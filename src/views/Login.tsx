import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { useNavigate } from 'react-router'
import { postQuery } from '../helpers/apiQuery'
import useAlertStore from '../stores/AlertStore'

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const showAlert = useAlertStore((state) => state.showAlert);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!username.trim() || !password) {
            showAlert('Completá usuario y contraseña', 'warning');
            return;
        }

        setSubmitting(true)

        try {
            await postQuery('/auth/login', {}, { username: username.trim(), password });
            navigate('/');
        } catch {
            // apiQuery already showed the error alert.
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Stack sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Paper
                component="form"
                onSubmit={handleSubmit}
                elevation={2}
                sx={{ width: '100%', maxWidth: 380, p: 4, borderRadius: 2 }}
            >
                <Stack spacing={3}>
                    <Typography variant="h1" sx={{ textAlign: 'center', color: 'primary.main' }}>
                        Lunitas
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                            label="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                            fullWidth
                        />
                        <TextField
                            label="Contraseña"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                    </Stack>

                    <Button type="submit" variant="contained" disabled={submitting} fullWidth>
                        Ingresar
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}

export default Login
