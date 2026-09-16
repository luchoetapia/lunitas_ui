import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import useAlertStore from '../../stores/AlertStore'

export default function BaseAlert() {
    const { open, message, alertType, hideAlert } = useAlertStore()

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
                onClose={hideAlert}
                sx={{
                    width: '100%',
                    backgroundColor: (theme) => alpha(theme.palette[alertType].main, 0.16),
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
