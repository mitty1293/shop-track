import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createCategory, PatchedCategoryInput } from '../api/client';
import CategoryForm from '../components/CategoryForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

const CategoryCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedCategoryInput) => createCategory({ name: data.name || '' }),
        onSuccess: (data) => {
            console.log('Category created:', data);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            navigate('/categories');
        },
    });

    // --- フォーム送信時の処理 (CategoryForm へ渡す) ---
    const handleFormSubmit = (data: PatchedCategoryInput) => {
        mutate(data);
    };

    // --- キャンセル処理 (CategoryForm へ渡す) ---
    const handleCancel = () => {
        navigate('/categories');
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Category
            </Typography>
            {/* ★ 共通フォームコンポーネントをレンダリング */}
            <CategoryForm
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
export default CategoryCreatePage;
