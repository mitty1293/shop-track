import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getOriginById, updateOrigin, PatchedOriginInput } from '../api/client';

const OriginEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const originId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // 編集対象のデータを取得
    const { data: originData, isLoading, isError, error } = useQuery({
        queryKey: ['origins', originId],
        queryFn: () => getOriginById(originId),
        enabled: !!originId && !isNaN(originId),
    });

    // --- フォームの初期値を設定 (React: useEffect) ---
    useEffect(() => { if (originData) setName(originData.name); }, [originData]);

    // --- 更新処理 (Tanstack Query: useMutation) ---
    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: (data: PatchedOriginInput) => updateOrigin(originId, data),
        onSuccess: (data) => {
            console.log('Origin updated:', data);
            queryClient.invalidateQueries({ queryKey: ['origins', originId] });
            queryClient.invalidateQueries({ queryKey: ['origins'] });
            navigate('/origins');
        },
        onError: (error) => { setFormError(error.message); },
    });

    // --- フォーム送信時の処理 ---
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        if (!name) { setFormError('Name is required.'); return; }
        const patchedData: PatchedOriginInput = { name };
        mutate(patchedData);
    };

    // --- レンダリング前のローディング・エラーチェック ---
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;
    if (!originData) return <div>Origin not found.</div>;

    return (
        <div>
            <h1>Edit Origin (ID: {originId})</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={isPending} />
                </div>
                {formError && <div style={{ color: 'red' }}>{formError}</div>}
                {mutationError && <div style={{ color: 'red' }}>{mutationError.message}</div>}
                <button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => navigate('/origins')} disabled={isPending}>Cancel</button>
            </form>
        </div>
    );
};
export default OriginEditPage;
