# คู่มือตั้งค่า Google OAuth (Sign in with Google) — Homeroom

ทำตามทีละขั้น จบแล้วจะ login ด้วย Gmail จริงได้ที่ local

> ปลายทางที่ต้องได้: **Client ID** + **Client Secret** ไปใส่ในไฟล์ `.env`

---

## ภาพรวม (ต้องทำ 4 ส่วน)
1. สร้าง/เลือก Project ใน Google Cloud
2. ตั้งค่า OAuth consent screen (หน้าจอขออนุญาต)
3. สร้าง OAuth Client ID (Web application) → ได้ Client ID/Secret
4. ใส่ค่าใน `.env` แล้วรันแอป

เวลาโดยประมาณ: ~10 นาที · ค่าใช้จ่าย: ฟรี

---

## ส่วนที่ 1 — สร้าง Project

1. เปิด https://console.cloud.google.com/
2. ล็อกอินด้วยบัญชี Google ของคุณ
3. มุมบนซ้าย กดตัวเลือก project (ข้าง ๆ โลโก้ Google Cloud) → **New Project**
4. ตั้งชื่อ เช่น `homeroom-dev` → **Create**
5. รอสักครู่ แล้วเลือก project นี้ให้เป็น project ปัจจุบัน (มุมบนซ้าย)

---

## ส่วนที่ 2 — OAuth consent screen

1. เมนูซ้าย (☰) → **APIs & Services** → **OAuth consent screen**
   - (ทางลัด: https://console.cloud.google.com/apis/credentials/consent)
2. เลือก **User Type**:
   - เลือก **External** (ใช้ได้กับทุกบัญชี Gmail) → **Create**
   - > ถ้าเป็น Google Workspace ขององค์กรและอยากจำกัดเฉพาะในองค์กร เลือก Internal
3. หน้า **App information** กรอก:
   - **App name**: `Homeroom`
   - **User support email**: อีเมลคุณ
   - **Developer contact information**: อีเมลคุณ
   - ที่เหลือเว้นว่างได้ → **Save and Continue**
4. หน้า **Scopes**: ไม่ต้องเพิ่มอะไร → **Save and Continue**
   - (แอปขอแค่ `profile` + `email` ซึ่งเป็น scope พื้นฐาน ไม่ต้องประกาศพิเศษ)
5. หน้า **Test users** (สำคัญ ตอนสถานะยังเป็น Testing):
   - กด **+ Add users** → ใส่ **อีเมล Gmail ที่คุณจะใช้ทดสอบ login** (ใส่ได้หลายอัน เช่น ของพ่อ แม่ ลูก)
   - → **Save and Continue**
   - > ถ้าไม่ใส่ที่นี่ จะ login ไม่ได้ (ขึ้น error 403 access_denied)
6. หน้า **Summary** → **Back to Dashboard**

> หมายเหตุ: ตอนนี้แอปอยู่สถานะ **Testing** ก็พอสำหรับใช้เอง/ทดสอบ ไม่ต้องกด Publish (การ Publish ต้องผ่าน verification ถ้าขอ scope ละเอียด — ของเราไม่ต้อง)

---

## ส่วนที่ 3 — สร้าง OAuth Client ID

1. เมนูซ้าย → **APIs & Services** → **Credentials**
   - (ทางลัด: https://console.cloud.google.com/apis/credentials)
2. กด **+ Create Credentials** (ด้านบน) → **OAuth client ID**
3. **Application type**: เลือก **Web application**
4. **Name**: `homeroom-web-local` (ตั้งอะไรก็ได้)
5. **Authorized JavaScript origins** → **+ Add URI**:
   ```
   http://localhost:5173
   ```
6. **Authorized redirect URIs** → **+ Add URI** (ต้องตรงเป๊ะ):
   ```
   http://localhost:3000/api/v1/auth/google/callback
   ```
7. กด **Create**
8. จะมี popup แสดง **Client ID** และ **Client Secret** → **คัดลอกเก็บไว้** (กด Download JSON ไว้ก็ได้)

> ⚠️ redirect URI ต้องตรงกับค่าใน `.env` (`GOOGLE_CALLBACK_URL`) ทุกตัวอักษร รวม http/https, พอร์ต, และ path — ถ้าไม่ตรงจะขึ้น error `redirect_uri_mismatch`

---

## ส่วนที่ 4 — ใส่ค่าใน `.env` แล้วรัน

1. เปิดไฟล์ `d:\Kiro\Tam-Yang\.env`
2. เติมค่า 2 บรรทัดนี้ (วางค่าที่คัดลอกมา):
   ```env
   GOOGLE_CLIENT_ID="วางClientIDที่นี่.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="วางClientSecretที่นี่"
   ```
   ตรวจให้ 2 บรรทัดนี้มีอยู่และค่าถูกต้อง (บรรทัดอื่นมีให้แล้ว):
   ```env
   GOOGLE_CALLBACK_URL="http://localhost:3000/api/v1/auth/google/callback"
   WEB_ORIGIN="http://localhost:5173"
   SESSION_SECRET="ตั้งข้อความสุ่มยาว ๆ อะไรก็ได้"
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/homework_tracker?schema=public"
   ```
3. ต้องมี **Postgres รันอยู่** (ผ่าน Docker) และ migrate ตารางแล้ว:
   ```powershell
   docker compose up -d
   corepack pnpm --filter @homework-tracker/api exec prisma migrate dev --schema ../../prisma/schema.prisma --name init
   ```
   > ถ้า Docker ยังไม่พร้อม บอกผมได้ เดี๋ยวรันให้ตอนพร้อม
4. รัน backend + frontend (คนละเทอร์มินัล):
   ```powershell
   corepack pnpm --filter @homework-tracker/api dev
   corepack pnpm --filter @homework-tracker/web dev
   ```
5. เปิด http://localhost:5173/ → กด **Sign in with Google** → เลือกบัญชี (ที่ใส่เป็น Test user) → กลับเข้าแอปแบบ login จริง 🎉

---

## แก้ปัญหาที่พบบ่อย (Troubleshooting)

| อาการ / Error | สาเหตุ | วิธีแก้ |
|---|---|---|
| `redirect_uri_mismatch` | redirect URI ไม่ตรง | ให้ URI ใน Credentials = `http://localhost:3000/api/v1/auth/google/callback` ตรงกับ `GOOGLE_CALLBACK_URL` ใน `.env` เป๊ะ |
| `403 access_denied` / "app not verified / not a test user" | อีเมลที่ login ไม่ได้อยู่ใน Test users | เพิ่มอีเมลนั้นใน OAuth consent screen → Test users |
| กดปุ่มแล้ว 404 ที่ `/api/v1/auth/google` | api ไม่ได้รัน หรือยังไม่มี Client ID/Secret (strategy ไม่ถูก register) | ใส่ค่าใน `.env` แล้ว restart api |
| login ผ่านแต่ค้าง/500 หลัง callback | ยังไม่มี Postgres / ยังไม่ migrate | `docker compose up -d` แล้ว `prisma migrate dev` |
| เปลี่ยน `.env` แล้วไม่มีผล | api ยังไม่ได้ restart | หยุดแล้วสั่ง `... api dev` ใหม่ |
| Client Secret หาย | popup ปิดไปแล้ว | Credentials → คลิก client ที่สร้าง → ดู/สร้าง secret ใหม่ได้ |

---

## หมายเหตุความปลอดภัย
- **ห้าม commit** ค่า Client Secret ลง git — ไฟล์ `.env` ถูก ignore ไว้แล้ว (ใช้ `.env.example` เป็นตัวอย่างเท่านั้น)
- Secret นี้ใช้เฉพาะ local dev; ตอน deploy production ให้สร้าง OAuth client แยก + ใส่ redirect URI ของ domain จริง + เก็บ secret ใน secret manager ของ hosting

---

## เช็กลิสต์ก่อนบอกผมว่า "พร้อม"
- [ ] มี Client ID + Client Secret แล้ว และใส่ใน `.env` เรียบร้อย
- [ ] redirect URI = `http://localhost:3000/api/v1/auth/google/callback`
- [ ] เพิ่มอีเมลทดสอบใน Test users แล้ว
- [ ] Docker/Postgres พร้อม (หรือให้ผมช่วยรัน)

พอครบแล้วพิมพ์ **"พร้อม"** ผมจะ migrate + start api/web + ต่อ frontend เข้ากับ login จริงให้ทันที
