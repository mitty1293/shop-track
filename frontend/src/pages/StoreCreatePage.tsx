import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createStore, PatchedStoreInput } from '../api/client';
import StoreForm from '../components/StoreForm';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const StoreCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedStoreInput) => createStore({ name: data.name || '', location: data.location || '' }),
        onSuccess: (data) => {
            console.log('Store created:', data);
            queryClient.invalidateQueries({ queryKey: ['stores'] });
            navigate('/stores');
        },
    });

    // --- フォームのサブミット処理 ---
    const handleFormSubmit = (data: PatchedStoreInput) => {
        mutate(data);
    };

    const handleCancel = () => {
        navigate('/stores');
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Store
            </Typography>
            <StoreForm
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSubmitting={isPending}
                submitError={mutationError?.message}
            />
        </Container>
    );
};
export default StoreCreatePage;
