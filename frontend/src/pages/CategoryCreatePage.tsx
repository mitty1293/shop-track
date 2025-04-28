import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createCategory, CategoryInput } from '../api/client';

const CategoryCreatePage: React.FC = () => {
    const [name, setName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: createCategory,
        onSuccess: (data) => {
            console.log('Category created:', data);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            navigate('/categories');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォームのサブミット処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!name) { setFormError('Name is required.'); return; }
        const categoryData: CategoryInput = { name };
        mutate(categoryData);
    };

    return (
        <div>
            <h1>Create New Category</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={isPending} />
                </div>
                {formError && <div style={{ color: 'red' }}>{formError}</div>}
                {mutationError && <div style={{ color: 'red' }}>{mutationError.message}</div>}
                <button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => navigate('/categories')} disabled={isPending}>Cancel</button>
            </form>
        </div>
    );
};
export default CategoryCreatePage;
