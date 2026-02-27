export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";

const settingsSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").optional(),
  email: z.string().email("Format email tidak valid").optional(),
  phoneNumber: z.string().min(10, "Nomor HP tidak valid").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter").optional(),
});

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token.value, secret) as any;

    const body = await req.json();
    const parsed = settingsSchema.parse(body);

    await dbConnect();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    // Update display name
    if (parsed.name) {
      user.name = parsed.name;
    }

    // Update email
    if (parsed.email && parsed.email !== user.email) {
      const emailExists = await User.findOne({
        email: parsed.email,
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return NextResponse.json(
          { message: "Email sudah digunakan akun lain." },
          { status: 409 },
        );
      }
      user.email = parsed.email;
    }

    // Update phone number
    if (parsed.phoneNumber && parsed.phoneNumber !== user.phoneNumber) {
      const exists = await User.findOne({
        phoneNumber: parsed.phoneNumber,
        _id: { $ne: user._id },
      });
      if (exists) {
        return NextResponse.json(
          { message: "Nomor HP sudah digunakan akun lain." },
          { status: 409 },
        );
      }
      user.phoneNumber = parsed.phoneNumber;
    }

    // Change password
    if (parsed.newPassword) {
      if (!parsed.currentPassword) {
        return NextResponse.json(
          {
            message: "Password saat ini wajib diisi untuk mengganti password.",
          },
          { status: 400 },
        );
      }
      const isMatch = await bcrypt.compare(
        parsed.currentPassword,
        user.password,
      );
      if (!isMatch) {
        return NextResponse.json(
          { message: "Password saat ini salah." },
          { status: 400 },
        );
      }
      user.password = await bcrypt.hash(parsed.newPassword, 10);
    }

    await user.save();

    return NextResponse.json(
      {
        message: "Pengaturan berhasil disimpan.",
        user: {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
