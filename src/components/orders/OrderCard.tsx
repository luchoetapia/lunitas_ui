import { Box, Button, Card, Chip, Skeleton, Stack, Typography } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import type { Order } from '../../models/domain'
import { orderSellingChannelParams, orderStatusParams } from '../../helpers/ordersParams'
import {
    canAdvanceStatus,
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
}

function OrderCard({ order, loading, onEdit, onAdvanceStatus, onViewDetails }: OrderCardProps) {
    const isLoading = loading || !order

    if (isLoading) {
        return (
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1.5}>
                    <Skeleton variant="text" width="60%" sx={{ fontSize: '1.75rem' }} />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="50%" />
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

    return (
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'stretch' }}>
                {/* Left column: chips (row 1), counts (row 2), cost + date (row 3) */}
                <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                        <Chip
                            label={statusParams.label}
                            size="small"
                            sx={{
                                bgcolor: statusParams.color,
                                color: '#FFFFFF',
                                fontWeight: 600,
                                height: '28px',
                                fontSize: '0.8125rem',
                            }}
                        />
                        <Chip
                            label={channelParams.label}
                            size="small"
                            sx={{
                                bgcolor: channelParams.color,
                                color: '#FFFFFF',
                                fontWeight: 600,
                                height: '28px',
                                fontSize: '0.8125rem',
                            }}
                        />
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <Typography variant="body2">{getProductsCountText(order)}</Typography>
                        <Typography variant="body2">{getUnitsCountText(order)}</Typography>
                        <Typography variant="body2">{getShippingText(order)}</Typography>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                        {getCostText(order)} · {getOrderDateText(order)}
                    </Typography>
                </Stack>

                {/* Right column: price spans rows 1-2 (centered in that space), buttons on row 3 */}
                <Stack sx={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography
                            variant="subtitle1"
                            color="primary"
                            sx={{ fontWeight: 700, fontSize: '1.75rem', whiteSpace: 'nowrap' }}
                        >
                            {getTotalPriceText(order)}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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
                    </Stack>
                </Stack>
            </Stack>
        </Card>
    )
}

export default OrderCard
