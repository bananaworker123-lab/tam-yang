import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '@homework-tracker/shared-errors';
import { EventBus } from '../../common/event-bus';
import { EventType } from '@homework-tracker/shared-types';

@Injectable()
export class FamilyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventBus,
  ) {}

  async createFamily(userId: string, name: string) {
    const family = await this.prisma.family.create({ data: { name } });
    await this.prisma.membership.create({
      data: { familyId: family.id, userId, role: 'parent' },
    });
    return family;
  }

  async assertMember(userId: string, familyId: string): Promise<void> {
    const m = await this.prisma.membership.findFirst({ where: { userId, familyId } });
    if (!m) throw AppError.forbidden('Not a member of this family');
  }

  async listMembers(familyId: string) {
    const members = await this.prisma.membership.findMany({
      where: { familyId },
      include: { user: true },
    });
    const invites = await this.prisma.invite.findMany({ where: { familyId } });
    return {
      members: members.map((m) => ({
        userId: m.userId, name: m.user.name, email: m.user.email,
        pictureUrl: m.user.pictureUrl, role: m.role,
      })),
      invites: invites.map((i) => ({
        id: i.id, email: i.email, role: i.role, status: i.status,
      })),
    };
  }

  async createInvite(familyId: string, email: string, role: 'parent' | 'child') {
    const token = randomBytes(32).toString('hex');
    const invite = await this.prisma.invite.create({
      data: { familyId, email: email.toLowerCase().trim(), role, token },
    });
    // TODO: send email with invite link
    return { inviteId: invite.id, token };
  }

  async acceptInvite(token: string, googleEmail: string, userId: string) {
    const invite = await this.prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.status !== 'pending') throw AppError.notFound('Invite not found or already used');
    if (invite.email.toLowerCase() !== googleEmail.toLowerCase())
      throw AppError.forbidden('Email does not match invite');

    // Child can only be in one family
    if (invite.role === 'child') {
      const existing = await this.prisma.membership.findFirst({ where: { userId, role: 'child' } });
      if (existing) throw AppError.conflict('Child is already in a family');
    }

    await this.prisma.membership.create({ data: { familyId: invite.familyId, userId, role: invite.role } });
    await this.prisma.invite.update({ where: { id: invite.id }, data: { status: 'accepted' } });
    return { familyId: invite.familyId, role: invite.role };
  }

  async removeMember(familyId: string, userId: string) {
    await this.prisma.membership.deleteMany({ where: { familyId, userId } });
    await this.prisma.progress.deleteMany({ where: { familyId, childUserId: userId } });
    await this.events.publish({
      eventId: `rm-${familyId}-${userId}-${Date.now()}`,
      eventType: EventType.FamilyMemberRemoved,
      timestamp: new Date().toISOString(),
      source: 'family',
      data: { familyId, userId },
    });
    return { ok: true };
  }
}
