// Domain models used across product components.
// Mirrors the API's Product shape 1:1 (see lunitas_server/src/database/schemas/productSchema.ts
// and lunitas_server/src/validators/productsValidators.ts) — keep both in sync when either changes.
export interface Product {
    _id: string
    name: string
    description: string
    image: string
    fabric: string
    filling: string
    length: number // in centimeters
    width: number // in centimeters
    is_active: boolean
    // key: minimum quantity (as string), value: unit price from that quantity on.
    // A Mongoose Map<string, number> serializes to a plain object over JSON.
    prices: Record<string, number>
    questions: string[]
}
