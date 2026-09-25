import { useState } from 'react'
import { Button, Pagination, Stack, Typography } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import CardsList from '../components/common/CardsList'
import MultiSelectFilter from '../components/common/MultiSelectFilter'
import OrderCard from '../components/orders/OrderCard'
import OrderForm from '../components/orders/OrderForm'
import usePaginatedList from '../hooks/usePaginatedList'
import { putQuery } from '../helpers/apiQuery'
import useAlertStore from '../stores/AlertStore'
import { getChannelOptions, getStateOptions } from '../helpers/orderOptions'
import type { Order } from '../models/domain'

// Number of skeleton OrderCards shown while the list is loading.
const LOADING_CARDS_COUNT = 3
const PAGE_SIZE = 5

const STATE_OPTIONS = getStateOptions()
const CHANNEL_OPTIONS = getChannelOptions()

// Cancelled orders are hidden by default; everything else starts checked.
const DEFAULT_STATES = STATE_OPTIONS.filter((option) => option.value !== 'CANCELLED').map(
    (option) => option.value
)
const DEFAULT_CHANNELS = CHANNEL_OPTIONS.map((option) => option.value)

function Orders() {
    const [page, setPage] = useState(1)
    const [selectedStates, setSelectedStates] = useState<string[]>(DEFAULT_STATES)
    // Channel filtering isn't supported by the API yet — this only tracks the
    // selection in the UI until the backend accepts a channel filter.
    const [selectedChannels, setSelectedChannels] = useState<string[]>(DEFAULT_CHANNELS)
    const [formOpen, setFormOpen] = useState(false)
    const [editingOrder, setEditingOrder] = useState<Order>()

    const handleStatesChange = (values: string[]) => {
        setSelectedStates(values)
        setPage(1)
    }

    const handleChannelsChange = (values: string[]) => {
        setSelectedChannels(values)
        setPage(1)
    }

    const {
        items: orders,
        loading,
        totalPages,
        refetch,
    } = usePaginatedList<Order>('/orders', {
        page,
        limit: PAGE_SIZE,
        filters: { states: selectedStates.join(',') },
        // An empty states list would fail the API's validation, and it should
        // show no results anyway, so skip the request entirely in that case.
        enabled: selectedStates.length > 0,
    })

    const handleCreateOrder = () => {
        setEditingOrder(undefined)
        setFormOpen(true)
    }

    const handleEdit = (order: Order) => {
        setEditingOrder(order)
        setFormOpen(true)
    }

    const handleFormClose = () => setFormOpen(false)

    // Ver ficha doesn't have a dialog yet, only the form does for now.
    const handleViewDetails = () => {
        useAlertStore.getState().showAlert('La ficha del pedido estara disponible pronto', 'info')
    }

    // Moves the order to its next state (PENDING -> IN_PROGRESS -> TO_DELIVER -> DELIVERED).
    const handleAdvanceStatus = async (order: Order) => {
        try {
            await putQuery(`/orders/${order._id}/next-status`, {}, {})
            useAlertStore.getState().showAlert('Estado del pedido actualizado', 'success')
            refetch()
        } catch {
            // apiQuery already surfaced a user-facing alert.
        }
    }

    const cards = loading
        ? Array.from({ length: LOADING_CARDS_COUNT }, (_, index) => (
                <OrderCard key={index} loading />
            ))
        : orders.map((order) => (
                <OrderCard
                    key={order._id}
                    order={order}
                    onEdit={handleEdit}
                    onAdvanceStatus={handleAdvanceStatus}
                    onViewDetails={handleViewDetails}
                />
        ))

    return (
        <Stack spacing={2} sx={{ p: 4 }}>
            <Typography variant="h1">Pedidos</Typography>

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
                >
                    <MultiSelectFilter
                        label="Estado"
                        options={STATE_OPTIONS}
                        selected={selectedStates}
                        onChange={handleStatesChange}
                    />
                    <MultiSelectFilter
                        label="Canal de venta"
                        options={CHANNEL_OPTIONS}
                        selected={selectedChannels}
                        onChange={handleChannelsChange}
                    />
                </Stack>

                <Button
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                    onClick={handleCreateOrder}
                >
                    Nuevo pedido
                </Button>
            </Stack>

            <CardsList
                cards={cards}
                emptyMessage="No hay pedidos cargados"
                emptyIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: '4rem' }} />}
            />

            <Stack sx={{ alignItems: 'center', pt: 1 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_event, value) => setPage(value)}
                    color="primary"
                />
            </Stack>

            <OrderForm
                open={formOpen}
                order={editingOrder}
                onClose={handleFormClose}
                onSaved={refetch}
            />
        </Stack>
    )
}

export default Orders
