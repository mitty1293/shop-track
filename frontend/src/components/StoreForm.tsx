import React, { useState, useEffect } from 'react';
import { Store, PatchedStoreInput } from '../api/client';

// --- Material UI ---
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// --- Props の型定義 ---
interface StoreFormProps {
    initialData?: Store;
    onSubmit: (data: PatchedStoreInput) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    submitError?: string | null;
}

const StoreForm: React.FC<StoreFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting = false,
    submitError,
}) => {
    // --- フォームの内部状態 (name と location) ---
    const [name, setName] = useState<string>('');
    const [location, setLocation] = useState<string>(''); // location の state を追加
    const [formError, setFormError] = useState<string | null>(null);

    // --- 初期値の設定 ---
    useEffect(() => {
        if (initialData) {
        setName(initialData.name);
        setLocation(initialData.location); // location も初期化
        } else {
        setName('');
        setLocation(''); // location もリセット
        }
    }, [initialData]);

    // --- 送信処理 ---
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        // name と location の両方を必須チェック
        if (!name || !location) {
            setFormError('Name and Location are required.');
            return;
        }
        // 送信データに location も含める
        onSubmit({ name, location });
    };

    // --- JSX ---
    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Stack spacing={2}>
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Store Name"
                    name="name"
                    autoComplete="store-name"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    error={!!formError && !name}
                    helperText={(!!formError && !name) ? "Name is required" : ""}
                />
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="location"
                    label="Location"
                    name="location"
                    autoComplete="store-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isSubmitting}
                    error={!!formError && !location}
                    helperText={(!!formError && !location) ? "Location is required" : ""}
                />

                {submitError && (
                    <Alert severity="error" sx={{ mt: 1 }}>{submitError}</Alert>
                )}
                {formError && (name && location) && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}


                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{ position: 'relative' }}
                    >
                        {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Save Store')}
                        {isSubmitting && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    color: 'primary.contrastText',
                                    position: 'absolute', top: '50%', left: '50%',
                                    marginTop: '-12px', marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
};

export default StoreForm;
