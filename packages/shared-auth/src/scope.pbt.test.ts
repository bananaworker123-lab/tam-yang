import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Role, type AuthContext } from '@homework-tracker/shared-types';
import { canAccess, canMutateChildProgress, inviteEmailMatches } from './scope.js';

const arbId = fc.uuid();

function ctxWith(roles: Role[], familyId?: string, classScopes?: string[]): AuthContext {
  return {
    userId: 'u',
    email: 'u@example.com',
    name: 'U',
    roles,
    familyId: familyId ?? null,
    classScopes: classScopes ?? [],
    onboardingComplete: true,
  };
}

describe('family-isolation predicate (PBT, US-010)', () => {
  it('parent/child can access ONLY their own family resources', () => {
    fc.assert(
      fc.property(arbId, arbId, fc.constantFrom(Role.Parent, Role.Child), (famA, famB, role) => {
        const ctx = ctxWith([role], famA);
        // same family → allowed
        expect(canAccess(ctx, { familyId: famA })).toBe(true);
        // different family → denied (unless ids happen to be equal, excluded below)
        fc.pre(famA !== famB);
        expect(canAccess(ctx, { familyId: famB })).toBe(false);
      }),
    );
  });

  it('admin can access any family resource', () => {
    fc.assert(
      fc.property(arbId, (fam) => {
        const ctx = ctxWith([Role.Admin]);
        expect(canAccess(ctx, { familyId: fam })).toBe(true);
      }),
    );
  });

  it('teacher can access ONLY classes in their scope', () => {
    fc.assert(
      fc.property(fc.array(arbId, { minLength: 1, maxLength: 5 }), arbId, (scopes, other) => {
        const ctx = ctxWith([Role.Teacher], undefined, scopes);
        expect(canAccess(ctx, { classId: scopes[0] })).toBe(true);
        fc.pre(!scopes.includes(other));
        expect(canAccess(ctx, { classId: other })).toBe(false);
      }),
    );
  });
});

describe('child-own-only (PBT, US-009)', () => {
  it('child can mutate only their own progress', () => {
    fc.assert(
      fc.property(arbId, arbId, (childId, otherId) => {
        const ctx: AuthContext = { ...ctxWith([Role.Child]), userId: childId };
        expect(canMutateChildProgress(ctx, childId)).toBe(true);
        fc.pre(childId !== otherId);
        expect(canMutateChildProgress(ctx, otherId)).toBe(false);
      }),
    );
  });
});

describe('invite-email-match (US-004)', () => {
  it('matches case-insensitively and trims', () => {
    expect(inviteEmailMatches('A@B.com', ' a@b.com ')).toBe(true);
    fc.assert(
      fc.property(fc.emailAddress(), fc.emailAddress(), (a, b) => {
        fc.pre(a.toLowerCase() !== b.toLowerCase());
        expect(inviteEmailMatches(a, b)).toBe(false);
      }),
    );
  });
});
