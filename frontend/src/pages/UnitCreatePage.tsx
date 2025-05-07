import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createUnit, UnitInput } from '../api/client';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const UnitCreatePage: React.FC = () => {
    const [name, setName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: createUnit,
        onSuccess: (data) => {
            console.log('Unit created:', data);
            queryClient.invalidateQueries({ queryKey: ['units'] });
            navigate('/units');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォームのサブミット処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!name) { setFormError('Name is required.'); return; }
        const unitData: UnitInput = { name };
        mutate(unitData);
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Unit
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <Stack spacing={2}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Unit Name"
                        name="name"
                        autoComplete="unit-name"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isPending}
                        error={!!formError && !name || (!!mutationError && !!mutationError.message.toLowerCase().includes('name'))}
                        helperText={ (formError && !name) ? formError :
                                    (mutationError && mutationError.message.toLowerCase().includes('name')) ? mutationError.message : '' }
                    />
            
                    {/* Mutation の一般的なエラーメッセージ (フィールド固有でない場合) */}
                    {mutationError && !mutationError.message.toLowerCase().includes('name') && (
                        <Alert severity="error" sx={{ mt: 1 }}>{mutationError.message}</Alert>
                    )}
                    {/* フォーム固有のエラーで、フィールドに直接関連しないもの（例：全体的なエラー）*/}
                    {formError && name && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={() => navigate('/units')}
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
export default UnitCreatePage;
