import { createTheme } from '@mui/material/styles'
import { colors } from './colors'

// Base MUI theme: brand palette + initial typography scale.
// Font sizes: titles 26px, subtitles 20px, body text 16px, caption 12px.
// Titles use Cinzel (matches the logo's lettering), body copy uses Nunito Sans.
export const theme = createTheme({
    palette: {
        primary: {
            main: colors.primary,
        },
        secondary: {
            main: colors.secondary,
        },
        error: {
            main: colors.error,
        },
        success: {
            main: colors.success,
        },
        warning: {
            main: colors.warning,
        },
        info: {
            main: colors.info,
        },
        background: {
            default: colors.background,
        },
        text: {
            primary: colors.text.primary,
            secondary: colors.text.secondary,
            disabled: colors.text.disabled,
        },
    },
    typography: {
        fontFamily: '"Nunito Sans", sans-serif',
        h1: {
            fontFamily: '"Cinzel", serif',
            fontSize: '26px',
            fontWeight: 600,
            letterSpacing: '0.02em',
        },
        subtitle1: {
            fontSize: '20px',
            fontWeight: 500,
        },
        body2: {
            fontSize: '16px',
        },
        // Reserved for secondary/small text (labels, timestamps, helper text).
        caption: {
            fontSize: '12px',
        },
    },
})
