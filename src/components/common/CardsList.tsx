import type { ReactNode } from 'react'
import { Stack } from '@mui/material'
import EmptyList from '../empty/EmptyList'

interface CardsListProps {
    cards: ReactNode[]
    emptyMessage?: string
    emptyIcon?: ReactNode
}

function CardsList({ cards, emptyMessage, emptyIcon }: CardsListProps) {
    if (cards.length === 0) {
        return <EmptyList message={emptyMessage} icon={emptyIcon} />
    }

    return <Stack spacing={2}>{cards}</Stack>
}

export default CardsList
