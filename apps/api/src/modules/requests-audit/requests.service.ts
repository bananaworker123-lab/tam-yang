import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '@homework-tracker/shared-errors';
import type { AuthContext, ProgressStatus } from '@homework-tracker/shared-types';
import { EventType } from '@homework-tracker/shared-types';
import { EventBus } from '../../common/event-bus';

@Injectable()
export class RequestsAuditService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventBus) {
    // Subscribe to progress events to write audit
    events.subscribe(EventType.ProgressStatusChanged, async (e) => {
      const d = e.data as { actorUserId: string; actorRole: string; childUserId: string; assignmentId: string; from: ProgressStatus; to: ProgressStatus };
      await this.prisma.auditEntry.create({
        data: {
          eventId: e.eventId,
          actorUserId: d.actorUserId, actorRole: d.actorRole,
          childUserId: d.childUserId, assignmentId: d.assignmentId,
          fromStatus: d.from, toStatus: d.to,
        },
      });
    });
  }

  async createRequest(createdBy: string, role: string, detail: string, assignmentId?: string) {
    return this.prisma.request.create({ data: { createdBy, role, detail, assignmentId } });
  }

  async listMine(userId: string) {
    return this.prisma.request.findMany({ where: { createdBy: userId }, orderBy: { createdAt: 'desc' } });
  }

  async listAll() {
    return this.prisma.request.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async resolve(id: string, reply: string, status: 'resolved' | 'rejected') {
    const r = await this.prisma.request.findUnique({ where: { id } });
    if (!r || r.status !== 'pending') throw AppError.notFound('Request not found or already handled');
    return this.prisma.request.update({ where: { id }, data: { status, reply } });
  }

  async searchAudit(q?: string) {
    const entries = await this.prisma.auditEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Collect unique IDs to resolve in parallel
    const actorIds  = [...new Set(entries.map((e) => e.actorUserId))];
    const childIds  = [...new Set(entries.map((e) => e.childUserId))];
    const assignIds = [...new Set(entries.map((e) => e.assignmentId))];

    const [actors, children, assignments] = await Promise.all([
      this.prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true, shortName: true } }),
      this.prisma.user.findMany({ where: { id: { in: childIds } }, select: { id: true, name: true, shortName: true } }),
      this.prisma.masterAssignment.findMany({ where: { id: { in: assignIds } }, select: { id: true, subject: true, topic: true } }),
    ]);

    const actorMap  = new Map(actors.map((u) => [u.id, u]));
    const childMap  = new Map(children.map((u) => [u.id, u]));
    const assignMap = new Map(assignments.map((a) => [a.id, a]));

    const enriched = entries.map((e) => {
      const actor      = actorMap.get(e.actorUserId);
      const child      = childMap.get(e.childUserId);
      const assignment = assignMap.get(e.assignmentId);
      return {
        ...e,
        actorName:  actor?.name ?? null,
        actorShort: actor?.shortName ?? null,
        childName:  child?.name ?? null,
        childShort: child?.shortName ?? null,
        subject:    assignment?.subject ?? null,
        topic:      assignment?.topic || null,
      };
    });

    if (!q) return enriched;
    const lq = q.toLowerCase();
    return enriched.filter((e) =>
      [e.actorName, e.actorRole, e.childName, e.assignmentTopic, e.subject, e.actorUserId, e.childUserId, e.assignmentId]
        .some((v) => v?.toLowerCase().includes(lq)),
    );
  }
}
