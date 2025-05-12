import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createManufacturer, PatchedManufacturerInput } from '../api/client';
import ManufacturerForm from '../components/ManufacturerForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

const ManufacturerCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedManufacturerInput) => createManufacturer({ name: data.name || '' }),
        onSuccess: (data) => {
            console.log('Manufacturer created:', data);
            queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
            navigate('/manufacturers');
        },
    });

    // --- フォーム送信時の処理 (ManufacturerForm へ渡す) ---
    const handleFormSubmit = (data: PatchedManufacturerInput) => {
        mutate(data);
    };

    // --- キャンセル処理 (ManufacturerForm へ渡す) ---
    const handleCancel = () => {
        navigate('/manufacturers');
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Manufacturer
            </Typography>
            {/* ★ 共通フォームコンポーネントをレンダリング */}
            <ManufacturerForm
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
export default ManufacturerCreatePage;
