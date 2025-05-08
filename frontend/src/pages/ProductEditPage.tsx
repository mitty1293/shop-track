import React, { useState, useEffect } from 'react';
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

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const ProductEditPage: React.FC = () => {
    // --- Hooks の初期化 ---
    const { id } = useParams<{ id: string }>(); // URL パラメータから ':id' を文字列として取得
    const productId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- フォーム入力値を管理する State ---
    // 初期値は空文字。API からデータ取得後に useEffect で設定される
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [unitId, setUnitId] = useState<number | ''>('');
    const [manufacturerId, setManufacturerId] = useState<number | ''>('');
    const [originId, setOriginId] = useState<number | ''>('');
    const [formError, setFormError] = useState<string | null>(null);

    // --- データ取得 (Tanstack Query: useQuery) ---
    // 1. 編集対象の商品データを取得
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

    // 2. ドロップダウン用の関連データを取得 (カテゴリ、単位など)
    const { data: categories, isLoading: isLoadingCategories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
    const { data: units, isLoading: isLoadingUnits } = useQuery({ queryKey: ['units'], queryFn: getUnits });
    const { data: manufacturers, isLoading: isLoadingManufacturers } = useQuery({ queryKey: ['manufacturers'], queryFn: getManufacturers });
    const { data: origins, isLoading: isLoadingOrigins } = useQuery({ queryKey: ['origins'], queryFn: getOrigins });

    // --- フォームの初期値を設定 (React: useEffect) ---
    // productData の取得が完了（または変更）されたら実行される副作用
    useEffect(() => {
        // productData が存在する場合 (取得成功時)
        if (productData) {
            // 各 state を取得したデータで更新
            setName(productData.name);
            setCategoryId(productData.category.id);
            setUnitId(productData.unit.id);
            // 関連データが null の可能性もあるため、null 合体演算子(??)で空文字にフォールバック
            setManufacturerId(productData.manufacturer?.id ?? '');
            setOriginId(productData.origin?.id ?? '');
        }
        // 依存配列に productData を指定。productData が変わるたびにこの effect が再実行される
    }, [productData]);

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
                console.log('商品更新成功:', updatedData);
                // 関連するクエリキャッシュを無効化して、再取得を促す
                queryClient.invalidateQueries({ queryKey: ['products', productId] }); // この商品の詳細キャッシュ
                queryClient.invalidateQueries({ queryKey: ['products'] });          // 商品一覧のキャッシュ
                // 一覧ページに遷移
                navigate('/products'); // パスは App.tsx の設定に合わせる
            },
            // Mutation 失敗時のコールバック
            onError: (error) => { setFormError(error.message); },
        });

    // --- ドロップダウンの選択変更処理 ---
    const handleSelectChange = (event: SelectChangeEvent<number | ''>, setter: React.Dispatch<React.SetStateAction<number | ''>>) => {
        setter(event.target.value as (number | ''));
    };
    
    // --- フォーム送信時の処理 ---
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // HTML 標準のフォーム送信動作を抑制
        setFormError(null); // 既存のエラーメッセージをクリア

        // 簡単なバリデーション (必須項目チェック)
        if (!name || !categoryId || !unitId) {
        setFormError('商品名、カテゴリ、単位は必須です。');
        return;
        }

        // API (PATCH /api/products/{id}/) に送信するデータ (PatchedProductInput 型) を作成
        const updatedProductData: PatchedProductInput = {
            name: name,
            category_id: Number(categoryId),
            unit_id: Number(unitId),
            manufacturer_id: manufacturerId ? Number(manufacturerId) : null,
            origin_id: originId ? Number(originId) : null,
        };
        mutate(updatedProductData);
    };

    // --- レンダリング前のローディング・エラーチェック ---
    // ドロップダウンデータ全体のローディング状態
    const isLoading = isLoadingProduct || isLoadingCategories || isLoadingUnits || isLoadingManufacturers || isLoadingOrigins;

    // ローディング中ならローディング表示
    if (isLoading) {
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
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <Stack spacing={2}>
                    <TextField
                        variant="outlined" margin="normal" required fullWidth autoFocus
                        id="name" label="Product Name" name="name"
                        value={name} onChange={(e) => setName(e.target.value)}
                        disabled={isPending}
                        error={!!formError && !name}
                        helperText={(!!formError && !name) ? "Name is required" : ""}
                    />
            
                    {/* Category Select */}
                    <FormControl fullWidth margin="normal" required disabled={isPending} error={!!formError && !categoryId}>
                        <InputLabel id="category-select-label">Category</InputLabel>
                        <Select
                            labelId="category-select-label" id="category-select"
                            value={categoryId} label="Category"
                            onChange={(e) => handleSelectChange(e as SelectChangeEvent<number | ''>, setCategoryId)}
                        >
                            <MenuItem value=""><em>Select Category...</em></MenuItem>
                            {categories?.map((category) => (
                                <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                            ))}
                        </Select>
                        {(!!formError && !categoryId) && <Typography color="error" variant="caption">Category is required</Typography>}
                    </FormControl>
            
                    {/* Unit Select */}
                    <FormControl fullWidth margin="normal" required disabled={isPending} error={!!formError && !unitId}>
                        <InputLabel id="unit-select-label">Unit</InputLabel>
                        <Select
                            labelId="unit-select-label" id="unit-select"
                            value={unitId} label="Unit"
                            onChange={(e) => handleSelectChange(e as SelectChangeEvent<number | ''>, setUnitId)}
                        >
                            <MenuItem value=""><em>Select Unit...</em></MenuItem>
                            {units?.map((unit) => (
                                <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                            ))}
                        </Select>
                        {(!!formError && !unitId) && <Typography color="error" variant="caption">Unit is required</Typography>}
                    </FormControl>
            
                    {/* Manufacturer Select (Optional) */}
                    <FormControl fullWidth margin="normal" disabled={isPending}>
                        <InputLabel id="manufacturer-select-label">Manufacturer (Optional)</InputLabel>
                        <Select
                            labelId="manufacturer-select-label" id="manufacturer-select"
                            value={manufacturerId} label="Manufacturer (Optional)"
                            onChange={(e) => handleSelectChange(e as SelectChangeEvent<number | ''>, setManufacturerId)}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {manufacturers?.map((manufacturer) => (
                                <MenuItem key={manufacturer.id} value={manufacturer.id}>{manufacturer.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
            
                    {/* Origin Select (Optional) */}
                    <FormControl fullWidth margin="normal" disabled={isPending}>
                        <InputLabel id="origin-select-label">Origin (Optional)</InputLabel>
                        <Select
                            labelId="origin-select-label" id="origin-select"
                            value={originId} label="Origin (Optional)"
                            onChange={(e) => handleSelectChange(e as SelectChangeEvent<number | ''>, setOriginId)}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {origins?.map((origin) => (
                                <MenuItem key={origin.id} value={origin.id}>{origin.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
            
                    {mutationError && (
                        <Alert severity="error" sx={{ mt: 1 }}>{mutationError.message}</Alert>
                    )}
                    {formError && (name && categoryId && unitId) && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}
            
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button variant="outlined" onClick={() => navigate('/products')} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={isPending || isLoading} sx={{ position: 'relative' }}>
                            {isPending ? 'Saving...' : 'Save Changes'}
                            {isPending && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px', color: 'primary.contrastText' }} />}
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Container>
      );
};

export default ProductEditPage;
