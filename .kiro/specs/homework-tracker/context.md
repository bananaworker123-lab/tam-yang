# Context Assessment

## Summary
<!-- 10-line max. Downstream phases read ONLY this section. -->
- **Type**: Greenfield
- **Stack**: Pending D3 decisions (responsive web app; Google OAuth required; ต้องมี backend + database)
- **Architecture**: Pending D2/D3 decisions (multi-tenant ระดับครอบครัว, RBAC 4 roles, audit log, data isolation)
- **Feature**: เว็บแอปติดตามการบ้านที่หลายครอบครัวใช้มาสเตอร์การบ้านกลางร่วมกัน แต่ละครอบครัวเห็นเฉพาะ progress ของตัวเอง
- **Impact**: New standalone product
- **Complexity**: High — ~18-22 stories, 8 domains, 4 user types, 16 หน้าจอ
- **Recommendations**: Personas Yes, Units Yes, NFR Yes

## Project Overview
- **Type**: Greenfield
- **Assessment Date**: 2026-06-30T00:00:00Z

แหล่งที่มาความต้องการ:
- `Initial-requirement/homework-tracker-design-brief.md` — Functional & Non-Functional Spec + รายการ 16 หน้าจอ
- `Initial-requirement/app_design/Homeroom - Homework Tracker.dc.html` — interactive design prototype (UI ครบทุกหน้า, mobile + desktop)
- `Initial-requirement/app_design/screenshots/*.png` — ภาพหน้าจอประกอบ

## Technology Stack
- **Languages**: N/A — greenfield (Pending D3 decisions)
- **Frameworks**: N/A — greenfield (Pending D3 decisions)
- **Build System**: N/A — greenfield (Pending D3 decisions)
- **Testing**: N/A — greenfield (Pending D3 decisions)
- **Infrastructure**: N/A — greenfield (Pending D3 decisions)

> หมายเหตุ: ต่างจาก client-only app ทั่วไป โปรเจกต์นี้ต้องมี backend + persistent database เพราะมี multi-family data isolation, RBAC, audit log, และ shared master ที่ Admin ควบคุม

## Feature Impact

**Affected Areas**: New standalone — workspace มีเฉพาะ AI-DLC skills + เอกสาร/ดีไซน์ requirement (ยังไม่มี source code)

| Area | Impact | Reason |
|------|--------|--------|
| Authentication / Identity | New | Google OAuth Sign-In; ยืนยันตัวตนผู้ถูกเชิญผ่าน Gmail ที่ตรงกับอีเมลเชิญ |
| Family & Membership | New | สร้าง/เข้าร่วมครอบครัว, คำเชิญผ่านลิงก์อีเมล, หลาย Parent/Child; Child อยู่ได้ 1 ครอบครัว |
| Assignment Master | New | มาสเตอร์การบ้านกลาง (Admin CRUD) ผูกชั้นเรียน+เทอม, active toggle |
| Progress Tracking | New | สถานะต่อ (Child + Assignment): Not started/Done/Submitted; data isolation ระหว่างครอบครัว |
| Request / Issue Flow | New | คำขอแก้ไขมาสเตอร์ pending→resolved/rejected พร้อมข้อความตอบกลับ Admin |
| Audit Log | New | บันทึกทุกการเปลี่ยนสถานะ (ใคร/role/เมื่อ/จากอะไรเป็นอะไร/งานไหน/เด็กคนไหน) + ค้นหา |
| Notifications (in-app) | New | badge/สี เมื่อใกล้/เลยกำหนดส่ง ไม่มี noti ภายนอก |
| Teacher Inspector View | New | ดู progress เด็กทุกคนในชั้นที่ดูแล (read-only, ข้ามครอบครัว) |
| Admin Back-office | New | Overview, Assignment CRUD, Progress รวม, Request mgmt, Audit, Teacher assignment, Family overview |

## Recommendations

- Story Count: High (11+) — ประเมิน ~18-22 stories จาก 16 หน้าจอ + flow เบื้องหลัง
- Domain Boundaries: Identity/Auth, Family, Assignment Master, Progress, Requests, Audit, Notifications, Admin
- User Types: Admin, Parent, Child, Teacher (4 roles, permission ต่างกันชัดเจน)
- Integration Points: Google OAuth (จำเป็น); การส่งลิงก์เชิญผ่านอีเมล (กลไกต้องยืนยันใน design)
- **Personas**: Yes — 4 role ที่สิทธิ์/เป้าหมายต่างกันมาก กระทบ requirements/design โดยตรง
- **Units**: Yes — 8 domain แยกขอบเขตชัด เหมาะแบ่ง unit เพื่อพัฒนาเป็นส่วน ๆ
- **NFR**: Yes — data isolation ระหว่างครอบครัวเป็นข้อกำหนดความปลอดภัยหลัก + RBAC + performance หน้ารายการ active + privacy ข้อมูลเด็ก

## Recommended Workflow

```
       ┌─────────────┐
       │  Context ✅  │
       └──────┬──────┘
              ▼
       ┌──────────────────────┐
       │ Requirements         │  ← personas (Admin/Parent/Child/Teacher)  [next]
       └──────┬───────────────┘
              ▼
       ┌───────────────┐
       │ Decomposition │
       └───────┬───────┘
               ▼
       ┌────────────┐
       │ Foundation │  ← greenfield: ตั้ง convention/contract/infra กลาง
       └──┬─────┬───┘
          │     │
          ▼     ▼
     ┌────────┐ ┌────────┐
     │ Unit 1 │ │ Unit N │  ← each: Design (+NFR) → Tasks → Implement
     └───┬────┘ └───┬────┘
         │          │
         ▼          ▼
     ┌──────────────────┐
     │ Solutions Review │
     └────────┬─────────┘
              ▼
     ┌─────────────┐
     │ Code Review │
     └─────────────┘
```

## External References

| Source | Type | What was used |
|--------|------|---------------|
| `Initial-requirement/homework-tracker-design-brief.md` | Requirements + Page list | Roles, auth/family rules, master assignment, progress, audit, requests, notifications, 16 screens |
| `Initial-requirement/app_design/Homeroom - Homework Tracker.dc.html` | Design prototype | UI ทุกหน้า (mobile+desktop), design system, status pill cycle, role switcher, screen behaviors |
| `Initial-requirement/app_design/screenshots/*.png` | Screenshots | ภาพประกอบหน้าจอ |
| Mobbin / Uizard / Figma / EduAdmin (ใน brief) | Design reference | แนวทาง UI task tracker + admin dashboard |
