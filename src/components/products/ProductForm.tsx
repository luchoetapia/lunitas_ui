import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel,
    IconButton, Stack, Switch, TextField, Typography } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ImageUploader from '../common/ImageUploader'
import ProductModelFields from './ProductModelFields'
import { createEmptyModel } from '../../models/productForm'
import type { ModelFormValues } from '../../models/productForm'
import useAlertStore from '../../stores/AlertStore'
import { postQuery, putQuery } from '../../helpers/apiQuery'
import type { Product, ProductModel } from '../../models/domain'

interface ProductFormValues {
    name: string
    description: string
    image: string
    fabric: string
    filling: string
    is_active: boolean
    models: ModelFormValues[]
    questions: string[]
}

// Payload sent to the API: models carry no _id, the backend replaces the
// whole array on update.
type ModelPayload = Omit<ProductModel, '_id'>

const EMPTY_VALUES: ProductFormValues = {
    name: '',
    description: '',
    image: '',
    fabric: '',
    filling: '',
    is_active: true,
    models: [createEmptyModel()],
    questions: [],
}

// The "1" tier is the mandatory base price and always shown first.
const modelToFormValues = (model: ProductModel): ModelFormValues => ({
    _id: model._id,
    length: String(model.length),
    width: String(model.width),
    prices: Object.entries(model.prices)
        .sort(([a], [b]) => (a === '1' ? -1 : b === '1' ? 1 : Number(a) - Number(b)))
        .map(([quantity, price]) => ({
            quantity,
            price: String(price),
        })),
})

// Converts a Product (as returned by the API) into editable form state.
const productToFormValues = (product: Product): ProductFormValues => ({
    name: product.name,
    description: product.description,
    image: product.image,
    fabric: product.fabric,
    filling: product.filling,
    is_active: product.is_active,
    models: product.models.length > 0
        ? product.models.map(modelToFormValues)
        : [createEmptyModel()],
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

    const handleModelChange = (index: number, model: ModelFormValues) => {
        setField('models', values.models.map((m, i) => (i === index ? model : m)))
    }

    const addModel = () => {
        setField('models', [...values.models, createEmptyModel()])
    }

    const removeModel = (index: number) => {
        setField('models', values.models.filter((_, i) => i !== index))
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

    // Builds the models array the API expects: measurements as numbers and
    // prices as a { "1": 100, "2": 90 } object, dropping empty tier rows.
    const buildModelsPayload = (): ModelPayload[] => (
        values.models.map(({ length, width, prices }) => {
            const tiers: Record<string, number> = {}

            prices.forEach(({ quantity, price }) => {
                if (quantity && price) {
                    tiers[quantity] = Number(price)
                }
            })

            return { length: Number(length), width: Number(width), prices: tiers }
        })
    )

    const validateModels = (models: ModelPayload[]): string | null => {
        const sizes = new Set<string>()

        for (const [index, model] of models.entries()) {
            const label = `Modelo ${index + 1}`

            if (!model.length || model.length <= 0) return `${label}: el largo debe ser mayor a 0`
            if (!model.width || model.width <= 0) return `${label}: el ancho debe ser mayor a 0`
            if (!model.prices['1']) return `${label}: definí el precio para cantidad mínima 1`

            const size = `${model.length}x${model.width}`
            if (sizes.has(size)) return `${label}: ya hay otro modelo con esas medidas`
            sizes.add(size)
        }

        return null
    }

    const validate = (models: ModelPayload[]): string | null => {
        if (!values.name.trim()) return 'El nombre es obligatorio'
        if (!values.description.trim()) return 'La descripción es obligatoria'
        if (!values.image) return 'Subí una imagen del producto'
        if (!values.fabric.trim()) return 'La tela es obligatoria'
        if (!values.filling.trim()) return 'El relleno es obligatorio'
        if (models.length === 0) return 'Agregá al menos un modelo'

        return validateModels(models)
    }

    const handleSubmit = async () => {
        const models = buildModelsPayload()
        const validationError = validate(models)

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
            is_active: values.is_active,
            models,
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

                    <Divider />

                    <Stack spacing={2}>
                        <Stack
                            direction="row"
                            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <Typography variant="subtitle2">Modelos</Typography>
                            <IconButton size="small" onClick={addModel}>
                                <AddOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Stack>

                        {values.models.map((model, index) => (
                            <ProductModelFields
                                key={model._id ?? index}
                                model={model}
                                index={index}
                                canRemove={values.models.length > 1}
                                onChange={handleModelChange}
                                onRemove={removeModel}
                            />
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
