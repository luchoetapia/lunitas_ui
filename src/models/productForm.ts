// Form-only shapes for the product editor: every field is kept as a string
// while editing and converted to the API's Product shape on submit.
export interface PriceTier {
    quantity: string
    price: string
}

export interface ModelFormValues {
    // Present only on models that already exist in the database.
    _id?: string
    length: string
    width: string
    prices: PriceTier[]
}

// A factory, not a constant: each new model needs its own arrays so two
// rows never share the same price tier objects.
export const createEmptyModel = (): ModelFormValues => ({
    length: '',
    width: '',
    prices: [{ quantity: '1', price: '' }],
})
