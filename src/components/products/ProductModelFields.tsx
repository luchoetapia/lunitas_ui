import { Card, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import type { ModelFormValues, PriceTier } from '../../models/productForm'
import { priceFormatter } from '../../helpers/utils'

interface ProductModelFieldsProps {
    model: ModelFormValues
    index: number
    canRemove: boolean
    onChange: (index: number, model: ModelFormValues) => void
    onRemove: (index: number) => void
}

// Editor for a single product model: its measurements plus its own tiered
// price list. Purely controlled — all state lives in ProductForm.
function ProductModelFields({
    model,
    index,
    canRemove,
    onChange,
    onRemove,
}: ProductModelFieldsProps) {
    const setField = <K extends keyof ModelFormValues>(
        field: K,
        value: ModelFormValues[K],
    ) => {
        onChange(index, { ...model, [field]: value })
    }

    const handlePriceChange = (tierIndex: number, field: keyof PriceTier, value: string) => {
        const prices = model.prices.map((tier, i) => (
            i === tierIndex ? { ...tier, [field]: value } : tier
        ))
        setField('prices', prices)
    }

    // The price field shows the formatted value (e.g. "$ 12.000") while typing;
    // typing only ever adds/removes digits, so we recover the raw amount by
    // stripping everything that isn't a digit.
    const handlePriceInputChange = (tierIndex: number, rawInput: string) => {
        const digitsOnly = rawInput.replace(/\D/g, '')
        handlePriceChange(tierIndex, 'price', digitsOnly)
    }

    const getPriceDisplayValue = (price: string) => (price ? priceFormatter(Number(price)) : '')

    const addPriceTier = () => {
        setField('prices', [...model.prices, { quantity: '', price: '' }])
    }

    const removePriceTier = (tierIndex: number) => {
        setField('prices', model.prices.filter((_, i) => i !== tierIndex))
    }

    return (
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                    <Typography variant="subtitle2">Modelo {index + 1}</Typography>
                    <Tooltip
                        title={canRemove ? 'Eliminar modelo' : 'Debe haber al menos un modelo'}
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
                    <TextField
                        label="Largo (cm)"
                        type="number"
                        value={model.length}
                        onChange={(e) => setField('length', e.target.value)}
                        size="small"
                        fullWidth
                    />
                    <TextField
                        label="Ancho (cm)"
                        type="number"
                        value={model.width}
                        onChange={(e) => setField('width', e.target.value)}
                        size="small"
                        fullWidth
                    />
                </Stack>

                <Stack spacing={1}>
                    <Stack
                        direction="row"
                        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Precios por cantidad
                        </Typography>
                        <IconButton size="small" onClick={addPriceTier}>
                            <AddOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Stack>

                    {model.prices.map((tier, tierIndex) => (
                        <Stack
                            key={tierIndex}
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center' }}
                        >
                            <TextField
                                label="Cantidad mínima"
                                type="number"
                                value={tier.quantity}
                                onChange={(e) => (
                                    handlePriceChange(tierIndex, 'quantity', e.target.value)
                                )}
                                disabled={tierIndex === 0}
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Precio unitario"
                                type="text"
                                inputMode="numeric"
                                value={getPriceDisplayValue(tier.price)}
                                onChange={(e) => (
                                    handlePriceInputChange(tierIndex, e.target.value)
                                )}
                                size="small"
                                fullWidth
                            />
                            <IconButton
                                size="small"
                                onClick={() => removePriceTier(tierIndex)}
                                disabled={tierIndex === 0}
                            >
                                <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    ))}
                </Stack>
            </Stack>
        </Card>
    )
}

export default ProductModelFields
