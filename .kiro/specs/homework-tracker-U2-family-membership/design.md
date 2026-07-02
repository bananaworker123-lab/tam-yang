# Design: U2 Family & Membership

> Domain unit. Stories: US-003 (สร้างครอบครัว), US-004 (เชิญสมาชิก), US-005 (จัดการสมาชิก). ใช้ stack/convention จาก U0/U1

## Summary
- **Architecture**: NestJS module `family` + React (Onboarding, CreateFamily, FamilyManagement)
- **Components**: 5 — FamilyModule, InviteService, Onboarding, CreateFamilyPage, FamilyManagementPage
- **Entities**: 3 — Family, Membership, Invite
- **Endpoints**: 6 — create family, invite, accept invite, list members, remove member, cancel invite

## Architecture

```
Onboarding ─► CreateFamily ─► POST /families
Invite link (email) ─► AcceptInvite (verify Gmail == invited email) ─► join
FamilyManagementPage ─► list members / invite / remove
events: family.member.removed (→ U4 ลบ progress), member.joined
```

---

## Components

### FamilyModule (api)
- **Responsibilities**: สร้างครอบครัว, จัดการ membership, บังคับกฎ Child 1 ครอบครัว, สิทธิ์ Parent จัดการสมาชิก
- **Exposes**: `FamilyService` (create, listMembers, removeMember), publishes `family.member.removed`
- **Consumes**: shared-auth (RBAC), Prisma, shared-errors, event-bus

### InviteService (api)
- **Responsibilities**: สร้าง invite ผูกอีเมล+role, ส่งลิงก์ (email), verify Gmail ตรงตอน accept, กฎ Child 1 ครอบครัว
- **Exposes**: `createInvite`, `acceptInvite(token, googleEmail)`, `cancelInvite`

### Onboarding / CreateFamilyPage / FamilyManagementPage (web)
- ตาม prototype: เลือกสร้าง/เข้าร่วม; ฟอร์มสร้างครอบครัว; รายชื่อสมาชิก + สถานะคำเชิญ + ปุ่มเชิญ/ลบ

---

## Data Model

### Family (schema `family`)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| name | varchar | not null | ชื่อครอบครัว |
| school_id | UUID | null | เผื่อ multi-school |
| created_at/updated_at | timestamptz | not null | |

### Membership (schema `family`)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| family_id | UUID | FK→Family, not null, index | |
| user_id | UUID | FK→User, not null, index | |
| role | enum(parent,child) | not null | role ในครอบครัว |
| created_at | timestamptz | not null | |

**Constraint**: unique(user_id) WHERE role=child (Child 1 ครอบครัว); unique(family_id,user_id)

### Invite (schema `family`)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| family_id | UUID | FK, not null | |
| email | varchar | not null, index | อีเมลผู้ถูกเชิญ |
| role | enum(parent,child) | not null | |
| token | varchar | unique, not null | invite token |
| status | enum(pending,accepted) | not null, default pending | |
| created_at | timestamptz | not null | |

---

## API Specification

### POST /api/v1/families
- **Auth**: required (ผู้ใช้ที่ยังไม่มีครอบครัว) | **Request**: `{ name }` | **Response 201**: `{ familyId }` | **Errors**: 400 (ชื่อว่าง)

### POST /api/v1/families/:id/invites
- **Auth**: parent (ในครอบครัวนั้น) | **Request**: `{ email, role }` | **Response 201**: `{ inviteId }` | **Errors**: 403

### POST /api/v1/invites/:token/accept
- **Auth**: required | **Behavior**: verify google email == invite.email; Child duplicate check
- **Response 200**: `{ familyId, role }` | **Errors**: 403 (email mismatch), 409 (child มีครอบครัวแล้ว)

### GET /api/v1/families/:id/members
- **Auth**: member ของครอบครัว / admin | **Response 200**: `{ members[], invites[] }`

### DELETE /api/v1/families/:id/members/:userId  | DELETE /api/v1/invites/:id
- **Auth**: parent | **Response 204** | **Errors**: 403 ; emit `family.member.removed`

---

## Integration Points

| External System | Protocol | Purpose | Error Handling |
|----------------|----------|---------|----------------|
| Email service | SMTP/API | ส่งลิงก์เชิญ | ส่งล้มเหลว → mark invite, แจ้งผู้เชิญ retry |

---

## Implementation

### Directory Structure
```
apps/api/src/modules/family/{family.module.ts,family.service.ts,invite.service.ts,*.controller.ts,*.repository.ts}
apps/web/src/routes/{Onboarding.tsx,CreateFamily.tsx,FamilyManagement.tsx}
```
- **Tests**: Jest+Supertest (invite verify, child-1-family, RBAC parent), Vitest+RTL (flows)

---

## Correctness Properties

| Property | Description | Validates |
|----------|-------------|-----------|
| invite-email-match | accept สำเร็จ ⇔ google email == invite.email (random emails) | US-004 |
| child-single-family | child เข้าครอบครัวที่ 2 ถูกปฏิเสธเสมอ | US-004 |

---

## Traceability
| Requirement | Component | API | Data |
|-------------|-----------|-----|------|
| US-003 | CreateFamilyPage, FamilyModule | POST /families | Family, Membership |
| US-004 | InviteService, FamilyManagement | invites/accept | Invite, Membership |
| US-005 | FamilyManagement, FamilyModule | members list/delete | Membership, Invite |
