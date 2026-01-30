# Project Blueprint: Sistem PPDB Online SMA Methodist 1 Palembang

## 1. Project Overview

**Goal:** Migrasi sistem Penerimaan Peserta Didik Baru (PPDB) dari offline ke full online (Web-based).
**Platform:** Next.js Fullstack (App Router).
**Database:** MongoDB (Integrated via Mongoose).
**Payment Model:** Manual Transfer (Bank Panin) dengan upload bukti bayar & Verifikasi Admin.
**Communication:** WhatsApp Gateway Integration (OTP & Notifikasi).

## 2. Tech Stack & Packages

### Core

- **Framework:** Next.js 14+ (App Router, TypeScript).
- **Database:** MongoDB & Mongoose.
- **State/Data Fetching:** React Query (TanStack Query).
- **Form Management:** React Hook Form + Zod (Validation).

### Utilities & UI

- **HTTP Client:** Axios (configured with Interceptors).
- **Notifications:** React Hot Toast / Sonner.
- **DevTools:** React DevTools.
- **PDF & Print:** `html2pdf.js` & `react-to-print` (Cetak Kartu/Invoice).
- **Excel:** `xlsx` (Export data siswa).
- **Date Handling:** `date-fns`.
- **Number Formatting:** `terbilang-js` (Untuk kwitansi).

### Security

- **Auth:** JWT (Access Token & Refresh Token strategy).
- **OTP:** Token via WhatsApp.

---

## 3. Database Schema Design (Mongoose)

### A. Users Collection (`users`)

Menyimpan kredensial dan akses login.

- `email` (String, Unique)
- `password` (String, Hashed)
- `phoneNumber` (String, Unique, WA Active)
- `role` (Enum: 'student', 'admin')
- `isPhoneVerified` (Boolean)
- `otpCode` (String)
- `otpExpires` (Date)
- `refreshToken` (String)

### B. Settings Collection (`settings`)

Pengaturan dinamis untuk Gelombang & Biaya (Editable by Admin).

- `waveName` (e.g., "Gelombang 1")
- `period` ({ start: Date, end: Date })
- `fees`:
  - `registration` (Uang Pendaftaran)
  - `participation` (Dana Partisipasi)
  - `uniformSport` (Seragam Olahraga/Badge)
  - `uniformBatik` (Seragam Batik)
  - `developmentArts` (Prestasi Seni/Bahasa)
  - `developmentAcademic` (Olimpiade)
  - `books` (Buku Tulis)
  - `orientation` (MPLS)
  - `lab` (IPA/Bahasa/Komputer)
  - `library` (Perpustakaan)
  - `healthUnit` (UKS)
  - `osis` (OSIS)
  - `tuition` (SPP/Uang Sekolah)

### C. Registrations Collection (`registrations`)

Data inti siswa.

- `userId` (Ref: User)
- `registrationNumber` (String, Unique, e.g., "PPDB-2025-001")
- `queueOrder` (Number, Auto-increment untuk tracking "100 Pendaftar Pertama")
- **Student Data:**
  - `fullName`, `gender`, `birthPlace`, `birthDate`
  - `originSchool`, `religion`
  - `address`: { `street`, `rt`, `rw`, `village` (Desa), `district` (Kecamatan), `city`, `province` }
  - `livingWith` (Orang Tua/Wali/Pondok/Panti)
  - `siblingCount`, `contactPhone`
- **Parents Data (Father, Mother, Guardian individually):**
  - `name`, `birthDate`, `education`, `job`, `address`
- **Documents (File Paths/URLs):**
  - `birthCertificate`, `familyCard`, `diploma`, `rankCertificate`
- **Business Logic Flags:**
  - `isRankOneToFive` (Boolean) -> Jika True, discount `participation` fee.
  - `isFirstHundred` (Boolean) -> Jika True, free `uniformMaterial`.
- **Payment Info:**
  - `totalAmount` (Calculated)
  - `paymentStatus` (Enum: 'unpaid', 'pending', 'paid')
  - `proofUrl` (Image)
  - `verifiedAt` (Date)

---

## 4. Folder Structure (Next.js App Router)

```text
src/
├── app/
│   ├── (auth)/             # Login, Register, Verify OTP
│   ├── (dashboard)/
│   │   ├── admin/          # CMS: Verifikasi Bayar, Export Excel, Edit Gelombang
│   │   ├── student/        # Form Pendaftaran, Upload Bukti, Cetak Kartu
│   │   └── layout.tsx      # Sidebar logic based on Role
│   ├── api/                # Backend Routes (Auth, Registration, Payment, WA)
├── components/
│   ├── ui/                 # Atomic components
│   ├── form/               # Reusable RHF components
│   ├── print/              # Templates for PDF/Print (Invoice/Card)
├── lib/
│   ├── db.ts               # DB Connection
│   ├── axios.ts            # Axios Instance + Interceptors
│   ├── wa.ts               # WhatsApp API Helper
│   └── utils.ts            # Currency formatter, Date formatter
├── hooks/                  # Custom hooks (useAuth, useMultiStepForm)
├── types/                  # TypeScript Interfaces
└── middleware.ts           # Route Protection & JWT Refresh Logic
```
