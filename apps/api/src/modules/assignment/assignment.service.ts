import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
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

  private mapRow(a: { id: string; subject: string; topic: string; teacherName: string; active: boolean; assignedDate: Date; dueDate: Date; classRoom: { name: string }; term: { name: string } }) {
    return {
      id: a.id,
      subject: a.subject,
      topic: a.topic,
      teacherName: a.teacherName,
      className: a.classRoom.name,
      term: a.term.name,
      assignedDate: a.assignedDate.toISOString().slice(0, 10),
      dueDate: a.dueDate.toISOString().slice(0, 10),
      active: a.active,
    };
  }

  async listActive(className?: string, termName?: string) {
    const rows = await this.prisma.masterAssignment.findMany({
      where: {
        active: true,
        ...(className ? { classRoom: { name: className } } : {}),
        ...(termName  ? { term:      { name: termName } }  : {}),
      },
      include: { classRoom: true, term: true },
      orderBy: { dueDate: 'asc' },
    });
    return rows.map((r) => this.mapRow(r));
  }

  async listAll() {
    // Auto-migrate: assignments with empty classRoom/term name get the first available class/term
    const orphaned = await this.prisma.masterAssignment.findMany({
      where: { OR: [{ classRoom: { name: '' } }, { term: { name: '' } }] },
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

    const rows = await this.prisma.masterAssignment.findMany({
      include: { classRoom: true, term: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapRow(r));
  }

  async create(input: AssignmentInput, actorUserId = '', actorRole = 'admin') {
    if (!input.className?.trim()) throw AppError.validation('className is required');
    if (!input.term?.trim())      throw AppError.validation('term is required');

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
    await this.events.publish({ eventId: randomUUID(), eventType: EventType.AssignmentChanged, timestamp: new Date().toISOString(), source: 'assignment', data: { assignmentId: a.id, action: 'created', actorUserId, actorRole, subject: a.subject, topic: a.topic } });
    return this.mapRow(a);
  }

  async update(id: string, input: Partial<AssignmentInput> & { active?: boolean }, actorUserId = '', actorRole = 'admin') {
    const existing = await this.prisma.masterAssignment.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Assignment not found');

    // Resolve updated class/term IDs when provided
    let classId: string | undefined;
    let termId: string | undefined;
    if (input.className?.trim()) {
      const cls = await this.prisma.classRoom.findFirst({ where: { name: input.className.trim() } })
        ?? await this.prisma.classRoom.create({ data: { name: input.className.trim() } });
      classId = cls.id;
    }
    if (input.term?.trim()) {
      const term = await this.prisma.term.findFirst({ where: { name: input.term.trim() } })
        ?? await this.prisma.term.create({ data: { name: input.term.trim() } });
      termId = term.id;
    }

    const a = await this.prisma.masterAssignment.update({
      where: { id },
      data: {
        ...(input.subject     ? { subject:      input.subject }                   : {}),
        ...(input.teacherName ? { teacherName:  input.teacherName }               : {}),
        ...(input.topic       ? { topic:        input.topic }                     : {}),
        ...(input.assignedDate? { assignedDate: new Date(input.assignedDate) }    : {}),
        ...(input.dueDate     ? { dueDate:      new Date(input.dueDate) }         : {}),
        ...(input.active !== undefined ? { active: input.active }                 : {}),
        ...(classId           ? { classId }                                       : {}),
        ...(termId            ? { termId }                                        : {}),
      },
      include: { classRoom: true, term: true },
    });
    await this.events.publish({ eventId: randomUUID(), eventType: EventType.AssignmentChanged, timestamp: new Date().toISOString(), source: 'assignment', data: { assignmentId: a.id, action: 'updated', actorUserId, actorRole, subject: a.subject, topic: a.topic } });
    return this.mapRow(a);
  }

  async delete(id: string, actorUserId = '', actorRole = 'admin') {
    const existing = await this.prisma.masterAssignment.findUnique({ where: { id }, select: { subject: true, topic: true } });
    await this.prisma.masterAssignment.delete({ where: { id } });
    await this.events.publish({ eventId: randomUUID(), eventType: EventType.AssignmentChanged, timestamp: new Date().toISOString(), source: 'assignment', data: { assignmentId: id, action: 'deleted', actorUserId, actorRole, subject: existing?.subject ?? '', topic: existing?.topic ?? '' } });
    return { ok: true };
  }
}
