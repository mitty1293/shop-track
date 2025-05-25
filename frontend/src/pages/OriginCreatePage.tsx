import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createOrigin, PatchedOriginInput } from '../api/client';
import OriginForm from '../components/OriginForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

const OriginCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedOriginInput) => createOrigin({ name: data.name || '' }),
        onSuccess: (data) => {
            console.log('Origin created:', data);
            queryClient.invalidateQueries({ queryKey: ['origins'] });
            navigate('/origins');
        },
    });

    // --- フォーム送信時の処理 (OriginForm へ渡す) ---
    const handleFormSubmit = (data: PatchedOriginInput) => {
        mutate(data);
    };

    // --- キャンセル処理 (OriginForm へ渡す) ---
    const handleCancel = () => {
        navigate('/origins');
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Origin
            </Typography>
            {/* ★ 共通フォームコンポーネントをレンダリング */}
            <OriginForm
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSubmitting={isPending}
                submitError={mutationError?.message} // エラーメッセージを渡す
                // initialData は渡さない (作成モード)
            />
            {/* 予期せぬエラーなどが Mutation にあれば表示 */}
            {mutationError && !mutationError.message && (
                <Alert severity="error" sx={{ mt: 1 }}>An unexpected error occurred.</Alert>
            )}
        </Container>
    );
};
export default OriginCreatePage;
