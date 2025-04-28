import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getCategories, deleteCategory } from '../api/client';

const CategoryListPage: React.FC = () => {
    const queryClient = useQueryClient();

    // --- 一覧の取得 (useQuery) ---
    const { data: categories, isLoading, isError, error } = useQuery({
        queryKey: ['categories'], // ★ クエリキー
        queryFn: getCategories,   // ★ 取得関数
    });

    // --- 削除処理 (useMutation) ---
    const { mutate, isPending: isDeleting, variables: deletingId } = useMutation({
        mutationFn: deleteCategory, // ★ 削除関数
        onSuccess: (_, id) => {
        console.log(`Category (ID: ${id}) deleted successfully`);
        queryClient.invalidateQueries({ queryKey: ['categories'] }); // ★ クエリキー
        },
        onError: (err, id) => {
        console.error(`Error deleting category (ID: ${id}):`, err);
        alert(`Error deleting category: ${err instanceof Error ? err.message : 'Unknown error'}`);
        },
    });

    // --- 削除ボタンのクリックハンドラ ---
    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Delete category "${name}" (ID: ${id})?`)) {
        mutate(id);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;

    return (
        <div>
            <h1>Categories</h1>
            <p><Link to="/categories/new"><button>Add New Category</button></Link></p>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories?.map((category) => (
                        <tr key={category.id}>
                            <td>{category.id}</td>
                            <td>{category.name}</td>
                            <td>
                                <Link to={`/categories/${category.id}/edit`}><button>Edit</button></Link>
                                {' '}
                                <button
                                    onClick={() => handleDelete(category.id, category.name)}
                                    disabled={isDeleting && deletingId === category.id}
                                >
                                {isDeleting && deletingId === category.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default CategoryListPage;
