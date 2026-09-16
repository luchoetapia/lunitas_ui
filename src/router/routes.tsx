import { useEffect } from 'react'
import type { ReactNode, SyntheticEvent } from 'react'
import { Tab, Tabs } from '@mui/material'
import { createBrowserRouter, Outlet, useLocation, useNavigate } from 'react-router'
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
