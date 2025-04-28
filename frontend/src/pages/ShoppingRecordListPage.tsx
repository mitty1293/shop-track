import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getShoppingRecords, deleteShoppingRecord, ShoppingRecord } from '../api/client';

const ShoppingRecordListPage: React.FC = () => {
    const queryClient = useQueryClient();

    // 購買記録一覧データを取得
    const { data: records, isLoading, isError, error } = useQuery<ShoppingRecord[], Error>({
        queryKey: ['shoppingRecords'],
        queryFn: getShoppingRecords,
    });

    // 削除処理 (useMutation)
    const { mutate, isPending: isDeleting, variables: deletingId } = useMutation({
        mutationFn: deleteShoppingRecord,
        onSuccess: (_, id) => {
            console.log(`Shopping Record (ID: ${id}) deleted successfully`);
            queryClient.invalidateQueries({ queryKey: ['shoppingRecords'] });
        },
        onError: (err, id) => {
            console.error(`Error deleting shopping record (ID: ${id}):`, err);
            alert(`Error deleting shopping record: ${err instanceof Error ? err.message : 'Unknown error'}`);
        },
    });

    // 削除ボタンのクリックハンドラ
    const handleDelete = (id: number, recordDescription: string) => {
        // 確認ダイアログを表示
        if (window.confirm(`Delete record "${recordDescription}" (ID: ${id})?`)) {
            mutate(id);
        }
    };

    // ローディング中の表示
    if (isLoading) {
        return <div>Loading shopping records...</div>;
    }

    // エラー発生時の表示
    if (isError) {
        return <div>Error fetching records: {error instanceof Error ? error.message : 'Unknown error'}</div>;
    }

    return (
        <div>
            <h1>Shopping Records</h1>
            <p>
                <Link to="/shopping-records/new">Add New Record</Link>
            </p>
            {(!records || records.length === 0) ? (
                <p>The records has not yet been registered.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product</th>
                            <th>Store</th>
                            <th>Purchase Date</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <tr key={record.id}>
                                <td>{record.id}</td>
                                <td>{record.product?.name ?? 'N/A'}</td>
                                <td>{record.store?.name ?? 'N/A'}</td>
                                <td>{record.purchase_date}</td>
                                <td>{record.price}</td>
                                <td>{record.quantity} {record.product?.unit?.name ?? ''}</td>
                                <td>
                                    <Link to={`/shopping-records/${record.id}/edit`}>
                                        <button>Edit</button>
                                    </Link>
                                    {' '}
                                    <button
                                        onClick={() => handleDelete(record.id, `${record.product?.name} on ${record.purchase_date}`)}
                                        disabled={isDeleting && deletingId === record.id}
                                    >
                                        {isDeleting && deletingId === record.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ShoppingRecordListPage;
