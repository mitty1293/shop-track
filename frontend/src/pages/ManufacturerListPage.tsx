import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getManufacturers, deleteManufacturer } from '../api/client';

const ManufacturerListPage: React.FC = () => {
    const queryClient = useQueryClient();

    // --- 一覧の取得 (useQuery) ---
    const { data: manufacturers, isLoading, isError, error } = useQuery({
        queryKey: ['manufacturers'], // ★ クエリキー
        queryFn: getManufacturers,   // ★ 取得関数
    });

    // --- 削除処理 (useMutation) ---
    const { mutate, isPending: isDeleting, variables: deletingId } = useMutation({
        mutationFn: deleteManufacturer, // ★ 削除関数
        onSuccess: (_, id) => {
        console.log(`Manufacturer (ID: ${id}) deleted successfully`);
        queryClient.invalidateQueries({ queryKey: ['manufacturers'] }); // ★ クエリキー
        },
        onError: (err, id) => {
        console.error(`Error deleting manufacturer (ID: ${id}):`, err);
        alert(`Error deleting manufacturer: ${err instanceof Error ? err.message : 'Unknown error'}`);
        },
    });

    // --- 削除ボタンのクリックハンドラ ---
    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Delete manufacturer "${name}" (ID: ${id})?`)) {
        mutate(id);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;

    return (
        <div>
            <h1>Manufacturers</h1>
            <p><Link to="/manufacturers/new"><button>Add New Manufacturer</button></Link></p>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {manufacturers?.map((manufacturer) => (
                        <tr key={manufacturer.id}>
                            <td>{manufacturer.id}</td>
                            <td>{manufacturer.name}</td>
                            <td>
                                <Link to={`/manufacturers/${manufacturer.id}/edit`}><button>Edit</button></Link>
                                {' '}
                                <button
                                    onClick={() => handleDelete(manufacturer.id, manufacturer.name)}
                                    disabled={isDeleting && deletingId === manufacturer.id}
                                >
                                {isDeleting && deletingId === manufacturer.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default ManufacturerListPage;
