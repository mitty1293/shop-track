import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
    getCategories,
    getUnits,
    getManufacturers,
    getOrigins,
    createProduct,
    PatchedProductInput,
} from '../api/client';
import ProductForm from '../components/ProductForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const ProductCreatePage: React.FC = () => {
    // --- React Router と Tanstack Query の準備 ---
    const navigate = useNavigate(); // ページ遷移用フック
    const queryClient = useQueryClient(); // Query Client インスタンス取得

    // --- 関連データの取得 (useQuery)(ドロップダウン用) ---
    // カテゴリ一覧
    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    // 単位一覧
    const { data: units, isLoading: isLoadingUnits } = useQuery({
        queryKey: ['units'],
        queryFn: getUnits,
    });

    // 製造者一覧
    const { data: manufacturers, isLoading: isLoadingManufacturers } = useQuery({
        queryKey: ['manufacturers'],
        queryFn: getManufacturers,
    });

    // 原産国一覧
    const { data: origins, isLoading: isLoadingOrigins } = useQuery({
        queryKey: ['origins'],
        queryFn: getOrigins,
    });

    // --- 商品作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedProductInput) => createProduct({
            name: data.name || '',
            category_id: Number(data.category_id),
            unit_id: Number(data.unit_id),
            manufacturer_id: data.manufacturer_id ? Number(data.manufacturer_id) : null,
            origin_id: data.origin_id ? Number(data.origin_id) : null,
        }),
        onSuccess: (data) => {
            console.log('Product created:', data);
            // 商品一覧のキャッシュを無効化して再取得をトリガー
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // 商品一覧ページに遷移
            navigate('/products');
        },
    });

    const handleFormSubmit = (data: PatchedProductInput) => {
        mutate(data);
    };

    const handleCancel = () => {
        navigate('/products');
    };


    // --- ローディング表示 ---
    const isLoadingDropdowns = isLoadingCategories || isLoadingUnits || isLoadingManufacturers || isLoadingOrigins;
    if (isLoadingDropdowns) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    // --- JSX (フォームのレンダリング) ---
    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Product
            </Typography>
            <ProductForm
                // ドロップダウン用データを渡す
                categories={categories}
                units={units}
                manufacturers={manufacturers}
                origins={origins}
                isLoadingDropdowns={isLoadingDropdowns} // これは Form 側では不要かも。親で制御するため。
                // コールバックと状態
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

export default ProductCreatePage;
