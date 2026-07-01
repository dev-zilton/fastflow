import { db } from "@/lib/db";
import { orders, orderItems, menuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order.length) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await db
      .select({
        id: orderItems.id,
        name: menuItems.name,
        quantity: orderItems.quantity,
        unit_price: orderItems.unit_price,
      })
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, id));

    return Response.json({
      ...order[0],
      items,
    });
  } catch (error) {
    console.error("[API] Error fetching order:", error);
    return Response.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const body = await request.json();

    const result = await db
      .update(orders)
      .set({
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    return Response.json(result[0]);
  } catch (error) {
    console.error("[API] Error updating order:", error);
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}
