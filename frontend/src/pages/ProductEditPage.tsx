import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Product,
    Category,
    Unit,
    Manufacturer,
    Origin,
    PatchedProductInput,
    getProductById,
    updateProduct,
    getCategories,
    getUnits,
    getManufacturers,
    getOrigins,
} from '../api/client';
import ProductForm from '../components/ProductForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const ProductEditPage: React.FC = () => {
    // --- Hooks の初期化 ---
    const { id } = useParams<{ id: string }>(); // URL パラメータから ':id' を文字列として取得
    const productId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 関連データの取得 (useQuery)(ドロップダウン用) ---
    // 編集対象の商品データを取得
    const {
        data: productData, // 取得したデータ (Product | undefined)
        isLoading: isLoadingProduct, // ローディング中か (boolean)
        isError: isErrorProduct, // エラーが発生したか (boolean)
        error: productError, // エラーオブジェクト
    } = useQuery({
        queryKey: ['products', productId],
        queryFn: () => getProductById(productId),
        enabled: !!productId && !isNaN(productId), // productId が有効な数値の場合のみ実行
    });

    // ドロップダウン用の関連データを取得 (カテゴリ、単位など)
    const { data: categories, isLoading: isLoadingCategories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
    const { data: units, isLoading: isLoadingUnits } = useQuery({ queryKey: ['units'], queryFn: getUnits });
    const { data: manufacturers, isLoading: isLoadingManufacturers } = useQuery({ queryKey: ['manufacturers'], queryFn: getManufacturers });
    const { data: origins, isLoading: isLoadingOrigins } = useQuery({ queryKey: ['origins'], queryFn: getOrigins });

    // --- 商品更新処理 (Tanstack Query: useMutation) ---
    const {
        mutate, // この関数を実行すると mutationFn が呼び出される
        isPending, // Mutation が実行中か (boolean)
        error: mutationError // Mutation で発生したエラーオブジェクト
    } = useMutation({
            // 実行される非同期関数。更新用 API クライアント関数を呼び出す
            mutationFn: (data: PatchedProductInput) => updateProduct(productId, data),
            // Mutation 成功時のコールバック
            onSuccess: (updatedData) => { // updatedData は updateProduct が返した値
                console.log('Product updated:', updatedData);
                // 関連するクエリキャッシュを無効化して、再取得を促す
                queryClient.invalidateQueries({ queryKey: ['products', productId] }); // この商品の詳細キャッシュ
                queryClient.invalidateQueries({ queryKey: ['products'] });          // 商品一覧のキャッシュ
                // 一覧ページに遷移
                navigate('/products'); // パスは App.tsx の設定に合わせる
            },
        });

    const handleFormSubmit = (data: PatchedProductInput) => {
        mutate(data);
    };

    const handleCancel = () => {
        navigate('/products');
    };

    // --- レンダリング前のローディング・エラーチェック ---
    // ドロップダウンデータ全体のローディング状態
    const isLoadingAllData = isLoadingProduct || isLoadingCategories || isLoadingUnits || isLoadingManufacturers || isLoadingOrigins;

    // ローディング中ならローディング表示
    if (isLoadingAllData) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    // 商品データの取得でエラーが発生した場合
    if (isErrorProduct) {
        return (
            <Container maxWidth="md" sx={{ mt: 2 }}>
                <Alert severity="error">Error loading product data: {productError?.message}</Alert>
            </Container>
        );
    }

    // 商品データが存在しない場合 (ID が不正、削除済みなど)
    if (!productData) {
        return (
            <Container maxWidth="md" sx={{ mt: 2 }}>
                <Alert severity="warning">Product not found (ID: {productId}).</Alert>
            </Container>
        );
    }

    // --- JSX によるフォームのレンダリング ---
    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Edit Product (ID: {productId})
            </Typography>
            <ProductForm
                initialData={productData}
                // ドロップダウン用データを渡す
                categories={categories}
                units={units}
                manufacturers={manufacturers}
                origins={origins}
                isLoadingDropdowns={isLoadingCategories || isLoadingUnits || isLoadingManufacturers || isLoadingOrigins} // ★ Form 側で使うなら
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

export default ProductEditPage;
