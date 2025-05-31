import React, { useState } from 'react';
import { useNavigate, useLocation  } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../api/client';

// --- Material UI ---
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();

    const from = (location.state as any)?.from?.pathname || '/';

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoggingIn(true);

        const credentials: LoginCredentials = { username, password };

        try {
            await auth.login(credentials);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during login.');
            console.error("Login error on page:", err);
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5">
                Sign in
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                <Stack spacing={2}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoggingIn}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoggingIn}
                    />
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mt: 1 }}>{error}</Alert>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, position: 'relative' }}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? 'Signing In...' : 'Sign In'}
                        {isLoggingIn && (
                        <CircularProgress
                            size={24}
                            sx={{
                            color: 'primary.contrastText',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                            }}
                        />
                        )}
                    </Button>
                </Stack>
            </Box>
        </Container>
    );
};

export default LoginPage;
