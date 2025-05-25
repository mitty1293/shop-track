import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getUnitById, updateUnit, PatchedUnitInput } from '../api/client';
import UnitForm from '../components/UnitForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const UnitEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const unitId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 編集対象のデータを取得
    const { data: unitData, isLoading, isError, error } = useQuery({
        queryKey: ['units', unitId],
        queryFn: () => getUnitById(unitId),
        enabled: !!unitId && !isNaN(unitId),
    });

    // --- 更新処理 (Tanstack Query: useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedUnitInput) => updateUnit(unitId, data),
        onSuccess: (data) => {
            console.log('Unit updated:', data);
            queryClient.invalidateQueries({ queryKey: ['units', unitId] });
            queryClient.invalidateQueries({ queryKey: ['units'] });
            navigate('/units');
        },
    });

    // --- フォーム送信時の処理 (UnitForm へ渡す) ---
    const handleFormSubmit = (data: PatchedUnitInput) => {
        mutate(data); // mutate を呼び出す
    };

    // --- キャンセル処理 (UnitForm へ渡す) ---
    const handleCancel = () => {
        navigate('/units');
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
        {/* ★ 共通フォームコンポーネントをレンダリング */}
        <UnitForm
            initialData={unitData} // ★ 取得したデータを渡す
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
export default UnitEditPage;
