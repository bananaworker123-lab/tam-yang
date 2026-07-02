import type {
  DueState,
  FamilyRole,
  InviteStatus,
  ProgressStatus,
  RequestStatus,
  Role,
} from './enums.js';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  pictureUrl?: string | null;
}

export interface FamilyDto {
  id: string;
  name: string;
}

export interface MemberDto {
  userId: string;
  name: string;
  email: string;
  role: FamilyRole;
}

export interface InviteDto {
  id: string;
  email: string;
  role: FamilyRole;
  status: InviteStatus;
}

export interface AssignmentDto {
  id: string;
  subject: string;
  teacherName: string;
  classId: string;
  termId: string;
  assignedDate: string; // ISO date
  dueDate: string; // ISO date
  active: boolean;
}

export interface ProgressItemDto {
  progressId: string;
  childUserId: string;
  assignment: AssignmentDto;
  status: ProgressStatus;
  dueState: DueState;
}

export interface RequestDto {
  id: string;
  createdBy: string;
  role: Role;
  assignmentId?: string | null;
  detail: string;
  status: RequestStatus;
  reply?: string | null;
  createdAt: string;
}

export interface AuditEntryDto {
  id: string;
  actorUserId: string;
  actorRole: Role;
  childUserId: string;
  assignmentId: string;
  fromStatus: ProgressStatus;
  toStatus: ProgressStatus;
  createdAt: string;
}
