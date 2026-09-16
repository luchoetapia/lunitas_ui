import type { ComponentType } from 'react'
import Home from '../views/Home'
import Products from '../views/Products'
import Orders from '../views/Orders'

// Site name appended to every browser tab title.
export const APP_NAME = 'Lunitas Deco Hogar'

export interface AppRoute {
    path: string // '/' is treated as the index route
    label: string // used for the nav link and the tab title (e.g. "Inicio - Lunitas Deco Hogar")
    Component: ComponentType
}

// Single source of truth for the app's pages.
// Add a page here and it's automatically wired into the router, the nav and the tab title.
export const appRoutes: AppRoute[] = [
    { path: '/', label: 'Inicio', Component: Home },
    { path: '/productos', label: 'Productos', Component: Products },
    { path: '/pedidos', label: 'Pedidos', Component: Orders },
]
