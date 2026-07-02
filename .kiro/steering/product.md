---
inclusion: always
---

# Product Context

## Summary
<!-- 3-line max -->
- **Product**: เว็บแอปติดตามการบ้านที่หลายครอบครัวใช้มาสเตอร์การบ้านกลางร่วมกัน แต่ละครอบครัวเห็นเฉพาะ progress ของตัวเอง
- **Users**: Admin, Parent, Child, Teacher
- **Type**: Greenfield — New product

## Overview

ระบบติดตามการบ้าน (Homework Tracker / ชื่อดีไซน์ "Homeroom" โดย Tam-Yang) สำหรับครอบครัวที่มีลูกเรียนในห้องเรียนเดียวกัน ใช้ติดตามว่าการบ้านที่ครูสั่งแต่ละชิ้น ลูกทำหรือยัง ขาดอะไรบ้าง โดยมีมาสเตอร์การบ้านกลางที่หลายครอบครัวใช้ร่วมกัน แต่ข้อมูล progress ของแต่ละครอบครัวถูกแยกขาดจากกัน (data isolation) เป็น responsive web ใช้ได้ทั้ง desktop และ mobile โทนสะอาด เป็นมิตร อ่านง่ายแม้บนจอเล็ก และใช้สีบอกสถานะชัดเจน

## Problem Statement

ผู้ปกครองและเด็กในห้องเรียนเดียวกันไม่มีเครื่องมือกลางที่ติดตามได้ว่าการบ้านแต่ละชิ้นทำถึงไหน ขาดงานอะไร เมื่อครูสั่งงานผ่านหลายช่องทางทำให้ตกหล่นและเลยกำหนด ระบบนี้รวมรายการการบ้าน (มาสเตอร์กลาง) ให้ทุกครอบครัวอ้างอิงชุดเดียวกัน พร้อมให้แต่ละครอบครัวติ๊กสถานะของลูกตัวเองได้ และครูดูภาพรวมของชั้นได้

## Target Users

- **Admin**: ควบคุมมาสเตอร์การบ้านทั้งหมด, จัดการคำขอแก้ไข, เห็น progress/audit log ทุกครอบครัว, มอบหมายครูเข้าชั้นเรียน
- **Parent**: แก้สถานะการบ้านของลูกทุกคนในครอบครัวตัวเอง, ส่งคำขอแก้ไขมาสเตอร์, เห็นเฉพาะครอบครัวตัวเอง
- **Child**: แก้สถานะการบ้านของตัวเองเท่านั้น (แก้ของพี่น้องไม่ได้), ส่งคำขอได้
- **Teacher**: ดู progress ของเด็กทุกคนในชั้นที่ตัวเองดูแล (read-only, ข้ามครอบครัวได้), ส่งคำขอได้ แก้สถานะใครไม่ได้

## Key Features

- **Authentication & Family**: Google Sign-In เท่านั้น; สร้างครอบครัว แล้วเชิญสมาชิกผ่านลิงก์อีเมล (ยืนยันตัวตนด้วย Gmail ที่ตรงกับอีเมลเชิญ); Child 1 คนอยู่ได้ 1 ครอบครัว; 1 ครอบครัวมีหลาย Parent/Child
- **Assignment Master**: มาสเตอร์การบ้านกลาง (วิชา, ครู, ชั้นเรียน, เทอม, วันสั่ง, กำหนดส่ง, active flag) แก้ไขโดย Admin เท่านั้น
- **Progress Tracking**: สถานะ Not started / Done / Submitted (ยังไม่ทำ/ทำแล้ว/ส่งแล้ว) ผูกกับ (Child + Assignment); data isolation ระหว่างครอบครัวเด็ดขาด
- **Request / Issue Flow**: ทุก role (ยกเว้น Admin) ส่งคำขอแก้ไขมาสเตอร์ได้; สถานะ pending → resolved/rejected พร้อมข้อความตอบกลับ
- **Audit Log**: บันทึกทุกการแก้ไขสถานะ (ใคร/role/เมื่อ/จากอะไรเป็นอะไร/งานไหน/เด็กคนไหน) + ค้นหาได้
- **In-app Notification**: badge/สี เมื่อใกล้/เลยกำหนดส่ง ไม่มี noti ภายนอก (อีเมล/SMS/Line)
- **Teacher Inspector View**: ตารางสรุป progress เด็กทุกคนในชั้นที่ดูแล (read-only) กรองตามสถานะ
- **Admin Back-office**: Overview (สถิติรวม), Assignment CRUD, Progress รวมทุกครอบครัว, Request management, Audit log, Teacher assignment, Family overview

## Domain Language

| Term | Definition | Example |
|------|-----------|---------|
| Family (ครอบครัว) | หน่วยที่รวม Parent และ Child ที่ใช้ progress ร่วมกัน | ครอบครัว ก. มีพ่อ แม่ ลูก 2 คน |
| Master Assignment (มาสเตอร์การบ้าน) | การบ้านกลางที่ Admin กำหนด ใช้ร่วมทุกครอบครัว | "คณิต บทที่ 3" ป.4 เทอม 1 |
| Progress (สถานะ) | สถานะของงานต่อเด็กหนึ่งคน | Not started / Done / Submitted |
| Role | บทบาทผู้ใช้กำหนดสิทธิ์ | Admin / Parent / Child / Teacher |
| Invite (คำเชิญ) | ลิงก์อีเมลเชิญเข้าร่วมครอบครัว | pending / accepted |
| Request (คำขอ) | คำขอแก้ไขมาสเตอร์จากผู้ใช้ | pending → resolved / rejected |
| Audit Log | บันทึกการเปลี่ยนสถานะ | "Parent A เปลี่ยนงาน X ของเด็ก B: Not started→Done" |
| Class / Term (ชั้นเรียน/เทอม) | ขอบเขตที่ผูกมาสเตอร์และครู | ป.4 / เทอม 1 |
| Overdue (เลยกำหนด) | งานที่เลยวันกำหนดส่งและยังไม่ Submitted | แสดงสีแดง |

## Success Criteria

- ผู้ปกครอง/เด็กดูและอัปเดตสถานะการบ้านของลูกในครอบครัวตัวเองได้ภายในไม่กี่คลิก
- ครอบครัวหนึ่งไม่สามารถเห็นหรือแก้ข้อมูลของอีกครอบครัวได้ (data isolation 100%)
- Child แก้สถานะของตัวเองได้เท่านั้น; Teacher เป็น read-only ในชั้นที่ดูแล
- Admin จัดการมาสเตอร์และคำขอได้ครบ พร้อม audit log ที่ตรวจสอบย้อนหลังได้
- ใช้งานลื่นไหลทั้ง mobile และ desktop; หน้ารายการ active โหลดเร็วแม้มีหลายครอบครัว/หลายชั้น

## Constraints & Assumptions

**Constraints**:
- Timeline: ไม่ระบุ
- Budget: ยังไม่ระบุ (จะยืนยันใน design — มีผลต่อเลือก hosting/DB)
- Regulatory: เกี่ยวข้องกับข้อมูลเด็ก — ต้องระวังความเป็นส่วนตัว (จะยืนยันใน requirements/design)
- Technical: responsive web (desktop + mobile); OAuth Google เท่านั้น; RBAC; data isolation ระดับครอบครัว; in-app noti เท่านั้น
- Scope: ใช้กับห้องเรียนเดียวก่อน แต่เผื่อโครงสร้างข้อมูลขยายในอนาคต (ยังไม่ทำ UI multi-school)

**Assumptions**:
- ผู้ใช้ทุกคนมีบัญชี Google และเข้าถึง Gmail ที่ใช้รับคำเชิญได้
- การยืนยันตัวตนของผู้ถูกเชิญ = login ด้วย Gmail ที่ตรงกับอีเมลที่ถูกเชิญ
- ผู้ใช้ใช้เบราว์เซอร์สมัยใหม่

## Project Type

- **Type**: Greenfield
- **Scope**: New product
