import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getStoreById, updateStore, PatchedStoreInput } from '../api/client';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const StoreEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const storeId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // 編集対象のデータを取得
    const { data: storeData, isLoading, isError, error } = useQuery({
        queryKey: ['stores', storeId],
        queryFn: () => getStoreById(storeId),
        enabled: !!storeId && !isNaN(storeId),
    });

    // --- フォームの初期値を設定 (React: useEffect) ---
    useEffect(() => {
        if (storeData) {
            setName(storeData.name);
            setLocation(storeData.location);
        }
    }, [storeData]);

    // --- 更新処理 (Tanstack Query: useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedStoreInput) => updateStore(storeId, data),
        onSuccess: (data) => {
            console.log('Store updated:', data);
            queryClient.invalidateQueries({ queryKey: ['stores', storeId] });
            queryClient.invalidateQueries({ queryKey: ['stores'] });
            navigate('/stores');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォーム送信時の処理 ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!name || !location) { setFormError('Name and Location are required.'); return; }
        const patchedData: PatchedStoreInput = { name, location };
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
              Error loading store data: {error?.message}
            </Alert>
          </Container>
        );
      }
      if (!storeData) {
        return (
          <Container maxWidth="md" sx={{ mt: 2 }}>
            <Alert severity="warning">Store not found (ID: {storeId}).</Alert>
          </Container>
        );
      }

      return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Edit Store (ID: {storeId})
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isPending}
                        error={!!formError && !name}
                        helperText={(!!formError && !name) ? "Name is required" : ""}
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
                        error={!!formError && !location}
                        helperText={(!!formError && !location) ? "Location is required" : ""}
                    />
            
                    {/* Mutation エラー表示 */}
                    {mutationError && (
                        <Alert severity="error" sx={{ mt: 1 }}>{mutationError.message}</Alert>
                    )}
                    {/* フォーム固有のエラーで、フィールドに直接関連しないもの */}
                    {formError && (name && location) && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}
            
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button
                            type="button"
                            variant="outlined"
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
                            {isPending ? 'Saving...' : 'Save Changes'}
                            {isPending && (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: 'primary.contrastText',
                                        position: 'absolute',
                                        top: '50%', left: '50%',
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
export default StoreEditPage;
