import { Role, type AuthContext } from '@homework-tracker/shared-types';

/** A resource that is scoped to a family and/or a class. */
export interface ScopedResource {
  familyId?: string | null;
  classId?: string | null;
}

/**
 * Pure data-isolation predicate (US-010).
 *
 * Rules:
 * - Admin can access anything.
 * - Parent/Child can access a resource only if it belongs to their family.
 * - Teacher can access a resource only if its class is in their assigned classScopes.
 * - Otherwise: denied.
 */
export function canAccess(ctx: AuthContext, resource: ScopedResource): boolean {
  if (ctx.roles.includes(Role.Admin)) return true;

  const isParentOrChild = ctx.roles.includes(Role.Parent) || ctx.roles.includes(Role.Child);
  if (isParentOrChild && resource.familyId != null && ctx.familyId != null) {
    if (resource.familyId === ctx.familyId) return true;
  }

  if (ctx.roles.includes(Role.Teacher) && resource.classId != null) {
    if ((ctx.classScopes ?? []).includes(resource.classId)) return true;
  }

  return false;
}

/**
 * Pure predicate: a child may only mutate their own progress (US-009).
 */
export function canMutateChildProgress(ctx: AuthContext, childUserId: string): boolean {
  if (ctx.roles.includes(Role.Admin)) return false; // admin does not edit progress
  if (ctx.roles.includes(Role.Parent)) return true; // family scope checked separately via canAccess
  if (ctx.roles.includes(Role.Child)) return ctx.userId === childUserId;
  return false;
}

/** Invite acceptance is valid only when the Google email matches the invited email. */
export function inviteEmailMatches(invitedEmail: string, googleEmail: string): boolean {
  return invitedEmail.trim().toLowerCase() === googleEmail.trim().toLowerCase();
}
