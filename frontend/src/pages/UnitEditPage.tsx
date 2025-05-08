import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getUnitById, updateUnit, PatchedUnitInput } from '../api/client';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const UnitEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const unitId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // 編集対象のデータを取得
    const { data: unitData, isLoading, isError, error } = useQuery({
        queryKey: ['units', unitId],
        queryFn: () => getUnitById(unitId),
        enabled: !!unitId && !isNaN(unitId),
    });

    // --- フォームの初期値を設定 (React: useEffect) ---
    useEffect(() => { if (unitData) setName(unitData.name); }, [unitData]);

    // --- 更新処理 (Tanstack Query: useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedUnitInput) => updateUnit(unitId, data),
        onSuccess: (data) => {
            console.log('Unit updated:', data);
            queryClient.invalidateQueries({ queryKey: ['units', unitId] });
            queryClient.invalidateQueries({ queryKey: ['units'] });
            navigate('/units');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォーム送信時の処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!name) { setFormError('Name is required.'); return; }
        const patchedData: PatchedUnitInput = { name };
        mutate(patchedData);
    };

    // --- レンダリング前のローディング・エラーチェック ---
    if (isLoading) {
        return (
          <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Container>
        );
    }
    if (isError) {
        return (
            <Container maxWidth="md" sx={{ mt: 2 }}>
            <Alert severity="error">
                Error loading unit data: {error?.message}
            </Alert>
            </Container>
        );
    }
    if (!unitData) {
        return (
            <Container maxWidth="md" sx={{ mt: 2 }}>
            <Alert severity="warning">Unit not found (ID: {unitId}).</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Edit Unit (ID: {unitId})
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
                        error={!!formError && !name}
                        helperText={(!!formError && !name) ? "Name is required" : ""}
                    />
            
                    {/* Mutation エラー表示 */}
                    {mutationError && (
                        <Alert severity="error" sx={{ mt: 1 }}>{mutationError.message}</Alert>
                    )}
                    {/* フォーム固有のエラー表示（必須チェックなど） */}
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
                            {isPending ? 'Saving...' : 'Save Changes'}
                            {isPending && (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: 'primary.contrastText',
                                        position: 'absolute', top: '50%', left: '50%',
                                        marginTop: '-12px', marginLeft: '-12px',
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
export default UnitEditPage;
