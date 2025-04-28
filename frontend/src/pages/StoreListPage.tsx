import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getStores, deleteStore } from '../api/client';

const StoreListPage: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: stores, isLoading, isError, error } = useQuery({
        queryKey: ['stores'], // ★ クエリキー
        queryFn: getStores,   // ★ 取得関数
    });

    const { mutate, isPending: isDeleting, variables: deletingId } = useMutation({
        mutationFn: deleteStore, // ★ 削除関数
        onSuccess: (_, id) => {
        console.log(`Store (ID: ${id}) deleted successfully`);
        queryClient.invalidateQueries({ queryKey: ['stores'] }); // ★ クエリキー
        },
        onError: (err, id) => {
        console.error(`Error deleting store (ID: ${id}):`, err);
        alert(`Error deleting store: ${err instanceof Error ? err.message : 'Unknown error'}`);
        },
    });

    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Delete store "${name}" (ID: ${id})?`)) {
        mutate(id);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;

    return (
        <div>
            <h1>Stores</h1>
            <p><Link to="/stores/new"><button>Add New Store</button></Link></p>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {stores?.map((store) => (
                        <tr key={store.id}>
                            <td>{store.id}</td>
                            <td>{store.name}</td>
                            <td>{store.location}</td>
                            <td>
                                <Link to={`/stores/${store.id}/edit`}><button>Edit</button></Link>{' '}
                                <button
                                    onClick={() => handleDelete(store.id, store.name)}
                                    disabled={isDeleting && deletingId === store.id}
                                >
                                    {isDeleting && deletingId === store.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default StoreListPage;
