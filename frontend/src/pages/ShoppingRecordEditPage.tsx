import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import {
    ShoppingRecord,
    Product,
    Store,
    PatchedShoppingRecordInput,
    getShoppingRecordById,
    updateShoppingRecord,
    getProducts,
    getStores,
} from '../api/client';
import ShoppingRecordForm from '../components/ShoppingRecordForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const ShoppingRecordEditPage: React.FC = () => {
    // --- Hooks ---
    const { id } = useParams<{ id: string }>();
    const recordId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- データ取得 ---
    // 1. 編集対象の購買記録データを取得
    const { data: recordData, isLoading: isLoadingRecord, isError, error } = useQuery<ShoppingRecord, Error>({
        queryKey: ['shoppingRecords', recordId],
        queryFn: () => getShoppingRecordById(recordId),
        enabled: !!recordId && !isNaN(recordId),
    });

    // 2. ドロップダウン用の商品・店舗リストを取得
    const { data: products, isLoading: isLoadingProducts } = useQuery<Product[], Error>({
        queryKey: ['products'],
        queryFn: getProducts,
    });
    const { data: stores, isLoading: isLoadingStores } = useQuery<Store[], Error>({
        queryKey: ['stores'],
        queryFn: getStores,
    });

    // --- Mutation (データ更新) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedShoppingRecordInput) => updateShoppingRecord(recordId, data),
        onSuccess: (updatedData) => {
            console.log('Shopping Record updated:', updatedData);
            // 関連するクエリキャッシュを無効化して、再取得を促す
            queryClient.invalidateQueries({ queryKey: ['shoppingRecords', recordId] });
            queryClient.invalidateQueries({ queryKey: ['shoppingRecords'] });
            navigate('/shopping-records');
        },
    });

    const handleFormSubmit = (data: PatchedShoppingRecordInput) => {
        mutate(data);
    };

    const handleCancel = () => {
        navigate('/shopping-records');
    };

    // --- ローディング / エラー表示 ---
    const isLoadingAllData = isLoadingRecord || isLoadingProducts || isLoadingStores;
    if (isLoadingAllData) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }
    if (isError) {
        return (
            <Container maxWidth="md" sx={{ mt: 2 }}>
                <Alert severity="error">Error loading record data: {error?.message}</Alert>
            </Container>
        );
    }
    if (!recordData) {
        return (
            <Container maxWidth="md" sx={{ mt: 2 }}>
                <Alert severity="warning">Shopping Record not found (ID: {recordId}).</Alert>
            </Container>
        );
    }

    // --- JSX (フォーム) ---
    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Edit Shopping Record (ID: {recordId})
            </Typography>
            <ShoppingRecordForm
                initialData={recordData}
                products={products}
                stores={stores}
                isLoadingDropdowns={isLoadingProducts || isLoadingStores}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSubmitting={isPending}
                submitError={mutationError?.message}
            />
            {mutationError && !mutationError.message && (
                <Alert severity="error" sx={{ mt: 1 }}>An unexpected error occurred.</Alert>
            )}
        </Container>
    );
};

export default ShoppingRecordEditPage;
