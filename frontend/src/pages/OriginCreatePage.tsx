import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createOrigin, OriginInput } from '../api/client';

const OriginCreatePage: React.FC = () => {
    const [name, setName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- 作成処理 (useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: createOrigin,
        onSuccess: (data) => {
            console.log('Origin created:', data);
            queryClient.invalidateQueries({ queryKey: ['origins'] });
            navigate('/origins');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォームのサブミット処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!name) { setFormError('Name is required.'); return; }
        const originData: OriginInput = { name };
        mutate(originData);
    };

    return (
        <div>
            <h1>Create New Origin</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={isPending} />
                </div>
                {formError && <div style={{ color: 'red' }}>{formError}</div>}
                {mutationError && <div style={{ color: 'red' }}>{mutationError.message}</div>}
                <button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => navigate('/origins')} disabled={isPending}>Cancel</button>
            </form>
        </div>
    );
};
export default OriginCreatePage;
