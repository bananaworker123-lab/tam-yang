import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '@homework-tracker/shared-errors';

export interface ExamInput {
  examType: string;
  subject: string;
  examDate: string;
  examTime?: string;
  endTime?: string;
  location?: string;
  isOpenWindow?: boolean;
  registrationDeadline?: string;
  announcementDate?: string;
  admitCardDate?: string;
}

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  private mapRow(e: {
    id: string; examType: string; subject: string; examDate: Date;
    examTime: string | null; endTime: string | null; location: string | null;
    isOpenWindow: boolean;
    registrationDeadline: Date | null; announcementDate: Date | null; admitCardDate: Date | null;
    createdAt: Date;
  }) {
    return {
      id: e.id,
      examType: e.examType,
      subject: e.subject,
      examDate: e.examDate.toISOString().slice(0, 10),
      examTime: e.examTime,
      endTime: e.endTime,
      location: e.location,
      isOpenWindow: e.isOpenWindow,
      registrationDeadline: e.registrationDeadline?.toISOString().slice(0, 10) ?? null,
      announcementDate: e.announcementDate?.toISOString().slice(0, 10) ?? null,
      admitCardDate: e.admitCardDate?.toISOString().slice(0, 10) ?? null,
      createdAt: e.createdAt.toISOString(),
    };
  }

  async list(childUserId?: string) {
    const events = await this.prisma.examEvent.findMany({
      orderBy: { examDate: 'asc' },
    });

    if (!childUserId) return events.map((e) => ({ ...this.mapRow(e), isParticipating: false, isCompleted: false }));

    const [participants, completions] = await Promise.all([
      this.prisma.examParticipant.findMany({ where: { childUserId }, select: { examId: true } }),
      this.prisma.examCompletion.findMany({ where: { childUserId }, select: { examId: true } }),
    ]);

    const participantSet = new Set(participants.map((p) => p.examId));
    const completionSet  = new Set(completions.map((c) => c.examId));

    return events.map((e) => ({
      ...this.mapRow(e),
      isParticipating: e.examType === 'competition' ? participantSet.has(e.id) : true,
      isCompleted: completionSet.has(e.id) || (!e.isOpenWindow && new Date(e.examDate) < new Date()),
    }));
  }

  async create(input: ExamInput) {
    const e = await this.prisma.examEvent.create({
      data: {
        examType: input.examType,
        subject: input.subject,
        examDate: new Date(input.examDate),
        examTime: input.examTime ?? null,
        endTime: input.endTime ?? null,
        location: input.location ?? null,
        isOpenWindow: input.isOpenWindow ?? false,
        registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : null,
        announcementDate: input.announcementDate ? new Date(input.announcementDate) : null,
        admitCardDate: input.admitCardDate ? new Date(input.admitCardDate) : null,
      },
    });
    return this.mapRow(e);
  }

  async update(id: string, input: Partial<ExamInput>) {
    const existing = await this.prisma.examEvent.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Exam not found');
    const e = await this.prisma.examEvent.update({
      where: { id },
      data: {
        ...(input.examType   ? { examType:   input.examType }                                        : {}),
        ...(input.subject    ? { subject:    input.subject }                                         : {}),
        ...(input.examDate   ? { examDate:   new Date(input.examDate) }                              : {}),
        ...(input.examTime   !== undefined ? { examTime:   input.examTime ?? null }                  : {}),
        ...(input.endTime    !== undefined ? { endTime:    input.endTime ?? null }                   : {}),
        ...(input.location   !== undefined ? { location:   input.location ?? null }                  : {}),
        ...(input.isOpenWindow !== undefined ? { isOpenWindow: input.isOpenWindow }                  : {}),
        ...(input.registrationDeadline !== undefined ? { registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : null } : {}),
        ...(input.announcementDate     !== undefined ? { announcementDate:     input.announcementDate     ? new Date(input.announcementDate)     : null } : {}),
        ...(input.admitCardDate        !== undefined ? { admitCardDate:        input.admitCardDate        ? new Date(input.admitCardDate)        : null } : {}),
      },
    });
    return this.mapRow(e);
  }

  async delete(id: string) {
    await this.prisma.examEvent.delete({ where: { id } });
    return { ok: true };
  }

  async participate(examId: string, childUserId: string) {
    const exam = await this.prisma.examEvent.findUnique({ where: { id: examId } });
    if (!exam || exam.examType !== 'competition') throw AppError.validation('Only competition exams support participation');
    await this.prisma.examParticipant.upsert({
      where: { examId_childUserId: { examId, childUserId } },
      create: { examId, childUserId },
      update: {},
    });
    return { ok: true };
  }

  async unparticipate(examId: string, childUserId: string) {
    await this.prisma.examParticipant.deleteMany({ where: { examId, childUserId } });
    return { ok: true };
  }

  async complete(examId: string, childUserId: string) {
    const exam = await this.prisma.examEvent.findUnique({ where: { id: examId } });
    if (!exam?.isOpenWindow) throw AppError.validation('Only open-window exams can be manually completed');
    await this.prisma.examCompletion.upsert({
      where: { examId_childUserId: { examId, childUserId } },
      create: { examId, childUserId },
      update: {},
    });
    return { ok: true };
  }

  async uncomplete(examId: string, childUserId: string) {
    await this.prisma.examCompletion.deleteMany({ where: { examId, childUserId } });
    return { ok: true };
  }
}
