import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getStoreById, updateStore, PatchedStoreInput } from '../api/client';
import StoreForm from '../components/StoreForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const StoreEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const storeId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 編集対象のデータを取得
    const { data: storeData, isLoading, isError, error } = useQuery({
        queryKey: ['stores', storeId],
        queryFn: () => getStoreById(storeId),
        enabled: !!storeId && !isNaN(storeId),
    });

    // --- 更新処理 (Tanstack Query: useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedStoreInput) => updateStore(storeId, data),
        onSuccess: (data) => {
            console.log('Store updated:', data);
            queryClient.invalidateQueries({ queryKey: ['stores', storeId] });
            queryClient.invalidateQueries({ queryKey: ['stores'] });
            navigate('/stores');
        },
    });

    // --- フォーム送信時の処理 ---
    const handleFormSubmit = (data: PatchedStoreInput) => {
        mutate(data);
    };

    // --- キャンセル処理 (StoreForm へ渡す) ---
    const handleCancel = () => {
        navigate('/stores');
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
            <StoreForm
                initialData={storeData}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSubmitting={isPending}
                submitError={mutationError?.message}
            />
            {mutationError && !mutationError.message && (
                <Alert severity="error" sx={{ mt: 1 }}>An unexpected error occurred during submission.</Alert>
            )}
        </Container>
    );
};
export default StoreEditPage;
