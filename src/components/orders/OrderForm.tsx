import { useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
    FormControlLabel, IconButton, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ColorBar from '../common/ColorBar'
import CurrencyField from '../common/CurrencyField'
import OrderProductFields from './OrderProductFields'
import { getQuery, postQuery, putQuery } from '../../helpers/apiQuery'
import useAlertStore from '../../stores/AlertStore'
import { priceFormatter } from '../../helpers/utils'
import { CREATABLE_STATE_OPTIONS, getChannelOptions, getStateOptions } from '../../helpers/orderOptions'
import {
    createEmptyOrderProduct,
    createEmptyOrderValues,
    CUSTOM_MODEL_VALUE,
    getFormTotal,
    orderToFormValues,
} from '../../models/orderForm'
import type { OrderFormValues, OrderProductFormValues } from '../../models/orderForm'
import type { Order, ProductNameOption } from '../../models/domain'

const CHANNEL_OPTIONS = getChannelOptions()
// Only used as a fallback so an already-cancelled order being edited doesn't
// render with a blank/invalid Estado field — it's shown disabled, not offered
// as a choice.
const ALL_STATE_OPTIONS = getStateOptions()

// Payload sent to the API: mirrors OrderProduct but model_id is only included
// when a real model was picked ("Personalizado" sends none).
type OrderProductPayload = {
    product_id: string
    model_id?: string
    product_name: string
    length: number
    width: number
    quantity: number
    color?: string
    unit_price: number
}

interface OrderFormContentProps {
    order?: Order
    onClose: () => void
    onSaved: () => void
}

// Owns all form state and interactions. Remounted fresh every time the
// dialog opens (see OrderForm below), so state never needs to be synced back
// to the edited order through an effect.
function OrderFormContent({ order, onClose, onSaved }: OrderFormContentProps) {
    const [values, setValues] = useState<OrderFormValues>(() => (
        order ? orderToFormValues(order) : createEmptyOrderValues()
    ))
    const [productOptions, setProductOptions] = useState<ProductNameOption[]>([])
    const [saving, setSaving] = useState(false)
    const showAlert = useAlertStore((state) => state.showAlert)

    const isEditing = Boolean(order)

    // Loaded once per time the form opens — the product picker filters this
    // list client-side as the user types, no server round trip per keystroke.
    useEffect(() => {
        getQuery<ProductNameOption[]>('/products/names')
            .then((response) => setProductOptions(response.data))
            .catch(() => setProductOptions([]))
    }, [])

    const setField = <K extends keyof OrderFormValues>(field: K, value: OrderFormValues[K]) => {
        setValues((prev) => ({ ...prev, [field]: value }))
    }

    const handleStateChange = (state: OrderFormValues['state']) => {
        // Fecha de entrega only makes sense (and is only enabled) for DELIVERED.
        setValues((prev) => ({
            ...prev,
            state,
            deliveryDate: state === 'DELIVERED' ? prev.deliveryDate : '',
        }))
    }

    const handleProductLineChange = (index: number, line: OrderProductFormValues) => {
        setField('products', values.products.map((p, i) => (i === index ? line : p)))
    }

    const addProductLine = () => {
        setField('products', [...values.products, createEmptyOrderProduct()])
    }

    const removeProductLine = (index: number) => {
        setField('products', values.products.filter((_, i) => i !== index))
    }

    const buildProductsPayload = (): OrderProductPayload[] => (
        values.products.map((product) => ({
            product_id: product.product_id,
            ...(product.model_id && product.model_id !== CUSTOM_MODEL_VALUE
                ? { model_id: product.model_id }
                : {}),
            product_name: product.product_name,
            length: Number(product.length),
            width: Number(product.width),
            quantity: Number(product.quantity),
            ...(product.color.trim() ? { color: product.color.trim() } : {}),
            unit_price: Number(product.unit_price),
        }))
    )

    // Validated straight off the form lines (not the built payload) so there's
    // no risk of the two arrays drifting out of index alignment.
    const validateProducts = (): string | null => {
        for (const [index, line] of values.products.entries()) {
            const label = `Producto ${index + 1}`

            if (!line.product_id) return `${label}: seleccioná un producto`
            if (!line.model_id) return `${label}: seleccioná un modelo`
            if (!line.length || Number(line.length) <= 0) return `${label}: el largo debe ser mayor a 0`
            if (!line.width || Number(line.width) <= 0) return `${label}: el ancho debe ser mayor a 0`
            if (!line.quantity || Number(line.quantity) <= 0) {
                return `${label}: la cantidad debe ser mayor a 0`
            }
            if (!line.unit_price || Number(line.unit_price) <= 0) {
                return `${label}: el precio unitario debe ser mayor a 0`
            }
        }

        return null
    }

    const validate = (products: OrderProductPayload[]): string | null => {
        if (products.length === 0) return 'Agregá al menos un producto'
        if (!values.channel) return 'Seleccioná el canal de compra'
        if (!values.orderDate) return 'La fecha del pedido es obligatoria'
        if (values.cost === '' || Number(values.cost) < 0) return 'Ingresá el costo del pedido'
        if (values.shipping && (values.shippingAmount === '' || Number(values.shippingAmount) < 0)) {
            return 'Ingresá el costo de envío'
        }
        if (values.state === 'DELIVERED' && !values.deliveryDate) {
            return 'La fecha de entrega es obligatoria para un pedido entregado'
        }

        return validateProducts()
    }

    const handleSubmit = async () => {
        const products = buildProductsPayload()
        const validationError = validate(products)

        if (validationError) {
            showAlert(validationError, 'warning')
            return
        }

        const basePayload = {
            products,
            shipping: values.shipping,
            shippingAmount: values.shipping ? Number(values.shippingAmount || 0) : 0,
            cost: Number(values.cost),
            orderDate: values.orderDate,
            deposit: values.deposit ? Number(values.deposit) : 0,
            channel: values.channel,
            ...(values.state === 'DELIVERED' && values.deliveryDate
                ? { deliveryDate: values.deliveryDate }
                : {}),
        }

        setSaving(true)

        try {
            if (isEditing && order) {
                await putQuery(`/orders/${order._id}`, {}, {
                    ...basePayload,
                    state: values.state,
                    totalPrice: getFormTotal(values.products),
                })
                showAlert('Pedido actualizado', 'success')
            } else {
                await postQuery('/orders', {}, {
                    ...basePayload,
                    // The API doesn't accept `state` on create yet (see chat) —
                    // sent anyway so this starts working once that's added.
                    state: values.state,
                })
                showAlert('Pedido creado', 'success')
            }

            onSaved()
            onClose()
        } catch {
            // apiQuery already showed the error alert.
        } finally {
            setSaving(false)
        }
    }

    const showCancelledOption = values.state === 'CANCELLED'
    const total = getFormTotal(values.products)

    return (
        <>
            <DialogTitle variant="h1">
                {isEditing ? 'Editar pedido' : 'Nuevo pedido'}
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            select
                            label="Estado"
                            value={values.state}
                            onChange={(e) => handleStateChange(e.target.value as OrderFormValues['state'])}
                            size="small"
                            fullWidth
                            slotProps={{ select: { sx: { display: 'flex', alignItems: 'center' } } }}
                        >
                            {showCancelledOption && (
                                <MenuItem value="CANCELLED" disabled>
                                    <ColorBar color={ALL_STATE_OPTIONS.find((o) => o.value === 'CANCELLED')?.color ?? '#A8A8A8'} />
                                    Cancelado
                                </MenuItem>
                            )}
                            {CREATABLE_STATE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <ColorBar color={option.color} />
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Canal de compra"
                            value={values.channel}
                            onChange={(e) => setField('channel', e.target.value)}
                            size="small"
                            fullWidth
                            slotProps={{ select: { sx: { display: 'flex', alignItems: 'center' } } }}
                        >
                            {!values.channel && (
                                <MenuItem value="" disabled>
                                    Seleccioná un canal
                                </MenuItem>
                            )}
                            {CHANNEL_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <ColorBar color={option.color} />
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            label="Fecha del pedido"
                            type="date"
                            value={values.orderDate}
                            onChange={(e) => setField('orderDate', e.target.value)}
                            size="small"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField
                            label="Fecha de entrega"
                            type="date"
                            value={values.deliveryDate}
                            onChange={(e) => setField('deliveryDate', e.target.value)}
                            disabled={values.state !== 'DELIVERED'}
                            size="small"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={values.shipping}
                                    onChange={(e) => setField('shipping', e.target.checked)}
                                />
                            }
                            label="Envío"
                            sx={{ mx: 0 }}
                        />
                        <CurrencyField
                            label="Costo de envío"
                            value={values.shippingAmount}
                            onChange={(value) => setField('shippingAmount', value)}
                            disabled={!values.shipping}
                            size="small"
                            fullWidth
                        />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <CurrencyField
                            label="Costo"
                            value={values.cost}
                            onChange={(value) => setField('cost', value)}
                            size="small"
                            fullWidth
                        />
                        <CurrencyField
                            label="Seña / depósito"
                            value={values.deposit}
                            onChange={(value) => setField('deposit', value)}
                            size="small"
                            fullWidth
                        />
                    </Stack>

                    <Divider />

                    <Stack spacing={2}>
                        <Stack
                            direction="row"
                            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <Typography variant="subtitle2">Productos</Typography>
                            <IconButton size="small" onClick={addProductLine}>
                                <AddOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Stack>

                        {values.products.map((product, index) => (
                            <OrderProductFields
                                key={index}
                                line={product}
                                index={index}
                                productOptions={productOptions}
                                canRemove={values.products.length > 1}
                                onChange={handleProductLineChange}
                                onRemove={removeProductLine}
                            />
                        ))}
                    </Stack>

                    <Divider />

                    <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'flex-end' }} spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                            Monto total:
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                            {priceFormatter(total)}
                        </Typography>
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                    {isEditing ? 'Guardar cambios' : 'Crear pedido'}
                </Button>
            </DialogActions>
        </>
    )
}

interface OrderFormProps {
    open: boolean
    order?: Order
    onClose: () => void
    onSaved: () => void
}

// Modal used both to create a new order and to edit an existing one. The
// content is only mounted while open, so each open starts from fresh state.
function OrderForm({ open, order, onClose, onSaved }: OrderFormProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            {open && (
                <OrderFormContent
                    key={order?._id ?? 'new'}
                    order={order}
                    onClose={onClose}
                    onSaved={onSaved}
                />
            )}
        </Dialog>
    )
}

export default OrderForm
