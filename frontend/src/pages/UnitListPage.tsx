import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getUnits, deleteUnit } from '../api/client';

const UnitListPage: React.FC = () => {
    const queryClient = useQueryClient();

    // --- 一覧の取得 (useQuery) ---
    const { data: units, isLoading, isError, error } = useQuery({
        queryKey: ['units'], // ★ クエリキー
        queryFn: getUnits,   // ★ 取得関数
    });

    // --- 削除処理 (useMutation) ---
    const { mutate, isPending: isDeleting, variables: deletingId } = useMutation({
        mutationFn: deleteUnit, // ★ 削除関数
        onSuccess: (_, id) => {
        console.log(`Unit (ID: ${id}) deleted successfully`);
        queryClient.invalidateQueries({ queryKey: ['units'] }); // ★ クエリキー
        },
        onError: (err, id) => {
        console.error(`Error deleting unit (ID: ${id}):`, err);
        alert(`Error deleting unit: ${err instanceof Error ? err.message : 'Unknown error'}`);
        },
    });

    // --- 削除ボタンのクリックハンドラ ---
    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Delete unit "${name}" (ID: ${id})?`)) {
        mutate(id);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;

    return (
        <div>
            <h1>Units</h1>
            <p><Link to="/units/new"><button>Add New Unit</button></Link></p>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {units?.map((unit) => (
                        <tr key={unit.id}>
                            <td>{unit.id}</td>
                            <td>{unit.name}</td>
                            <td>
                                <Link to={`/units/${unit.id}/edit`}><button>Edit</button></Link>
                                {' '}
                                <button
                                    onClick={() => handleDelete(unit.id, unit.name)}
                                    disabled={isDeleting && deletingId === unit.id}
                                >
                                {isDeleting && deletingId === unit.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default UnitListPage;
