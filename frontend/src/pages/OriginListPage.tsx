import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getOrigins, deleteOrigin } from '../api/client';

const OriginListPage: React.FC = () => {
    const queryClient = useQueryClient();

    // --- 一覧の取得 (useQuery) ---
    const { data: origins, isLoading, isError, error } = useQuery({
        queryKey: ['origins'], // ★ クエリキー
        queryFn: getOrigins,   // ★ 取得関数
    });

    // --- 削除処理 (useMutation) ---
    const { mutate, isPending: isDeleting, variables: deletingId } = useMutation({
        mutationFn: deleteOrigin, // ★ 削除関数
        onSuccess: (_, id) => {
        console.log(`Origin (ID: ${id}) deleted successfully`);
        queryClient.invalidateQueries({ queryKey: ['origins'] }); // ★ クエリキー
        },
        onError: (err, id) => {
        console.error(`Error deleting origin (ID: ${id}):`, err);
        alert(`Error deleting origin: ${err instanceof Error ? err.message : 'Unknown error'}`);
        },
    });

    // --- 削除ボタンのクリックハンドラ ---
    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Delete origin "${name}" (ID: ${id})?`)) {
        mutate(id);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;

    return (
        <div>
            <h1>Origins</h1>
            <p><Link to="/origins/new"><button>Add New Origin</button></Link></p>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {origins?.map((origin) => (
                        <tr key={origin.id}>
                            <td>{origin.id}</td>
                            <td>{origin.name}</td>
                            <td>
                                <Link to={`/origins/${origin.id}/edit`}><button>Edit</button></Link>
                                {' '}
                                <button
                                    onClick={() => handleDelete(origin.id, origin.name)}
                                    disabled={isDeleting && deletingId === origin.id}
                                >
                                {isDeleting && deletingId === origin.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default OriginListPage;
