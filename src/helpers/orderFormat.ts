import type { Order } from '../models/domain'
import { priceFormatter } from './utils'

// "23/09/2026" — the order date shown on the card's first line.
export const getOrderDateText = (order: Order) =>
    new Date(order.orderDate).toLocaleDateString('es-AR')

// "3 productos" — number of distinct product lines in the order.
export const getProductsCountText = (order: Order) => {
    const count = order.products.length
    return `${count} ${count === 1 ? 'producto' : 'productos'}`
}

// "8 unidades" — total quantity across all product lines (a line can have quantity > 1).
export const getUnitsCountText = (order: Order) => {
    const count = order.products.reduce((total, product) => total + product.quantity, 0)
    return `${count} ${count === 1 ? 'unidad' : 'unidades'}`
}

// "Envio: Si" / "Envio: No".
export const getShippingText = (order: Order) => `Envio: ${order.shipping ? 'Si' : 'No'}`

// Small "Costo: $X" text, distinct from the bold final amount.
export const getCostText = (order: Order) => `Costo: ${priceFormatter(order.cost)}`

export const getTotalPriceText = (order: Order) => priceFormatter(order.totalPrice)

// An order that's already delivered or cancelled has no further status to move to.
export const canAdvanceStatus = (order: Order) =>
    order.state !== 'DELIVERED' && order.state !== 'CANCELLED'

// Same terminal states also block cancelling.
export const canCancelOrder = (order: Order) =>
    order.state !== 'DELIVERED' && order.state !== 'CANCELLED'
