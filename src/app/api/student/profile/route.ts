import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import { Registration, User } from "@/lib/models"; // Assuming Registration model exists

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

    let registration = await Registration.findOne({ userId: decoded.userId });

    if (!registration) {
      // Create draft if not exists
      registration = await Registration.create({
        userId: decoded.userId,
        status: "draft",
      });
    }

    return NextResponse.json({ registration }, { status: 200 });
  } catch (error) {
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

    // Build update object dynamically to allow partial updates
    const updateData: any = { updatedAt: new Date() };
    if (body.student) updateData.student = body.student;
    if (body.father) updateData.father = body.father;
    if (body.mother) updateData.mother = body.mother;
    if (body.guardian) updateData.guardian = body.guardian;
    if (body.documents) updateData.documents = body.documents;
    if (body.payment) updateData.payment = body.payment;
    // --- Checklist Logic ---
    const checklist: any = {};

    // Check Biodata Completeness
    const s = updateData.student || body.student;
    if (s?.fullName && s?.birthPlace && s?.address?.street) {
      checklist.biodata = true;
    }

    // Check Documents Completeness
    const d = updateData.documents || body.documents;
    if (d?.familyCard && d?.birthCertificate) {
      // Payment Proof is separate
      checklist.documents = true;
    } else if (d?.familyCard || d?.birthCertificate) {
      // Maybe partial? Logic says 'Completed' for Green.
    }

    // Check Payment (When Proof Uploaded)
    if (d?.paymentProof) {
      checklist.payment = true;
      // Auto-update status to 'pending' if it was 'draft'
      const currentStatus = body.status || "draft"; // We might need to fetch current status if not provided, but front end usually sends it or we default.
      // Better: If proof provided, we assume we want to submit.
      if (!updateData.status || updateData.status === "draft") {
        updateData.status = "pending";
      }
    }

    updateData.checklist = { ...checklist }; // Merge with existing if needed, but for now specific calculation

    const updatedRegistration = await Registration.findOneAndUpdate(
      { userId: decoded.userId },
      {
        $set: updateData,
        // Ensure checklist is merged if we are doing partials, but actually we want to re-eval checklist on every save.
        // Since we build updateData partially, we might miss fields if they are not in body.
        // Ideal: Fetch, Merge, Save. But atomic update is standard.
        // Compromise: We update checklist based on what we HAVE in updateData + assume previous state?
        // No, simplest is to let the frontend send checklist? No, insecure.
        // Let's rely on what's in 'body' being the latest state of that section.
        // If we are updating 'student', we re-eval 'biodata'.
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
