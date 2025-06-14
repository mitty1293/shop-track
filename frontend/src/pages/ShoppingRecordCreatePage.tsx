import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
    Product,
    Store,
    getProducts,
    getStores,
    createShoppingRecord,
    PatchedShoppingRecordInput
} from '../api/client';
import ShoppingRecordForm from '../components/ShoppingRecordForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const ShoppingRecordCreatePage: React.FC = () => {
    // --- Hooks ---
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- データ取得 (ドロップダウン用) ---
    const { data: products, isLoading: isLoadingProducts } = useQuery<Product[], Error>({
        queryKey: ['products'],
        queryFn: getProducts,
    });
    const { data: stores, isLoading: isLoadingStores } = useQuery<Store[], Error>({
        queryKey: ['stores'],
        queryFn: getStores,
    });

    // --- Mutation (データ作成) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedShoppingRecordInput) => createShoppingRecord({
            product_id: Number(data.product_id),
            store_id: Number(data.store_id),
            purchase_date: data.purchase_date || '',
            price: Number(data.price),
            quantity: data.quantity || '',
        }),
        onSuccess: (data) => {
            console.log('Shopping Record created:', data);
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

    // ローディングチェック
    const isLoadingDropdowns = isLoadingProducts || isLoadingStores;
    if (isLoadingDropdowns) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Add New Shopping Record
            </Typography>
            <ShoppingRecordForm
                products={products}
                stores={stores}
                isLoadingDropdowns={isLoadingDropdowns}
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

export default ShoppingRecordCreatePage;
