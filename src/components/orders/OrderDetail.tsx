import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Typography,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import type { Order } from '../../models/domain'
import { orderPickupLocationParams, orderSellingChannelParams, orderStatusParams } from '../../helpers/ordersParams'
import {
    canAdvanceStatus,
    canCancelOrder,
    getContactDetailText,
    getCustomerNameText,
    getDeliveryAddressText,
    getDeliveryDateText,
    getDepositText,
    getOrderDateText,
    getShippingAmountText,
    getShippingText,
    getTotalPriceText,
} from '../../helpers/orderFormat'
import { priceFormatter } from '../../helpers/utils'

interface OrderDetailProps {
    open: boolean
    order?: Order
    onClose: () => void
    onEdit: (order: Order) => void
    onAdvanceStatus: (order: Order) => void
    onCancel: (order: Order) => void
}

// Read-only "ficha" for a single order. Opened from OrderCard's "Ver ficha"
// button. Editing, advancing status and cancelling are all triggered from
// the actions next to the title; the modal itself stays read-only.
function OrderDetail({ open, order, onClose, onEdit, onAdvanceStatus, onCancel }: OrderDetailProps) {
    if (!order) return null

    const statusParams = orderStatusParams[order.state] ?? {
        color: '#A8A8A8',
        label: order.state,
    }
    const channelParams = orderSellingChannelParams[order.channel] ?? {
        color: '#A8A8A8',
        label: order.channel,
    }
    const pickupLocationLabel = order.pickupLocation
        ? (orderPickupLocationParams[order.pickupLocation]?.label ?? order.pickupLocation)
        : 'Sin definir'

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h1" color="primary" sx={{ flex: 1, minWidth: 0 }} noWrap>
                    Pedido
                </Typography>

                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button
                        size="small"
                        disabled={!canAdvanceStatus(order)}
                        onClick={() => onAdvanceStatus(order)}
                    >
                        Siguiente estado
                    </Button>
                    <Button
                        size="small"
                        color="error"
                        disabled={!canCancelOrder(order)}
                        onClick={() => onCancel(order)}
                    >
                        Cancelar pedido
                    </Button>
                    <IconButton aria-label="Editar pedido" onClick={() => onEdit(order)}>
                        <EditOutlinedIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                            <Chip
                                label={statusParams.label}
                                size="small"
                                sx={{ bgcolor: statusParams.color, color: '#FFFFFF', fontWeight: 600 }}
                            />
                            <Chip
                                label={channelParams.label}
                                size="small"
                                sx={{ bgcolor: channelParams.color, color: '#FFFFFF', fontWeight: 600 }}
                            />
                        </Stack>

                        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
                            {getTotalPriceText(order)}
                        </Typography>
                    </Stack>

                    <Divider />

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 2, rowGap: 0.5 }}>
                        {order.customerName && (
                            <Typography variant="body2" sx={{ gridColumn: '1 / -1' }}>
                                {getCustomerNameText(order)}
                            </Typography>
                        )}
                        {order.contactDetail && (
                            <Typography variant="body2" sx={{ gridColumn: '1 / -1' }}>
                                {getContactDetailText(order)}
                            </Typography>
                        )}
                        <Typography variant="body2">Fecha del pedido: {getOrderDateText(order)}</Typography>
                        <Typography variant="body2">Fecha de entrega: {getDeliveryDateText(order)}</Typography>
                        <Typography variant="body2">{getShippingText(order)}</Typography>
                        <Typography variant="body2">
                            {order.shipping ? getShippingAmountText(order) : ''}
                        </Typography>
                        <Typography variant="body2" sx={{ gridColumn: '1 / -1' }}>
                            {order.shipping
                                ? getDeliveryAddressText(order)
                                : `Lugar de entrega: ${pickupLocationLabel}`}
                        </Typography>
                        <Typography variant="body2">Costo: {priceFormatter(order.cost)}</Typography>
                        <Typography variant="body2">{getDepositText(order)}</Typography>
                    </Box>

                    <Divider />

                    <Stack spacing={1.5}>
                        <Typography variant="subtitle2">Productos</Typography>

                        {order.products.map((product, index) => (
                            <Stack key={index} spacing={0.25}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {product.product_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {product.length} x {product.width} cm
                                    {product.color ? ` · ${product.color}` : ''}
                                    {` · x${product.quantity}`}
                                </Typography>
                                <Typography variant="body2">
                                    {priceFormatter(product.unit_price)} c/u · Subtotal:{' '}
                                    {priceFormatter(product.unit_price * product.quantity)}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default OrderDetail
