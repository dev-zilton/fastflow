import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { code, restaurantId, subtotal } = await request.json();

    if (!code || !restaurantId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const coupon = await db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.code, code.toUpperCase()),
          eq(coupons.restaurantId, restaurantId),
          eq(coupons.is_active, true),
        ),
      )
      .limit(1);

    if (!coupon.length) {
      return Response.json(
        { error: "Cupom inválido ou expirado" },
        { status: 404 },
      );
    }

    const c = coupon[0];

    // Check if coupon is within valid date range
    const now = new Date();
    if (new Date(c.start_date) > now || new Date(c.end_date) < now) {
      return Response.json({ error: "Cupom expirado" }, { status: 400 });
    }

    // Check minimum order value
    if (c.min_order_value && subtotal < parseFloat(c.min_order_value as any)) {
      return Response.json(
        { error: `Pedido mínimo de MT${c.min_order_value}` },
        { status: 400 },
      );
    }

    // Check usage limit
    if (c.usage_limit != null && (c.times_used ?? 0) >= c.usage_limit) {
      return Response.json(
        { error: "Cupom atingiu limite de uso" },
        { status: 400 },
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (c.discount_type === "percentage") {
      discountAmount = (subtotal * parseFloat(c.discount_value as any)) / 100;
    } else {
      discountAmount = parseFloat(c.discount_value as any);
    }

    // Apply max discount limit
    if (c.max_discount && discountAmount > parseFloat(c.max_discount as any)) {
      discountAmount = parseFloat(c.max_discount as any);
    }

    return Response.json({
      valid: true,
      code: c.code,
      description: c.description,
      discountType: c.discount_type,
      discountValue: c.discount_value,
      discountAmount: discountAmount.toFixed(2),
    });
  } catch (error) {
    console.error("[API] Error validating coupon:", error);
    return Response.json(
      { error: "Failed to validate coupon" },
      { status: 500 },
    );
  }
}
