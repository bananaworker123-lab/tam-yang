import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, type AuthContext } from '@homework-tracker/shared-types';

export interface GoogleProfileInput {
  googleSub: string;
  email: string;
  name: string;
  pictureUrl?: string | null;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /** Upsert a user from a Google profile (idempotent by googleSub). */
  async upsertFromGoogle(p: GoogleProfileInput): Promise<string> {
    const user = await this.prisma.user.upsert({
      where: { googleSub: p.googleSub },
      update: { email: p.email, name: p.name, pictureUrl: p.pictureUrl ?? null },
      create: {
        googleSub: p.googleSub,
        email: p.email,
        name: p.name,
        pictureUrl: p.pictureUrl ?? null,
      },
    });
    return user.id;
  }

  async updateName(userId: string, name: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { name } });
  }

  async updateShortName(userId: string, shortName: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { shortName: shortName.slice(0, 4) || null } });
  }

  /** Allow editing if same user OR shares the same family (any role). */
  async assertSameFamilyOrSelf(actor: AuthContext, targetId: string): Promise<void> {
    if (actor.userId === targetId) return;
    if (actor.roles.includes('admin' as any)) return;
    if (!actor.familyId) throw AppError.forbidden('Not in a family');
    const membership = await this.prisma.membership.findFirst({
      where: { userId: targetId, familyId: actor.familyId },
    });
    if (!membership) throw AppError.forbidden('Not in the same family');
  }

  /** Build the AuthContext (roles + scopes) for a user from their memberships. */
  async buildAuthContext(userId: string): Promise<AuthContext | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: true,
        teacherAssignments: true,
      },
    });
    if (!user) return null;

    const roles: Role[] = [];
    if (user.isAdmin) roles.push(Role.Admin);
    const membership = user.memberships[0];
    if (membership) {
      roles.push(membership.role === 'parent' ? Role.Parent : Role.Child);
    }
    if (user.teacherAssignments.length > 0) roles.push(Role.Teacher);

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      shortName: user.shortName,
      pictureUrl: user.pictureUrl,
      roles,
      familyId: membership?.familyId ?? null,
      classScopes: user.teacherAssignments.map((t: { classId: string }) => t.classId),
      onboardingComplete: roles.length > 0,
    };
  }
}
