import { orderPickupLocationParams, orderSellingChannelParams, orderStatusParams } from './ordersParams'

export interface OrderOption {
    value: string
    label: string
    color: string
}

export const getStateOptions = (): OrderOption[] =>
    Object.entries(orderStatusParams).map(([value, { label, color }]) => ({ value, label, color }))

export const getChannelOptions = (): OrderOption[] =>
    Object.entries(orderSellingChannelParams).map(([value, { label, color }]) => ({
        value,
        label,
        color,
    }))

export const getPickupLocationOptions = (): OrderOption[] =>
    Object.entries(orderPickupLocationParams).map(([value, { label, color }]) => ({
        value,
        label,
        color,
    }))

// States selectable when creating/editing an order from the form — cancelling
// an order has its own dedicated action instead.
export const CREATABLE_STATE_OPTIONS = getStateOptions().filter((option) => option.value !== 'CANCELLED')
