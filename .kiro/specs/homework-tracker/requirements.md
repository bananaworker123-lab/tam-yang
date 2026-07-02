# Requirements

## Summary
<!-- 10-line max. Downstream phases read ONLY this section. -->
- **Total Stories**: 22 across 9 functional areas
- **Priority**: 13 High, 7 Medium, 2 Low
- **User Types**: Admin, Parent, Child, Teacher
- **Key Entities**: User, Family, Membership/Invite, Class, MasterAssignment, Progress, Request, AuditLog
- **Integrations**: Google OAuth (OpenID Connect); email สำหรับส่งลิงก์เชิญ
- **Core Flows**: login(Google) → create/join family → ดู dashboard ตามลูก → ติ๊กสถานะ; admin จัดการ master/คำขอ/ครู; teacher ดูชั้น (read-only)

## Overview
User stories จัดกลุ่มตาม functional area พร้อม acceptance criteria แบบ EARS อ้างอิงจาก D1 decisions, personas และ design prototype (16 หน้าจอ)

---

## Functional Area 1: Authentication & Identity

### US-001: เข้าสู่ระบบด้วย Google
**As a** ผู้ใช้ทุก role
**I want** login ด้วยบัญชี Google
**So that** เข้าใช้งานได้โดยไม่ต้องสมัคร/จำรหัสผ่าน

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** ผู้ใช้กดปุ่ม "Sign in with Google", **THEN** ระบบเริ่ม OAuth flow และสร้าง/เชื่อมบัญชีจากอีเมล Google
2. **IF** เป็นการ login ครั้งแรกและยังไม่ผูกกับครอบครัว/role ใด, **THEN** นำผู้ใช้ไปหน้า onboarding, **ELSE** นำไปหน้าหลักตาม role
3. **WHEN** การยืนยันกับ Google ล้มเหลวหรือถูกยกเลิก, **THEN** แสดงข้อความผิดพลาดและคงอยู่หน้า login
4. **WHILE** ยังไม่ได้ login, **IF** ผู้ใช้พยายามเข้าหน้าที่ต้องสิทธิ์, **THEN** redirect ไปหน้า login

**Dependencies**: None
**Source**: D1-2; Design: Login

### US-002: ออกจากระบบและดูโปรไฟล์
**As a** ผู้ใช้ทุก role
**I want** ดูข้อมูลตัวเอง (role, ชั้นเรียนที่เกี่ยวข้อง) และออกจากระบบ
**So that** ตรวจสอบบทบาทและจบ session ได้

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** ผู้ใช้เปิดหน้า Profile, **THEN** แสดงชื่อ, อีเมล, role และชั้นเรียน/ครอบครัวที่เกี่ยวข้อง
2. **WHEN** ผู้ใช้กด "ออกจากระบบ", **THEN** จบ session และกลับไปหน้า login

**Dependencies**: US-001
**Source**: Design: Profile

---

## Functional Area 2: Family & Membership

### US-003: สร้างครอบครัว
**As a** Parent
**I want** สร้างครอบครัวใหม่
**So that** เริ่มเพิ่มสมาชิกและติดตามการบ้านของลูกได้

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** ผู้ใช้ที่ยังไม่มีครอบครัวเลือก "สร้างครอบครัวใหม่" และกรอกชื่อครอบครัว, **THEN** ระบบสร้างครอบครัวและกำหนดผู้สร้างเป็น Parent ในครอบครัวนั้น
2. **IF** ชื่อครอบครัวว่าง, **THEN** แสดง validation error และไม่สร้าง

**Dependencies**: US-001
**Source**: D1-1; Design: Create Family, Onboarding

### US-004: เชิญสมาชิกเข้าครอบครัว
**As a** Parent
**I want** เชิญผู้ปกครองคนอื่นหรือลูกเข้าร่วมครอบครัวผ่านลิงก์อีเมล โดยระบุ role
**So that** สมาชิกในครอบครัวใช้ระบบร่วมกันได้

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** Parent กรอกอีเมลผู้ถูกเชิญและเลือก role (Parent/Child), **THEN** ระบบสร้างคำเชิญสถานะ pending และส่งลิงก์ไปอีเมลนั้น
2. **WHEN** ผู้ถูกเชิญเปิดลิงก์และ login ด้วย Gmail ที่ตรงกับอีเมลที่ถูกเชิญ, **THEN** ระบบเพิ่มเขาเข้าครอบครัวด้วย role ที่กำหนดและเปลี่ยนคำเชิญเป็น accepted
3. **IF** ผู้เปิดลิงก์ login ด้วย Gmail ที่ไม่ตรงกับอีเมลที่ถูกเชิญ, **THEN** ปฏิเสธการเข้าร่วมและแสดงข้อความ
4. **IF** ผู้ถูกเชิญเป็น Child ที่อยู่ในครอบครัวอื่นแล้ว, **THEN** ปฏิเสธ (Child อยู่ได้ 1 ครอบครัว) และแจ้งเหตุผล
5. **WHILE** คำเชิญยัง pending, **THEN** แสดงสถานะคำเชิญในหน้าจัดการครอบครัว

**Dependencies**: US-003
**Source**: D1-2, D1-3; Design: Family Management

### US-005: จัดการสมาชิกในครอบครัว
**As a** Parent
**I want** ดูรายชื่อสมาชิก, สถานะคำเชิญ และลบสมาชิก/ยกเลิกคำเชิญ
**So that** ดูแลองค์ประกอบครอบครัวให้ถูกต้อง

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** Parent เปิดหน้าจัดการครอบครัว, **THEN** แสดงสมาชิกทุกคนพร้อม role และคำเชิญที่ pending/accepted
2. **WHEN** Parent ลบสมาชิกหรือยกเลิกคำเชิญ, **THEN** ระบบถอดสมาชิก/ยกเลิกคำเชิญ และข้อมูล progress ของสมาชิกที่ถูกลบจะถูกลบ (audit log คงไว้)
3. **IF** ผู้ใช้ที่ไม่ใช่ Parent ของครอบครัวพยายามจัดการสมาชิก, **THEN** ปฏิเสธด้วยสิทธิ์ไม่พอ

**Dependencies**: US-004
**Source**: D1-4, D1-9; Design: Family Management

---

## Functional Area 3: Assignment Master

### US-006: สร้าง/แก้ไข/ลบ มาสเตอร์การบ้าน (Admin)
**As a** Admin
**I want** จัดการมาสเตอร์การบ้านกลาง (วิชา, ครู, ชั้นเรียน, เทอม, วันสั่ง, กำหนดส่ง, active)
**So that** ทุกครอบครัวอ้างอิงรายการการบ้านชุดเดียวกันที่ถูกต้อง

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** Admin บันทึกการบ้านใหม่พร้อมฟิลด์ครบ, **THEN** ระบบสร้าง MasterAssignment ผูกกับชั้นเรียน+เทอม
2. **WHEN** Admin แก้ไขหรือลบการบ้าน, **THEN** ระบบอัปเดต/ลบและบันทึกการเปลี่ยนแปลง
3. **IF** ฟิลด์บังคับ (วิชา/ชั้นเรียน/กำหนดส่ง) ว่างหรือกำหนดส่งก่อนวันสั่ง, **THEN** แสดง validation error และไม่บันทึก
4. **WHEN** Admin toggle active เป็น off, **THEN** การบ้านนั้นไม่ปรากฏในรายการ active ของผู้ใช้
5. **IF** ผู้ใช้ที่ไม่ใช่ Admin พยายามแก้มาสเตอร์, **THEN** ปฏิเสธ

**Dependencies**: US-001
**Source**: D1-1; Design: Admin Tasks (CRUD)

### US-007: กำหนดสถานะ active ผูกชั้นเรียน+เทอม
**As a** Admin
**I want** ให้การบ้าน active ตามชั้นเรียน+เทอม
**So that** ผู้ใช้เห็นเฉพาะงานที่เกี่ยวข้องกับลูกของตน

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** ระบบแสดงรายการการบ้านให้ครอบครัว, **THEN** กรองเฉพาะการบ้าน active ที่ตรงชั้นเรียน+เทอมของลูกในครอบครัว
2. **IF** ไม่มีการบ้าน active สำหรับลูกคนใด, **THEN** แสดงสถานะว่าง (empty state)

**Dependencies**: US-006
**Source**: D1-1; Design: Dashboard

---

## Functional Area 4: Progress Tracking

### US-008: อัปเดตสถานะการบ้านของลูก (Parent)
**As a** Parent
**I want** เปลี่ยนสถานะการบ้านของลูกทุกคนในครอบครัว (Not started/Done/Submitted)
**So that** บันทึกความคืบหน้าได้

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** Parent แตะ status pill ของงานหนึ่ง, **THEN** สถานะวนเปลี่ยน Not started → Done → Submitted และบันทึกทันที
2. **WHILE** สถานะใด ๆ, **IF** Parent เลือกเปลี่ยนไปสถานะอื่น, **THEN** อนุญาตเปลี่ยนได้อิสระทุกทิศ (รวมย้อนกลับ)
3. **WHEN** สถานะถูกเปลี่ยน, **THEN** ระบบเขียน audit log (actor, role, from→to, assignment, child, timestamp)
4. **IF** Parent พยายามแก้สถานะของเด็กนอกครอบครัวตัวเอง, **THEN** ปฏิเสธ

**Dependencies**: US-007
**Source**: D1-5; Design: Dashboard, Assignment Detail

### US-009: อัปเดตสถานะการบ้านของตัวเอง (Child)
**As a** Child
**I want** เปลี่ยนสถานะการบ้านของตัวเอง
**So that** รายงานว่าทำ/ส่งงานแล้ว

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** Child แตะ status pill ของงานตัวเอง, **THEN** สถานะวนเปลี่ยนและบันทึก + เขียน audit log
2. **IF** Child พยายามแก้สถานะของพี่น้องหรือเด็กคนอื่น, **THEN** ปฏิเสธ
3. **WHILE** Child ดู dashboard, **THEN** เห็นเฉพาะการบ้าน+สถานะของตัวเองเท่านั้น

**Dependencies**: US-007
**Source**: D1-5, D1-6; Design: Dashboard

### US-010: Data isolation ระหว่างครอบครัว
**As a** Parent/Child
**I want** ให้ข้อมูล progress ของครอบครัวเราถูกแยกจากครอบครัวอื่น
**So that** ความเป็นส่วนตัวของลูกได้รับการปกป้อง

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** ผู้ใช้ในครอบครัว A ร้องขอข้อมูล progress, **THEN** ระบบคืนเฉพาะข้อมูลของครอบครัว A
2. **IF** มีการพยายามเข้าถึง progress ของครอบครัวอื่นผ่าน id โดยตรง, **THEN** ระบบปฏิเสธ (403/not found)
3. **WHILE** แสดงผลทุกหน้า, **THEN** ไม่มีข้อมูลของครอบครัวอื่นรั่วไหล

**Dependencies**: US-008, US-009
**Source**: NFR (data isolation); product.md

### US-011: ดูรายละเอียดงาน
**As a** Parent/Child
**I want** เปิดดูรายละเอียดงานแต่ละชิ้น
**So that** เห็นข้อมูลครบและเปลี่ยนสถานะหรือแจ้งปัญหาได้

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** ผู้ใช้เปิดรายละเอียดงาน, **THEN** แสดง วิชา, ครู, วันสั่ง, กำหนดส่ง, สถานะปัจจุบัน และปุ่มเปลี่ยนสถานะ + ปุ่มแจ้งแอดมิน
2. **WHEN** ผู้ใช้เปลี่ยนสถานะจากหน้านี้, **THEN** บันทึกและสะท้อนกลับใน dashboard

**Dependencies**: US-008
**Source**: Design: Assignment Detail

---

## Functional Area 5: Notifications (in-app)

### US-012: แจ้งเตือนใกล้/ครบ/เลยกำหนดในแอป
**As a** Parent/Child
**I want** เห็น badge/สีบอกงานที่ใกล้กำหนด ครบกำหนด หรือเลยกำหนด
**So that** ไม่พลาดส่งงาน

**Priority**: High

**Acceptance Criteria**:
1. **IF** วันปัจจุบันอยู่ภายใน 2 วันก่อนกำหนดส่ง และงานยังไม่ Submitted, **THEN** แสดงสถานะ "ใกล้กำหนด" (เหลืองอ่อน)
2. **IF** วันปัจจุบันเป็นวันกำหนดส่งและงานยังไม่ Submitted, **THEN** แสดง "ครบกำหนดวันนี้" (เหลืองเข้ม)
3. **IF** เลยวันกำหนดส่งและงานยังไม่ Submitted, **THEN** แสดง "overdue" (แดง)
4. **IF** งาน Submitted แล้ว, **THEN** ไม่แสดงการเตือนใกล้/เลยกำหนด
5. **WHILE** อยู่ในแอป, **THEN** การแจ้งเตือนแสดงผ่าน badge/สีเท่านั้น (ไม่มี noti ภายนอก)

**Dependencies**: US-008
**Source**: D1-7, D1-11; Design: Dashboard (status pills)

---

## Functional Area 6: Request / Issue Flow

### US-013: ส่งคำขอแก้ไขมาสเตอร์
**As a** Parent/Child/Teacher
**I want** แจ้งปัญหา/คำขอแก้ไขมาสเตอร์การบ้าน
**So that** Admin แก้ไขข้อมูลที่ผิดได้

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** ผู้ใช้ (ยกเว้น Admin) เลือกงานที่เกี่ยวข้องและกรอกรายละเอียดแล้วส่ง, **THEN** ระบบสร้าง Request สถานะ pending
2. **IF** รายละเอียดว่าง, **THEN** แสดง validation error และไม่ส่ง
3. **WHEN** Admin พยายามใช้ฟอร์มส่งคำขอ, **THEN** ไม่แสดงฟังก์ชันนี้ (Admin แก้เองได้)

**Dependencies**: US-006
**Source**: Design: Report Issue

### US-014: ดูคำขอของฉัน
**As a** Parent/Child/Teacher
**I want** ดูรายการคำขอที่เคยส่งพร้อมสถานะและคำตอบ
**So that** ติดตามผลคำขอของตัวเองได้

**Priority**: Low

**Acceptance Criteria**:
1. **WHEN** ผู้ใช้เปิดหน้า "คำขอของฉัน", **THEN** แสดงคำขอทั้งหมดของตัวเองพร้อมสถานะ (pending/resolved/rejected) และข้อความตอบกลับ
2. **WHILE** ไม่มีคำขอ, **THEN** แสดง empty state

**Dependencies**: US-013
**Source**: Design: My Requests

### US-015: จัดการคำขอ (Admin)
**As a** Admin
**I want** ดูคำขอทั้งหมด อนุมัติ/ปฏิเสธ พร้อมเขียนข้อความตอบกลับ
**So that** ตอบสนองคำขอและปรับมาสเตอร์ได้

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** Admin เปิดหน้าจัดการคำขอ, **THEN** แสดงคำขอจากทุก role พร้อมรายละเอียดและผู้ส่ง
2. **WHEN** Admin กด approve หรือ reject พร้อมข้อความ, **THEN** เปลี่ยนสถานะคำขอเป็น resolved/rejected และบันทึกข้อความตอบกลับ
3. **WHEN** สถานะคำขอเปลี่ยน, **THEN** ผู้ส่งเห็นสถานะและคำตอบในหน้า "คำขอของฉัน"

**Dependencies**: US-013
**Source**: Design: Admin Requests

---

## Functional Area 7: Audit Log

### US-016: บันทึก audit ทุกการเปลี่ยนสถานะ
**As a** Admin
**I want** ให้ระบบบันทึกทุกการเปลี่ยนสถานะการบ้านโดยอัตโนมัติ
**So that** ตรวจสอบย้อนหลังได้ว่าใครเปลี่ยนอะไรเมื่อไหร่

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** มีการเปลี่ยนสถานะ progress ใด ๆ, **THEN** ระบบเขียน AuditLog: actor, role, timestamp, from→to, assignment, child
2. **IF** สมาชิก/ครอบครัวถูกลบ, **THEN** audit log ที่เกี่ยวข้องยังคงอยู่ (ไม่ถูกลบ)

**Dependencies**: US-008, US-009
**Source**: D1-9; Design: Admin Audit

### US-017: ค้นหา/กรอง audit log (Admin)
**As a** Admin
**I want** ค้นหาและกรองรายการ audit log
**So that** หาเหตุการณ์ที่ต้องการได้เร็ว

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** Admin พิมพ์คำค้น, **THEN** แสดงเฉพาะ log ที่ตรง (ชื่อผู้กระทำ/เด็ก/งาน)
2. **IF** ไม่มีรายการตรง, **THEN** แสดง "No matching entries"

**Dependencies**: US-016
**Source**: Design: Admin Audit

---

## Functional Area 8: Teacher Inspector View

### US-018: ครูดูภาพรวม progress ของชั้น (read-only)
**As a** Teacher
**I want** ดูสถานะการบ้านของเด็กทุกคนในชั้นที่ได้รับมอบหมาย
**So that** รู้ว่าใครขาดงานอะไรบ้าง

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** Teacher เปิด class overview, **THEN** แสดง progress ของเด็กทุกคนในชั้นที่ได้รับมอบหมาย (ข้ามครอบครัว) แบบ read-only
2. **WHEN** Teacher กรองตามสถานะ (to do/overdue/submitted), **THEN** แสดงเฉพาะรายการที่ตรง
3. **IF** Teacher พยายามเปลี่ยนสถานะของเด็ก, **THEN** ปฏิเสธ (read-only)
4. **IF** Teacher ถูก revoke จากชั้น, **THEN** ไม่เห็นข้อมูลชั้นนั้นอีก

**Dependencies**: US-007, US-021
**Source**: D1-8; Design: Teacher Class Overview

---

## Functional Area 9: Admin Back-office

### US-019: Admin overview dashboard
**As a** Admin
**I want** เห็นสถิติรวม (จำนวนครอบครัว, งาน active, คำขอค้าง, % completion) และกิจกรรมล่าสุด
**So that** ประเมินภาพรวมระบบได้อย่างรวดเร็ว

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** Admin เปิด overview, **THEN** แสดง KPI: families, active tasks, pending requests, completion %
2. **WHEN** มีกิจกรรมล่าสุด, **THEN** แสดงรายการ recent activity (จาก audit) และเด็กที่ต้องกระตุ้น

**Dependencies**: US-016
**Source**: Design: Admin Overview

### US-020: ดู progress รวมทุกครอบครัว (Admin)
**As a** Admin
**I want** ดูสถานะของทุกครอบครัวต่องานแต่ละชิ้น พร้อมกรอง
**So that** ติดตามภาพรวมและเจาะดูได้

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** Admin เปิดหน้า progress รวม, **THEN** แสดงสถานะของทุกครอบครัว/เด็กต่อการบ้าน พร้อมกรองตามชั้น/เทอม/สถานะ
2. **WHEN** Admin เลือกเด็กคนหนึ่ง, **THEN** เปิดรายละเอียด progress ของเด็กนั้น

**Dependencies**: US-007, US-016
**Source**: Design: Admin Progress

### US-021: มอบหมาย/ถอดครูออกจากชั้น (Admin)
**As a** Admin
**I want** กำหนดครูให้ดูแลชั้นเรียน และถอด (revoke) ออกได้
**So that** ควบคุมว่าครูคนไหนเห็นชั้นไหน

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** Admin มอบหมายครูให้ชั้นเรียนหนึ่ง, **THEN** ครูคนนั้นเห็น class overview ของชั้นนั้น (ไม่แบ่งเทอม)
2. **WHEN** Admin ถอดครูออกจากชั้น, **THEN** สิทธิ์การเห็นชั้นนั้นถูก revoke ทันที
3. **IF** ผู้ที่ไม่ใช่ Admin พยายามมอบหมายครู, **THEN** ปฏิเสธ

**Dependencies**: US-001
**Source**: D1-8; Design: Admin Teachers

### US-022: ดูครอบครัวทั้งหมดในระบบ (Admin)
**As a** Admin
**I want** ดูรายชื่อครอบครัวทั้งหมดพร้อมสมาชิก
**So that** เข้าใจองค์ประกอบผู้ใช้ในระบบ

**Priority**: Low

**Acceptance Criteria**:
1. **WHEN** Admin เปิด family overview, **THEN** แสดงทุกครอบครัวพร้อมสมาชิกและ role
2. **WHILE** แสดงผล, **THEN** Admin ดูได้แบบข้ามขอบเขต (ไม่ติด data isolation)

**Dependencies**: US-003
**Source**: Design: Admin Families

---

## Story Summary

| ID | Title | Area | Priority | Dependencies |
|----|-------|------|----------|--------------|
| US-001 | Login ด้วย Google | Auth | High | None |
| US-002 | Profile + logout | Auth | Medium | US-001 |
| US-003 | สร้างครอบครัว | Family | High | US-001 |
| US-004 | เชิญสมาชิก | Family | High | US-003 |
| US-005 | จัดการสมาชิก | Family | Medium | US-004 |
| US-006 | Master CRUD (Admin) | Assignment | High | US-001 |
| US-007 | Active ผูกชั้น+เทอม | Assignment | Medium | US-006 |
| US-008 | อัปเดตสถานะ (Parent) | Progress | High | US-007 |
| US-009 | อัปเดตสถานะ (Child) | Progress | High | US-007 |
| US-010 | Data isolation | Progress | High | US-008, US-009 |
| US-011 | ดูรายละเอียดงาน | Progress | Medium | US-008 |
| US-012 | แจ้งเตือนใกล้/เลยกำหนด | Notifications | High | US-008 |
| US-013 | ส่งคำขอแก้ไข | Requests | Medium | US-006 |
| US-014 | คำขอของฉัน | Requests | Low | US-013 |
| US-015 | จัดการคำขอ (Admin) | Requests | High | US-013 |
| US-016 | บันทึก audit | Audit | High | US-008, US-009 |
| US-017 | ค้นหา audit | Audit | Medium | US-016 |
| US-018 | Teacher class overview | Teacher | High | US-007, US-021 |
| US-019 | Admin overview | Admin | Medium | US-016 |
| US-020 | Progress รวม (Admin) | Admin | Medium | US-007, US-016 |
| US-021 | มอบหมาย/ถอดครู | Admin | High | US-001 |
| US-022 | Family overview (Admin) | Admin | Low | US-003 |

---

## Story-Persona Matrix

| Story | Admin | Parent | Child | Teacher |
|-------|-------|--------|-------|---------|
| US-001 | ✓ | ✓ | ✓ | ✓ |
| US-002 | ✓ | ✓ | ✓ | ✓ |
| US-003 | — | ✓ Primary | — | — |
| US-004 | — | ✓ Primary | — | — |
| US-005 | — | ✓ Primary | — | — |
| US-006 | ✓ Primary | — | — | — |
| US-007 | ✓ Primary | ✓ | ✓ | — |
| US-008 | — | ✓ Primary | — | — |
| US-009 | — | — | ✓ Primary | — |
| US-010 | — | ✓ | ✓ | — |
| US-011 | — | ✓ | ✓ | — |
| US-012 | — | ✓ | ✓ | — |
| US-013 | — | ✓ | ✓ | ✓ |
| US-014 | — | ✓ | ✓ | ✓ |
| US-015 | ✓ Primary | — | — | — |
| US-016 | ✓ Primary | — | — | — |
| US-017 | ✓ Primary | — | — | — |
| US-018 | — | — | — | ✓ Primary |
| US-019 | ✓ Primary | — | — | — |
| US-020 | ✓ Primary | — | — | — |
| US-021 | ✓ Primary | — | — | — |
| US-022 | ✓ Primary | — | — | — |

---

## Non-Functional Considerations

- **Security/Privacy**: RBAC บังคับฝั่ง backend ทุก endpoint; data isolation ระหว่างครอบครัวเด็ดขาด; ข้อมูลเด็กต้องปกป้อง; ลบสมาชิก/ครอบครัว → progress ถูกลบ, audit log คงไว้
- **Performance**: หน้ารายการ active และ progress รวมต้องโหลดเร็วแม้มีหลายครอบครัว/หลายชั้น
- **Compatibility**: responsive web ใช้ได้ทั้ง desktop และ mobile
- **Auth**: Google OAuth (OpenID Connect) เท่านั้น; invite ผูกกับ Gmail
- **Extensibility**: database schema ต้องออกแบบรองรับ multi-school ในอนาคต (แม้ UI ยังไม่ทำ)
- **Notifications**: in-app เท่านั้น (badge/สี) — ไม่มีช่องทางภายนอก

## External References

| Source | Stories Derived | What was used |
|--------|----------------|---------------|
| `Initial-requirement/homework-tracker-design-brief.md` | US-001..US-022 | Roles, rules, master assignment, progress, requests, audit, notifications |
| `Initial-requirement/app_design/Homeroom - Homework Tracker.dc.html` | US-001..US-022 | 16 screens, status pill behavior, admin back-office layout |
