import React, { useState, useEffect } from 'react';
import {
    Product, PatchedProductInput,
    Category, Unit, Manufacturer, Origin
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
import FormHelperText from '@mui/material/FormHelperText'; // エラー表示用

// --- Props の型定義 ---
interface ProductFormProps {
    initialData?: Product;
    // ドロップダウン用のデータ
    categories?: Category[];
    units?: Unit[];
    manufacturers?: Manufacturer[];
    origins?: Origin[];
    isLoadingDropdowns?: boolean; // ドロップダウンデータロード中フラグ
    // コールバックと状態
    onSubmit: (data: PatchedProductInput) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    submitError?: string | null;
}

const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    categories, units, manufacturers, origins,
    isLoadingDropdowns = false,
    onSubmit,
    onCancel,
    isSubmitting = false,
    submitError,
}) => {
    // --- フォームの内部状態 ---
    const [name, setName] = useState<string>('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [unitId, setUnitId] = useState<number | ''>('');
    const [manufacturerId, setManufacturerId] = useState<number | ''>('');
    const [originId, setOriginId] = useState<number | ''>('');
    const [formError, setFormError] = useState<string | null>(null);

    // --- 初期値の設定 ---
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCategoryId(initialData.category?.id ?? '');
            setUnitId(initialData.unit?.id ?? '');
            setManufacturerId(initialData.manufacturer?.id ?? '');
            setOriginId(initialData.origin?.id ?? '');
        } else {
            // 作成モードの場合はリセット (念のため)
            setName('');
            setCategoryId('');
            setUnitId('');
            setManufacturerId('');
            setOriginId('');
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
        if (!name || !categoryId || !unitId) {
            setFormError('Name, Category, and Unit are required.');
            return;
        }
        const productData: PatchedProductInput = {
            name,
            category_id: Number(categoryId),
            unit_id: Number(unitId),
            manufacturer_id: manufacturerId ? Number(manufacturerId) : null,
            origin_id: originId ? Number(originId) : null,
        };
        onSubmit(productData);
    };

    const disableFormElements = isSubmitting || isLoadingDropdowns;

    // --- JSX ---
    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Stack spacing={2}>
                <TextField
                    variant="outlined" margin="normal" required fullWidth autoFocus
                    id="name" label="Product Name" name="name"
                    value={name} onChange={(e) => setName(e.target.value)}
                    disabled={disableFormElements}
                    error={!!formError && !name}
                    helperText={(!!formError && !name) ? formError : ""}
                />

                {/* Category Select */}
                <FormControl fullWidth margin="normal" required disabled={disableFormElements} error={!!formError && !categoryId}>
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
                    {(!!formError && !categoryId) && <FormHelperText>Category is required</FormHelperText>}
                </FormControl>

                {/* Unit Select */}
                <FormControl fullWidth margin="normal" required disabled={disableFormElements} error={!!formError && !unitId}>
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
                    {(!!formError && !unitId) && <FormHelperText>Unit is required</FormHelperText>}
                </FormControl>

                {/* Manufacturer Select (Optional) */}
                <FormControl fullWidth margin="normal" disabled={disableFormElements}>
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
                <FormControl fullWidth margin="normal" disabled={disableFormElements}>
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

                {submitError && (
                    <Alert severity="error" sx={{ mt: 1 }}>{submitError}</Alert>
                )}
                {formError && (name && categoryId && unitId) && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={disableFormElements} sx={{ position: 'relative' }}>
                        {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Save Product')}
                        {isSubmitting && (
                            <CircularProgress size={24} sx={{ color: 'primary.contrastText', position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />
                        )}
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
};

export default ProductForm;
