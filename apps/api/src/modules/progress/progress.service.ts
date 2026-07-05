import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '@homework-tracker/shared-errors';
import { EventBus } from '../../common/event-bus';
import { EventType, ProgressStatus, type AuthContext } from '@homework-tracker/shared-types';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventBus) {}

  /** Resolve the child userId to track for a family. If none found, falls back to fallbackId. */
  async resolveChildUserId(familyId: string, fallbackId: string): Promise<string> {
    const m = await this.prisma.membership.findFirst({
      where: { familyId, role: 'child' },
      orderBy: { createdAt: 'asc' },
    });
    return m?.userId ?? fallbackId;
  }

  async listForChild(childUserId: string, familyId: string, className?: string, termName?: string, assignmentId?: string) {
    // assignments + progress are independent — run in parallel
    const [assignments, progressRows] = await Promise.all([
      this.prisma.masterAssignment.findMany({
        where: {
          active: true,
          ...(assignmentId ? { id: assignmentId } : {}),
          // filter by active flag directly on the relation — avoids a separate resolveActiveFilter round-trip
          ...(className ? { classRoom: { name: className } } : { classRoom: { active: true } }),
          ...(termName  ? { term:      { name: termName  } } : { term:      { active: true  } }),
        },
        include: { classRoom: true, term: true },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.progress.findMany({ where: { childUserId, familyId } }),
    ]);

    const subjectNames = [...new Set(assignments.map((a) => a.subject))];
    const subjectRows = await this.prisma.subject.findMany({
      where: { name: { in: subjectNames } },
      select: { name: true, short: true },
    });
    const shortMap = new Map(subjectRows.map((s) => [s.name, s.short]));

    return assignments.map((a) => {
      const p = progressRows.find((x) => x.assignmentId === a.id);
      return {
        progressId: p?.id ?? null,
        assignmentId: a.id,
        subject: a.subject,
        subjectShort: shortMap.get(a.subject) ?? a.subject.slice(0, 3).toUpperCase(),
        topic: (a as { topic?: string }).topic ?? '',
        teacherName: a.teacherName,
        className: a.classRoom.name,
        term: a.term.name,
        assignedDate: a.assignedDate.toISOString().slice(0, 10),
        dueDate: a.dueDate.toISOString().slice(0, 10),
        status: (p?.status ?? 'not_started') as ProgressStatus,
      };
    });
  }

  async updateStatus(
    progressId: string | null, assignmentId: string,
    childUserId: string, familyId: string,
    newStatus: ProgressStatus, actor: AuthContext,
  ) {
    const existing = progressId
      ? await this.prisma.progress.findUnique({ where: { id: progressId }, select: { status: true } })
      : await this.prisma.progress.findFirst({ where: { childUserId, assignmentId }, select: { status: true } });

    const fromStatus = (existing?.status ?? 'not_started') as ProgressStatus;

    const p = await this.prisma.progress.upsert({
      where: { childUserId_assignmentId: { childUserId, assignmentId } },
      update: { status: newStatus },
      create: { childUserId, assignmentId, familyId, status: newStatus },
    });

    // fire-and-forget — audit log, not part of the response
    void this.events.publish({
      eventId: randomUUID(),
      eventType: EventType.ProgressStatusChanged,
      timestamp: new Date().toISOString(),
      source: 'progress',
      data: {
        actorUserId: actor.userId, actorRole: actor.roles[0]!,
        childUserId, assignmentId, familyId,
        from: fromStatus, to: newStatus,
      },
    });

    return { progressId: p.id, status: p.status };
  }
}
