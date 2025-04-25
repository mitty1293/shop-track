import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, deleteProduct } from '../api/client';
import { Link } from 'react-router';

const ItemsListPage: React.FC = () => {
    const queryClient = useQueryClient();

    // --- 商品一覧の取得 (useQuery) ---
    const { data: products, isLoading, isError, error } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    // --- 削除処理 (useMutation) ---
    const { mutate, isPending: isDeleting, variables: deletingId } = useMutation({
        mutationFn: deleteProduct,
        onSuccess: (data, id) => {
            console.log(`商品 (ID: ${id}) の削除成功`);
            // 商品一覧のキャッシュを無効化して再取得をトリガー
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error, id) => {
            console.error(`商品 (ID: ${id}) の削除エラー:`, error);
            // エラーメッセージを表示 (例: alert)
            alert(`商品の削除中にエラーが発生しました: ${error.message}`);
        },
    });

    // --- 削除ボタンのクリックハンドラ ---
    const handleDelete = (id: number, name: string) => {
        // 確認ダイアログを表示
        if (window.confirm(`${name}(ID: ${id}) を本当に削除しますか？`)) {
            // 確認されたら mutate 関数を実行して削除 API を呼び出す
            mutate(id);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (isError) {
        return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;
    }

    return (
        <div>
            <h1>Products</h1>
            <p>
                <Link to="/items/new">新しい商品を追加</Link>
            </p>
            {(!products || products.length === 0) ? (
                <p>The product has not yet been registered.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Unit</th>
                            <th>Manufacturer</th>
                            <th>Origin</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.category.name}</td>
                                <td>{product.unit.name}</td>
                                <td>{product.manufacturer ? product.manufacturer.name : 'N/A'}</td>
                                <td>{product.origin ? product.origin.name : 'N/A'}</td>
                                <td>
                                    <Link to={`/items/${product.id}/edit`}>
                                        <button>編集</button>
                                    </Link>
                                    {' '}
                                    <button
                                        onClick={() => handleDelete(product.id, product.name)}
                                        // 特定の ID の商品が削除中の場合にボタンを無効化
                                        disabled={isDeleting && deletingId === product.id}
                                    >
                                        {/* 削除中なら表示を変更 */}
                                        {isDeleting && deletingId === product.id ? '削除中...' : '削除'}
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

export default ItemsListPage;
