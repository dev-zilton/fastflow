import { pgTable, text, timestamp, boolean, decimal, integer, jsonb } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Example:
//
// import { serial } from "drizzle-orm/pg-core"
//
// export const todos = pgTable("todos", {
//   id: serial("id").primaryKey(),
//   userId: text("userId").notNull(),
//   title: text("title").notNull(),
//   completed: boolean("completed").notNull().default(false),
//   createdAt: timestamp("createdAt").notNull().defaultNow(),
// })
//
// If the user asks for foreign keys, add the reference back in:
//   userId: text("userId")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),

// --- FastFlow Restaurant Delivery Tables ---

export const restaurants = pgTable('restaurants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  phone: text('phone'),
  email: text('email'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  isOpen: boolean('isOpen').default(true),
  image_url: text('image_url'),
  min_order_value: decimal('min_order_value', { precision: 10, scale: 2 }),
  delivery_fee: decimal('delivery_fee', { precision: 10, scale: 2 }),
  estimated_delivery_minutes: integer('estimated_delivery_minutes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurantId').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  image_url: text('image_url'),
  is_available: boolean('is_available').default(true),
  preparation_time_minutes: integer('preparation_time_minutes'),
  allergens: text('allergens'),
  is_vegetarian: boolean('is_vegetarian').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const menuItemOptions = pgTable('menu_item_options', {
  id: text('id').primaryKey(),
  menuItemId: text('menuItemId').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  option_type: text('option_type').notNull(),
  price_modifier: decimal('price_modifier', { precision: 10, scale: 2 }).default('0'),
  is_required: boolean('is_required').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurantId').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  userId: text('userId'),
  customer_name: text('customer_name'),
  customer_phone: text('customer_phone').notNull(),
  customer_email: text('customer_email'),
  delivery_address: text('delivery_address').notNull(),
  delivery_latitude: decimal('delivery_latitude', { precision: 10, scale: 8 }),
  delivery_longitude: decimal('delivery_longitude', { precision: 11, scale: 8 }),
  status: text('status').notNull().default('pending'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  delivery_fee: decimal('delivery_fee', { precision: 10, scale: 2 }),
  discount_amount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  payment_method: text('payment_method'),
  notes: text('notes'),
  estimated_delivery_time: timestamp('estimated_delivery_time'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('orderId').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: text('menuItemId').notNull().references(() => menuItems.id),
  quantity: integer('quantity').notNull(),
  unit_price: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  customizations: jsonb('customizations'),
  special_instructions: text('special_instructions'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  orderId: text('orderId').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: text('method').notNull(),
  status: text('status').notNull().default('pending'),
  pix_code: text('pix_code'),
  pix_qr_code: text('pix_qr_code'),
  transaction_id: text('transaction_id'),
  error_message: text('error_message'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const loyaltyPoints = pgTable('loyalty_points', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  restaurantId: text('restaurantId').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  points: integer('points').notNull().default(0),
  total_earned: integer('total_earned').notNull().default(0),
  total_redeemed: integer('total_redeemed').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const loyaltyTransactions = pgTable('loyalty_transactions', {
  id: text('id').primaryKey(),
  loyaltyPointsId: text('loyaltyPointsId').notNull().references(() => loyaltyPoints.id, { onDelete: 'cascade' }),
  orderId: text('orderId').references(() => orders.id),
  type: text('type').notNull(),
  points: integer('points').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const coupons = pgTable('coupons', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurantId').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  description: text('description'),
  discount_type: text('discount_type').notNull(),
  discount_value: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  min_order_value: decimal('min_order_value', { precision: 10, scale: 2 }),
  max_discount: decimal('max_discount', { precision: 10, scale: 2 }),
  usage_limit: integer('usage_limit'),
  times_used: integer('times_used').default(0),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  is_active: boolean('is_active').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const deliveryZones = pgTable('delivery_zones', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurantId').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  zone_name: text('zone_name').notNull(),
  delivery_fee: decimal('delivery_fee', { precision: 10, scale: 2 }).notNull(),
  estimated_time_minutes: integer('estimated_time_minutes'),
  polygon_coordinates: jsonb('polygon_coordinates'),
  is_active: boolean('is_active').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const restaurantManagers = pgTable('restaurant_managers', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurantId').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('manager'),
  permissions: jsonb('permissions').default({ manage_orders: true, manage_menu: true, view_reports: true }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const drivers = pgTable('drivers', {
  id: text('id').primaryKey(),
  restaurantId: text('restaurantId').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  vehicle_type: text('vehicle_type'),
  license_plate: text('license_plate'),
  status: text('status').default('available'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  current_order_id: text('current_order_id').references(() => orders.id),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('5.0'),
  total_deliveries: integer('total_deliveries').default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orderStatusHistory = pgTable('order_status_history', {
  id: text('id').primaryKey(),
  orderId: text('orderId').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  changed_by: text('changed_by'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
