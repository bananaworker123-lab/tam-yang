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
    const entries = await this.prisma.auditEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    if (!q) return entries;
    const lq = q.toLowerCase();
    return entries.filter((e) =>
      [e.actorUserId, e.actorRole, e.childUserId, e.assignmentId].some((v) => v.toLowerCase().includes(lq)),
    );
  }
}
