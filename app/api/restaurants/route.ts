import { db } from '@/lib/db'
import { restaurants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const data = await db.select().from(restaurants).where(eq(restaurants.isOpen, true))
    return Response.json(data)
  } catch (error) {
    console.error('[API] Error fetching restaurants:', error)
    return Response.json({ error: 'Failed to fetch restaurants' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await db.insert(restaurants).values({
      id: `rest_${Date.now()}`,
      ...body,
    }).returning()
    return Response.json(result[0], { status: 201 })
  } catch (error) {
    console.error('[API] Error creating restaurant:', error)
    return Response.json({ error: 'Failed to create restaurant' }, { status: 500 })
  }
}
