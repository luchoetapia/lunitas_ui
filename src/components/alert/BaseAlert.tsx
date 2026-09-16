import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import useAlertStore from '../../stores/AlertStore'

// Fixed-position toast alert, driven by the global alert store: call
// useAlertStore.getState().showAlert(message, alertType) from anywhere to
// trigger it.
// Desktop (sm and up): bottom-right corner, fixed 500px width, 24px offset.
// Mobile (below sm): floats above the bottom edge with 16px margins on all
// sides (plus the device's safe-area inset), instead of a flush full-width bar.
export default function BaseAlert() {
    const { open, message, alertType, hideAlert } = useAlertStore()

    if (!open) return null

    return (
        <Box
            sx={{
                position: 'fixed',
                // Pinned to the viewport (not the page), so it always floats over
                // the visible screen with no scrolling needed, on mobile and desktop.
                // The safe-area inset keeps it clear of the home-indicator/gesture
                // bar on notched phones instead of sitting flush under it.
                bottom: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', sm: 24 },
                right: { xs: 16, sm: 24 },
                // Mobile: 16px on both sides instead of a full-width flush bar, so
                // it reads as a floating card. Width is left auto (bounded by
                // left/right) rather than 100%, which would overflow past them.
                left: { xs: 16, sm: 'auto' },
                width: { xs: 'auto', sm: 500 },
                zIndex: (theme) => theme.zIndex.snackbar,
            }}
        >
            <Alert
                severity={alertType}
                onClose={hideAlert}
                sx={{
                    width: '100%',
                    // MUI's default "standard" background auto-derives from the
                    // color's `light` shade and lightens it further, which washes
                    // our muted brand colors down to near-white. Tint the real
                    // severity main color directly instead, so it stays visible.
                    backgroundColor: (theme) => alpha(theme.palette[alertType].main, 0.16),
                    alignItems: 'center', // center the icon against the message text
                    '& .MuiAlert-icon': {
                        fontSize: 28, // default is 22px, bump it up a bit
                    },
                }}
            >
                {message}
            </Alert>
        </Box>
    )
}
