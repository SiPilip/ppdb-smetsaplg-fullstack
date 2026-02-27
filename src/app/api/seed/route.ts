export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 200 },
      );
    }

    // Create Admin User
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Administrator",
      email: "admin@example.com",
      phoneNumber: "081234567890",
      password: hashedPassword,
      role: "admin",
    });

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        email: "admin@example.com",
        password: "admin123",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Seeding Error:", error);
    return NextResponse.json(
      { message: "Error seeding admin user" },
      { status: 500 },
    );
  }
}
