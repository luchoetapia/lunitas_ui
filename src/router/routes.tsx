// This file mixes local components with a non-component export (`router`), which
// react-refresh's only-export-components rule flags. Fast refresh on this file is not
// a concern in practice, so the rule is disabled here.
/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter, Outlet } from 'react-router'
import NavBar from '../components/navbar/NavBar'
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

// Builds one router route per entry in appRoutes, each wrapped to set the tab title.
export const router = createBrowserRouter([
    {
        element: (
            <>
                <NavBar />
                <Outlet />
            </>
        ),
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
