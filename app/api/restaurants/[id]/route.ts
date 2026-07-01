import { db } from "@/lib/db";
import { restaurants, menuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const restaurant = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);

    if (!restaurant.length) {
      return Response.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.restaurantId, id));

    return Response.json({
      restaurant: restaurant[0],
      items: items,
    });
  } catch (error) {
    console.error("[API] Error fetching restaurant:", error);
    return Response.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const body = await request.json();

    const updated = await db
      .update(restaurants)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, id))
      .returning();

    if (!updated.length) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("[Restaurant API] PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update restaurant" },
      { status: 500 },
    );
  }
}
