import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Button, Card, Chip, IconButton, Menu, MenuItem, Skeleton, Stack, Typography } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined'
import type { Order } from '../../models/domain'
import { orderSellingChannelParams, orderStatusParams } from '../../helpers/ordersParams'
import {
    canAdvanceStatus,
    canCancelOrder,
    getCostText,
    getOrderDateText,
    getProductsCountText,
    getShippingText,
    getTotalPriceText,
    getUnitsCountText,
} from '../../helpers/orderFormat'

interface OrderCardProps {
    order?: Order
    loading?: boolean
    onEdit?: (order: Order) => void
    onAdvanceStatus?: (order: Order) => void
    onViewDetails?: (order: Order) => void
    onCancel?: (order: Order) => void
}

function OrderCard({ order, loading, onEdit, onAdvanceStatus, onViewDetails, onCancel }: OrderCardProps) {
    const isLoading = loading || !order
    // "Cancelar" lives behind this menu instead of a plain button so it's not a
    // one-click action next to the rest — see the menu below.
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

    if (isLoading) {
        return (
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1.5}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="50%" sx={{ fontSize: '1.5rem' }} />
                </Stack>
            </Card>
        )
    }

    const statusParams = orderStatusParams[order.state] ?? {
        color: '#A8A8A8',
        label: order.state,
    }
    const channelParams = orderSellingChannelParams[order.channel] ?? {
        color: '#A8A8A8',
        label: order.channel,
    }

    const handleMenuOpen = (event: MouseEvent<HTMLElement>) => setMenuAnchor(event.currentTarget)
    const handleMenuClose = () => setMenuAnchor(null)
    const handleCancel = () => {
        handleMenuClose()
        onCancel?.(order)
    }

    return (
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1}>
                <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}
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

                    <Typography variant="body2" color="text.secondary">
                        {getOrderDateText(order)}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <Typography variant="body2">{getProductsCountText(order)}</Typography>
                    <Typography variant="body2">{getUnitsCountText(order)}</Typography>
                    <Typography variant="body2">{getShippingText(order)}</Typography>
                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
                >
                    <Typography variant="caption" color="text.secondary">
                        {getCostText(order)}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
                        {getTotalPriceText(order)}
                    </Typography>
                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ flexWrap: 'wrap', alignItems: 'center', pt: 0.5 }}
                >
                    <Button
                        size="small"
                        startIcon={<EditOutlinedIcon fontSize="small" />}
                        onClick={() => onEdit?.(order)}
                    >
                        Editar
                    </Button>
                    <Button
                        size="small"
                        startIcon={<ArrowForwardOutlinedIcon fontSize="small" />}
                        disabled={!canAdvanceStatus(order)}
                        onClick={() => onAdvanceStatus?.(order)}
                    >
                        Siguiente estado
                    </Button>
                    <Button
                        size="small"
                        startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                        onClick={() => onViewDetails?.(order)}
                    >
                        Ver ficha
                    </Button>

                    <IconButton
                        size="small"
                        aria-label="Mas acciones"
                        onClick={handleMenuOpen}
                        sx={{ ml: 'auto' }}
                    >
                        <MoreVertOutlinedIcon fontSize="small" />
                    </IconButton>
                    <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                        <MenuItem
                            disabled={!canCancelOrder(order)}
                            onClick={handleCancel}
                            sx={{ color: 'error.main' }}
                        >
                            Cancelar pedido
                        </MenuItem>
                    </Menu>
                </Stack>
            </Stack>
        </Card>
    )
}

export default OrderCard
