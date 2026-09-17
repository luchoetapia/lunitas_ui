import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import useAlertStore from '../../stores/AlertStore'
import { uploadImageToCloudinary } from '../../helpers/cloudinary'

const MAX_FILE_SIZE_MB = 5

interface ImageUploaderProps {
    value?: string
    onChange: (url: string) => void
}

// Square dropzone/preview. Click to pick a file, uploads to Cloudinary and
// reports the resulting secure URL back through onChange to be saved in the DB.
function ImageUploader({ value, onChange }: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const showAlert = useAlertStore((state) => state.showAlert)

    const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''

        if (!file) return

        if (!file.type.startsWith('image/')) {
            showAlert('El archivo debe ser una imagen', 'error')
            return
        }

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            showAlert(`La imagen no puede superar los ${MAX_FILE_SIZE_MB}MB`, 'error')
            return
        }

        setUploading(true)

        try {
            const url = await uploadImageToCloudinary(file)
            onChange(url)
        } catch {
            // uploadImageToCloudinary already showed the error alert.
        } finally {
            setUploading(false)
        }
    }

    return (
        <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Box
                onClick={() => inputRef.current?.click()}
                sx={{
                    width: '8rem',
                    height: '8rem',
                    borderRadius: 1,
                    border: '1px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: 'pointer',
                }}
            >
                {uploading ? (
                    <CircularProgress size={24} />
                ) : value ? (
                    <Box
                        component="img"
                        src={value}
                        alt="Producto"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <PhotoCameraOutlinedIcon color="disabled" />
                )}
            </Box>

            <Typography variant="caption" color="text.secondary">
                Click para {value ? 'cambiar' : 'subir'} imagen
            </Typography>

            <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
        </Stack>
    )
}

export default ImageUploader
