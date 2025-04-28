import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getUnitById, updateUnit, PatchedUnitInput } from '../api/client';

const UnitEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const unitId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // 編集対象のデータを取得
    const { data: unitData, isLoading, isError, error } = useQuery({
        queryKey: ['units', unitId],
        queryFn: () => getUnitById(unitId),
        enabled: !!unitId && !isNaN(unitId),
    });

    // --- フォームの初期値を設定 (React: useEffect) ---
    useEffect(() => { if (unitData) setName(unitData.name); }, [unitData]);

    // --- 更新処理 (Tanstack Query: useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedUnitInput) => updateUnit(unitId, data),
        onSuccess: (data) => {
            console.log('Unit updated:', data);
            queryClient.invalidateQueries({ queryKey: ['units', unitId] });
            queryClient.invalidateQueries({ queryKey: ['units'] });
            navigate('/units');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォーム送信時の処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!name) { setFormError('Name is required.'); return; }
        const patchedData: PatchedUnitInput = { name };
        mutate(patchedData);
    };

    // --- レンダリング前のローディング・エラーチェック ---
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;
    if (!unitData) return <div>Unit not found.</div>;

    return (
        <div>
            <h1>Edit Unit (ID: {unitId})</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={isPending} />
                </div>
                {formError && <div style={{ color: 'red' }}>{formError}</div>}
                {mutationError && <div style={{ color: 'red' }}>{mutationError.message}</div>}
                <button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => navigate('/units')} disabled={isPending}>Cancel</button>
            </form>
        </div>
    );
};
export default UnitEditPage;
