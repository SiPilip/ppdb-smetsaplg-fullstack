import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import { Registration, User, Settings } from "@/lib/models"; // Assuming Registration model exists

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token.value, secret) as any;

    await dbConnect();

    // Fetch Profile
    let registration = await Registration.findOne({ userId: decoded.userId });

    // Fetch Settings for Wave assignment
    const settings = await Settings.findOne({});
    const now = new Date();

    let waveToAssign = "Gelombang 1"; // Default fall back

    // Logic to find active wave
    if (settings && settings.waves && settings.waves.length > 0) {
      const activeWave = settings.waves.find((w: any) => {
        const start = w.startDate ? new Date(w.startDate) : null;
        const end = w.endDate ? new Date(w.endDate) : null;
        if (start && end) return now >= start && now <= end;
        if (start) return now >= start;
        if (end) return now <= end;
        return false;
      });

      if (activeWave) {
        waveToAssign = activeWave.name;
      } else {
        // If no active wave, use the latest one or first (logic to be determined, assume first for now)
        waveToAssign = settings.waves[0].name;
      }
    }

    if (!registration) {
      // Create draft if not exists
      registration = await Registration.create({
        userId: decoded.userId,
        status: "draft",
        wave: waveToAssign,
      });
    } else {
      // Dynamic Wave Logic: If status is "draft", always update to current active wave
      // This ensures pricing reflects WHEN they pay, not when they registered.
      if (
        registration.status === "draft" &&
        registration.wave !== waveToAssign
      ) {
        registration.wave = waveToAssign;
        await registration.save();
      } else if (!registration.wave) {
        // Fallback if missing
        registration.wave = waveToAssign;
        await registration.save();
      }
    }

    return NextResponse.json({ registration }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching profile" },
      { status: 500 },
    );
  }
}

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

    await dbConnect();

    // 1. Fetch existing registration to support partial updates
    const existingRegistration = await Registration.findOne({
      userId: decoded.userId,
    });

    // Build update object dynamically to allow partial updates
    const updateData: any = { updatedAt: new Date() };
    const nowTimestamp = new Date();

    // Biodata Updates
    if (body.student || body.father || body.mother || body.guardian) {
      updateData["timestamps.biodata"] = nowTimestamp;
    }

    if (body.student) updateData.student = body.student;
    if (body.father) updateData.father = body.father;
    if (body.mother) updateData.mother = body.mother;
    if (body.guardian) updateData.guardian = body.guardian;

    // Document Updates - Granular
    if (body.documents) {
      updateData.documents = body.documents;
      if (body.documents.familyCard)
        updateData["timestamps.documents.familyCard"] = nowTimestamp;
      if (body.documents.birthCertificate)
        updateData["timestamps.documents.birthCertificate"] = nowTimestamp;
      if (body.documents.paymentProof)
        updateData["timestamps.documents.paymentProof"] = nowTimestamp;
    }

    if (body.payment) updateData.payment = body.payment;

    // --- Checklist Logic (Merged Data) ---
    // We must merge existing DB data with incoming updates to check completeness
    const mergedStudent = {
      ...(existingRegistration?.student || {}),
      ...(body.student || {}),
    };
    const mergedDocuments = {
      ...(existingRegistration?.documents || {}),
      ...(body.documents || {}),
    };

    // Initialize with explicit defaults to ensure false states are captured
    const checklist = {
      biodata: false,
      documents: false,
      payment: false,
    };

    // Check Biodata Completeness
    const isBiodataComplete =
      mergedStudent.fullName &&
      mergedStudent.birthPlace &&
      mergedStudent.address?.street;

    if (isBiodataComplete) {
      checklist.biodata = true;
    }

    // Check Documents Completeness
    if (mergedDocuments.familyCard && mergedDocuments.birthCertificate) {
      checklist.documents = true;
    }

    // Check Payment (When Proof Uploaded)
    if (mergedDocuments.paymentProof) {
      checklist.payment = true;
      if (
        !existingRegistration?.status ||
        existingRegistration.status === "draft"
      ) {
        updateData.status = "pending";
      }
    } else {
      // PROOF REMOVED: Revert to draft if currently pending
      if (existingRegistration?.status === "pending") {
        updateData.status = "draft";
      }
    }

    // Overwrite checklist fully to ensure downgrades (true -> false) apply
    updateData.checklist = checklist;

    const updatedRegistration = await Registration.findOneAndUpdate(
      { userId: decoded.userId },
      {
        $set: updateData,
      },
      { new: true, upsert: true },
    );

    return NextResponse.json(
      { message: "Profile updated", registration: updatedRegistration },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error updating profile" },
      { status: 500 },
    );
  }
}
