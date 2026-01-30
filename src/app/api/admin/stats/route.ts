import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import { Registration } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();

    const total = await Registration.countDocuments();
    const pending = await Registration.countDocuments({
      status: "pending_payment",
    });
    const verified = await Registration.countDocuments({ status: "verified" });
    const paid = await Registration.countDocuments({ status: "paid" });

    return NextResponse.json(
      {
        total,
        pending,
        verified,
        paid,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Error stats" }, { status: 500 });
  }
}
