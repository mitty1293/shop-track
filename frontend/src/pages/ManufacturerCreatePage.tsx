import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createManufacturer, ManufacturerInput } from '../api/client';

const ManufacturerCreatePage: React.FC = () => {
    const [name, setName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: createManufacturer,
        onSuccess: (data) => {
            console.log('Manufacturer created:', data);
            queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
            navigate('/manufacturers');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォームのサブミット処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!name) { setFormError('Name is required.'); return; }
        const manufacturerData: ManufacturerInput = { name };
        mutate(manufacturerData);
    };

    return (
        <div>
            <h1>Create New Manufacturer</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={isPending} />
                </div>
                {formError && <div style={{ color: 'red' }}>{formError}</div>}
                {mutationError && <div style={{ color: 'red' }}>{mutationError.message}</div>}
                <button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => navigate('/manufacturers')} disabled={isPending}>Cancel</button>
            </form>
        </div>
    );
};
export default ManufacturerCreatePage;
