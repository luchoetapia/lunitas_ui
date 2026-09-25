import type { Order } from '../models/domain'
import { priceFormatter } from './utils'

// "23/09/2026" — the order date shown on the card next to the cost.
export const getOrderDateText = (order: Order) =>
    new Date(order.orderDate).toLocaleDateString('es-AR')

// "23/09/2026" or a placeholder when no delivery date was set yet.
export const getDeliveryDateText = (order: Order) =>
    order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('es-AR') : 'Sin definir'

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

export const getShippingAmountText = (order: Order) =>
    `Costo de envio: ${priceFormatter(order.shippingAmount)}`

// "Cliente: Nombre" shown in the ficha's details grid, when set.
export const getCustomerNameText = (order: Order) => `Cliente: ${order.customerName}`

// "Contacto: X" — free text (phone, Instagram handle, etc.), can be empty.
export const getContactDetailText = (order: Order) => `Contacto: ${order.contactDetail}`

// "Dirección: Calle 123" — only meaningful when the order has shipping.
export const getDeliveryAddressText = (order: Order) =>
    `Dirección: ${order.deliveryAddress ?? 'Sin definir'}`

// Small "Costo: $X" text, distinct from the bold final amount.
export const getCostText = (order: Order) => `Costo: ${priceFormatter(order.cost)}`

export const getDepositText = (order: Order) => `Seña: ${priceFormatter(order.deposit)}`

export const getTotalPriceText = (order: Order) => priceFormatter(order.totalPrice)

// An order that's already delivered or cancelled has no further status to move to.
export const canAdvanceStatus = (order: Order) =>
    order.state !== 'DELIVERED' && order.state !== 'CANCELLED'

// An order that's already cancelled can't be cancelled again.
export const canCancelOrder = (order: Order) => order.state !== 'CANCELLED'
