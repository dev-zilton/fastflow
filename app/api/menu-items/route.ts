import { db } from "@/lib/db";
import { menuItems, restaurants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get("restaurantId");

    if (restaurantId) {
      const items = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.restaurantId, restaurantId));

      return NextResponse.json(items);
    }

    const items = await db.select().from(menuItems);
    return NextResponse.json(items);
  } catch (error) {
    console.error("[Menu Items API] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const restaurantId = body.restaurantId;

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId is required" },
        { status: 400 },
      );
    }

    const restaurant = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, restaurantId))
      .limit(1);
    if (!restaurant.length) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    const item = {
      id: uuid(),
      restaurantId,
      name: body.name,
      description: body.description || "",
      category: body.category || "sushi",
      price: body.price,
      image_url: body.image_url || "",
      is_available: true,
      preparation_time_minutes: 15,
      allergens: body.allergens || "",
      is_vegetarian: body.is_vegetarian || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(menuItems).values(item);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[Menu Items API] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );
  }
}
