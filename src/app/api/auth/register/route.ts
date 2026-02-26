import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User, Registration, Settings } from "@/lib/models";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  password: z.string().min(6),
});

// Import WhatsApp service (assuming it's default export or named export, checking lib/whatsapp.ts might be needed but standard usage)
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phoneNumber, password } = registerSchema.parse(body);

    await dbConnect();

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      // Jika sudah terverifikasi, tolak pendaftaran
      if (existingUser.isPhoneVerified) {
        return NextResponse.json(
          { message: "Email atau Nomor WhatsApp sudah terdaftar." },
          { status: 409 },
        );
      }

      // Belum terverifikasi → generate OTP baru dan kirim ulang tanpa membuat user baru
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();

      try {
        await sendWhatsAppMessage({
          to: phoneNumber,
          message: `Kode OTP PPDB Anda adalah: *${otp}*.\nJangan berikan kode ini kepada siapapun.`,
        });
      } catch (waError) {
        console.error("WhatsApp Send Error:", waError);
      }

      return NextResponse.json(
        { message: "OTP baru telah dikirim ulang ke WhatsApp Anda." },
        { status: 200 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const newUser = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "student",
      otp,
      otpExpires,
      isPhoneVerified: false,
    });

    // Create Initial Registration Document
    // 1. Get Settings for Wave
    const settings = await Settings.findOne({});
    let waveName = "Gelombang 1";
    if (settings && settings.waves && settings.waves.length > 0) {
      const now = new Date();
      const activeWave = settings.waves.find((w: any) => {
        const start = w.startDate ? new Date(w.startDate) : null;
        const end = w.endDate ? new Date(w.endDate) : null;
        if (start && end) return now >= start && now <= end;
        return false;
      });
      if (activeWave) waveName = activeWave.name;
      else if (settings.waves[0]) waveName = settings.waves[0].name;
    }

    // 2. Generate Registration Number (e.g., PPDB-2025-XXXX)
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regNum = `PPDB-${year}-${randomSuffix}`;

    await Registration.create({
      userId: newUser._id,
      registrationNumber: regNum,
      wave: waveName,
      status: "draft",
      checklist: {
        biodata: false,
        documents: false,
        payment: false,
      },
    });

    // Send WhatsApp (Simulate or Real)
    try {
      await sendWhatsAppMessage({
        to: phoneNumber,
        message: `Kode OTP PPDB Anda adalah: *${otp}*.\nJangan berikan kode ini kepada siapapun.`,
      });
    } catch (waError) {
      console.error("WhatsApp Send Error:", waError);
      // Continue even if WA fails (user might request resend later)
    }

    return NextResponse.json(
      { message: "OTP terkirim ke WhatsApp Anda." },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Input tidak valid", errors: error.issues },
        { status: 400 },
      );
    }
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
