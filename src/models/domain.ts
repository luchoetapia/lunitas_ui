// Domain models used across product components.
// Mirrors the API's Product shape 1:1 (see lunitas_server/src/database/schemas/productSchema.ts
// and lunitas_server/src/validators/productsValidators.ts) — keep both in sync when either changes.

// A variant of a product: one size with its own price list.
export interface ProductModel {
    _id: string
    length: number // in centimeters
    width: number // in centimeters
    // key: minimum quantity (as string), value: unit price from that quantity on.
    // A Mongoose Map<string, number> serializes to a plain object over JSON.
    prices: Record<string, number>
}

export interface Product {
    _id: string
    name: string
    description: string
    image: string
    fabric: string
    filling: string
    is_active: boolean
    models: ProductModel[]
    questions: string[]
}

// Domain models used across order components.
// Mirrors the API's Order shape 1:1 (see lunitas_server/src/database/schemas/OrderSchema.ts
// and lunitas_server/src/validators/ordersValidators.ts) — keep both in sync when either changes.

export type OrderState = 'PENDING' | 'IN_PROGRESS' | 'TO_DELIVER' | 'DELIVERED' | 'CANCELLED'

// One line item within an order: a product + model combination with its own quantity.
export interface OrderProduct {
    product_id: string
    model_id?: string
    product_name: string
    length: number // in centimeters
    width: number // in centimeters
    quantity: number
    color?: string
    unit_price: number
}

export interface Order {
    _id: string
    products: OrderProduct[]
    totalPrice: number
    shipping: boolean
    shippingAmount: number
    cost: number
    orderDate: string
    deliveryDate?: string
    deposit: number
    state: OrderState
    channel: string
}
