import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { z } from "zod";

const verifySchema = z.object({
  phoneNumber: z.string().min(10),
  otp: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, otp } = verifySchema.parse(body);

    await dbConnect();

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan." },
        { status: 404 },
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json({ message: "Kode OTP salah." }, { status: 400 });
    }

    if (user.otpExpires < new Date()) {
      return NextResponse.json(
        { message: "Kode OTP telah kadaluarsa." },
        { status: 400 },
      );
    }

    // Verify User
    user.isPhoneVerified = true;
    user.otp = undefined; // Clear OTP
    user.otpExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Verifikasi berhasil. Silahkan login." },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Input tidak valid" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
