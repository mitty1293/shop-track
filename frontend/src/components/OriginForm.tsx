import React, { useState, useEffect } from 'react';
import { Origin, PatchedOriginInput } from '../api/client';

// --- Material UI ---
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// --- Props の型定義 ---
interface OriginFormProps {
    // 初期データ (編集モード用、作成モードでは undefined)
    initialData?: Origin;
    // フォーム送信時の処理 (親コンポーネントから渡される)
    onSubmit: (data: PatchedOriginInput) => void;
    // キャンセル時の処理 (親コンポーネントから渡される)
    onCancel: () => void;
    // 送信処理中かどうか (親から渡される isPending)
    isSubmitting?: boolean;
    // 親コンポーネントの Mutation からのエラー
    submitError?: string | null;
}

const OriginForm: React.FC<OriginFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting = false, // デフォルトは false
    submitError,
}) => {
    // --- フォームの内部状態 ---
    const [name, setName] = useState<string>('');
    const [formError, setFormError] = useState<string | null>(null);

    // --- 初期値の設定 ---
    // initialData が変更されたとき (主に編集モードでのデータロード時) に実行
    useEffect(() => {
        if (initialData) {
        setName(initialData.name);
        } else {
        // 作成モードやデータがクリアされた場合はリセット
        setName('');
        }
    }, [initialData]); // initialData を依存配列に

    // --- 送信処理 ---
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null); // ローカルエラーをリセット
        if (!name) {
            setFormError('Name is required.');
            return;
        }
        // 親コンポーネントに処理を委譲 (送信データは Patched 型で渡す)
        onSubmit({ name });
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
                    label="Origin Name"
                    name="name"
                    autoComplete="origin-name"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    error={!!formError && !name}
                    helperText={(!!formError && !name) ? formError : ""}
                />

                {/* 親からのエラー (APIエラーなど) */}
                {submitError && (
                    <Alert severity="error" sx={{ mt: 1 }}>{submitError}</Alert>
                )}
                {/* ローカルのフォームエラー */}
                {formError && name && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}


                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={onCancel} // 親から渡されたキャンセル処理
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
                        {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Save Origin')}
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

export default OriginForm;
