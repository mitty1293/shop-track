import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getOriginById, updateOrigin, PatchedOriginInput } from '../api/client';
import OriginForm from '../components/OriginForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const OriginEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const originId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 編集対象のデータを取得
    const { data: originData, isLoading, isError, error } = useQuery({
        queryKey: ['origins', originId],
        queryFn: () => getOriginById(originId),
        enabled: !!originId && !isNaN(originId),
    });

    // --- 更新処理 (Tanstack Query: useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedOriginInput) => updateOrigin(originId, data),
        onSuccess: (data) => {
            console.log('Origin updated:', data);
            queryClient.invalidateQueries({ queryKey: ['origins', originId] });
            queryClient.invalidateQueries({ queryKey: ['origins'] });
            navigate('/origins');
        },
    });

    // --- フォーム送信時の処理 (OriginForm へ渡す) ---
    const handleFormSubmit = (data: PatchedOriginInput) => {
        mutate(data); // mutate を呼び出す
    };

    // --- キャンセル処理 (OriginForm へ渡す) ---
    const handleCancel = () => {
        navigate('/origins');
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
                Error loading origin data: {error?.message}
            </Alert>
            </Container>
        );
    }
    if (!originData) {
        return (
            <Container maxWidth="md" sx={{ mt: 2 }}>
            <Alert severity="warning">Origin not found (ID: {originId}).</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
            Edit Origin (ID: {originId})
        </Typography>
        {/* ★ 共通フォームコンポーネントをレンダリング */}
        <OriginForm
            initialData={originData} // ★ 取得したデータを渡す
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
export default OriginEditPage;
