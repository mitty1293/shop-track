import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getManufacturerById, updateManufacturer, PatchedManufacturerInput } from '../api/client';

const ManufacturerEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const manufacturerId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // 編集対象のデータを取得
    const { data: manufacturerData, isLoading, isError, error } = useQuery({
        queryKey: ['manufacturers', manufacturerId],
        queryFn: () => getManufacturerById(manufacturerId),
        enabled: !!manufacturerId && !isNaN(manufacturerId),
    });

    // --- フォームの初期値を設定 (React: useEffect) ---
    useEffect(() => { if (manufacturerData) setName(manufacturerData.name); }, [manufacturerData]);

    // --- 更新処理 (Tanstack Query: useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedManufacturerInput) => updateManufacturer(manufacturerId, data),
        onSuccess: (data) => {
            console.log('Manufacturer updated:', data);
            queryClient.invalidateQueries({ queryKey: ['manufacturers', manufacturerId] });
            queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
            navigate('/manufacturers');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォーム送信時の処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!name) { setFormError('Name is required.'); return; }
        const patchedData: PatchedManufacturerInput = { name };
        mutate(patchedData);
    };

    // --- レンダリング前のローディング・エラーチェック ---
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;
    if (!manufacturerData) return <div>Manufacturer not found.</div>;

    return (
        <div>
            <h1>Edit Manufacturer (ID: {manufacturerId})</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={isPending} />
                </div>
                {formError && <div style={{ color: 'red' }}>{formError}</div>}
                {mutationError && <div style={{ color: 'red' }}>{mutationError.message}</div>}
                <button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => navigate('/manufacturers')} disabled={isPending}>Cancel</button>
            </form>
        </div>
    );
};
export default ManufacturerEditPage;
