import type { ReactNode } from 'react'
import { Stack, Typography } from '@mui/material'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'

interface EmptyListProps {
    message?: string
    icon?: ReactNode
}

// Generic "no data" placeholder: an icon + a message, centered.
// Standalone so any list, table, etc. can reuse it, not just CardsList.
function EmptyList({ message = 'No hay datos disponibles', icon }: EmptyListProps) {
    return (
        <Stack
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'center', py: 6, color: 'text.disabled' }}
        >
            {icon ?? <InboxOutlinedIcon sx={{ fontSize: '4rem' }} />}
            <Typography variant="body2" color="text.disabled">
                {message}
            </Typography>
        </Stack>
    )
}

export default EmptyList
