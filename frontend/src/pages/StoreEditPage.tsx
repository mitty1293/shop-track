import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getStoreById, updateStore, PatchedStoreInput } from '../api/client';

const StoreEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const storeId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // 編集対象のデータを取得
    const { data: storeData, isLoading, isError, error } = useQuery({
        queryKey: ['stores', storeId],
        queryFn: () => getStoreById(storeId),
        enabled: !!storeId && !isNaN(storeId),
    });

    // --- フォームの初期値を設定 (React: useEffect) ---
    useEffect(() => {
        if (storeData) {
            setName(storeData.name);
            setLocation(storeData.location);
        }
    }, [storeData]);

    // --- 更新処理 (Tanstack Query: useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedStoreInput) => updateStore(storeId, data),
        onSuccess: (data) => {
            console.log('Store updated:', data);
            queryClient.invalidateQueries({ queryKey: ['stores', storeId] });
            queryClient.invalidateQueries({ queryKey: ['stores'] });
            navigate('/stores');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォーム送信時の処理 ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!name || !location) { setFormError('Name and Location are required.'); return; }
        const patchedData: PatchedStoreInput = { name, location };
        mutate(patchedData);
    };

    // --- レンダリング前のローディング・エラーチェック ---
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;
    if (!storeData) return <div>Store not found.</div>;

    return (
        <div>
            <h1>Edit Store (ID: {storeId})</h1>
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
                <button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => navigate('/stores')} disabled={isPending}>Cancel</button>
            </form>
        </div>
    );
};
export default StoreEditPage;
