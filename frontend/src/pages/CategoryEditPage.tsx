import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getCategoryById, updateCategory, PatchedCategoryInput } from '../api/client';
import CategoryForm from '../components/CategoryForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const CategoryEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const categoryId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 編集対象のデータを取得
    const { data: categoryData, isLoading, isError, error } = useQuery({
        queryKey: ['categories', categoryId],
        queryFn: () => getCategoryById(categoryId),
        enabled: !!categoryId && !isNaN(categoryId),
    });

    // --- 更新処理 (Tanstack Query: useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedCategoryInput) => updateCategory(categoryId, data),
        onSuccess: (data) => {
            console.log('Category updated:', data);
            queryClient.invalidateQueries({ queryKey: ['categories', categoryId] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            navigate('/categories');
        },
    });

    // --- フォーム送信時の処理 (CategoryForm へ渡す) ---
    const handleFormSubmit = (data: PatchedCategoryInput) => {
        mutate(data); // mutate を呼び出す
    };

    // --- キャンセル処理 (CategoryForm へ渡す) ---
    const handleCancel = () => {
        navigate('/categories');
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
                Error loading category data: {error?.message}
            </Alert>
            </Container>
        );
    }
    if (!categoryData) {
        return (
            <Container maxWidth="md" sx={{ mt: 2 }}>
            <Alert severity="warning">Category not found (ID: {categoryId}).</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
            Edit Category (ID: {categoryId})
        </Typography>
        {/* ★ 共通フォームコンポーネントをレンダリング */}
        <CategoryForm
            initialData={categoryData} // ★ 取得したデータを渡す
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
            submitError={mutationError?.message} // エラーメッセージを渡す
        />
        {/* 予期せぬエラーなどが Mutation にあれば表示 */}
        {mutationError && !mutationError.message && (
            <Alert severity="error" sx={{ mt: 1 }}>An unexpected error occurred.</Alert>
        )}
        </Container>
  );
};
export default CategoryEditPage;
