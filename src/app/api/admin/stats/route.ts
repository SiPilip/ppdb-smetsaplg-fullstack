export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import { Registration } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();

    const total = await Registration.countDocuments();
    const pending = await Registration.countDocuments({ status: "pending" }); // Sudah upload/bayar
    const verified = await Registration.countDocuments({ status: "verified" }); // Diterima
    const rejected = await Registration.countDocuments({ status: "rejected" });
    const draft = await Registration.countDocuments({ status: "draft" });

    // Recent Registrations (Limit 5)
    // Only fetch necessary fields: Student Name, Status, Wave, Date
    const recent = await Registration.find()
      .populate("userId", "name phoneNumber")
      .select("student.fullName status wave createdAt userId")
      .sort({ createdAt: -1 })
      .limit(5);

    // Wave Stats (Aggregation)
    const waveStats = await Registration.aggregate([
      { $group: { _id: "$wave", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json(
      {
        counts: {
          total,
          pending,
          verified,
          rejected,
          draft,
        },
        recent,
        waveStats,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Error stats" }, { status: 500 });
  }
}
