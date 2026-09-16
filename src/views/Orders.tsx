import { Stack, Typography } from '@mui/material'

function Orders() {
    return (
        <Stack spacing={1} sx={{ p: 4 }}>
            <Typography variant="h1">Pedidos</Typography>
            <Typography variant="body2">Listado y gestion de pedidos.</Typography>
        </Stack>
    )
}

export default Orders
