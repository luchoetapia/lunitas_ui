import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { CircularProgress, Stack } from '@mui/material'
import { getCurrentUser } from '../../helpers/apiQuery'
import type { CurrentUser } from '../../models/auth'
import { FIRST_LOGIN_PATH } from '../../router/routes.config'

type SessionStatus = 'checking' | 'authenticated' | 'unauthenticated'

// Passed down to every route rendered through this guard's Outlet (see routes.tsx).
export interface AuthContext {
    user: CurrentUser | null
    // Re-fetches the session user. Used after the first-login password change, so
    // this guard's isFirstLogin check sees the updated value on the next render.
    refreshUser: () => Promise<CurrentUser | null>
}

// Route guard for every page that needs a session (see router/routes.tsx).
// Fetches the session user once per mount via getCurrentUser and either renders the
// matched route or bounces to /login, carrying the current location in nav state so
// Login can send the user back here after they authenticate. A user whose account
// still has isFirstLogin set is redirected to the mandatory password-change page
// instead of the route they requested, until that flag is cleared.
function RequireAuth() {
    const [status, setStatus] = useState<SessionStatus>('checking')
    const [user, setUser] = useState<CurrentUser | null>(null)
    const location = useLocation()

    const refreshUser = async () => {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setStatus(currentUser ? 'authenticated' : 'unauthenticated')
        return currentUser
    }

    useEffect(() => {
        let cancelled = false

        getCurrentUser().then((currentUser) => {
            if (cancelled) return
            setUser(currentUser)
            setStatus(currentUser ? 'authenticated' : 'unauthenticated')
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

    const onFirstLoginPage = location.pathname === FIRST_LOGIN_PATH

    if (user?.isFirstLogin && !onFirstLoginPage) {
        return <Navigate to={FIRST_LOGIN_PATH} replace />
    }

    if (!user?.isFirstLogin && onFirstLoginPage) {
        return <Navigate to="/" replace />
    }

    return <Outlet context={{ user, refreshUser } satisfies AuthContext} />
}

export default RequireAuth
