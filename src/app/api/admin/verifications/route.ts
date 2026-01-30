import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import { Registration } from "@/lib/models";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    // Auth check (middleware handles redirection but good to double check role here or rely on specific admin middleware)
    // For simplicity, we decode and check role here too or trust middleware
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token!.value, secret) as any;

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = {};
    if (status && status !== "all") {
      query = { status };
    }

    const registrations = await Registration.find(query)
      .populate("userId", "name email phoneNumber") // Populate user details
      .sort({ createdAt: -1 });

    return NextResponse.json({ registrations }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token!.value, secret) as any;

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { registrationId, status, notes } = body;

    await dbConnect();

    const updated = await Registration.findByIdAndUpdate(
      registrationId,
      {
        status,
        // notes could be added to schema if needed
        "payment.verifiedAt": status === "verified" ? new Date() : undefined,
      },
      { new: true },
    );

    return NextResponse.json(
      { message: `Status updated to ${status}`, registration: updated },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating status" },
      { status: 500 },
    );
  }
}
