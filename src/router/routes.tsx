import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter, Outlet } from 'react-router'
import NavBar from '../components/navbar/NavBar'
import useAlertStore from '../stores/AlertStore'
import Login from '../views/Login'
import { appRoutes, APP_NAME } from './routes.config'

interface PageTitleProps {
    title: string
    children: ReactNode
}

// Sets the browser tab title for whichever route renders it.
function PageTitle({ title, children }: PageTitleProps) {
    useEffect(() => {
        document.title = `${title} - ${APP_NAME}`
    }, [title])

    return children
}

// Root layout: nav + whichever route matched.
// Fires a one-time welcome alert on mount, exercising showAlert end-to-end.
function AppLayout() {
    useEffect(() => {
        useAlertStore.getState().showAlert('Bienvenido a Lunitas!', 'info')
    }, [])

    return (
        <>
            <NavBar />
            <Outlet />
        </>
    )
}

// Builds one router route per entry in appRoutes, each wrapped to set the tab title.
// /login is a standalone route outside AppLayout, so it renders without the nav bar.
export const router = createBrowserRouter([
    {
        path: '/login',
        element: (
            <PageTitle title="Iniciar sesión">
                <Login />
            </PageTitle>
        ),
    },
    {
        element: <AppLayout />,
        children: appRoutes.map(({ path, label, Component }) => {
            const element = (
                <PageTitle title={label}>
                    <Component />
                </PageTitle>
            )
            return path === '/' ? { index: true, element } : { path, element }
        }),
    },
])
