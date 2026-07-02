import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '@homework-tracker/shared-errors';
import { EventBus } from '../../common/event-bus';
import { EventType } from '@homework-tracker/shared-types';

export interface AssignmentInput {
  subject: string; topic: string; teacherName: string;
  className: string; term: string;
  assignedDate: string; dueDate: string; active?: boolean;
}

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventBus) {}

  async listActive(className?: string, termName?: string) {
    return this.prisma.masterAssignment.findMany({
      where: {
        active: true,
        ...(className ? { classRoom: { name: className } } : {}),
        ...(termName  ? { term:      { name: termName } }  : {}),
      },
      include: { classRoom: true, term: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  async listAll() {
    return this.prisma.masterAssignment.findMany({
      include: { classRoom: true, term: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(input: AssignmentInput) {
    const cls  = await this.prisma.classRoom.upsert({ where: { name_schoolId: { name: input.className, schoolId: null as unknown as string } }, update: {}, create: { name: input.className }, select: { id: true } }).catch(() =>
      this.prisma.classRoom.findFirst({ where: { name: input.className } }).then((r) => r ?? this.prisma.classRoom.create({ data: { name: input.className } })));
    const term = await this.prisma.term.findFirst({ where: { name: input.term } }) ??
      await this.prisma.term.create({ data: { name: input.term } });

    const a = await this.prisma.masterAssignment.create({
      data: {
        subject: input.subject, teacherName: input.teacherName,
        topic: input.topic,
        classId: cls!.id, termId: term.id,
        assignedDate: new Date(input.assignedDate), dueDate: new Date(input.dueDate),
        active: input.active ?? true,
      },
      include: { classRoom: true, term: true },
    });
    await this.events.publish({ eventId: `asgn-${a.id}`, eventType: EventType.AssignmentChanged, timestamp: new Date().toISOString(), source: 'assignment', data: { assignmentId: a.id, action: 'created' } });
    return a;
  }

  async update(id: string, input: Partial<AssignmentInput> & { active?: boolean }) {
    const existing = await this.prisma.masterAssignment.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Assignment not found');

    const a = await this.prisma.masterAssignment.update({
      where: { id },
      data: {
        ...(input.subject   ? { subject:     input.subject }   : {}),
        ...(input.teacherName ? { teacherName: input.teacherName } : {}),
        ...(input.topic     ? { topic:       input.topic }     : {}),
        ...(input.assignedDate ? { assignedDate: new Date(input.assignedDate) } : {}),
        ...(input.dueDate   ? { dueDate:     new Date(input.dueDate) }   : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
      include: { classRoom: true, term: true },
    });
    await this.events.publish({ eventId: `asgn-upd-${a.id}-${Date.now()}`, eventType: EventType.AssignmentChanged, timestamp: new Date().toISOString(), source: 'assignment', data: { assignmentId: a.id, action: 'updated' } });
    return a;
  }

  async delete(id: string) {
    await this.prisma.masterAssignment.delete({ where: { id } });
    return { ok: true };
  }
}
