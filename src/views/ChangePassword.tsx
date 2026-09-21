import { useState } from 'react'
import type { FormEvent } from 'react'
import {
    Button,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { useNavigate, useOutletContext } from 'react-router'
import { postQuery } from '../helpers/apiQuery'
import useAlertStore from '../stores/AlertStore'
import type { AuthContext } from '../components/auth/RequireAuth'

// Mirrors the backend's resetPasswordSchema (lunitas_server/src/auth/authValidators.ts):
// min 8 chars, at least one uppercase, one lowercase and one number.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/
const PASSWORD_RULES_MESSAGE =
    'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'

// Mandatory step for a user whose account still has isFirstLogin set (see
// RequireAuth, which routes here and supplies the session user via context).
function ChangePassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()
    const showAlert = useAlertStore((state) => state.showAlert)
    const { user, refreshUser } = useOutletContext<AuthContext>()

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        if (!password || !confirmPassword) {
            showAlert('Completá los dos campos de contraseña', 'warning')
            return
        }
        if (password !== confirmPassword) {
            showAlert('Las contraseñas no coinciden', 'warning')
            return
        }
        if (!PASSWORD_REGEX.test(password)) {
            showAlert(PASSWORD_RULES_MESSAGE, 'warning')
            return
        }

        setSubmitting(true)

        try {
            await postQuery('/auth/reset-password', {}, {
                password,
                confirmPassword,
                isFirstLogin: true,
            })
            // Clears isFirstLogin on the session user so RequireAuth stops
            // redirecting here before we navigate away from this page.
            await refreshUser()
            navigate('/', { replace: true })
        } catch {
            // apiQuery already showed the error alert.
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Stack sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Paper
                component="form"
                onSubmit={handleSubmit}
                elevation={2}
                sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 2 }}
            >
                <Stack spacing={3}>
                    <Typography variant="h1" sx={{ textAlign: 'center', color: 'primary.main' }}>
                        ¡Hola {user?.name ?? user?.username}!
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{ textAlign: 'center', color: 'text.secondary' }}
                    >
                        Como este es tu primer inicio de sesión, es necesario que cambies tu
                        contraseña antes de continuar.
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                            label="Nueva contraseña"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                            fullWidth
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={
                                                    showPassword
                                                        ? 'Ocultar contraseña'
                                                        : 'Mostrar contraseña'
                                                }
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                edge="end"
                                            >
                                                {showPassword
                                                    ? <VisibilityOffOutlinedIcon />
                                                    : <VisibilityOutlinedIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            label="Confirmar contraseña"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            fullWidth
                        />
                    </Stack>

                    <Button type="submit" variant="contained" disabled={submitting} fullWidth>
                        Cambiar contraseña
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    )
}

export default ChangePassword
