import type { Product, ProductModel } from '../models/domain'
import { priceFormatter } from './utils'

// "tela · relleno" line shown under the product name.
export const getSpecsText = (product: Product) => `${product.fabric} · ${product.filling}`

// A model is identified by its measurements, e.g. "90cm x 60cm".
export const getModelSizeText = (model: ProductModel) =>
    `${model.length}cm x ${model.width}cm`

// Compact summary of the available models, e.g. "2 modelos: 90cm x 60cm, 120cm x 80cm".
export const getModelsSummary = (product: Product) => {
    const count = product.models.length

    if (count === 0) return 'Sin modelos'

    const sizes = product.models.map(getModelSizeText).join(', ')
    return `${count} ${count === 1 ? 'modelo' : 'modelos'}: ${sizes}`
}

// Price tiers sorted by minimum quantity, ready to render.
export const getSortedPriceTiers = (model: ProductModel) =>
    Object.entries(model.prices).sort(([a], [b]) => Number(a) - Number(b))

// "Desde 5 unidades: $12.000" — one line of a model's price list.
export const getPriceTierText = (quantity: string, price: number) => {
    const unit = quantity === '1' ? 'unidad' : 'unidades'
    return `Desde ${quantity} ${unit}: ${priceFormatter(price)}`
}
