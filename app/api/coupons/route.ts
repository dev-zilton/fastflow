import { db } from '@/lib/db'
import { coupons, restaurants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get('restaurantId')

    if (restaurantId) {
      const couponsList = await db
        .select()
        .from(coupons)
        .where(eq(coupons.restaurantId, restaurantId))

      return NextResponse.json(couponsList)
    }

    const couponsList = await db.select().from(coupons)
    return NextResponse.json(couponsList)
  } catch (error) {
    console.error('[Coupons API] GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const restaurants_list = await db.select().from(restaurants).limit(1)

    if (!restaurants_list.length) {
      return NextResponse.json({ error: 'No restaurant found' }, { status: 404 })
    }

    const coupon = {
      id: uuid(),
      restaurantId: restaurants_list[0].id,
      code: body.code,
      description: body.description || '',
      discount_type: body.discount_type || 'percentage',
      discount_value: body.discount_value,
      min_order_value: body.min_order_value,
      max_discount: body.max_discount,
      usage_limit: body.usage_limit || null,
      times_used: 0,
      start_date: body.start_date || new Date(),
      end_date: body.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      is_active: true,
      createdAt: new Date(),
    }

    await db.insert(coupons).values(coupon)
    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error('[Coupons API] POST Error:', error)
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}
