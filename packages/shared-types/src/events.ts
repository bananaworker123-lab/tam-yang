import type { ProgressStatus, Role } from './enums.js';

/** Generic in-process domain event envelope. */
export interface DomainEvent<T> {
  eventId: string;
  eventType: string;
  timestamp: string; // ISO 8601 UTC
  source: string;
  data: T;
}

export interface ProgressStatusChangedData {
  actorUserId: string;
  actorRole: Role;
  childUserId: string;
  assignmentId: string;
  familyId: string;
  from: ProgressStatus;
  to: ProgressStatus;
}

export interface FamilyMemberRemovedData {
  familyId: string;
  userId: string;
}

export interface AssignmentChangedData {
  assignmentId: string;
  action: 'created' | 'updated' | 'deleted';
  actorUserId: string;
  actorRole: string;
  subject: string;
  topic: string;
}

export interface TeacherAssignmentChangedData {
  teacherUserId: string;
  classId: string;
  action: 'assigned' | 'revoked';
}

export const EventType = {
  ProgressStatusChanged: 'progress.status.changed',
  FamilyMemberRemoved: 'family.member.removed',
  AssignmentChanged: 'assignment.changed',
  TeacherAssignmentChanged: 'assignment.teacher.changed',
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];
