# Decomposition Decisions (D2)

## Context Summary
- **Product**: Homework Tracker — 22 stories, 9 functional areas, 4 roles (Admin/Parent/Child/Teacher)
- **Type**: Greenfield, web app + backend + database
- **Domains**: Auth/Identity, Family & Membership, Assignment Master, Progress Tracking, Notifications, Request/Issue, Audit Log, Teacher Inspector, Admin Back-office
- **Cross-cutting**: RBAC, data isolation ระหว่างครอบครัว, DB รองรับ multi-school
- **Integrations**: Google OAuth, email invite

---

## Decision Questions

### D2-1: ต้องแบ่ง unit ไหม
**Question**: โปรเจกต์นี้ควรแตกเป็นหลาย unit หรือทำเป็นก้อนเดียว?
- 1) แบ่งเป็นหลาย unit ตาม domain **(Recommended)** — ขอบเขตใหญ่ 22 stories, แยก domain ชัด
- 2) ทำเป็น unit เดียว (monolithic spec)
- 3) Other (please specify): _______

**Answer**: 

---

### D2-2: รูปแบบสถาปัตยกรรม
**Question**: โครงสร้างระบบควรเป็นแบบใด?
- 1) Modular Monolith — backend เดียวแบ่ง module ภายใน, deploy ง่าย **(Recommended)**
- 2) Microservices — แยก service ต่อ domain (overhead สูง)
- 3) Single Unit — ไม่มีการแบ่งโครงสร้างภายใน
- 4) Other (please specify): _______

**Answer**: 

---

### D2-3: กลยุทธ์การแบ่ง
**Question**: ใช้กลยุทธ์ใดในการแบ่ง unit?
- 1) Domain-Driven — แบ่งตาม bounded context (Identity, Family, Assignment, Progress, ...) **(Recommended)**
- 2) Layer-Based — แบ่งตามชั้น (frontend/backend/data)
- 3) User Journey-Based — แบ่งตาม flow ของผู้ใช้
- 4) Hybrid
- 4) Other (please specify): _______

**Answer**: 

---

### D2-4: ชุด unit ที่เสนอ
**Question**: เห็นด้วยกับชุด unit ที่เสนอนี้ไหม? (แก้ได้)
- 1) **(Recommended)** 6 units:
  - **U1 Identity & Access** — Google login, profile, RBAC, session (US-001, US-002)
  - **U2 Family & Membership** — สร้าง/เชิญ/จัดการสมาชิก, invite verification (US-003, US-004, US-005)
  - **U3 Assignment Master** — Admin CRUD, active ผูกชั้น+เทอม, class/term, teacher assignment (US-006, US-007, US-021)
  - **U4 Progress & Tracking** — อัปเดตสถานะ, data isolation, รายละเอียดงาน, แจ้งเตือนใกล้/เลยกำหนด (US-008, US-009, US-010, US-011, US-012)
  - **U5 Requests & Audit** — คำขอแก้ไข + จัดการ, audit log + ค้นหา (US-013, US-014, US-015, US-016, US-017)
  - **U6 Oversight (Teacher & Admin views)** — teacher class overview, admin overview/progress รวม/family overview (US-018, US-019, US-020, US-022)
- 2) รวม U5+U6 เป็น unit เดียว (เหลือ 5 units)
- 3) แยกละเอียดกว่านี้ (เช่น Notifications, Audit เป็น unit แยก)
- 4) Other (please specify): _______

**Answer**: 

---

### D2-5: ลำดับการพัฒนา
**Question**: ลำดับการพัฒนา unit ควรเป็นอย่างไร?
- 1) U1 → U2 → U3 → U4 → U5 → U6 (foundation-first ตาม dependency) **(Recommended)**
- 2) ทำ U1 ก่อน แล้วที่เหลือขนานกันตามทีม
- 3) Other (please specify): _______

**Answer**: 

---

## Decisions Summary
<!-- Machine-readable compact summary. Downstream phases: read ONLY this section. -->
<!-- Auto-populated after user fills answers. One line per decision. -->
- D2-1 Decompose: แบ่งเป็นหลาย unit ตาม domain
- D2-2 Architecture: Modular Monolith
- D2-3 Strategy: Domain-Driven (bounded context)
- D2-4 Unit Set: 6 units (U1 Identity, U2 Family, U3 Assignment Master, U4 Progress, U5 Requests & Audit, U6 Oversight)
- D2-5 Dev Sequence: U1 → U2 → U3 → U4 → U5 → U6 (foundation-first ตาม dependency)

---

**Instructions**: Fill in your answers above and respond with "done"
