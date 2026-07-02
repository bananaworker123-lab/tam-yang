import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '@homework-tracker/shared-errors';
import { EventBus } from '../../common/event-bus';
import { EventType } from '@homework-tracker/shared-types';
import { Resend } from 'resend';

@Injectable()
export class FamilyService {
  private readonly logger = new Logger(FamilyService.name);
  private readonly resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

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

    const family = await this.prisma.family.findUnique({ where: { id: familyId } });
    const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:5173';
    const inviteUrl = `${webOrigin}/join?token=${token}`;
    const roleLabel = role === 'child' ? 'child' : 'parent';

    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'Homeroom <noreply@homeroom.isad1dev.com>',
          to: email.toLowerCase().trim(),
          subject: `You're invited to join ${family?.name ?? 'a family'} on Homeroom`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="margin:0 0 8px">You're invited!</h2>
              <p style="color:#555;margin:0 0 20px">
                You've been invited to join <strong>${family?.name ?? 'a family'}</strong>
                as a <strong>${roleLabel}</strong> on Homeroom.
              </p>
              <p style="color:#555;margin:0 0 20px">
                Click the button below and sign in with Google using <strong>${email}</strong>.
              </p>
              <a href="${inviteUrl}"
                 style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;
                        border-radius:8px;text-decoration:none;font-weight:600">
                Accept invite
              </a>
              <p style="color:#999;font-size:12px;margin-top:24px">
                Or copy this link: ${inviteUrl}
              </p>
            </div>
          `,
        });
        this.logger.log(`Invite email sent to ${email}`);
      } catch (err) {
        this.logger.error(`Failed to send invite email to ${email}`, err);
      }
    } else {
      this.logger.warn(`RESEND_API_KEY not set — invite link for ${email}: ${inviteUrl}`);
    }

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
