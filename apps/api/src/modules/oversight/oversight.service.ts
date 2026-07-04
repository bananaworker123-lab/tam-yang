import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppError } from '@homework-tracker/shared-errors';

@Injectable()
export class OversightService {
  constructor(private readonly prisma: PrismaService) {}

  async getClassrooms() {
    return this.prisma.classRoom.findMany({ where: { name: { not: '' } }, orderBy: { name: 'asc' } });
  }

  async getTerms() {
    return this.prisma.term.findMany({ where: { name: { not: '' } }, orderBy: { name: 'asc' } });
  }

  /** Teacher: get progress matrix for classes the teacher is assigned to. */
  async getTeacherOverview(teacherUserId: string, className?: string, termName?: string) {
    const teacherAssignments = await this.prisma.teacherAssignment.findMany({
      where: { teacherUserId },
      include: { classRoom: true },
    });
    const classIds = teacherAssignments.map((t) => t.classId);
    if (classIds.length === 0) return { assignments: [], rows: [] };

    const assignments = await this.prisma.masterAssignment.findMany({
      where: {
        active: true,
        classId: { in: classIds },
        ...(className ? { classRoom: { name: className } } : {}),
        ...(termName ? { term: { name: termName } } : {}),
      },
      include: { classRoom: true, term: true },
      orderBy: { dueDate: 'asc' },
    });

    if (assignments.length === 0) return { assignments: [], rows: [] };

    const progress = await this.prisma.progress.findMany({
      where: { assignmentId: { in: assignments.map((a) => a.id) } },
      include: { child: { select: { id: true, name: true, shortName: true, pictureUrl: true } } },
    });

    const childMap = new Map<string, { id: string; name: string; shortName: string | null; pictureUrl: string | null }>();
    for (const p of progress) {
      childMap.set(p.childUserId, {
        id: p.childUserId,
        name: p.child.name,
        shortName: p.child.shortName ?? null,
        pictureUrl: p.child.pictureUrl,
      });
    }

    const rows = [...childMap.values()].map((c) => ({
      childId: c.id,
      childName: c.name,
      childShort: c.shortName ?? null,
      pictureUrl: c.pictureUrl,
      cells: assignments.map((a) => {
        const p = progress.find((x) => x.childUserId === c.id && x.assignmentId === a.id);
        return { assignmentId: a.id, status: p?.status ?? 'not_started' };
      }),
    }));

    return {
      assignments: assignments.map((a) => ({
        id: a.id,
        subject: a.subject,
        topic: a.topic,
        dueDate: a.dueDate.toISOString().slice(0, 10),
        className: a.classRoom.name,
        term: a.term.name,
      })),
      rows,
    };
  }

  /** Admin: aggregate dashboard stats. */
  async getAdminOverview() {
    const [familyCount, childCount, parentCount, activeAssignmentCount, pendingRequestCount] =
      await Promise.all([
        this.prisma.family.count(),
        this.prisma.membership.count({ where: { role: 'child' } }),
        this.prisma.membership.count({ where: { role: 'parent' } }),
        this.prisma.masterAssignment.count({ where: { active: true } }),
        this.prisma.request.count({ where: { status: 'pending' } }),
      ]);

    const teacherCount = await this.prisma.teacherAssignment.count();

    const recentAudit = await this.prisma.auditEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const families = await this.prisma.family.findMany({
      include: { members: { include: { user: true } } },
      take: 30,
      orderBy: { createdAt: 'asc' },
    });

    const assignments = await this.prisma.masterAssignment.findMany({
      where: { active: true },
      include: { classRoom: true, term: true },
      take: 50,
    });

    return {
      familyCount,
      childCount,
      parentCount,
      teacherCount,
      activeAssignmentCount,
      pendingRequestCount,
      recentAudit,
      families: families.map((f) => ({
        id: f.id,
        name: f.name,
        members: f.members.map((m) => ({
          userId: m.userId,
          name: m.user.name,
          email: m.user.email,
          role: m.role,
          pictureUrl: m.user.pictureUrl,
        })),
      })),
      assignments: assignments.map((a) => ({
        id: a.id,
        subject: a.subject,
        teacherName: a.teacherName,
        active: a.active,
      })),
    };
  }

  /** Admin: all families with members. */
  async getAdminFamilies() {
    const families = await this.prisma.family.findMany({
      include: { members: { include: { user: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return families.map((f) => ({
      id: f.id,
      name: f.name,
      members: f.members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        pictureUrl: m.user.pictureUrl,
      })),
    }));
  }

  /** Admin: progress matrix across all families. */
  async getAdminAllProgress(className?: string, termName?: string) {
    const assignments = await this.prisma.masterAssignment.findMany({
      where: {
        active: true,
        ...(className ? { classRoom: { name: className } } : {}),
        ...(termName ? { term: { name: termName } } : {}),
      },
      include: { classRoom: true, term: true },
      orderBy: { dueDate: 'asc' },
    });

    if (assignments.length === 0) return { assignments: [], rows: [] };

    const [progress, memberships] = await Promise.all([
      this.prisma.progress.findMany({
        where: { assignmentId: { in: assignments.map((a) => a.id) } },
      }),
      this.prisma.membership.findMany({
        where: { role: 'child' },
        include: { family: true, user: true },
      }),
    ]);

    const rows = memberships.map((m) => ({
      childId: m.userId,
      childName: m.user.name,
      childShort: m.user.shortName ?? null,
      familyName: m.family.name,
      cells: assignments.map((a) => {
        const p = progress.find((x) => x.childUserId === m.userId && x.assignmentId === a.id);
        return { assignmentId: a.id, status: p?.status ?? 'not_started' };
      }),
    }));

    return {
      assignments: assignments.map((a) => ({
        id: a.id,
        subject: a.subject,
        topic: a.topic,
        dueDate: a.dueDate.toISOString().slice(0, 10),
        className: a.classRoom.name,
        term: a.term.name,
      })),
      rows,
    };
  }

  /** Admin: list all TeacherAssignments. */
  async getAdminTeachers() {
    const assignments = await this.prisma.teacherAssignment.findMany({
      include: { teacher: true, classRoom: true },
    });

    return assignments.map((ta) => ({
      id: ta.id,
      teacherUserId: ta.teacherUserId,
      teacherName: ta.teacher.name,
      teacherEmail: ta.teacher.email,
      pictureUrl: ta.teacher.pictureUrl,
      className: ta.classRoom.name,
      classId: ta.classId,
    }));
  }

  /** Admin: assign a user as teacher to a class (by email + class name). */
  async assignTeacher(email: string, className: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) throw AppError.notFound('User not found — they must sign in with Google first');

    let cls = await this.prisma.classRoom.findFirst({ where: { name: className } });
    if (!cls) cls = await this.prisma.classRoom.create({ data: { name: className } });

    const existing = await this.prisma.teacherAssignment.findFirst({
      where: { teacherUserId: user.id, classId: cls.id },
    });
    if (existing) throw AppError.conflict('Teacher is already assigned to this class');

    const ta = await this.prisma.teacherAssignment.create({
      data: { teacherUserId: user.id, classId: cls.id },
      include: { teacher: true, classRoom: true },
    });

    return {
      id: ta.id,
      teacherUserId: ta.teacherUserId,
      teacherName: ta.teacher.name,
      teacherEmail: ta.teacher.email,
      pictureUrl: ta.teacher.pictureUrl,
      className: ta.classRoom.name,
      classId: ta.classId,
    };
  }

  /** Admin: remove a TeacherAssignment by id. */
  async removeTeacherAssignment(id: string) {
    const ta = await this.prisma.teacherAssignment.findUnique({ where: { id } });
    if (!ta) throw AppError.notFound('Teacher assignment not found');
    await this.prisma.teacherAssignment.delete({ where: { id } });
    return { ok: true };
  }

  // ---------- Class & Term management ----------

  async createClassroom(name: string) {
    const existing = await this.prisma.classRoom.findFirst({ where: { name: name.trim() } });
    if (existing) throw AppError.conflict('Class already exists');
    return this.prisma.classRoom.create({ data: { name: name.trim() } });
  }

  async deleteClassroom(id: string) {
    const inUse = await this.prisma.masterAssignment.count({ where: { classId: id } });
    if (inUse > 0) throw AppError.conflict('Class has assignments — remove them first');
    await this.prisma.classRoom.delete({ where: { id } });
    return { ok: true };
  }

  async createTerm(name: string) {
    const existing = await this.prisma.term.findFirst({ where: { name: name.trim() } });
    if (existing) throw AppError.conflict('Term already exists');
    return this.prisma.term.create({ data: { name: name.trim() } });
  }

  async deleteTerm(id: string) {
    const inUse = await this.prisma.masterAssignment.count({ where: { termId: id } });
    if (inUse > 0) throw AppError.conflict('Term has assignments — remove them first');
    await this.prisma.term.delete({ where: { id } });
    return { ok: true };
  }

  // ---------- Subject catalog ----------

  private readonly DEFAULT_SUBJECTS = [
    { name: 'Mathematics',    short: 'MA' },
    { name: 'English',        short: 'EN' },
    { name: 'Science',        short: 'SC' },
    { name: 'History',        short: 'HI' },
    { name: 'Geography',      short: 'GE' },
    { name: 'Art',            short: 'AR' },
    { name: 'P.E.',           short: 'PE' },
    { name: 'Music',          short: 'MU' },
    { name: 'Thai',           short: 'TH' },
    { name: 'Social Studies', short: 'SS' },
  ];

  async listSubjects() {
    const count = await this.prisma.subject.count();
    if (count === 0) {
      await this.prisma.subject.createMany({ data: this.DEFAULT_SUBJECTS });
    }
    return this.prisma.subject.findMany({ orderBy: { name: 'asc' } });
  }

  async upsertSubject(id: string | undefined, name: string, short: string) {
    if (id) {
      return this.prisma.subject.update({ where: { id }, data: { name, short } });
    }
    return this.prisma.subject.create({ data: { name, short } });
  }

  async deleteSubject(id: string) {
    const s = await this.prisma.subject.findUnique({ where: { id } });
    if (!s) throw AppError.notFound('Subject not found');
    await this.prisma.subject.delete({ where: { id } });
    return { ok: true };
  }

  // ---------- Teacher catalog ----------

  async listTeacherCatalog() {
    return this.prisma.teacherCatalog.findMany({ orderBy: [{ className: 'asc' }, { name: 'asc' }] });
  }

  async upsertTeacherCatalog(id: string | undefined, name: string, subject: string, className: string) {
    if (id) {
      return this.prisma.teacherCatalog.update({ where: { id }, data: { name, subject, className } });
    }
    return this.prisma.teacherCatalog.create({ data: { name, subject, className } });
  }

  async deleteTeacherCatalog(id: string) {
    const t = await this.prisma.teacherCatalog.findUnique({ where: { id } });
    if (!t) throw AppError.notFound('Teacher not found');
    await this.prisma.teacherCatalog.delete({ where: { id } });
    return { ok: true };
  }
}
