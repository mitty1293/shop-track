import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createStore, StoreInput } from '../api/client';

const StoreCreatePage: React.FC = () => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: createStore,
        onSuccess: (data) => {
            console.log('Store created:', data);
            queryClient.invalidateQueries({ queryKey: ['stores'] });
            navigate('/stores');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォームのサブミット処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!name || !location) { setFormError('Name and Location are required.'); return; }
        const storeData: StoreInput = { name, location };
        mutate(storeData);
    };

    return (
        <div>
        <h1>Create New Store</h1>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Name:</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={isPending} />
            </div>
            <div>
                <label htmlFor="location">Location:</label>
                <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} disabled={isPending} />
            </div>
            {formError && <div style={{ color: 'red' }}>{formError}</div>}
            {mutationError && <div style={{ color: 'red' }}>{mutationError.message}</div>}
            <button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => navigate('/stores')} disabled={isPending}>Cancel</button>
        </form>
        </div>
    );
};
export default StoreCreatePage;
