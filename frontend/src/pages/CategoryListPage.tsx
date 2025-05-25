import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getCategories, deleteCategory, Category } from '../api/client';
import ConfirmationDialog from '../components/ConfirmationDialog';

// --- Material UI ---
import Container from '@mui/material/Container'; // 全体のコンテナ
import Typography from '@mui/material/Typography'; // テキスト表示 (h1, p など)
import Button from '@mui/material/Button';       // 標準ボタン
import Table from '@mui/material/Table';         // テーブル本体
import TableBody from '@mui/material/TableBody';   // テーブルボディ
import TableCell from '@mui/material/TableCell';   // テーブルセル (td, th)
import TableContainer from '@mui/material/TableContainer'; // テーブルのコンテナ
import TableHead from '@mui/material/TableHead';   // テーブルヘッダー
import TableRow from '@mui/material/TableRow';     // テーブル行 (tr)
import Paper from '@mui/material/Paper';         // 背景と影を持つコンテナ (TableContainerで使用)
import CircularProgress from '@mui/material/CircularProgress'; // ローディングインジケータ
import Alert from '@mui/material/Alert';         // エラーメッセージ表示
import Box from '@mui/material/Box';             // 汎用レイアウトボックス (余白などに便利)
import IconButton from '@mui/material/IconButton'; // アイコン用ボタン
import EditIcon from '@mui/icons-material/Edit';   // 編集アイコン
import DeleteIcon from '@mui/icons-material/Delete'; // 削除アイコン
import TablePagination from '@mui/material/TablePagination'; // ページネーション
import TextField from '@mui/material/TextField'; // フィルタリング入力用

const CategoryListPage: React.FC = () => {
    const queryClient = useQueryClient();

    // --- ページネーション用の State ---
    const [page, setPage] = useState(0); // 現在のページ (0から始まる)
    const [rowsPerPage, setRowsPerPage] = useState(10); // 1ページあたりの行数 (初期値: 10)

    // --- フィルタリング用の State ---
    const [filterName, setFilterName] = useState(''); // カテゴリ名フィルターの入力値

    // --- ダイアログの状態管理 ---
    const [dialogOpen, setDialogOpen] = useState(false);
    // 削除対象のカテゴリ情報を保持 (IDと名前など)
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    // --- 一覧の取得 (useQuery) ---
    const { data: categories, isLoading, isError, error } = useQuery({
        queryKey: ['categories'], // ★ クエリキー
        queryFn: getCategories,   // ★ 取得関数
    });

    // --- 削除処理 (useMutation) ---
    const { mutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteCategory,
        onSuccess: (_, deletedCategoryId) => {
            console.log(`Category (ID: ${deletedCategoryId}) deleted successfully`);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setDialogOpen(false);
            setCategoryToDelete(null);
        },
        onError: (err, deletedCategoryId) => {
            console.error(`Error deleting category (ID: ${deletedCategoryId}):`, err);
            alert(`Error deleting category: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setDialogOpen(false);
            setCategoryToDelete(null);
        },
    });

    // --- フィルタリングされたカテゴリリスト (useMemoで計算) ---
    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        if (!filterName) return categories; // フィルターが空なら全件返す
        return categories.filter(category =>
            category.name.toLowerCase().includes(filterName.toLowerCase()) // 大文字・小文字を区別しない部分一致
        );
    }, [categories, filterName]); // categories または filterName が変更された時のみ再計算

    // --- 削除ボタンクリック時の処理 ---
    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category); // 削除対象のカテゴリ情報をセット
        setDialogOpen(true);          // ダイアログを開く
    };

    // --- ダイアログの確認ボタン押下時の処理 ---
    const handleConfirmDelete = () => {
        if (categoryToDelete) {
            mutate(categoryToDelete.id); // mutate を呼び出し
        }
    };

    // --- ダイアログのクローズ処理 ---
    const handleDialogClose = () => {
        setDialogOpen(false);
        setCategoryToDelete(null); // ダイアログを閉じたら削除対象もリセット
    };

    // --- ページネーション用のハンドラ関数 ---
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // 表示行数を変更したら最初のページに戻る
    };

    // --- フィルター入力変更ハンドラ ---
    const handleFilterNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterName(event.target.value);
        setPage(0); // フィルター変更時は1ページ目に戻す
    };

    if (isLoading) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }
    if (isError) {
        return (
            <Container maxWidth="md" sx={{ mt: 2 }}>
                <Alert severity="error">
                    Error fetching categories: {error instanceof Error ? error.message : 'Unknown error'}
                </Alert>
            </Container>
        );
    }

    // 表示するカテゴリをスライス (ページネーションのため)
    const paginatedCategories = filteredCategories
        ? (rowsPerPage === -1 // "All" が選択されたかチェック
            ? filteredCategories // "All" なら元の配列をそのまま使用
            : filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // それ以外ならスライス
            )
        : [];

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <TextField
                    label="Filter by Name"
                    variant="outlined"
                    size="small"
                    value={filterName}
                    onChange={handleFilterNameChange}
                    sx={{ width: '300px' }}
                />
                <Button variant="contained" component={Link} to="/categories/new">
                    Add New Category
                </Button>
            </Box>

            {(!categories) ? (
                <Typography>Loading data or no categories available.</Typography>
            ) : (!filteredCategories || filteredCategories.length === 0) ? (
                <Typography>No categories match your filter criteria "{filterName}".</Typography>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table stickyHeader aria-label="category table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedCategories.map((category) => (
                                    <TableRow hover key={category.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">{category.id}</TableCell>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell align="right">
                                             {/* 編集ボタン (IconButton) */}
                                            <IconButton component={Link} to={`/categories/${category.id}/edit`} color="primary" aria-label="edit category" size="small">
                                                <EditIcon fontSize="inherit" />
                                            </IconButton>
                                            {/* 削除ボタン (IconButton) */}
                                            <IconButton
                                                color="error" aria-label="delete category" size="small"
                                                onClick={() => handleDeleteClick(category)}
                                                // 削除処理中はボタンを無効化
                                                disabled={isDeleting && categoryToDelete?.id === category.id}
                                            >
                                                {isDeleting && categoryToDelete?.id === category.id ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="inherit"/>}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {/* 空の行を避けるための処理 */}
                                {paginatedCategories.length === 0 && page > 0 && (
                                    <TableRow style={{ height: 53 * rowsPerPage }}>
                                        <TableCell colSpan={3} align="center">
                                            No results found on this page.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]} // 表示行数の選択肢
                        component="div"
                        count={filteredCategories.length || 0}
                        rowsPerPage={rowsPerPage} // 現在の1ページあたりの行数
                        page={page} // 現在のページ番号 (0から)
                        onPageChange={handleChangePage} // ページ変更時のハンドラ
                        onRowsPerPageChange={handleChangeRowsPerPage} // 表示行数変更時のハンドラ
                    />
                </Paper>
            )}
            {categoryToDelete && ( // categoryToDelete がある場合のみダイアログを意味のあるものとしてレンダリング
                <ConfirmationDialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    onConfirm={handleConfirmDelete}
                    title="Confirm Deletion"
                    message={
                        <>
                        Are you sure you want to delete the category
                        "<strong>{categoryToDelete.name}</strong>" (ID: {categoryToDelete.id})?
                        <br />
                        This action cannot be undone.
                        </>
                    }
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            )}
        </Container>
    );
};
export default CategoryListPage;
