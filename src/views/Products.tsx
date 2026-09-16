import { Stack, Typography } from '@mui/material'

function Products() {
  return (
    <Stack spacing={1} sx={{ p: 4 }}>
      <Typography variant="h1">Productos</Typography>
      <Typography variant="body2">Listado y gestion de productos.</Typography>
    </Stack>
  )
}

export default Products
