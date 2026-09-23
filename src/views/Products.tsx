import { useState } from 'react'
import type { ChangeEvent } from 'react'
import {
    Button,
    FormControlLabel,
    InputAdornment,
    Pagination,
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
import usePaginatedList from '../hooks/usePaginatedList'
import type { Product } from '../models/domain'

// Number of skeleton ProductCards shown while the list is loading.
const LOADING_CARDS_COUNT = 3
const PAGE_SIZE = 5

function Products() {
    const [search, setSearch] = useState('')
    const [onlyActive, setOnlyActive] = useState(true)
    const [page, setPage] = useState(1)
    const [formOpen, setFormOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product>()
    const [detailOpen, setDetailOpen] = useState(false)
    const [detailProduct, setDetailProduct] = useState<Product>()

    const {
        items: products,
        loading,
        totalPages,
        refetch,
    } = usePaginatedList<Product>('/products', { search, onlyActive, page, limit: PAGE_SIZE })

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value)
        setPage(1)
    }

    const handleOnlyActiveChange = (event: ChangeEvent<HTMLInputElement>) => {
        setOnlyActive(event.target.checked)
        setPage(1)
    }

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
        : products.map((product) => (
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
                        onChange={handleSearchChange}
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
                        control={<Switch checked={onlyActive} onChange={handleOnlyActiveChange} />}
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

            
            <Stack sx={{ alignItems: 'center', pt: 1 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_event, value) => setPage(value)}
                    color="primary"
                />
            </Stack>
            

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
