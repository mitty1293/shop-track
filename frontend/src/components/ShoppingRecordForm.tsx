import React, { useState, useEffect } from 'react';
import {
    ShoppingRecord, PatchedShoppingRecordInput,
    Product, Store
} from '../api/client';

// --- Material UI ---
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
import Typography from '@mui/material/Typography'; // For endAdornment
import FormHelperText from '@mui/material/FormHelperText';

// --- Props の型定義 ---
interface ShoppingRecordFormProps {
    initialData?: ShoppingRecord;
    products?: Product[];
    stores?: Store[];
    isLoadingDropdowns?: boolean;
    onSubmit: (data: PatchedShoppingRecordInput) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    submitError?: string | null;
}

const ShoppingRecordForm: React.FC<ShoppingRecordFormProps> = ({
    initialData,
    products,
    stores,
    isLoadingDropdowns = false,
    onSubmit,
    onCancel,
    isSubmitting = false,
    submitError,
}) => {
    // --- フォームの内部状態 ---
    const [productId, setProductId] = useState<number | ''>('');
    const [storeId, setStoreId] = useState<number | ''>('');
    const [purchaseDate, setPurchaseDate] = useState<string>('');
    const [price, setPrice] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<string>('');
    const [formError, setFormError] = useState<string | null>(null);

    // --- 初期値の設定 ---
    useEffect(() => {
        if (initialData) {
            setProductId(initialData.product?.id ?? '');
            setStoreId(initialData.store?.id ?? '');
            setPurchaseDate(initialData.purchase_date ?? '');
            setPrice(initialData.price ?? '');
            setQuantity(initialData.quantity ?? '');
        } else {
            // 作成モード時はリセット
            setProductId('');
            setStoreId('');
            setPurchaseDate('');
            setPrice('');
            setQuantity('');
        }
    }, [initialData]);

    // --- Select 変更ハンドラ ---
    const handleSelectChange = (event: SelectChangeEvent<number | ''>, setter: React.Dispatch<React.SetStateAction<number | ''>>) => {
        setter(event.target.value as (number | ''));
    };

    // --- 送信処理 ---
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        if (!productId || !storeId || !purchaseDate || price === '' || !quantity) {
            setFormError('All fields are required (price can be 0).');
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

        const recordData: PatchedShoppingRecordInput = {
            product_id: Number(productId),
            store_id: Number(storeId),
            purchase_date: purchaseDate,
            price: Number(price),
            quantity: quantity,
        };
        onSubmit(recordData);
    };

    const disableFormElements = isSubmitting || isLoadingDropdowns;
    const selectedProduct = products?.find(p => p.id === productId);

    // --- JSX ---
    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Stack spacing={2}>
                {/* Product Select */}
                <FormControl fullWidth margin="normal" required disabled={disableFormElements} error={!!formError && !productId}>
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
                    {(!!formError && !productId) && <FormHelperText>Product is required</FormHelperText>}
                </FormControl>

                {/* Store Select */}
                <FormControl fullWidth margin="normal" required disabled={disableFormElements} error={!!formError && !storeId}>
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
                    {(!!formError && !storeId) && <FormHelperText>Store is required</FormHelperText>}
                </FormControl>

                {/* Purchase Date */}
                <TextField
                    variant="outlined" margin="normal" required fullWidth
                    id="purchaseDate" label="Purchase Date" type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
                    disabled={disableFormElements}
                    error={!!formError && !purchaseDate}
                    helperText={(!!formError && !purchaseDate) ? "Purchase Date is required" : ""}
                />

                {/* Price */}
                <TextField
                    variant="outlined" margin="normal" required fullWidth
                    id="price" label="Price" type="number"
                    slotProps={{ htmlInput: { min: 0, step: "1" } }}
                    value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={disableFormElements}
                    error={!!formError && (price === '' || (typeof price === 'number' && price < 0))}
                    helperText={(!!formError && (price === '' || (typeof price === 'number' && price < 0))) ? "Price must be a non-negative number" : ""}
                />

                {/* Quantity */}
                <TextField
                    variant="outlined" margin="normal" required fullWidth
                    id="quantity" label="Quantity" type="number"
                    slotProps={{
                        input: {
                            endAdornment: <Typography variant="caption" sx={{ ml: 0.5 }}>{selectedProduct?.unit?.name ?? ''}</Typography>,
                            inputProps: { min: 0, step: "any" }
                        }
                    }}
                    value={quantity} onChange={(e) => setQuantity(e.target.value)}
                    disabled={disableFormElements}
                    error={!!formError && (!quantity || (isNaN(Number(quantity)) || Number(quantity) <= 0))}
                    helperText={(!!formError && (!quantity || (isNaN(Number(quantity)) || Number(quantity) <= 0))) ? "Quantity must be a positive number" : ""}
                />

                {submitError && ( <Alert severity="error" sx={{ mt: 1 }}>{submitError}</Alert> )}
                {formError && (productId && storeId && purchaseDate && price !== '' && quantity) && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={disableFormElements} sx={{ position: 'relative' }}>
                        {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Save Record')}
                        {isSubmitting && (
                            <CircularProgress size={24} sx={{ color: 'primary.contrastText', position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />
                        )}
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
};

export default ShoppingRecordForm;
