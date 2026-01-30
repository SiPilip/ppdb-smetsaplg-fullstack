import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Settings } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();

    // Fetch settings (Admin config)
    // If no settings exist, we might return defaults or empty
    let settings = await Settings.findOne({});

    if (!settings) {
      // Optional: Create default if missing for dev convenience
      settings = await Settings.create({
        waveName: "Gelombang 1",
        feeGroups: [
          {
            name: "Reguler",
            description: "Jalur Masuk Reguler",
            items: {
              registration: 150000,
              participation: 5000000,
              uniformSport: 150000,
              uniformBatik: 100000,
              developmentArts: 200000,
              developmentAcademic: 150000,
              books: 1200000,
              orientation: 100000,
              lab: 300000,
              library: 100000,
              healthUnit: 50000,
              osis: 100000,
              tuition: 600000,
            },
          },
        ],
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching settings" },
      { status: 500 },
    );
  }
}
