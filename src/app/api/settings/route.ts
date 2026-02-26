import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Settings } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();

    // Fetch settings (Admin config)
    let settings = await Settings.findOne({});

    if (!settings) {
      settings = await Settings.create({
        waves: [
          {
            name: "Gelombang 1",
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

    // Migration Logic: Check for old 'feeGroups' inside waves (Level 3 -> Level 2)
    const settingsObj = settings.toObject ? settings.toObject() : settings;
    let needsMigration = false;

    // Check if we have waves
    if (settingsObj.waves && settingsObj.waves.length > 0) {
      // Check if first wave has 'feeGroups' instead of direct 'items'
      if (settingsObj.waves[0].feeGroups && !settingsObj.waves[0].items) {
        console.log("Migrating nested feeGroups to flattened items...");

        const newWaves = settingsObj.waves.map((w: any) => ({
          name: w.name,
          startDate: w.startDate,
          endDate: w.endDate,
          // Flatten: Take first group items or empty
          items: w.feeGroups?.[0]?.items || {},
        }));

        await Settings.updateOne(
          { _id: settings._id },
          { $set: { waves: newWaves } },
        );
        needsMigration = true;
      }
    }

    if (needsMigration) {
      settings = await Settings.findOne({ _id: settings._id });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching settings" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    console.log("PUT /api/settings Body:", JSON.stringify(body, null, 2));

    let settings = await Settings.findOne({});
    console.log("Existing Settings:", settings ? "Found" : "Not Found");

    if (!settings) {
      return NextResponse.json(
        { message: "Settings not initialized" },
        { status: 404 },
      );
    }

    const updateData: any = {};
    if (body.waves) {
      // --- Date Validation Logic ---
      const wavesToCheck = [...body.waves];

      // 1. Sort by Start Date
      wavesToCheck.sort(
        (a: any, b: any) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );

      // 2. Check for Overlaps
      for (let i = 0; i < wavesToCheck.length - 1; i++) {
        const currentWave = wavesToCheck[i];
        const nextWave = wavesToCheck[i + 1];

        const currentEnd = new Date(currentWave.endDate).getTime();
        const nextStart = new Date(nextWave.startDate).getTime();

        // Allow touching dates (end == start)? User said "no collision", let's assume end day of one cannot be > start day of next.
        // Usually simpler: End Date of 1 must be < Start Date of 2.
        // If Wave 1 ends Jan 10 (23:59), Wave 2 starts Jan 5 -> Overlap.
        // If Wave 1 ends Jan 10, Wave 2 starts Jan 11 -> OK.
        if (currentEnd >= nextStart) {
          return NextResponse.json(
            {
              message: `Terdapat bentrokan tanggal antara "${currentWave.name}" dan "${nextWave.name}". Harap perbaiki tanggal.`,
            },
            { status: 400 },
          );
        }
      }

      updateData.waves = body.waves;
    }

    console.log("Updating Settings with:", JSON.stringify(updateData, null, 2));

    const updatedSettings = await Settings.findByIdAndUpdate(
      settings._id,
      { $set: updateData },
      { new: true },
    );

    console.log(
      "Updated Settings Result:",
      JSON.stringify(updatedSettings, null, 2),
    );

    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { message: "Error updating settings" },
      { status: 500 },
    );
  }
}
