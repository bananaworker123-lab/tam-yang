# Units of Work

## Summary
<!-- 10-line max. Downstream phases read ONLY this section. -->
- **Units**: 7 units — U0 Foundation (infra), U1 Identity & Access, U2 Family & Membership, U3 Assignment Master, U4 Progress & Tracking, U5 Requests & Audit, U6 Oversight
- **Strategy**: Domain-Driven (bounded contexts) + Foundation infra unit
- **Architecture**: Modular Monolith (backend เดียวแบ่ง module + responsive web frontend)
- **Story Distribution**: U0: 0, U1: 2, U2: 3, U3: 3, U4: 5, U5: 5, U6: 4 (รวม 22)
- **Key Dependencies**: ทุก unit → U0 (foundation); ทุก domain unit → U1 (identity/RBAC); U4 → U2,U3; U5 → U3,U4; U6 → U3,U4,U5
- **Development Sequence**: U0 → U1 → U2 → U3 → U4 → U5 → U6

## Overview
แตกเป็น 6 units ตาม bounded context เพื่อพัฒนาแบบเป็นลำดับ (foundation-first) และแยกความรับผิดชอบชัดเจน บน Modular Monolith

**Strategy**: Domain-Driven
**Rationale**: 22 stories ครอบคลุม 9 domain ที่มีขอบเขตชัด; การแบ่งตาม bounded context ทำให้ RBAC, data isolation และ DB schema ออกแบบสอดคล้องกัน และพัฒนาทีละส่วนได้

---

## Unit 0: Foundation (U0)

**Type**: Infrastructure (not domain)
**Purpose**: วางโครง monorepo + shared packages + cross-cutting (auth/RBAC/data-isolation guard, error envelope, DB setup + scope columns, in-process event bus, logging, CI/CD)
**Priority**: Foundation (ทำก่อน domain units)
**Complexity**: Medium
**Stories**: None (cross-cutting)

### Responsibilities
- scaffold monorepo (apps/web, apps/api, packages/shared-*)
- shared-types, shared-ui (design tokens + base components), shared-auth, shared-errors, shared-logging, shared-config
- DB baseline + schema/migration + scope columns (family_id, school_id เผื่อ multi-school)
- in-process event bus utility, CI/CD baseline

### Dependencies
| Depends On | Type | Description |
|------------|------|-------------|
| (Google OAuth) | API | external identity provider |

**Depended on by**: U1, U2, U3, U4, U5, U6

---

## Unit 1: Identity & Access (U1)

**Purpose**: จัดการการเข้าสู่ระบบด้วย Google, โปรไฟล์, role และการบังคับสิทธิ์ (RBAC) เป็นรากฐานของทุก unit
**Priority**: High
**Complexity**: Medium
**Stories**: 2 stories — US-001, US-002

### Commands
| Command | Description | Actor |
|---------|-------------|-------|
| SignInWithGoogle | เริ่ม OAuth flow, สร้าง/เชื่อมบัญชี | User |
| SignOut | จบ session | User |
| ViewProfile | ดู role + ขอบเขตที่เกี่ยวข้อง | User |
| AuthorizeRequest | ตรวจสิทธิ์ตาม role ต่อ request | System |

### Domain Model
**Aggregates**: User (root: User)
**Entities**: User, Session
**Value Objects**: Email, Role (Admin/Parent/Child/Teacher)

### Domain Events
**Publishes**: UserAuthenticated — เมื่อ login สำเร็จ
**Subscribes**: —

### Dependencies
| Depends On | Type | Description |
|------------|------|-------------|
| (Google OAuth) | API | external identity provider |

---

## Unit 2: Family & Membership (U2)

**Purpose**: สร้างครอบครัว, เชิญสมาชิกผ่านอีเมล (ผูก Gmail), จัดการสมาชิก/คำเชิญ และบังคับกฎ Child 1 ครอบครัว
**Priority**: High
**Complexity**: Medium
**Stories**: 3 stories — US-003, US-004, US-005

### Commands
| Command | Description | Actor |
|---------|-------------|-------|
| CreateFamily | สร้างครอบครัว + กำหนดผู้สร้างเป็น Parent | Parent |
| InviteMember | สร้างคำเชิญผูกอีเมล + role | Parent |
| AcceptInvite | ยืนยันด้วย Gmail ที่ตรง → เข้าครอบครัว | Invitee |
| RemoveMember | ลบสมาชิก/ยกเลิกคำเชิญ | Parent |

### Domain Model
**Aggregates**: Family (root: Family)
**Entities**: Family, Membership, Invite
**Value Objects**: InviteStatus (pending/accepted), Email

### Domain Events
**Publishes**: MemberJoined, MemberRemoved — สำหรับ Progress cleanup
**Subscribes**: UserAuthenticated from U1 — ผูกบัญชีกับ membership

### Dependencies
| Depends On | Type | Description |
|------------|------|-------------|
| U1 Identity & Access | Data/API | ต้องมี user + role |
| (Email service) | API | ส่งลิงก์เชิญ |

---

## Unit 3: Assignment Master (U3)

**Purpose**: มาสเตอร์การบ้านกลาง (Admin CRUD), ชั้นเรียน/เทอม, active flag และการมอบหมายครูเข้าชั้น (รวม class registry ที่ teacher/progress อ้างอิง)
**Priority**: High
**Complexity**: Medium
**Stories**: 3 stories — US-006, US-007, US-021

### Commands
| Command | Description | Actor |
|---------|-------------|-------|
| CreateAssignment / UpdateAssignment / DeleteAssignment | จัดการมาสเตอร์ | Admin |
| ToggleActive | เปิด/ปิดการแสดงงาน | Admin |
| AssignTeacher / RevokeTeacher | มอบหมาย/ถอดครูจากชั้น | Admin |

### Domain Model
**Aggregates**: MasterAssignment (root), ClassRoom (root)
**Entities**: MasterAssignment, ClassRoom, Term, TeacherAssignment
**Value Objects**: Subject, DueDate, ActiveFlag

### Domain Events
**Publishes**: AssignmentChanged, TeacherAssignmentChanged
**Subscribes**: UserAuthenticated from U1

### Dependencies
| Depends On | Type | Description |
|------------|------|-------------|
| U1 Identity & Access | Data/API | ตรวจ Admin role + teacher identity |

---

## Unit 4: Progress & Tracking (U4)

**Purpose**: สถานะการบ้านต่อ (Child + Assignment), data isolation ระหว่างครอบครัว, รายละเอียดงาน และการคำนวณสถานะแจ้งเตือน (near/due/overdue)
**Priority**: High
**Complexity**: High
**Stories**: 5 stories — US-008, US-009, US-010, US-011, US-012

### Commands
| Command | Description | Actor |
|---------|-------------|-------|
| UpdateProgressStatus | เปลี่ยนสถานะ (วนอิสระ) | Parent/Child |
| ViewAssignmentDetail | ดูรายละเอียดงาน | Parent/Child |
| ComputeDueState | คำนวณ near/due/overdue | System |

### Domain Model
**Aggregates**: Progress (root: Progress per Child+Assignment)
**Entities**: Progress
**Value Objects**: ProgressStatus (NotStarted/Done/Submitted), DueState (near/dueToday/overdue)

### Domain Events
**Publishes**: ProgressChanged — ให้ U5 บันทึก audit
**Subscribes**: AssignmentChanged from U3; MemberRemoved from U2 (ลบ progress); MemberJoined from U2

### Dependencies
| Depends On | Type | Description |
|------------|------|-------------|
| U1 | API | RBAC + family scope |
| U2 | Data/Event | family membership (เด็กในครอบครัว) |
| U3 | Data/Event | assignment ที่ active + ชั้น/เทอม |

---

## Unit 5: Requests & Audit (U5)

**Purpose**: คำขอแก้ไขมาสเตอร์ (submit/my requests/admin manage) และ audit log ของทุกการเปลี่ยนสถานะ (บันทึก + ค้นหา)
**Priority**: High
**Complexity**: Medium
**Stories**: 5 stories — US-013, US-014, US-015, US-016, US-017

### Commands
| Command | Description | Actor |
|---------|-------------|-------|
| SubmitRequest | ส่งคำขอแก้ไขมาสเตอร์ | Parent/Child/Teacher |
| ResolveRequest / RejectRequest | จัดการคำขอ + ตอบกลับ | Admin |
| RecordAudit | บันทึกการเปลี่ยนสถานะ | System |
| SearchAudit | ค้นหา/กรอง log | Admin |

### Domain Model
**Aggregates**: Request (root), AuditLog (root)
**Entities**: Request, AuditEntry
**Value Objects**: RequestStatus (pending/resolved/rejected), AuditChange (from→to)

### Domain Events
**Publishes**: RequestResolved
**Subscribes**: ProgressChanged from U4 (เขียน audit); AssignmentChanged from U3

### Dependencies
| Depends On | Type | Description |
|------------|------|-------------|
| U1 | API | RBAC |
| U3 | Data | อ้างอิง assignment ในคำขอ |
| U4 | Event | ProgressChanged → audit |

---

## Unit 6: Oversight (Teacher & Admin views) (U6)

**Purpose**: มุมมองอ่านอย่างเดียวข้ามครอบครัว — teacher class overview และ admin dashboards (overview, progress รวม, family overview)
**Priority**: Medium
**Complexity**: Medium
**Stories**: 4 stories — US-018, US-019, US-020, US-022

### Commands
| Command | Description | Actor |
|---------|-------------|-------|
| ViewClassOverview | ครูดู progress ของชั้น (read-only) | Teacher |
| ViewAdminOverview | KPI + recent activity | Admin |
| ViewAllProgress | progress รวมทุกครอบครัว + filter | Admin |
| ViewAllFamilies | รายชื่อครอบครัว + สมาชิก | Admin |

### Domain Model
**Aggregates**: (read models / projections — ไม่มี aggregate เขียนใหม่)
**Entities**: ClassProgressView, AdminOverviewView (projection)
**Value Objects**: StatusFilter

### Domain Events
**Publishes**: —
**Subscribes**: ProgressChanged, AssignmentChanged, TeacherAssignmentChanged — อัปเดต read models

### Dependencies
| Depends On | Type | Description |
|------------|------|-------------|
| U1 | API | RBAC (teacher scope/admin) |
| U3 | Data | class/teacher assignment, assignments |
| U4 | Data | progress data |
| U5 | Data | audit (recent activity), requests (pending count) |

---

## Context Map

| Upstream | Downstream | Pattern |
|----------|------------|---------|
| U0 Foundation | U1, U2, U3, U4, U5, U6 | Shared Kernel (scaffold + shared packages) |
| U1 Identity | U2, U3, U4, U5, U6 | Shared Kernel (identity/RBAC) |
| U2 Family | U4 Progress | Customer/Supplier |
| U3 Assignment | U4, U5, U6 | Customer/Supplier |
| U4 Progress | U5 Audit | Publisher/Subscriber (ProgressChanged) |
| U2/U3/U4/U5 | U6 Oversight | Publisher/Subscriber (read models) |

**Patterns**: Shared Kernel (identity), Customer/Supplier, Publisher/Subscriber

> ไม่มี circular dependency — dependency เป็นทิศทางเดียวตามลำดับ U1→U6

---

## Development Sequence

### Phase 1: Foundation (infrastructure)
- [ ] U0 Foundation — scaffold monorepo + shared packages + cross-cutting (auth/RBAC/data-isolation, error, DB, events, CI/CD)

### Phase 2: Identity
- [ ] U1 Identity & Access — รากฐาน auth + RBAC ที่ทุก unit ใช้

### Phase 3: Core domain
- [ ] U2 Family & Membership — ขอบเขตข้อมูล (family scope)
- [ ] U3 Assignment Master — มาสเตอร์ + class/teacher

### Phase 4: Tracking
- [ ] U4 Progress & Tracking — หัวใจการใช้งาน + data isolation + แจ้งเตือน

### Phase 5: Supporting
- [ ] U5 Requests & Audit — คำขอ + audit
- [ ] U6 Oversight — teacher + admin views (อิงข้อมูลจาก unit ก่อนหน้า)
