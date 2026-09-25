import { useEffect, useState } from 'react'
import { Autocomplete, Card, IconButton, MenuItem, Stack, TextField, Tooltip,
    Typography } from '@mui/material'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import CurrencyField from '../common/CurrencyField'
import { getQuery } from '../../helpers/apiQuery'
import { getModelSizeText } from '../../helpers/productFormat'
import { priceFormatter } from '../../helpers/utils'
import type { ProductModel, ProductNameOption } from '../../models/domain'
import type { OrderProductFormValues } from '../../models/orderForm'
import { CUSTOM_MODEL_VALUE } from '../../models/orderForm'

interface OrderProductFieldsProps {
    line: OrderProductFormValues
    index: number
    productOptions: ProductNameOption[]
    canRemove: boolean
    onChange: (index: number, line: OrderProductFormValues) => void
    onRemove: (index: number) => void
}

// Editor for a single order line: pick a product, then a model of that
// product (or "Personalizado"), then adjust quantity/measurements/price as
// needed. Purely controlled — all state lives in OrderForm.
function OrderProductFields({
    line,
    index,
    productOptions,
    canRemove,
    onChange,
    onRemove,
}: OrderProductFieldsProps) {
    const [models, setModels] = useState<ProductModel[]>([])
    const [modelsLoading, setModelsLoading] = useState(false)

    const setField = <K extends keyof OrderProductFormValues>(
        field: K,
        value: OrderProductFormValues[K],
    ) => {
        onChange(index, { ...line, [field]: value })
    }

    const applyModel = (model: ProductModel) => {
        onChange(index, {
            ...line,
            model_id: model._id,
            length: String(model.length),
            width: String(model.width),
            unit_price: String(model.prices['1'] ?? ''),
        })
    }

    // Loads the selected product's models so the user can pick one. A single
    // model is auto-selected; an already-set model_id (editing an existing
    // order) is left alone so it isn't clobbered by this re-fetch. Clearing
    // the product (handleProductChange) resets `models` itself, so this only
    // ever needs to fetch, never to reset.
    useEffect(() => {
        if (!line.product_id) return

        let cancelled = false
        // Same fetch-on-mount/dependency-change shape as usePaginatedList; see the
        // eslint-disable there for why this rule doesn't fit this pattern.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModelsLoading(true)

        getQuery<ProductModel[]>(`/products/${line.product_id}/models`)
            .then((response) => {
                if (cancelled) return
                const productModels = response.data
                setModels(productModels)

                const onlyModel = productModels[0]
                if (productModels.length === 1 && onlyModel && !line.model_id) {
                    applyModel(onlyModel)
                }
            })
            .catch(() => {
                if (!cancelled) setModels([])
            })
            .finally(() => {
                if (!cancelled) setModelsLoading(false)
            })

        return () => {
            cancelled = true
        }
        // Re-runs only when the product changes, not on every field edit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [line.product_id])

    const handleProductChange = (option: ProductNameOption | null) => {
        setModels([])
        onChange(index, {
            ...line,
            product_id: option?._id ?? '',
            product_name: option?.name ?? '',
            model_id: '',
            length: '',
            width: '',
            unit_price: '',
        })
    }

    const handleModelChange = (modelId: string) => {
        if (modelId === CUSTOM_MODEL_VALUE) {
            onChange(index, { ...line, model_id: CUSTOM_MODEL_VALUE, length: '', width: '', unit_price: '' })
            return
        }

        const model = models.find((m) => m._id === modelId)
        if (model) applyModel(model)
    }

    const selectedProduct = productOptions.find((option) => option._id === line.product_id) ?? null
    const subtotal = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0)

    return (
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                    <Typography variant="subtitle2">Producto {index + 1}</Typography>
                    <Tooltip
                        title={canRemove ? 'Eliminar producto' : 'Debe haber al menos un producto'}
                    >
                        <span>
                            <IconButton
                                size="small"
                                onClick={() => onRemove(index)}
                                disabled={!canRemove}
                            >
                                <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <Autocomplete
                        options={productOptions}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        value={selectedProduct}
                        onChange={(_event, option) => handleProductChange(option)}
                        renderInput={(params) => (
                            <TextField {...params} label="Producto" size="small" />
                        )}
                        sx={{ flex: 1 }}
                    />

                    <TextField
                        select
                        label="Modelo"
                        size="small"
                        value={line.model_id}
                        onChange={(e) => handleModelChange(e.target.value)}
                        disabled={!line.product_id || modelsLoading}
                        sx={{ flex: 1 }}
                    >
                        {!line.model_id && (
                            <MenuItem value="" disabled>
                                Seleccioná un modelo
                            </MenuItem>
                        )}
                        {models.map((model) => (
                            <MenuItem key={model._id} value={model._id}>
                                {getModelSizeText(model)}
                            </MenuItem>
                        ))}
                        <MenuItem value={CUSTOM_MODEL_VALUE}>Personalizado</MenuItem>
                    </TextField>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <TextField
                        label="Largo (cm)"
                        type="number"
                        value={line.length}
                        onChange={(e) => setField('length', e.target.value)}
                        size="small"
                        fullWidth
                    />
                    <TextField
                        label="Ancho (cm)"
                        type="number"
                        value={line.width}
                        onChange={(e) => setField('width', e.target.value)}
                        size="small"
                        fullWidth
                    />
                    <TextField
                        label="Cantidad"
                        type="number"
                        value={line.quantity}
                        onChange={(e) => setField('quantity', e.target.value)}
                        size="small"
                        fullWidth
                    />
                </Stack>

                <Stack direction="row" spacing={2}>
                    <TextField
                        label="Color"
                        value={line.color}
                        onChange={(e) => setField('color', e.target.value)}
                        size="small"
                        fullWidth
                    />
                    <CurrencyField
                        label="Precio unitario"
                        value={line.unit_price}
                        onChange={(value) => setField('unit_price', value)}
                        size="small"
                        fullWidth
                    />
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
                    Subtotal: {priceFormatter(subtotal)}
                </Typography>
            </Stack>
        </Card>
    )
}

export default OrderProductFields
