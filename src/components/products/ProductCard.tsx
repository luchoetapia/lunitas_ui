import { Box, Button, Card, Chip, Skeleton, Stack, Typography } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import type { Product } from '../../models/domain'

// Square thumbnail: fluid width capped per breakpoint, height follows via
// aspect-ratio — nothing here is pinned to a fixed pixel size.
const imageSx = {
    width: { xs: '100%', sm: '8rem' },
    maxWidth: { xs: '12rem', sm: '8rem' },
    aspectRatio: '1',
    borderRadius: 1,
    flexShrink: 0,
}

interface ProductCardProps {
    product?: Product
    loading?: boolean
    onEdit?: (product: Product) => void
    onViewDetails?: (product: Product) => void
}

// "tela · relleno · largo x ancho" line shown under the product name.
const getSpecsText = (product: Product) =>
    `${product.fabric} · ${product.filling} · ${product.length}cm x ${product.width}cm`

function ProductCard({ product, loading, onEdit, onViewDetails }: ProductCardProps) {
    const isLoading = loading || !product

    return (
        <Card
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-start' },
                gap: 2,
            }}
        >
            {isLoading ? (
                <Skeleton variant="rounded" sx={imageSx} />
            ) : (
                <Box
                    component="img"
                    src={product.image}
                    alt={product.name}
                    sx={{ ...imageSx, objectFit: 'cover' }}
                />
            )}

            <Stack spacing={1} sx={{ minWidth: 0, width: '100%', flex: 1 }}>
                {isLoading ? (
                    <Skeleton variant="text" width="60%" sx={{ fontSize: '1.5rem' }} />
                ) : (
                    <Typography variant="subtitle1" color="primary" noWrap>
                        {product.name}
                    </Typography>
                )}

                {isLoading ? (
                    <Skeleton variant="text" width="85%" />
                ) : (
                    <Typography variant="body2" noWrap>
                        {getSpecsText(product)}
                    </Typography>
                )}

                {isLoading ? (
                    <Skeleton variant="text" width="45%" />
                ) : (
                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                        <Chip
                            label={product.is_active ? 'Activo' : 'Inactivo'}
                            size="small"
                            sx={{
                                bgcolor: product.is_active ? 'primary.main' : 'grey.400',
                                color: '#FFFFFF',
                                fontWeight: 600,
                            }}
                        />
                        <Button
                            size="small"
                            startIcon={<EditOutlinedIcon fontSize="small" />}
                            onClick={() => onEdit?.(product)}
                        >
                            Editar
                        </Button>
                        <Button
                            size="small"
                            startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                            onClick={() => onViewDetails?.(product)}
                        >
                            Ver ficha
                        </Button>
                    </Stack>
                )}
            </Stack>
        </Card>
    )
}

export default ProductCard
