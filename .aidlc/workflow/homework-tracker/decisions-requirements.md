# Requirements Decisions (D1)

## Context Summary
- **Product**: เว็บแอปติดตามการบ้าน (Homeroom) — หลายครอบครัวใช้มาสเตอร์การบ้านกลางร่วมกัน แต่ละครอบครัวเห็นเฉพาะ progress ตัวเอง
- **Type**: Greenfield, responsive web, ต้องมี backend + database
- **Roles**: Admin, Parent, Child, Teacher (RBAC)
- **Core**: Google OAuth, family + invite, master assignment (Admin CRUD), progress (Not started/Done/Submitted), request flow, audit log, in-app notification, teacher read-only inspector
- **Scope note**: ห้องเรียนเดียวก่อน แต่เผื่อโครงสร้างข้อมูลขยายภายหลัง; ไม่มี noti ภายนอก; ไม่มีแนบไฟล์
- **Design**: มี interactive prototype + 16 หน้าจอ + design system ครบ

---

## Decision Questions

### D1-1: ขอบเขต MVP รุ่นแรก
**Question**: รุ่นแรกที่จะสร้างควรครอบคลุมแค่ไหน?
- 1) Core flow เท่านั้น (login + family + ดู/อัปเดตสถานะการบ้าน + admin master CRUD) — เร็วที่สุด
- 2) Core + request flow + audit log + teacher view (ครบตาม spec ทั้ง 16 หน้า) **(Recommended)**
- 3) ครบทุกอย่าง + เตรียม multi-school structure ตั้งแต่แรก
- 4) Other (please specify): _______

**Answer**: 2

---

### D1-2: กลไกคำเชิญเข้าครอบครัว
**Question**: ผู้ถูกเชิญเข้าร่วมครอบครัวอย่างไร?
- 1) ลิงก์เชิญผูกกับอีเมลเฉพาะ — ต้อง login ด้วย Gmail ที่ตรงกับอีเมลที่เชิญเท่านั้น **(Recommended)**
- 2) ลิงก์เชิญทั่วไป — ใครเปิดลิงก์แล้ว login ก็เข้าร่วมได้ (ไม่ผูกอีเมล)
- 3) รหัสเชิญ (code) ให้กรอกเอง
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-3: การกำหนด role ของผู้ใช้
**Question**: ผู้ใช้ได้ role (Parent/Child/Teacher) มาอย่างไร?
- 1) ระบุ role ตอนถูกเชิญ (ผู้เชิญ/Admin เลือกให้) **(Recommended)**
- 2) ผู้ใช้เลือก role เองตอน onboarding
- 3) Admin กำหนด/อนุมัติ role ทุกคนจากหลังบ้าน
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-4: ใครจัดการสมาชิกในครอบครัว (เชิญ/ลบ)
**Question**: สิทธิ์จัดการสมาชิกครอบครัว (เชิญ Parent/Child เพิ่ม, ลบสมาชิก) เป็นของใคร?
- 1) Parent ทุกคนในครอบครัวจัดการได้ **(Recommended)**
- 2) เฉพาะ Parent ผู้สร้างครอบครัว (owner) เท่านั้น
- 3) Admin เท่านั้น
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-5: เงื่อนไขการ "ส่งแล้ว" (Submitted) และการย้อนสถานะ
**Question**: สถานะ Not started → Done → Submitted ควรเปลี่ยนได้อิสระแค่ไหน?
- 1) เปลี่ยนไป-กลับได้อิสระทุกทิศ (เช่น Submitted กลับเป็น Not started ได้) **(Recommended)**
- 2) เดินหน้าอย่างเดียว (Not started → Done → Submitted ย้อนไม่ได้)
- 3) ย้อนได้แต่ต้องมีเหตุผล/ยืนยัน
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-6: การมองเห็นของ Child
**Question**: Child เห็นข้อมูลอะไรในครอบครัวตัวเอง?
- 1) เห็นเฉพาะการบ้าน + สถานะของตัวเองเท่านั้น **(Recommended)**
- 2) เห็นการบ้านของพี่น้องด้วย (read-only) แต่แก้ได้แค่ของตัวเอง
- 3) เห็นทุกอย่างในครอบครัวเหมือน Parent แต่แก้ได้แค่ของตัวเอง
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-7: เกณฑ์การแจ้งเตือนในแอป (near/overdue)
**Question**: นิยาม "ใกล้ครบกำหนด" สำหรับ badge/สีเตือน?
- 1) ใกล้กำหนด = ภายใน 1 วันก่อน due; เลยกำหนด = พ้น due แล้วยังไม่ Submitted **(Recommended)**
- 2) ใกล้กำหนด = ภายใน 2-3 วันก่อน due
- 3) ให้ตั้งค่าได้ (configurable) ภายหลัง
- 4) Other (please specify): _______

**Answer**:  ตอบข้อ 4 ใกล้ครบกำหนด (สีเหลืองอ่อน) คือ ก่อนครบกำหนด 2 วัน เช่น นัดส่งวันที่ 3 ให้แจ้งตั้งแต่วันที่ 1 และวันที่ 2 และยังไม่ได้ส่งงาน ส่วนวันที่ 3 คือวันครบกำหนด(สีเหลืองเข้ม) และยังไม่ได้ส่งงาน ให้สีเข้มขึ้น  หากเลยกำหนดแล้วยังไม่ส่งงาน เรียกว่า overdue (สีแดง)

---

### D1-8: ขอบเขตการมองเห็นของ Teacher
**Question**: Teacher ดู progress ได้แค่ไหน?
- 1) ดูได้เฉพาะชั้นเรียน+เทอมที่ Admin มอบหมายให้ (read-only, ข้ามครอบครัวในชั้นนั้น) **(Recommended)**
- 2) ดูได้ทุกชั้นเรียนในระบบ (read-only)
- 3) ดูได้เฉพาะวิชาที่ตัวเองสอน
- 4) Other (please specify): _______

**Answer**: 1 ครูจะดูชั้นแรียนนั้น ไม่ต้องแบ่งเทอม ถ้าเปลี่ยนครู ก็ revolk สิทธิ์ออก

---

### D1-9: ความเป็นส่วนตัว/การลบข้อมูล (privacy ข้อมูลเด็ก)
**Question**: ต้องมี story เกี่ยวกับ privacy/การลบข้อมูลในรุ่นแรกไหม? (ข้อมูลเกี่ยวข้องกับเด็ก)
- 1) มี story พื้นฐาน: ลบสมาชิก/ครอบครัวแล้วข้อมูล progress ถูกลบ + audit log เก็บไว้ **(Recommended)**
- 2) ครบชุด (consent, right-to-delete, export, retention policy)
- 3) ยังไม่ทำในรุ่นแรก (internal/ทดลองใช้)
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-10: การยืนยันสร้าง personas
**Question**: ต้องการให้สร้างเอกสาร personas (Admin/Parent/Child/Teacher) เพื่อ clarify ความต้องการไหม?
- 1) สร้าง personas ทั้ง 4 roles **(Recommended)**
- 2) ข้าม personas (requirements ชัดเจนพอแล้ว)
- 3) Other (please specify): _______

**Answer**: 1

---

### D1-11: สิ่งที่อยู่นอกขอบเขต (out of scope) รุ่นแรก
**Question**: ยืนยันสิ่งที่ "ไม่ทำ" ในรุ่นแรก (เลือกได้หลายข้อ / แก้ได้)
- 1) ไม่มี noti ภายนอก (email/SMS/Line), ไม่มีแนบไฟล์/รูป, ไม่มี UI multi-school **(Recommended baseline)**
- 2) ตัดข้อ 1 + ตัด audit log search ขั้นสูงออกด้วย
- 3) ไม่มีข้อยกเว้น ทำครบทุกอย่าง
- 4) Other (please specify): _______

**Answer**: 1 แต่ต้องวาง database structure รองรับ multi-school ไว้ด้วย

---

## Decisions Summary
<!-- Machine-readable compact summary. Downstream phases: read ONLY this section. -->
<!-- Auto-populated after user fills answers. One line per decision. -->
- D1-1 MVP Scope: ครบตาม spec — Core + request flow + audit log + teacher view (16 หน้า)
- D1-2 Invite Mechanism: ลิงก์เชิญผูกกับอีเมลเฉพาะ — ต้อง login ด้วย Gmail ที่ตรงกับอีเมลที่เชิญ
- D1-3 Role Assignment: ระบุ role ตอนถูกเชิญ (ผู้เชิญ/Admin เลือกให้)
- D1-4 Family Member Management: Parent ทุกคนในครอบครัวจัดการสมาชิกได้ (เชิญ/ลบ)
- D1-5 Status Transitions: เปลี่ยนไป-กลับได้อิสระทุกทิศ (Not started/Done/Submitted)
- D1-6 Child Visibility: Child เห็นเฉพาะการบ้าน + สถานะของตัวเองเท่านั้น
- D1-7 Notification Thresholds: ใกล้กำหนด = ภายใน 2 วันก่อน due (เหลืองอ่อน); วัน due ยังไม่ส่ง = เหลืองเข้ม; เลย due ยังไม่ส่ง = overdue (แดง)
- D1-8 Teacher Scope: ดูเฉพาะชั้นเรียนที่ได้รับมอบหมาย (read-only, ข้ามครอบครัวในชั้น, ไม่แบ่งเทอม); เปลี่ยนครู = revoke สิทธิ์
- D1-9 Privacy/Deletion: มี story พื้นฐาน — ลบสมาชิก/ครอบครัวแล้ว progress ถูกลบ แต่ audit log เก็บไว้
- D1-10 Personas: สร้าง personas ทั้ง 4 roles (Admin/Parent/Child/Teacher)
- D1-11 Out of Scope: ไม่มี noti ภายนอก, ไม่แนบไฟล์, ไม่มี UI multi-school — แต่ DB ต้องออกแบบรองรับ multi-school

---

**Instructions**: Fill in your answers above and respond with "done"
