---
inclusion: always
---

# Project Structure

## Summary
<!-- 3-line max -->
- **Repo**: Monorepo (pnpm workspaces + Turborepo)
- **Source**: `apps/web` (React), `apps/api` (NestJS modules), `packages/shared-*`, `prisma/`
- **Entry**: `apps/web/src/main.tsx`; `apps/api/src/main.ts`

## Repository

- **Type**: Monorepo
- **Root**: pnpm workspace — apps (web, api) + shared packages + prisma + deploy config

## Key Directories

| Directory | Purpose | Key Contents |
|-----------|---------|-------------|
| Initial-requirement/ | Requirement source | `homework-tracker-design-brief.md`, `app_design/` |
| Initial-requirement/app_design/ | Design prototype | `Homeroom - Homework Tracker.dc.html`, screenshots, uploads |
| .kiro/skills/ | AI-DLC tooling | skill definitions |
| .kiro/specs/homework-tracker/ | Spec artifacts | context.md (+ requirements/design/tasks ภายหลัง) |
| .kiro/steering/ | Steering | product/tech/structure/resources/aidlc-workflow |

> Source code directory structure จะกำหนดในเฟส design

## Key Files

| File | Purpose | Notes |
|------|---------|-------|
| Initial-requirement/homework-tracker-design-brief.md | Functional & Non-functional spec | 16 screens, roles, rules |
| Initial-requirement/app_design/Homeroom - Homework Tracker.dc.html | UI prototype | ทุกหน้าจอ mobile+desktop + design system |

> Key files ของ application จะกำหนดในเฟส design

## Entry Points

> Entry points จะกำหนดในเฟส design (คาดว่ามี web frontend + backend API)

## Screen Inventory (จาก design prototype)

**หน้าบ้าน (Parent / Child / Teacher)**:
1. Login (Google Sign-In)
2. Onboarding (สร้าง/เข้าร่วมครอบครัว)
3. Create Family
4. Family Management
5. Dashboard (รายการการบ้าน + child tabs + summary)
6. Assignment Detail
7. Report Issue
8. My Requests
9. Teacher Class Overview (read-only inspector)
10. Profile

**หลังบ้าน (Admin)**:
11. Admin Overview (สถิติรวม + recent activity)
12. Assignment Master CRUD (Tasks)
13. Progress รวมทุกครอบครัว
14. Request Management
15. Audit Log (+search)
16. Teacher Assignment
17. Family Overview (admin)
