import React, { useState, useEffect } from 'react';
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

const ShoppingRecordEditPage: React.FC = () => {
    // --- Hooks ---
    const { id } = useParams<{ id: string }>();
    const recordId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- State ---
    const [productId, setProductId] = useState<number | ''>('');
    const [storeId, setStoreId] = useState<number | ''>('');
    const [purchaseDate, setPurchaseDate] = useState<string>('');
    const [price, setPrice] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<string>('');
    const [formError, setFormError] = useState<string | null>(null);

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

    // --- フォーム初期値の設定 (useEffect) ---
    // recordData の取得が完了したら、そのデータでフォーム state を更新
    useEffect(() => {
        if (recordData) {
            // 各 state を取得したデータで更新
            setProductId(recordData.product?.id ?? '');
            setStoreId(recordData.store?.id ?? '');
            setPurchaseDate(recordData.purchase_date ?? '');
            setPrice(recordData.price ?? '');
            setQuantity(recordData.quantity ?? '');
        }
    }, [recordData]);

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
        onError: (error) => {
            setFormError(error.message);
            console.error("Update Shopping Record error:", error);
        },
    });

    // --- ドロップダウンの選択変更処理 ---
    const handleSelectChange = (event: SelectChangeEvent<number | ''>, setter: React.Dispatch<React.SetStateAction<number | ''>>) => {
        setter(event.target.value as (number | ''));
    };

    // --- フォーム送信時の処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);

        if (!productId || !storeId || !purchaseDate || price === '' || !quantity) {
            setFormError('All fields except price (can be 0) are required.');
            return;
        }
        if (isNaN(Number(price)) || Number(price) < 0) {
            setFormError('Price must be a non-negative number.');
            return;
        }
        if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
            setFormError('Quantity must be a positive number.');
            return;
        }

        // PATCH 用のデータを作成 (現在のフォームの値から)
        const patchedData: PatchedShoppingRecordInput = {
            product_id: Number(productId),
            store_id: Number(storeId),
            purchase_date: purchaseDate,
            price: Number(price),
            quantity: quantity,
        };
        mutate(patchedData);
    };

    // --- ローディング / エラー表示 ---
    const isLoading = isLoadingRecord || isLoadingProducts || isLoadingStores;

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
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <Stack spacing={2}>
                    {/* Product Select */}
                    <FormControl fullWidth margin="normal" required disabled={isPending} error={!!formError && !productId}>
                        <InputLabel id="product-select-label">Product</InputLabel>
                        <Select
                            labelId="product-select-label" id="product-select"
                            value={productId} label="Product"
                            onChange={(e) => handleSelectChange(e as SelectChangeEvent<number | ''>, setProductId)}
                        >
                            <MenuItem value=""><em>Select Product...</em></MenuItem>
                            {products?.map(product => (
                                <MenuItem key={product.id} value={product.id}>
                                {product.name} {product.unit ? `(${product.unit.name})` : ''}
                                </MenuItem>
                            ))}
                        </Select>
                        {(!!formError && !productId) && <Typography color="error" variant="caption">Product is required</Typography>}
                    </FormControl>
            
                    {/* Store Select */}
                    <FormControl fullWidth margin="normal" required disabled={isPending} error={!!formError && !storeId}>
                        <InputLabel id="store-select-label">Store</InputLabel>
                        <Select
                            labelId="store-select-label" id="store-select"
                            value={storeId} label="Store"
                            onChange={(e) => handleSelectChange(e as SelectChangeEvent<number | ''>, setStoreId)}
                        >
                            <MenuItem value=""><em>Select Store...</em></MenuItem>
                            {stores?.map(store => (
                                <MenuItem key={store.id} value={store.id}>
                                {store.name} {store.location ? `(${store.location})` : ''}
                                </MenuItem>
                            ))}
                        </Select>
                        {(!!formError && !storeId) && <Typography color="error" variant="caption">Store is required</Typography>}
                    </FormControl>
            
                    {/* Purchase Date */}
                    <TextField
                        variant="outlined" margin="normal" required fullWidth
                        id="purchaseDate" label="Purchase Date" type="date"
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
                        disabled={isPending}
                        error={!!formError && !purchaseDate}
                        helperText={(!!formError && !purchaseDate) ? "Purchase Date is required" : ""}
                    />
            
                    {/* Price */}
                    <TextField
                        variant="outlined" margin="normal" required fullWidth
                        id="price" label="Price" type="number"
                        slotProps={{ htmlInput: { min: 0, step: "1" } }}
                        value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        disabled={isPending}
                        error={!!formError && (price === '' || (typeof price === 'number' && price < 0))}
                        helperText={(!!formError && (price === '' || (typeof price === 'number' && price < 0))) ? "Price must be a non-negative number" : ""}
                    />
            
                    {/* Quantity */}
                    <TextField
                        variant="outlined" margin="normal" required fullWidth
                        id="quantity" label="Quantity" type="number"
                        slotProps={{
                            input: {
                            endAdornment: <Typography variant="caption" sx={{ ml: 0.5 }}>{products?.find(p => p.id === productId)?.unit?.name ?? ''}</Typography>,
                            inputProps: { min: 0, step: "any" }
                            }
                        }}
                        value={quantity} onChange={(e) => setQuantity(e.target.value)}
                        disabled={isPending}
                        error={!!formError && (!quantity || (isNaN(Number(quantity)) || Number(quantity) <= 0))}
                        helperText={(!!formError && (!quantity || (isNaN(Number(quantity)) || Number(quantity) <= 0))) ? "Quantity must be a positive number" : ""}
                    />
            
                    {/* Error Display */}
                    {mutationError && (
                        <Alert severity="error" sx={{ mt: 1 }}>{mutationError.message}</Alert>
                    )}
                    {formError && (productId && storeId && purchaseDate && price !== '' && quantity) && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}
            
                    {/* Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button variant="outlined" onClick={() => navigate('/shopping-records')} disabled={isPending}>
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

export default ShoppingRecordEditPage;
