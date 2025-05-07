import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
    getCategories,
    getUnits,
    getManufacturers,
    getOrigins,
    createProduct,
    ProductInput,
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

const ProductCreatePage: React.FC = () => {
    // --- 状態管理 ---
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>(''); // 初期値は空 or プレースホルダ値
    const [unitId, setUnitId] = useState<number | ''>('');
    const [manufacturerId, setManufacturerId] = useState<number | ''>(''); // 任意なので空を許容
    const [originId, setOriginId] = useState<number | ''>('');       // 任意なので空を許容
    const [formError, setFormError] = useState<string | null>(null); // フォーム送信時のエラーメッセージ用

    // --- React Router と Tanstack Query の準備 ---
    const navigate = useNavigate(); // ページ遷移用フック
    const queryClient = useQueryClient(); // Query Client インスタンス取得

    // --- 関連データの取得 (useQuery)(ドロップダウン用) ---
    // カテゴリ一覧
    const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    // 単位一覧
    const { data: units, isLoading: isLoadingUnits, isError: isErrorUnits } = useQuery({
        queryKey: ['units'],
        queryFn: getUnits,
    });

    // 製造者一覧
    const { data: manufacturers, isLoading: isLoadingManufacturers, isError: isErrorManufacturers } = useQuery({
        queryKey: ['manufacturers'],
        queryFn: getManufacturers,
    });

    // 原産国一覧
    const { data: origins, isLoading: isLoadingOrigins, isError: isErrorOrigins } = useQuery({
        queryKey: ['origins'],
        queryFn: getOrigins,
    });

    // --- 商品作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: createProduct, // Product作成関数
        onSuccess: (data) => {
            console.log('Product created:', data);
            // 商品一覧のキャッシュを無効化して再取得をトリガー
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // 商品一覧ページに遷移
            navigate('/products');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- ドロップダウンの選択変更処理 ---
    const handleSelectChange = (event: SelectChangeEvent<number | ''>, setter: React.Dispatch<React.SetStateAction<number | ''>>) => {
        setter(event.target.value as (number | ''));
    };

    // --- フォームのサブミット処理 ---
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // デフォルトのフォーム送信を抑制
        setFormError(null); // エラーメッセージをリセット

        // 簡単なバリデーション
        if (!name || !categoryId || !unitId) {
            setFormError('Name, Category, and Unit are required.');
            return;
        }

        // 送信するデータを作成 (ProductInput 型)
        const productData: ProductInput = {
            name,
            category_id: Number(categoryId), // number 型に変換
            unit_id: Number(unitId),         // number 型に変換
            manufacturer_id: manufacturerId ? Number(manufacturerId) : null,
            origin_id: originId ? Number(originId) : null,
        };

        // useMutation の mutate 関数を実行して API に POST リクエスト
        mutate(productData);
    };

    // --- ローディング表示 ---
    const isLoadingDropdownData = isLoadingCategories || isLoadingUnits || isLoadingManufacturers || isLoadingOrigins;

    // --- JSX (フォームのレンダリング) ---
    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Product
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <Stack spacing={2}>
                    {/* Name Input */}
                    <TextField
                        variant="outlined" margin="normal" required fullWidth autoFocus
                        id="name" label="Product Name" name="name"
                        value={name} onChange={(e) => setName(e.target.value)}
                        disabled={isPending || isLoadingDropdownData}
                        error={!!formError && !name}
                        helperText={(!!formError && !name) ? "Name is required" : ""}
                    />
            
                    {/* Category Select */}
                    <FormControl fullWidth margin="normal" required disabled={isPending || isLoadingDropdownData} error={!!formError && !categoryId}>
                        <InputLabel id="category-select-label">Category</InputLabel>
                        <Select
                            labelId="category-select-label"
                            id="category-select"
                            value={categoryId}
                            label="Category" // これが InputLabel と連動して表示を調整
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
                    <FormControl fullWidth margin="normal" required disabled={isPending || isLoadingDropdownData} error={!!formError && !unitId}>
                        <InputLabel id="unit-select-label">Unit</InputLabel>
                        <Select
                            labelId="unit-select-label"
                            id="unit-select"
                            value={unitId}
                            label="Unit"
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
                    <FormControl fullWidth margin="normal" disabled={isPending || isLoadingDropdownData}>
                        <InputLabel id="manufacturer-select-label">Manufacturer (Optional)</InputLabel>
                        <Select
                            labelId="manufacturer-select-label"
                            id="manufacturer-select"
                            value={manufacturerId}
                            label="Manufacturer (Optional)"
                            onChange={(e) => handleSelectChange(e as SelectChangeEvent<number | ''>, setManufacturerId)}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {manufacturers?.map((manufacturer) => (
                                <MenuItem key={manufacturer.id} value={manufacturer.id}>{manufacturer.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
            
                    {/* Origin Select (Optional) */}
                    <FormControl fullWidth margin="normal" disabled={isPending || isLoadingDropdownData}>
                        <InputLabel id="origin-select-label">Origin (Optional)</InputLabel>
                        <Select
                            labelId="origin-select-label"
                            id="origin-select"
                            value={originId}
                            label="Origin (Optional)"
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
                    {/* フォーム固有のエラーで、フィールドに直接関連しないもの */}
                    {formError && (name && categoryId && unitId) && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}
            
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button variant="outlined" onClick={() => navigate('/products')} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={isPending || isLoadingDropdownData} sx={{ position: 'relative' }}>
                            {isPending ? 'Saving...' : 'Save Product'}
                            {isPending && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px', color: 'primary.contrastText' }} />}
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Container>
    );
};

export default ProductCreatePage;
