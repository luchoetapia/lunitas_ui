import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import type { AlertColor } from '@mui/material/Alert'

export interface BaseAlertProps {
    message: string
    alertType: AlertColor
    seconds?: number
}

// Fixed-position toast alert.
// Desktop (sm and up): bottom-right corner, fixed 500px width, 24px offset.
// Mobile (below sm): floats above the bottom edge with 16px margins on all
// sides (plus the device's safe-area inset), instead of a flush full-width bar.
export default function BaseAlert({ message, alertType, seconds = 10 }: BaseAlertProps) {
    const alertKey = `${alertType}:${message}`
    const [dismissedAlert, setDismissedAlert] = useState<string | null>(null)
    const open = dismissedAlert !== alertKey

    useEffect(() => {
        const timer = setTimeout(() => setDismissedAlert(alertKey), seconds * 1000)
        return () => clearTimeout(timer)
    }, [seconds, alertKey])

    const handleClose = () => {
        setDismissedAlert(alertKey)
    }

    if (!open) return null

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', sm: 24 },
                right: { xs: 16, sm: 24 },
                left: { xs: 16, sm: 'auto' },
                width: { xs: 'auto', sm: 500 },
                zIndex: (theme) => theme.zIndex.snackbar,
            }}
        >
            <Alert
                severity={alertType}
                onClose={handleClose}
                sx={{
                    width: '100%',
                    backgroundColor: (theme) => alpha(theme.palette[alertType].main, 0.3),
                    alignItems: 'center',
                    '& .MuiAlert-icon': {
                        fontSize: 28, 
                    },
                }}
            >
                {message}
            </Alert>
        </Box>
    )
}
