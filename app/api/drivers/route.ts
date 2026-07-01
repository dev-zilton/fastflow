import { db } from "@/lib/db";
import { drivers, restaurants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get("restaurantId");

    if (restaurantId) {
      const driversList = await db
        .select()
        .from(drivers)
        .where(eq(drivers.restaurantId, restaurantId));

      return NextResponse.json(driversList);
    }

    const driversList = await db.select().from(drivers);
    return NextResponse.json(driversList);
  } catch (error) {
    console.error("[Drivers API] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const restaurants_list = await db.select().from(restaurants).limit(1);

    if (!restaurants_list.length) {
      return NextResponse.json(
        { error: "No restaurant found" },
        { status: 404 },
      );
    }

    const driver = {
      id: uuid(),
      restaurantId: restaurants_list[0].id,
      name: body.name,
      phone: body.phone,
      email: body.email || "",
      vehicle_type: body.vehicle_type || "motorcycle",
      license_plate: body.license_plate || "",
      status: "available",
      rating: "5.0",
      total_deliveries: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(drivers).values(driver);
    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    console.error("[Drivers API] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create driver" },
      { status: 500 },
    );
  }
}
