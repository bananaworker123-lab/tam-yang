import { ProgressStatus, RequestStatus, InviteStatus } from '@homework-tracker/shared-types';

// Type definitions only — seed data cleared for production
export interface MockChild { id: string; name: string; initials: string; }
export interface MockMember { id: string; name: string; initials: string; role: 'parent' | 'child'; }
export interface MockFamily { id: string; name: string; members: MockMember[]; }
export interface MockAssignment {
  id: string; subject: string; topic: string; teacherName: string;
  className: string; term: string; assignedDate: string; dueDate: string; active: boolean;
}
export interface MockProgress { childId: string; assignmentId: string; status: ProgressStatus; }
export interface MockRequest {
  id: string; by: string; role: string; assignmentId?: string;
  detail: string; status: RequestStatus; reply?: string; date: string;
}
export interface MockInvite { id: string; email: string; role: 'parent' | 'child'; status: InviteStatus; }
export interface MockAudit {
  id: string; who: string; role: string; childName: string; task: string;
  from: ProgressStatus; to: ProgressStatus; when: string;
}
export interface MockTeacher { id: string; name: string; initials: string; subject: string; className: string; }

// Empty seed data — all data comes from API
export const children: MockChild[] = [];
export const family: MockFamily = { id: '', name: '', members: [] };
export const invites: MockInvite[] = [];
export const assignments: MockAssignment[] = [];
export const initialProgress: MockProgress[] = [];
export const requests: MockRequest[] = [];
export const teachers: MockTeacher[] = [];
export const otherFamiliesAudit: MockAudit[] = [];
export const allFamilies: MockFamily[] = [];
