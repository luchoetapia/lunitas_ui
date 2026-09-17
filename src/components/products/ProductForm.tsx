import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel,
    IconButton, Stack, Switch, TextField, Typography } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ImageUploader from '../common/ImageUploader'
import useAlertStore from '../../stores/AlertStore'
import { postQuery, putQuery } from '../../helpers/apiQuery'    
import type { Product } from '../../models/domain'

interface PriceTier {
    quantity: string
    price: string
}

interface ProductFormValues {
    name: string
    description: string
    image: string
    fabric: string
    filling: string
    length: string
    width: string
    is_active: boolean
    prices: PriceTier[]
    questions: string[]
}

const EMPTY_VALUES: ProductFormValues = {
    name: '',
    description: '',
    image: '',
    fabric: '',
    filling: '',
    length: '',
    width: '',
    is_active: true,
    prices: [{ quantity: '1', price: '' }],
    questions: [],
}

// Converts a Product (as returned by the API) into editable form state.
const productToFormValues = (product: Product): ProductFormValues => ({
    name: product.name,
    description: product.description,
    image: product.image,
    fabric: product.fabric,
    filling: product.filling,
    length: String(product.length),
    width: String(product.width),
    is_active: product.is_active,
    // The "1" tier is the mandatory base price and always shown first.
    prices: Object.entries(product.prices)
        .sort(([a], [b]) => (a === '1' ? -1 : b === '1' ? 1 : Number(a) - Number(b)))
        .map(([quantity, price]) => ({
            quantity,
            price: String(price),
        })),
    questions: product.questions,
})

interface ProductFormContentProps {
    product?: Product
    onClose: () => void
    onSaved: () => void
}

// Owns all form state and interactions. Remounted fresh every time the
// dialog opens (see ProductForm below), so state never needs to be synced
// back to the edited product through an effect.
function ProductFormContent({ product, onClose, onSaved }: ProductFormContentProps) {
    const [values, setValues] = useState<ProductFormValues>(() => (
        product ? productToFormValues(product) : EMPTY_VALUES
    ))
    const [saving, setSaving] = useState(false)
    const showAlert = useAlertStore((state) => state.showAlert)

    const isEditing = Boolean(product)

    const setField = <K extends keyof ProductFormValues>(
        field: K,
        value: ProductFormValues[K],
    ) => {
        setValues((prev) => ({ ...prev, [field]: value }))
    }

    const handlePriceChange = (index: number, field: keyof PriceTier, value: string) => {
        const prices = values.prices.map((tier, i) => (
            i === index ? { ...tier, [field]: value } : tier
        ))
        setField('prices', prices)
    }

    const addPriceTier = () => {
        setField('prices', [...values.prices, { quantity: '', price: '' }])
    }

    const removePriceTier = (index: number) => {
        setField('prices', values.prices.filter((_, i) => i !== index))
    }

    const handleQuestionChange = (index: number, value: string) => {
        const questions = values.questions.map((q, i) => (i === index ? value : q))
        setField('questions', questions)
    }

    const addQuestion = () => {
        setField('questions', [...values.questions, ''])
    }

    const removeQuestion = (index: number) => {
        setField('questions', values.questions.filter((_, i) => i !== index))
    }

    // Builds the { "1": 100, "2": 90 } shape the API expects, dropping empty rows.
    const buildPricesPayload = (): Record<string, number> => {
        const prices: Record<string, number> = {}

        values.prices.forEach(({ quantity, price }) => {
            if (quantity && price) {
                prices[quantity] = Number(price)
            }
        })

        return prices
    }

    const validate = (prices: Record<string, number>): string | null => {
        if (!values.name.trim()) return 'El nombre es obligatorio'
        if (!values.description.trim()) return 'La descripción es obligatoria'
        if (!values.image) return 'Subí una imagen del producto'
        if (!values.fabric.trim()) return 'La tela es obligatoria'
        if (!values.filling.trim()) return 'El relleno es obligatorio'
        if (!values.length || Number(values.length) <= 0) return 'El largo debe ser mayor a 0'
        if (!values.width || Number(values.width) <= 0) return 'El ancho debe ser mayor a 0'
        if (!prices['1']) return 'Definí el precio base para cantidad mínima 1'

        return null
    }

    const handleSubmit = async () => {
        const prices = buildPricesPayload()
        const validationError = validate(prices)

        if (validationError) {
            showAlert(validationError, 'warning')
            return
        }

        const payload = {
            name: values.name.trim(),
            description: values.description.trim(),
            image: values.image,
            fabric: values.fabric.trim(),
            filling: values.filling.trim(),
            length: Number(values.length),
            width: Number(values.width),
            is_active: values.is_active,
            prices,
            questions: values.questions.map((q) => q.trim()).filter(Boolean),
        }

        setSaving(true)

        try {
            if (isEditing && product) {
                await putQuery(`/products/${product._id}`, {}, payload)
                showAlert('Producto actualizado', 'success')
            } else {
                await postQuery('/products', {}, payload)
                showAlert('Producto creado', 'success')
            }

            onSaved()
            onClose()
        } catch {
            // apiQuery already showed the error alert.
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <DialogTitle variant="h1">
                {isEditing ? 'Editar producto' : 'Nuevo producto'}
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                        <ImageUploader
                            value={values.image}
                            onChange={(url) => setField('image', url)}
                        />

                        <Stack spacing={2} sx={{ flex: 1 }}>
                            <TextField
                                label="Nombre"
                                value={values.name}
                                onChange={(e) => setField('name', e.target.value)}
                                fullWidth
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={values.is_active}
                                        onChange={(e) => setField('is_active', e.target.checked)}
                                    />
                                }
                                label="Activo"
                            />
                        </Stack>
                    </Stack>

                    <TextField
                        label="Descripción"
                        value={values.description}
                        onChange={(e) => setField('description', e.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                    />

                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Tela"
                            value={values.fabric}
                            onChange={(e) => setField('fabric', e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Relleno"
                            value={values.filling}
                            onChange={(e) => setField('filling', e.target.value)}
                            fullWidth
                        />
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Largo (cm)"
                            type="number"
                            value={values.length}
                            onChange={(e) => setField('length', e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Ancho (cm)"
                            type="number"
                            value={values.width}
                            onChange={(e) => setField('width', e.target.value)}
                            fullWidth
                        />
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                        <Stack
                            direction="row"
                            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <Typography variant="subtitle2">Precios por cantidad</Typography>
                            <IconButton size="small" onClick={addPriceTier}>
                                <AddOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Stack>

                        {values.prices.map((tier, index) => (
                            <Stack
                                key={index}
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'center' }}
                            >
                                <TextField
                                    label="Cantidad mínima"
                                    type="number"
                                    value={tier.quantity}
                                    onChange={(e) => (
                                        handlePriceChange(index, 'quantity', e.target.value)
                                    )}
                                    disabled={index === 0}
                                    size="small"
                                    fullWidth
                                />
                                <TextField
                                    label="Precio unitario"
                                    type="number"
                                    value={tier.price}
                                    onChange={(e) => (
                                        handlePriceChange(index, 'price', e.target.value)
                                    )}
                                    size="small"
                                    fullWidth
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => removePriceTier(index)}
                                    disabled={index === 0}
                                >
                                    <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        ))}
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                        <Stack
                            direction="row"
                            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <Typography variant="subtitle2">Preguntas al cliente</Typography>
                            <IconButton size="small" onClick={addQuestion}>
                                <AddOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Stack>

                        {values.questions.map((question, index) => (
                            <Stack
                                key={index}
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'center' }}
                            >
                                <TextField
                                    value={question}
                                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                                    size="small"
                                    fullWidth
                                />
                                <IconButton size="small" onClick={() => removeQuestion(index)}>
                                    <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                    {isEditing ? 'Guardar cambios' : 'Crear producto'}
                </Button>
            </DialogActions>
        </>
    )
}

interface ProductFormProps {
    open: boolean
    product?: Product
    onClose: () => void
    onSaved: () => void
}

// Modal used both to create a new product and to edit an existing one.
// There is no dedicated page: creating/editing always happens over the list.
// The content is only mounted while open, so each open starts from fresh
// state (the edited product, or a blank product for creation).
function ProductForm({ open, product, onClose, onSaved }: ProductFormProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            {open && (
                <ProductFormContent
                    key={product?._id ?? 'new'}
                    product={product}
                    onClose={onClose}
                    onSaved={onSaved}
                />
            )}
        </Dialog>
    )
}

export default ProductForm
