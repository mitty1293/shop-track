import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
    Product,
    Store,
    getProducts,
    getStores,
    createShoppingRecord,
    ShoppingRecordInput,
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

const ShoppingRecordCreatePage: React.FC = () => {
    // --- State ---
    const [productId, setProductId] = useState<number | ''>('');
    const [storeId, setStoreId] = useState<number | ''>('');
    const [purchaseDate, setPurchaseDate] = useState<string>(''); // YYYY-MM-DD
    const [price, setPrice] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<string>('');
    const [formError, setFormError] = useState<string | null>(null);

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
        mutationFn: createShoppingRecord,
        onSuccess: (data) => {
            console.log('Shopping Record created:', data);
            queryClient.invalidateQueries({ queryKey: ['shoppingRecords'] });
            navigate('/shopping-records');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- ドロップダウンの選択変更処理 ---
    const handleSelectChange = (event: SelectChangeEvent<number | ''>, setter: React.Dispatch<React.SetStateAction<number | ''>>) => {
        setter(event.target.value as (number | ''));
    };

    // --- フォームのサブミット処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);

        // バリデーション (必須項目 + 型チェック)
        if (!productId || !storeId || !purchaseDate || price === '' || !quantity) {
            setFormError('All fields except price (can be 0) are required.');
            return;
        }
        if (isNaN(Number(price)) || Number(price) < 0) {
            setFormError('Price must be a non-negative number.');
            return;
        }
        // quantity のバリデーション (数値として有効か、など - API仕様に合わせる)
        if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
            setFormError('Quantity must be a positive number.');
            return;
        }

        const recordData: ShoppingRecordInput = {
            product_id: Number(productId),
            store_id: Number(storeId),
            purchase_date: purchaseDate,
            price: Number(price),
            quantity: quantity,
        };

        mutate(recordData);
    };

    // ローディングチェック
    const isLoadingDropdownData = isLoadingProducts || isLoadingStores;

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Add New Shopping Record
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <Stack spacing={2}>
                    {/* Product Select */}
                    <FormControl fullWidth margin="normal" required disabled={isPending || isLoadingDropdownData} error={!!formError && !productId}>
                        <InputLabel id="product-select-label">Product</InputLabel>
                        <Select
                            labelId="product-select-label"
                            id="product-select"
                            value={productId}
                            label="Product"
                            onChange={(e) => handleSelectChange(e as SelectChangeEvent<number | ''>, setProductId)}
                        >
                            <MenuItem value=""><em>Select Product...</em></MenuItem>
                            {products?.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                    {product.name} {product.unit ? `(${product.unit.name})` : ''}
                                </MenuItem>
                            ))}
                        </Select>
                        {(!!formError && !productId) && <Typography color="error" variant="caption">Product is required</Typography>}
                    </FormControl>
            
                    {/* Store Select */}
                    <FormControl fullWidth margin="normal" required disabled={isPending || isLoadingDropdownData} error={!!formError && !storeId}>
                        <InputLabel id="store-select-label">Store</InputLabel>
                        <Select
                            labelId="store-select-label"
                            id="store-select"
                            value={storeId}
                            label="Store"
                            onChange={(e) => handleSelectChange(e as SelectChangeEvent<number | ''>, setStoreId)}
                        >
                            <MenuItem value=""><em>Select Store...</em></MenuItem>
                            {stores?.map((store) => (
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
                        id="purchaseDate"
                        label="Purchase Date"
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        disabled={isPending || isLoadingDropdownData}
                        slotProps={{
                            inputLabel: {
                                shrink: true // InputLabel コンポーネントに shrink: true を渡す
                            }
                        }}
                        error={!!formError && !purchaseDate}
                        helperText={(!!formError && !purchaseDate) ? "Purchase Date is required" : ""}
                    />
            
                    {/* Price */}
                    <TextField
                        variant="outlined" margin="normal" required fullWidth
                        id="price"
                        label="Price"
                        type="number"
                        slotProps={{
                            htmlInput: { // ネイティブのHTML <input> 要素そのものに渡す属性
                                min: 0,
                                step: "1"
                            }
                        }}
                        value={price}
                        onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        disabled={isPending || isLoadingDropdownData}
                        error={!!formError && (price === '' || (typeof price === 'number' && price < 0))}
                        helperText={(!!formError && (price === '' || (typeof price === 'number' && price < 0))) ? "Price must be a non-negative number" : ""}
                    />
            
                    {/* Quantity */}
                    <TextField
                        variant="outlined" margin="normal" required fullWidth
                        id="quantity"
                        label="Quantity"
                        type="number"
                        slotProps={{
                            input: { // TextField がラップする Input コンポーネント (OutlinedInputなど) への Props
                                // 入力の末尾に単位を表示するための endAdornment を設定したいのでネイティブのHTML <input> 要素を示すhtmlInputではなく、inputを使用
                                endAdornment: <Typography variant="caption" sx={{ ml: 0.5 }}>{products?.find(p => p.id === productId)?.unit?.name ?? ''}</Typography>,
                                // Input コンポーネント自体が持つ inputProps (ネイティブ input 属性用)
                                inputProps: {
                                    min: 0,
                                    step: "any"
                                }
                            }
                        }}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        disabled={isPending || isLoadingDropdownData}
                        error={!!formError && (!quantity || (isNaN(Number(quantity)) || Number(quantity) <= 0))}
                        helperText={(!!formError && (!quantity || (isNaN(Number(quantity)) || Number(quantity) <= 0))) ? "Quantity must be a positive number" : ""}
                    />
            
                    {mutationError && (
                        <Alert severity="error" sx={{ mt: 1 }}>{mutationError.message}</Alert>
                    )}
                    {formError && (productId && storeId && purchaseDate && price !== '' && quantity) && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}
            
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button variant="outlined" onClick={() => navigate('/shopping-records')} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={isPending || isLoadingDropdownData} sx={{ position: 'relative' }}>
                            {isPending ? 'Saving...' : 'Save Record'}
                            {isPending && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px', color: 'primary.contrastText' }} />}
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Container>
      );
};

export default ShoppingRecordCreatePage;
