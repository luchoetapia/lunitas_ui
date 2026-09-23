import { useState } from 'react'
import { Pagination, Stack, Typography } from '@mui/material'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import CardsList from '../components/common/CardsList'
import OrderCard from '../components/orders/OrderCard'
import usePaginatedList from '../hooks/usePaginatedList'
import { putQuery } from '../helpers/apiQuery'
import useAlertStore from '../stores/AlertStore'
import type { Order } from '../models/domain'

// Number of skeleton OrderCards shown while the list is loading.
const LOADING_CARDS_COUNT = 3
const PAGE_SIZE = 5

function Orders() {
    const [page, setPage] = useState(1)

    const {
        items: orders,
        loading,
        totalPages,
        refetch,
    } = usePaginatedList<Order>('/orders', { page, limit: PAGE_SIZE })

    // Editar/Ver ficha don't have a dialog yet, only the list does for now.
    const handleEdit = () => {
        useAlertStore.getState().showAlert('La edicion de pedidos estara disponible pronto', 'info')
    }

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

    // Destructive and not reversible from the UI yet, so ask for confirmation first.
    const handleCancel = async (order: Order) => {
        if (!window.confirm('¿Cancelar este pedido?')) return

        try {
            await putQuery(`/orders/${order._id}/cancel`, {}, {})
            useAlertStore.getState().showAlert('Pedido cancelado', 'success')
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
                    onCancel={handleCancel}
                />
        ))

    return (
        <Stack spacing={2} sx={{ p: 4 }}>
            <Typography variant="h1">Pedidos</Typography>

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
        </Stack>
    )
}

export default Orders
