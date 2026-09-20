import { RouterProvider } from 'react-router'
import { router } from './router/routes'
import BaseAlert from './components/alert/BaseAlert'

// BaseAlert lives here (outside the router) so it renders on every route,
// including standalone ones like /login that sit outside AppLayout.
function App() {
    return (
        <>
            <RouterProvider router={router} />
            <BaseAlert />
        </>
    )
}

export default App
