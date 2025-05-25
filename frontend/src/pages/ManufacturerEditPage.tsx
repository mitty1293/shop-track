import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getManufacturerById, updateManufacturer, PatchedManufacturerInput } from '../api/client';
import ManufacturerForm from '../components/ManufacturerForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const ManufacturerEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const manufacturerId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 編集対象のデータを取得
    const { data: manufacturerData, isLoading, isError, error } = useQuery({
        queryKey: ['manufacturers', manufacturerId],
        queryFn: () => getManufacturerById(manufacturerId),
        enabled: !!manufacturerId && !isNaN(manufacturerId),
    });

    // --- 更新処理 (Tanstack Query: useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedManufacturerInput) => updateManufacturer(manufacturerId, data),
        onSuccess: (data) => {
            console.log('Manufacturer updated:', data);
            queryClient.invalidateQueries({ queryKey: ['manufacturers', manufacturerId] });
            queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
            navigate('/manufacturers');
        },
    });

    // --- フォーム送信時の処理 (ManufacturerForm へ渡す) ---
    const handleFormSubmit = (data: PatchedManufacturerInput) => {
        mutate(data); // mutate を呼び出す
    };

    // --- キャンセル処理 (ManufacturerForm へ渡す) ---
    const handleCancel = () => {
        navigate('/manufacturers');
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
                Error loading manufacturer data: {error?.message}
            </Alert>
            </Container>
        );
    }
    if (!manufacturerData) {
        return (
            <Container maxWidth="md" sx={{ mt: 2 }}>
            <Alert severity="warning">Manufacturer not found (ID: {manufacturerId}).</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
            Edit Manufacturer (ID: {manufacturerId})
        </Typography>
        {/* ★ 共通フォームコンポーネントをレンダリング */}
        <ManufacturerForm
            initialData={manufacturerData} // ★ 取得したデータを渡す
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
export default ManufacturerEditPage;
