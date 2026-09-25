// Form-only shapes for the order editor: every numeric/date field is kept as a
// string while editing and converted to the API's Order shape on submit.
import type { Order, OrderProduct, OrderState } from './domain'

// Sentinel for the "Personalizado" option in a line's model select — distinct
// from '' (no model chosen yet) and from any real model _id.
export const CUSTOM_MODEL_VALUE = 'custom'

export interface OrderProductFormValues {
    product_id: string
    product_name: string
    // A real model's _id, CUSTOM_MODEL_VALUE, or '' while none is chosen yet.
    model_id: string
    length: string
    width: string
    quantity: string
    color: string
    unit_price: string
}

// A factory, not a constant: each new line needs its own object so two rows
// never share state.
export const createEmptyOrderProduct = (): OrderProductFormValues => ({
    product_id: '',
    product_name: '',
    model_id: '',
    length: '',
    width: '',
    quantity: '1',
    color: '',
    unit_price: '',
})

export interface OrderFormValues {
    products: OrderProductFormValues[]
    state: OrderState
    channel: string
    shipping: boolean
    shippingAmount: string
    cost: string
    deposit: string
    orderDate: string
    deliveryDate: string
}

// yyyy-mm-dd, what <input type="date"> (and the API's z.coerce.date()) both accept.
const toDateInputValue = (value?: string | Date): string => {
    if (!value) return ''

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    return date.toISOString().slice(0, 10)
}

// A factory (not a constant) so the default order date is always "today",
// not whatever day the module first loaded.
export const createEmptyOrderValues = (): OrderFormValues => ({
    products: [createEmptyOrderProduct()],
    state: 'PENDING',
    channel: '',
    shipping: false,
    shippingAmount: '',
    cost: '',
    deposit: '',
    orderDate: toDateInputValue(new Date()),
    deliveryDate: '',
})

const orderProductToFormValues = (product: OrderProduct): OrderProductFormValues => ({
    product_id: product.product_id,
    product_name: product.product_name,
    model_id: product.model_id || CUSTOM_MODEL_VALUE,
    length: String(product.length),
    width: String(product.width),
    quantity: String(product.quantity),
    color: product.color ?? '',
    unit_price: String(product.unit_price),
})

// Converts an Order (as returned by the API) into editable form state.
export const orderToFormValues = (order: Order): OrderFormValues => ({
    products: order.products.length > 0
        ? order.products.map(orderProductToFormValues)
        : [createEmptyOrderProduct()],
    state: order.state,
    channel: order.channel,
    shipping: order.shipping,
    shippingAmount: String(order.shippingAmount),
    cost: String(order.cost),
    deposit: String(order.deposit),
    orderDate: toDateInputValue(order.orderDate),
    deliveryDate: toDateInputValue(order.deliveryDate),
})

// Running total shown in the form footer as products are added/edited —
// mirrors the backend's own quantity * unit_price sum.
export const getFormTotal = (products: OrderProductFormValues[]): number =>
    products.reduce(
        (total, product) => total + (Number(product.quantity) || 0) * (Number(product.unit_price) || 0),
        0
    )
