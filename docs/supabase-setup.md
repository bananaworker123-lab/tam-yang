# คู่มือใช้ Supabase เป็น PostgreSQL (ไม่ต้องใช้ Docker) — Homeroom

เป้าหมาย: ได้ **connection string** ของ Postgres จาก Supabase มาใส่ `.env` (`DATABASE_URL`)
แล้วบอกผม "พร้อม" → ผมจะ `prisma migrate` + รัน backend + เชื่อม frontend เข้ากับข้อมูลจริงให้

เวลาโดยประมาณ: ~5 นาที · ฟรี

> เราใช้ Supabase แค่ในฐานะ **Postgres ธรรมดา** เท่านั้น (ไม่ใช้ Auth/Storage ของ Supabase)

---

## ส่วนที่ 1 — สร้างบัญชี + โปรเจกต์

1. เปิด https://supabase.com/ → **Start your project** → ล็อกอิน (ใช้ GitHub/Google ก็ได้)
2. เข้า Dashboard → **New project**
3. กรอก:
   - **Name**: `homeroom`
   - **Database Password**: ตั้งรหัสผ่านที่ **แข็งแรงและจดไว้** (จะใช้ใน connection string) — เลี่ยงอักขระ `@ : / ? # [ ]` เพราะต้อง encode ยุ่งยาก แนะนำใช้ตัวอักษร+ตัวเลขล้วน
   - **Region**: เลือกใกล้ไทย เช่น **Southeast Asia (Singapore)**
   - Plan: **Free**
4. กด **Create new project** → รอ ~2 นาที (Supabase provisioning ฐานข้อมูล)

---

## ส่วนที่ 2 — เอา connection string

1. ในโปรเจกต์ กดปุ่ม **Connect** (แถบบนสุด) — หรือไป **Project Settings → Database**
2. หา section **Connection string** → เลือกแท็บ **URI**
3. เลือกโหมด **Session pooler** (พอร์ต `5432`) — สำคัญ เพราะรองรับ Prisma migration และเป็น IPv4 (ต่อได้จากทุกเน็ต)
   - รูปแบบจะประมาณนี้:
     ```
     postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
     ```
4. กด **Copy** → แล้ว **แทนที่ `[YOUR-PASSWORD]`** ด้วยรหัสผ่านที่ตั้งไว้ในส่วนที่ 1

> ถ้าเห็นหลายโหมด: **Session pooler = 5432** (ใช้อันนี้), Transaction pooler = 6543, Direct = 5432 (อาจเป็น IPv6). แนะนำ **Session pooler** ที่สุดสำหรับงานนี้

---

## ส่วนที่ 3 — ใส่ใน `.env`

1. เปิดไฟล์ `d:\Kiro\Tam-Yang\.env`
2. แก้บรรทัด `DATABASE_URL` ให้เป็น string ที่ copy มา (ใส่รหัสผ่านจริงแล้ว) และเติม `?sslmode=require` ต่อท้าย:
   ```env
   DATABASE_URL="postgresql://postgres.abcdefghijklmnop:YOURPASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
   ```
3. บันทึกไฟล์

> `.env` ถูก git-ignore ไว้แล้ว รหัสผ่านจะไม่หลุดขึ้น repo

---

## ส่วนที่ 4 — บอกผม "พร้อม"

พอใส่ `DATABASE_URL` แล้ว พิมพ์ **"พร้อม"** ผมจะรันให้:
1. `prisma migrate deploy/dev` → สร้าง schema + ตารางทั้งหมด (identity/family/assignment/progress/requests_audit) บน Supabase
2. seed ข้อมูลตัวอย่าง (optional)
3. start API + เชื่อม frontend เข้ากับ API จริง (แทน mock)

> การ migrate จะสร้าง schema หลายอันในฐานข้อมูล `postgres` ของ Supabase ซึ่งทำได้ปกติ

---

## แก้ปัญหาที่พบบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| `password authentication failed` | รหัสผ่านผิด/ยังไม่ได้แทน `[YOUR-PASSWORD]` | ตรวจรหัส; ถ้าลืม → Project Settings → Database → **Reset database password** |
| `Can't reach database server` | ใช้ Direct (IPv6) แต่เน็ตไม่รองรับ IPv6 | เปลี่ยนไปใช้ **Session pooler (5432)** |
| Prisma migrate ค้าง/`prepared statement` error | ใช้ Transaction pooler (6543) | เปลี่ยนเป็น **Session pooler (5432)** |
| SSL error | ไม่มี sslmode | เติม `?sslmode=require` ท้าย URL |
| รหัสผ่านมีอักขระพิเศษ | ต้อง URL-encode | ตั้งรหัสใหม่เป็นตัวอักษร+ตัวเลขล้วน (ง่ายสุด) |

---

## เช็กลิสต์ก่อนพิมพ์ "พร้อม"
- [ ] โปรเจกต์ Supabase สร้างเสร็จ (สถานะ Active)
- [ ] copy connection string แบบ **Session pooler (5432)** แล้ว
- [ ] แทน `[YOUR-PASSWORD]` ด้วยรหัสจริง + เติม `?sslmode=require`
- [ ] วางใน `.env` → `DATABASE_URL="..."` และบันทึกแล้ว

พร้อมเมื่อไหร่พิมพ์ **"พร้อม"** ได้เลยครับ 🚀
