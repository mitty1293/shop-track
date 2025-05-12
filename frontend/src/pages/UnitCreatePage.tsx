import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createUnit, PatchedUnitInput } from '../api/client';
import UnitForm from '../components/UnitForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

const UnitCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedUnitInput) => createUnit({ name: data.name || '' }),
        onSuccess: (data) => {
            console.log('Unit created:', data);
            queryClient.invalidateQueries({ queryKey: ['units'] });
            navigate('/units');
        },
    });

    // --- フォーム送信時の処理 (UnitForm へ渡す) ---
    const handleFormSubmit = (data: PatchedUnitInput) => {
        mutate(data);
    };

    // --- キャンセル処理 (UnitForm へ渡す) ---
    const handleCancel = () => {
        navigate('/units');
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Unit
            </Typography>
            {/* ★ 共通フォームコンポーネントをレンダリング */}
            <UnitForm
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
export default UnitCreatePage;
