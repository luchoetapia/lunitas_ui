import axios from 'axios'
import { getQuery } from './apiQuery'
import useAlertStore from '../stores/AlertStore'

interface UploadSignature {
    timestamp: number
    signature: string
    apiKey: string
    cloudName: string
    folder: string
}

// Requests a signed upload from our backend, then uploads the file directly to
// Cloudinary from the browser (the image bytes never go through our server).
// The API secret used to build the signature never reaches the frontend.
export async function uploadImageToCloudinary(file: File): Promise<string> {
    const { data: signatureData } = await getQuery<UploadSignature>('/uploads/signature')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', signatureData.apiKey)
    formData.append('timestamp', String(signatureData.timestamp))
    formData.append('signature', signatureData.signature)
    formData.append('folder', signatureData.folder)

    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`

    try {
        const response = await axios.post<{ secure_url: string }>(uploadUrl, formData)
        return response.data.secure_url
    } catch (error) {
        // This request goes straight to Cloudinary, not through our API, so
        // its errors never show up in the backend logs. Log the real reason
        // here (wrong cloud name, bad signature, disabled account, etc.).
        if (axios.isAxiosError(error)) {
            console.error(
                'Cloudinary upload failed:',
                error.response?.status,
                error.response?.data,
            )
        } else {
            console.error('Cloudinary upload failed:', error)
        }

        useAlertStore
            .getState()
            .showAlert('No se pudo subir la imagen. Intentá nuevamente.', 'error')
        throw error
    }
}
