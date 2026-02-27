export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import { Registration, User } from "@/lib/models";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token.value, secret) as any;

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { registrationId, status, rejectionReason } = await req.json();

    await dbConnect();

    // Find the registration and populate user to get phone number
    const registration =
      await Registration.findById(registrationId).populate("userId");

    if (!registration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 },
      );
    }

    // Update Status
    registration.status = status;
    await registration.save();

    // Send WhatsApp Notification
    const user = registration.userId;
    if (user && user.phoneNumber) {
      let message = "";
      if (status === "verified") {
        message = `Halo ${user.name},\n\nSelamat! Pendaftaran PPDB Anda di SMA Methodist 1 Palembang telah DITERIMA / TERVERIFIKASI.\n\nSilahkan login ke dashboard untuk melihat informasi selanjutnya.\n\nTerima Kasih.`;
      } else if (status === "rejected") {
        message = `Halo ${user.name},\n\nMohon maaf, pendaftaran Anda belum dapat kami verifikasi karena:\n"${rejectionReason || "Data belum lengkap"}"\n\nSilahkan perbaiki data/dokumen Anda di dashboard dan lakukan konfirmasi ulang.\n\nTerima Kasih.`;
      }

      if (message) {
        await sendWhatsAppMessage({
          to: user.phoneNumber,
          message: message,
        });
      }
    }

    return NextResponse.json(
      { message: "Verification updated", registration },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error updating verification" },
      { status: 500 },
    );
  }
}
