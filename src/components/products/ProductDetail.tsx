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
import type { Product } from '../../models/domain'

interface ProductDetailProps {
    open: boolean
    product?: Product
    onClose: () => void
    onEdit: (product: Product) => void
}

// "tela · relleno · largo x ancho" line, same wording used in ProductCard.
const getSpecsText = (product: Product) =>
    `${product.fabric} · ${product.filling} · ${product.length}cm x ${product.width}cm`

// Read-only "ficha" for a single product. Opened from ProductCard's
// "Ver ficha" button. The pencil next to the title hands off to the edit
// modal instead of duplicating any editing UI here.
function ProductDetail({ open, product, onClose, onEdit }: ProductDetailProps) {
    if (!product) return null

    const priceTiers = Object.entries(product.prices).sort(
        ([a], [b]) => Number(a) - Number(b),
    )

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h1" color="primary" sx={{ flex: 1, minWidth: 0 }} noWrap>
                    {product.name}
                </Typography>
                <IconButton aria-label="Editar producto" onClick={() => onEdit(product)}>
                    <EditOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <Box
                        component="img"
                        src={product.image}
                        alt={product.name}
                        sx={{
                            width: '100%',
                            maxHeight: '16rem',
                            objectFit: 'cover',
                            borderRadius: 1,
                        }}
                    />

                    <Chip
                        label={product.is_active ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={{
                            alignSelf: 'flex-start',
                            bgcolor: product.is_active ? 'primary.main' : 'grey.400',
                            color: '#FFFFFF',
                            fontWeight: 600,
                        }}
                    />

                    <Typography variant="body1">{product.description}</Typography>

                    <Typography variant="body2" color="text.secondary">
                        {getSpecsText(product)}
                    </Typography>

                    <Divider />

                    <Stack spacing={1}>
                        <Typography variant="subtitle2">Precios por cantidad</Typography>
                        {priceTiers.map(([quantity, price]) => (
                            <Typography key={quantity} variant="body2">
                                Desde {quantity} unidad{quantity === '1' ? '' : 'es'}: ${price}
                            </Typography>
                        ))}
                    </Stack>

                    {product.questions.length > 0 && (
                        <>
                            <Divider />

                            <Stack spacing={1}>
                                <Typography variant="subtitle2">Preguntas al cliente</Typography>
                                {product.questions.map((question, index) => (
                                    <Typography key={index} variant="body2">
                                        {question}
                                    </Typography>
                                ))}
                            </Stack>
                        </>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ProductDetail
