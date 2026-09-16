import { create } from 'zustand'
import type { AlertColor } from '@mui/material/Alert'

interface AlertStoreState {
    open: boolean
    message: string
    alertType: AlertColor
    showAlert: (message: string, alertType: AlertColor, seconds?: number) => void
    hideAlert: () => void
}

// Tracks the pending auto-hide timer so a new alert call always resets it,
let hideTimer: ReturnType<typeof setTimeout> | undefined

// Global store for BaseAlert. Call showAlert(message, alertType, seconds)
// from anywhere in the app to trigger it; BaseAlert just renders this state.
const useAlertStore = create<AlertStoreState>((set) => ({
    open: false,
    message: '',
    alertType: 'info',

    showAlert: (message, alertType, seconds = 10) => {
        clearTimeout(hideTimer)
        set({ open: true, message, alertType })
        hideTimer = setTimeout(() => set({ open: false }), seconds * 1000)
    },

    hideAlert: () => {
        clearTimeout(hideTimer)
        set({ open: false })
    },
}))

export default useAlertStore
