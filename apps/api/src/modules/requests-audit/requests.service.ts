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
      const assignment = await this.prisma.masterAssignment.findUnique({
        where: { id: d.assignmentId },
        select: { subject: true, topic: true },
      });
      await this.prisma.auditEntry.create({
        data: {
          eventId: e.eventId,
          actorUserId: d.actorUserId, actorRole: d.actorRole,
          childUserId: d.childUserId, assignmentId: d.assignmentId,
          subject: assignment?.subject ?? null,
          topic: assignment?.topic || null,
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

    // Resolve actor/child names only (subject+topic are stored in entry)
    const actorIds = [...new Set(entries.map((e) => e.actorUserId))];
    const childIds = [...new Set(entries.map((e) => e.childUserId))];
    const [actors, children] = await Promise.all([
      this.prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true, shortName: true } }),
      this.prisma.user.findMany({ where: { id: { in: childIds } }, select: { id: true, name: true, shortName: true } }),
    ]);
    const actorMap = new Map(actors.map((u) => [u.id, u]));
    const childMap = new Map(children.map((u) => [u.id, u]));

    const enriched = entries.map((e) => ({
      ...e,
      actorName:  actorMap.get(e.actorUserId)?.name ?? null,
      actorShort: actorMap.get(e.actorUserId)?.shortName ?? null,
      childName:  childMap.get(e.childUserId)?.name ?? null,
      childShort: childMap.get(e.childUserId)?.shortName ?? null,
    }));

    if (!q) return enriched;
    const lq = q.toLowerCase();
    return enriched.filter((e) =>
      [e.actorName, e.actorRole, e.childName, e.subject, e.topic, e.actorUserId, e.childUserId]
        .some((v) => v?.toLowerCase().includes(lq)),
    );
  }
}
