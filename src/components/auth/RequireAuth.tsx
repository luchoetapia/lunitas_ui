import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { CircularProgress, Stack } from '@mui/material'
import { checkSession } from '../../helpers/apiQuery'

type SessionStatus = 'checking' | 'authenticated' | 'unauthenticated'

// Route guard for every page that needs a session (see router/routes.tsx).
// Probes the httpOnly session cookie once per mount via checkSession and either
// renders the matched route or bounces to /login, carrying the current location
// in nav state so Login can send the user back here after they authenticate.
function RequireAuth() {
    const [status, setStatus] = useState<SessionStatus>('checking')
    const location = useLocation()

    useEffect(() => {
        let cancelled = false

        checkSession().then((ok) => {
            if (!cancelled) setStatus(ok ? 'authenticated' : 'unauthenticated')
        })

        return () => {
            cancelled = true
        }
    }, [])

    if (status === 'checking') {
        return (
            <Stack sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Stack>
        )
    }

    if (status === 'unauthenticated') {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <Outlet />
}

export default RequireAuth
