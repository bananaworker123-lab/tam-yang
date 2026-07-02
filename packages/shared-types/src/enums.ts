// Domain enums — single source of truth (shared between web + api)

export const Role = {
  Admin: 'admin',
  Parent: 'parent',
  Child: 'child',
  Teacher: 'teacher',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

/** Membership role within a family (admin/teacher are system roles, not family roles) */
export const FamilyRole = {
  Parent: 'parent',
  Child: 'child',
} as const;
export type FamilyRole = (typeof FamilyRole)[keyof typeof FamilyRole];

export const ProgressStatus = {
  NotStarted: 'not_started',
  Done: 'done',
  Submitted: 'submitted',
} as const;
export type ProgressStatus = (typeof ProgressStatus)[keyof typeof ProgressStatus];

/** Notification state derived from due date + status */
export const DueState = {
  None: 'none',
  Near: 'near',
  DueToday: 'due_today',
  Overdue: 'overdue',
} as const;
export type DueState = (typeof DueState)[keyof typeof DueState];

export const RequestStatus = {
  Pending: 'pending',
  Resolved: 'resolved',
  Rejected: 'rejected',
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const InviteStatus = {
  Pending: 'pending',
  Accepted: 'accepted',
} as const;
export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];
