# Design: U5 Requests & Audit

> Domain unit. Stories: US-013 (ส่งคำขอ), US-014 (คำขอของฉัน), US-015 (admin จัดการคำขอ), US-016 (บันทึก audit), US-017 (ค้นหา audit). ใช้ stack/convention จาก U0-U4

## Summary
- **Architecture**: NestJS module `requests-audit` + React (ReportIssue, MyRequests, AdminRequests, AdminAudit)
- **Components**: 6 — RequestService, AuditService, ReportIssuePage, MyRequestsPage, AdminRequestsPage, AdminAuditPage
- **Entities**: 2 — Request, AuditEntry (append-only)
- **Endpoints**: submit/list-my/admin-list/resolve-reject request; list/search audit

## Architecture
```
ReportIssuePage ─► POST /requests (parent/child/teacher)
MyRequestsPage ─► GET /requests/mine
AdminRequestsPage ─► GET /requests + POST /requests/:id/resolve|reject (+reply)
AuditService subscribes progress.status.changed (U4) ─► append AuditEntry (idempotent by eventId)
AdminAuditPage ─► GET /audit?q= (search)
```

---

## Components

### RequestService (api)
- **Responsibilities**: สร้างคำขอ (ทุก role ยกเว้น admin), list ของตัวเอง, admin list + resolve/reject + reply
- **Exposes**: `createRequest`, `listMine`, `listAll`, `resolve`, `reject`
- **Consumes**: shared-auth, U3 assignment ref, event-bus

### AuditService (api)
- **Responsibilities**: subscribe `progress.status.changed` → append AuditEntry (idempotent by eventId), query/search (admin)
- **Subscribes**: `progress.status.changed`
- **Exposes**: `search(query)`

### Web pages
- ReportIssuePage (เลือกงาน + รายละเอียด), MyRequestsPage (สถานะ+คำตอบ), AdminRequestsPage (reply/approve/reject), AdminAuditPage (search log)

---

## Data Model

### Request (schema `requests_audit`)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| created_by | UUID | FK→User, not null, index | ผู้ส่ง |
| role | enum(parent,child,teacher) | not null | |
| assignment_id | UUID | FK→MasterAssignment, null | งานที่เกี่ยวข้อง |
| detail | text | not null | |
| status | enum(pending,resolved,rejected) | not null, default pending | |
| reply | text | null | คำตอบ admin |
| created_at/updated_at | timestamptz | | |

### AuditEntry (schema `requests_audit`, append-only)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| event_id | UUID | unique, not null | idempotency |
| actor_user_id | UUID | not null | |
| actor_role | varchar | not null | |
| child_user_id | UUID | not null | |
| assignment_id | UUID | not null | |
| from_status | varchar | not null | |
| to_status | varchar | not null | |
| created_at | timestamptz | not null, index | |

> ไม่มี update/delete (append-only); คงอยู่แม้สมาชิก/ครอบครัวถูกลบ (US-016)

---

## API Specification

### POST /api/v1/requests
- **Auth**: parent/child/teacher (ไม่ใช่ admin) | **Request**: `{ assignmentId?, detail }` | **Errors**: 400 (detail ว่าง), 403 (admin)

### GET /api/v1/requests/mine | GET /api/v1/requests (admin)
- **Auth**: required / admin | **Response 200**: `{ requests[] }`

### POST /api/v1/requests/:id/resolve | /reject
- **Auth**: admin | **Request**: `{ reply }` | **Response 200**: `{ status }`

### GET /api/v1/audit?q=
- **Auth**: admin | **Response 200**: `{ entries[] }` (filter by actor/child/task)

---

## Integration Points
| Source | Type | Purpose |
|--------|------|---------|
| U4 Progress | event | progress.status.changed → audit append |
| U3 Assignment | service | assignment ref ในคำขอ/audit |

---

## Implementation
```
apps/api/src/modules/requests-audit/{module.ts,request.service.ts,audit.service.ts,*.controller.ts,*.repository.ts}
apps/web/src/routes/{ReportIssue.tsx,MyRequests.tsx,admin/Requests.tsx,admin/Audit.tsx}
```
- **Tests**: Jest+Supertest (RBAC admin-only resolve, request lifecycle, audit append on event), Vitest+RTL; fast-check (audit idempotency)

## Correctness Properties
| Property | Description | Validates |
|----------|-------------|-----------|
| audit-append-idempotent | event เดียวกัน (event_id ซ้ำ) → audit entry ไม่เพิ่มซ้ำ | US-016 |
| request-lifecycle | pending → resolved/rejected เท่านั้น (ไม่ย้อน) | US-015 |

## Traceability
| Requirement | Component | API | Data |
|-------------|-----------|-----|------|
| US-013 | RequestService, ReportIssuePage | POST /requests | Request |
| US-014 | MyRequestsPage | GET /requests/mine | Request |
| US-015 | RequestService, AdminRequestsPage | resolve/reject | Request |
| US-016 | AuditService | (event) | AuditEntry |
| US-017 | AuditService, AdminAuditPage | GET /audit | AuditEntry |
