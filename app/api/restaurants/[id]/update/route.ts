import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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
