import type { Role } from './enums.js';

/** Resolved authorization context for the current request/session. */
export interface AuthContext {
  userId: string;
  email: string;
  name: string;
  pictureUrl?: string | null;
  roles: Role[];
  /** Set when the user belongs to a family (parent/child). */
  familyId?: string | null;
  /** Class ids a teacher is assigned to (read scope). */
  classScopes?: string[];
  /** True when user has a family/role and finished onboarding. */
  onboardingComplete: boolean;
}
