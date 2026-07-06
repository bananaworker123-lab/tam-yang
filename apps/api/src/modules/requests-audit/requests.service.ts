import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '@homework-tracker/shared-errors';
import type { AuthContext, ProgressStatus } from '@homework-tracker/shared-types';
import { EventType } from '@homework-tracker/shared-types';
import { EventBus } from '../../common/event-bus';

@Injectable()
export class RequestsAuditService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventBus) {
    events.subscribe(EventType.ProgressStatusChanged, async (e) => {
      const d = e.data as { actorUserId: string; actorRole: string; childUserId: string; assignmentId: string; from: ProgressStatus; to: ProgressStatus };
      const assignment = await this.prisma.masterAssignment.findUnique({
        where: { id: d.assignmentId },
        select: { subject: true, topic: true },
      });
      await this.prisma.auditEntry.create({
        data: {
          eventId: e.eventId,
          eventType: 'progress_status_changed',
          actorUserId: d.actorUserId, actorRole: d.actorRole,
          childUserId: d.childUserId, assignmentId: d.assignmentId,
          subject: assignment?.subject ?? null,
          topic: assignment?.topic || null,
          fromStatus: d.from, toStatus: d.to,
        },
      });
    });

    events.subscribe(EventType.AssignmentChanged, async (e) => {
      const d = e.data as { assignmentId: string; action: string; actorUserId: string; actorRole: string; after: { subject: string; topic: string; assignedDate: string; dueDate: string }; before?: { subject: string; topic: string; assignedDate: string; dueDate: string } };
      if (!d.actorUserId) return;
      await this.prisma.auditEntry.create({
        data: {
          eventId: e.eventId,
          eventType: `assignment_${d.action}`,
          actorUserId: d.actorUserId, actorRole: d.actorRole,
          assignmentId: d.action !== 'deleted' ? d.assignmentId : null,
          subject: d.after.subject || null,
          topic: d.after.topic || null,
          metadata: JSON.stringify({ before: d.before ?? null, after: d.after }),
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

    const actorIds = [...new Set(entries.map((e) => e.actorUserId))];
    const childIds = [...new Set(entries.map((e) => e.childUserId).filter((id): id is string => id !== null))];
    const [actors, children] = await Promise.all([
      this.prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true, shortName: true } }),
      childIds.length > 0
        ? this.prisma.user.findMany({ where: { id: { in: childIds } }, select: { id: true, name: true, shortName: true } })
        : Promise.resolve([]),
    ]);
    const actorMap = new Map(actors.map((u) => [u.id, u]));
    const childMap = new Map(children.map((u) => [u.id, u]));

    const enriched = entries.map((e) => ({
      ...e,
      actorName:  actorMap.get(e.actorUserId)?.name ?? null,
      actorShort: actorMap.get(e.actorUserId)?.shortName ?? null,
      childName:  e.childUserId ? (childMap.get(e.childUserId)?.name ?? null) : null,
      childShort: e.childUserId ? (childMap.get(e.childUserId)?.shortName ?? null) : null,
    }));

    if (!q) return enriched;
    const lq = q.toLowerCase();
    return enriched.filter((e) =>
      [e.actorName, e.actorRole, e.childName, e.subject, e.topic]
        .some((v) => v?.toLowerCase().includes(lq)),
    );
  }
}
