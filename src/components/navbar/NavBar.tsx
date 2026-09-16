import { AppBar, Box, Toolbar, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { NavLink } from 'react-router'
import { appRoutes } from '../../router/routes.config'

// Nav link: pink text + a pink underline bar when its route is active.
// Uses the subtitle1 typography (size/weight) so it doesn't read too small.
const NavItem = styled(NavLink)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    padding: '0 15px',
    color: theme.palette.text.primary,
    textDecoration: 'none',
    fontSize: theme.typography.subtitle1.fontSize,
    fontWeight: theme.typography.subtitle1.fontWeight,
    '&.active': {
        color: theme.palette.primary.main,
    },
    '&.active::after': {
        content: '""',
        position: 'absolute',
        left: '15px',
        right: '15px',
        bottom: 0,
        height: '2px',
        backgroundColor: theme.palette.primary.main,
    },
}))

function NavBar() {
    return (
        <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                }}
            >
                <Typography
                    sx={{
                        justifySelf: 'start',
                        fontFamily: '"Cinzel", serif',
                        fontSize: '20px',
                        letterSpacing: '0.05em',
                        color: 'primary.main',
                    }}
                >
                    Lunitas
                </Typography>
                <Box sx={{ display: 'flex', justifySelf: 'center' }}>
                    {appRoutes.map((route) => (
                        <NavItem key={route.path} to={route.path} end={route.path === '/'}>
                            {route.label}
                        </NavItem>
                    ))}
                </Box>
                <Box />
            </Toolbar>
        </AppBar>
    )
}

export default NavBar
