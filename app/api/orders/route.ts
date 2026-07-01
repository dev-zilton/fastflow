import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      restaurantId,
      items,
      address,
      paymentMethod,
      subtotal,
      deliveryFee,
    } = body

    const orderId = `order_${uuidv4()}`

    // Create order
    const total = parseFloat(subtotal) + parseFloat(deliveryFee)

    const orderResult = await db
      .insert(orders)
      .values({
        id: orderId,
        restaurantId,
        customer_name: address.name,
        customer_phone: address.phone,
        customer_email: address.email,
        delivery_address: `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city}`,
        status: 'pending',
        subtotal: subtotal.toString(),
        delivery_fee: deliveryFee.toString(),
        total: total.toString(),
        payment_method: paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    // Create order items
    for (const item of items) {
      await db.insert(orderItems).values({
        id: `order_item_${uuidv4()}`,
        orderId,
        menuItemId: item.id,
        quantity: item.quantity,
        unit_price: item.price.toString(),
        createdAt: new Date(),
      })
    }

    return Response.json(orderResult[0], { status: 201 })
  } catch (error) {
    console.error('[API] Error creating order:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const allOrders = await db.select().from(orders).limit(100)
    return Response.json(allOrders)
  } catch (error) {
    console.error('[API] Error fetching orders:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
