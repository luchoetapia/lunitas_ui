import { useState } from 'react'
import type { Theme } from '@mui/material/styles'
import { AppBar, Box, Drawer, IconButton, Toolbar, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import { styled } from '@mui/material/styles'
import { NavLink } from 'react-router'
import { appRoutes } from '../../router/routes.config'

// Desktop nav link: pink text + a pink underline bar when its route is active.
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

// Mobile drawer nav link: pink text + a pink left bar when its route is active.
const DrawerNavItem = styled(NavLink)(({ theme }) => ({
    position: 'relative',
    display: 'block',
    padding: '15px',
    color: theme.palette.text.primary,
    textDecoration: 'none',
    fontSize: theme.typography.subtitle1.fontSize,
    fontWeight: theme.typography.subtitle1.fontWeight,
    '&.active': {
        color: theme.palette.primary.main,
    },
    '&.active::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '3px',
        backgroundColor: theme.palette.primary.main,
    },
}))

// Logo wordmark styles: matches the h1 size/weight, in Cinzel like the real logo.
const getLogoSx = (theme: Theme) => ({
    fontFamily: '"Cinzel", serif',
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    letterSpacing: '0.05em',
    color: theme.palette.primary.main,
})

// Full-width navbar.
// Desktop (sm and up): wordmark on the left, nav links centered.
// Mobile (below sm): wordmark on the left, a menu button on the right opens a drawer.
function NavBar() {
    const [mobileOpen, setMobileOpen] = useState(false)

    const closeDrawer = () => setMobileOpen(false)

    return (
        <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar
                sx={{
                    display: { xs: 'flex', sm: 'grid' },
                    justifyContent: { xs: 'space-between', sm: 'unset' },
                    gridTemplateColumns: { sm: '1fr auto 1fr' },
                    alignItems: 'center',
                }}
            >
                <Typography sx={(theme) => ({ ...getLogoSx(theme), justifySelf: 'start' })}>
                    Lunitas
                </Typography>

                <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifySelf: 'center' }}>
                    {appRoutes.map((route) => (
                        <NavItem key={route.path} to={route.path} end={route.path === '/'}>
                            {route.label}
                        </NavItem>
                    ))}
                </Box>

                <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

                <IconButton
                    aria-label="Abrir menu de navegacion"
                    onClick={() => setMobileOpen(true)}
                    sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
            </Toolbar>

            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={closeDrawer}
                slotProps={{
                    paper: { sx: { width: 220, backgroundColor: 'background.default' } },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton aria-label="Cerrar menu de navegacion" onClick={closeDrawer}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box>
                    {appRoutes.map((route) => (
                        <DrawerNavItem
                            key={route.path}
                            to={route.path}
                            end={route.path === '/'}
                            onClick={closeDrawer}
                        >
                            {route.label}
                        </DrawerNavItem>
                    ))}
                </Box>
            </Drawer>
        </AppBar>
    )
}

export default NavBar
