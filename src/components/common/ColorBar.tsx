import { Box } from '@mui/material'

interface ColorBarProps {
    color: string
}

// Small accent swatch shown next to a labeled option (order status, sales
// channel, etc.): 4px wide, as tall as the text next to it.
function ColorBar({ color }: ColorBarProps) {
    return (
        <Box
            sx={{
                width: '4px',
                height: '1em',
                display: 'inline-block',
                verticalAlign: 'middle',
                bgcolor: color,
                borderRadius: '2px',
                flexShrink: 0,
                mr: 1,
            }}
        />
    )
}

export default ColorBar
