import { useMemo, useState } from 'react'
import {
    Button,
    FormControlLabel,
    InputAdornment,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import CardsList from '../components/common/CardsList'
import ProductCard from '../components/products/ProductCard'
import ProductDetail from '../components/products/ProductDetail'
import ProductForm from '../components/products/ProductForm'
import useFetchList from '../hooks/useFetchList'
import type { Product } from '../models/domain'

// Number of skeleton ProductCards shown while the list is loading.
const LOADING_CARDS_COUNT = 3

function Products() {
    const { items: products, loading, refetch } = useFetchList<Product>('/products')
    const [search, setSearch] = useState('')
    const [onlyActive, setOnlyActive] = useState(true)
    const [formOpen, setFormOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product>()
    const [detailOpen, setDetailOpen] = useState(false)
    const [detailProduct, setDetailProduct] = useState<Product>()

    // Client-side filter: the whole catalog is already in memory via
    // useFetchList, so there's no need to round-trip to the API per keystroke.
    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase()

        return products
            .filter((product) => !onlyActive || product.is_active)
            .filter((product) => !query || product.name.toLowerCase().includes(query))
    }, [products, search, onlyActive])

    const handleCreateProduct = () => {
        setEditingProduct(undefined)
        setFormOpen(true)
    }

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product)
        setFormOpen(true)
    }

    const handleFormClose = () => setFormOpen(false)

    const handleViewDetails = (product: Product) => {
        setDetailProduct(product)
        setDetailOpen(true)
    }

    const handleDetailClose = () => setDetailOpen(false)

    // The pencil in the ficha hands off to the edit modal.
    const handleEditFromDetail = (product: Product) => {
        setDetailOpen(false)
        handleEditProduct(product)
    }

    const cards = loading
        ? Array.from({ length: LOADING_CARDS_COUNT }, (_, index) => (
              <ProductCard key={index} loading />
          ))
        : filteredProducts.map((product) => (
              <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={handleEditProduct}
                  onViewDetails={handleViewDetails}
              />
          ))

    const emptyMessage = search
        ? 'No se encontraron productos con ese nombre'
        : onlyActive
          ? 'No hay productos activos'
          : 'No hay productos cargados'

    return (
        <Stack spacing={2} sx={{ p: 4 }}>
            <Typography variant="h1">Productos</Typography>

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
                    <TextField
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar por nombre"
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlinedIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ width: { xs: '100%', sm: '20rem' } }}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={onlyActive}
                                onChange={(event) => setOnlyActive(event.target.checked)}
                            />
                        }
                        label="Solo activos"
                        sx={{ mx: 0 }}
                    />
                </Stack>

                <Button
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                    onClick={handleCreateProduct}
                >
                    Nuevo producto
                </Button>
            </Stack>

            <CardsList
                cards={cards}
                emptyMessage={emptyMessage}
                emptyIcon={<Inventory2OutlinedIcon sx={{ fontSize: '4rem' }} />}
            />

            <ProductForm
                open={formOpen}
                product={editingProduct}
                onClose={handleFormClose}
                onSaved={refetch}
            />

            <ProductDetail
                open={detailOpen}
                product={detailProduct}
                onClose={handleDetailClose}
                onEdit={handleEditFromDetail}
            />
        </Stack>
    )
}

export default Products
