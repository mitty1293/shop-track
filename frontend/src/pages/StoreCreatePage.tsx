import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createStore, StoreInput } from '../api/client';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const StoreCreatePage: React.FC = () => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: createStore,
        onSuccess: (data) => {
            console.log('Store created:', data);
            queryClient.invalidateQueries({ queryKey: ['stores'] });
            navigate('/stores');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォームのサブミット処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!name || !location) { setFormError('Name and Location are required.'); return; }
        const storeData: StoreInput = { name, location };
        mutate(storeData);
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Store
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <Stack spacing={2}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Store Name"
                        name="name"
                        autoComplete="store-name"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isPending}
                        error={!!formError && !name || (!!mutationError && !!mutationError.message.toLowerCase().includes('name'))}
                        helperText={ (formError && !name) ? formError :
                                    (mutationError && mutationError.message.toLowerCase().includes('name')) ? mutationError.message : '' }
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="location"
                        label="Location"
                        name="location"
                        autoComplete="store-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={isPending}
                        error={!!formError && !location || (!!mutationError && !!mutationError.message.toLowerCase().includes('location'))}
                        helperText={ (formError && !location) ? formError :
                                    (mutationError && mutationError.message.toLowerCase().includes('location')) ? mutationError.message : '' }
                    />
            
                    {/* Mutation の一般的なエラーメッセージ (フィールド固有でない場合) */}
                    {mutationError && !mutationError.message.toLowerCase().includes('name') && !mutationError.message.toLowerCase().includes('location') && (
                        <Alert severity="error" sx={{ mt: 1 }}>{mutationError.message}</Alert>
                    )}
                    {/* フォーム固有のエラーで、フィールドに直接関連しないもの（例：全体的なエラー）*/}
                    {formError && (name && location) && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button
                            type="button"
                            variant="outlined" // アウトラインスタイル
                            onClick={() => navigate('/stores')}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isPending}
                            sx={{ position: 'relative' }}
                        >
                            {isPending ? 'Saving...' : 'Save'}
                            {isPending && (
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
                    </Box>
                </Stack>
            </Box>
        </Container>
    );
};
export default StoreCreatePage;
