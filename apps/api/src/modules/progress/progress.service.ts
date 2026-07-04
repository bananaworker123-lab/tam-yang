import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '@homework-tracker/shared-errors';
import { EventBus } from '../../common/event-bus';
import { EventType, ProgressStatus, type AuthContext } from '@homework-tracker/shared-types';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventBus) {}

  async listForChild(childUserId: string, familyId: string, className?: string, termName?: string) {
    // Auto-migrate orphaned assignments (empty class/term) to the first available class/term
    const orphaned = await this.prisma.masterAssignment.findMany({
      where: { active: true, OR: [{ classRoom: { name: '' } }, { term: { name: '' } }] },
      select: { id: true },
    });
    if (orphaned.length > 0) {
      const [firstClass, firstTerm] = await Promise.all([
        this.prisma.classRoom.findFirst({ where: { name: { not: '' } }, orderBy: { name: 'asc' } }),
        this.prisma.term.findFirst({ where: { name: { not: '' } }, orderBy: { name: 'asc' } }),
      ]);
      if (firstClass && firstTerm) {
        await this.prisma.masterAssignment.updateMany({
          where: { id: { in: orphaned.map((o) => o.id) } },
          data: { classId: firstClass.id, termId: firstTerm.id },
        });
      }
    }

    const assignments = await this.prisma.masterAssignment.findMany({
      where: {
        active: true,
        ...(className ? { classRoom: { name: className } } : {}),
        ...(termName  ? { term: { name: termName } } : {}),
      },
      include: { classRoom: true, term: true },
      orderBy: { dueDate: 'asc' },
    });

    const progressRows = await this.prisma.progress.findMany({
      where: { childUserId, familyId },
    });

    return assignments.map((a) => {
      const p = progressRows.find((x) => x.assignmentId === a.id);
      return {
        progressId: p?.id ?? null,
        assignmentId: a.id,
        subject: a.subject,
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
    let p = progressId ? await this.prisma.progress.findUnique({ where: { id: progressId } }) : null;
    if (!p) {
      p = await this.prisma.progress.findFirst({ where: { childUserId, assignmentId } });
    }

    const fromStatus = (p?.status ?? 'not_started') as ProgressStatus;

    if (p) {
      p = await this.prisma.progress.update({ where: { id: p.id }, data: { status: newStatus } });
    } else {
      p = await this.prisma.progress.create({
        data: { childUserId, assignmentId, familyId, status: newStatus },
      });
    }

    await this.events.publish({
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
