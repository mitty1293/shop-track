import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getUnits, deleteUnit, Unit } from '../api/client';
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

const UnitListPage: React.FC = () => {
    const queryClient = useQueryClient();

    // --- ページネーション用の State ---
  const [page, setPage] = useState(0); // 現在のページ (0から始まる)
  const [rowsPerPage, setRowsPerPage] = useState(10); // 1ページあたりの行数 (初期値: 10)

    // --- ダイアログの状態管理 ---
    const [dialogOpen, setDialogOpen] = useState(false);
    // 削除対象のカテゴリ情報を保持 (IDと名前など)
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

    // --- 一覧の取得 (useQuery) ---
    const { data: units, isLoading, isError, error } = useQuery({
        queryKey: ['units'], // ★ クエリキー
        queryFn: getUnits,   // ★ 取得関数
    });

    // --- 削除処理 (useMutation) ---
    const { mutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteUnit,
        onSuccess: (_, deletedUnitId) => {
            console.log(`Unit (ID: ${deletedUnitId}) deleted successfully`);
            queryClient.invalidateQueries({ queryKey: ['units'] });
            setDialogOpen(false);
            setUnitToDelete(null);
        },
        onError: (err, deletedUnitId) => {
            console.error(`Error deleting unit (ID: ${deletedUnitId}):`, err);
            alert(`Error deleting unit: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setDialogOpen(false);
            setUnitToDelete(null);
        },
    });

    // --- 削除ボタンクリック時の処理 ---
    const handleDeleteClick = (unit: Unit) => {
        setUnitToDelete(unit); // 削除対象のカテゴリ情報をセット
        setDialogOpen(true);          // ダイアログを開く
    };

    // --- ダイアログの確認ボタン押下時の処理 ---
    const handleConfirmDelete = () => {
        if (unitToDelete) {
            mutate(unitToDelete.id); // mutate を呼び出し
        }
    };

    // --- ダイアログのクローズ処理 ---
    const handleDialogClose = () => {
        setDialogOpen(false);
        setUnitToDelete(null); // ダイアログを閉じたら削除対象もリセット
    };

    // --- ページネーション用のハンドラ関数 ---
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // 表示行数を変更したら最初のページに戻る
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
                    Error fetching units: {error instanceof Error ? error.message : 'Unknown error'}
                </Alert>
            </Container>
        );
    }

    // 表示するカテゴリをスライス (ページネーションのため)
    const paginatedUnits = units
        ? (rowsPerPage === -1 // "All" が選択されたかチェック
            ? units // "All" なら元の配列をそのまま使用
            : units.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // それ以外ならスライス
            )
        : [];

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Units
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Button variant="contained" component={Link} to="/units/new">
                    Add New Unit
                </Button>
            </Box>

            {(!units || units.length === 0) ? (
                <Typography>No units found.</Typography>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table stickyHeader aria-label="unit table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedUnits.map((unit) => (
                                    <TableRow hover key={unit.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">{unit.id}</TableCell>
                                        <TableCell>{unit.name}</TableCell>
                                        <TableCell align="right">
                                             {/* 編集ボタン (IconButton) */}
                                            <IconButton component={Link} to={`/units/${unit.id}/edit`} color="primary" aria-label="edit unit" size="small">
                                                <EditIcon fontSize="inherit" />
                                            </IconButton>
                                            {/* 削除ボタン (IconButton) */}
                                            <IconButton
                                                color="error" aria-label="delete unit" size="small"
                                                onClick={() => handleDeleteClick(unit)}
                                                // 削除処理中はボタンを無効化
                                                disabled={isDeleting && unitToDelete?.id === unit.id}
                                            >
                                                {isDeleting && unitToDelete?.id === unit.id ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="inherit"/>}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {/* 空の行を避けるための処理 */}
                                {paginatedUnits.length === 0 && page > 0 && (
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
                        count={units?.length || 0} // 全アイテム数
                        rowsPerPage={rowsPerPage} // 現在の1ページあたりの行数
                        page={page} // 現在のページ番号 (0から)
                        onPageChange={handleChangePage} // ページ変更時のハンドラ
                        onRowsPerPageChange={handleChangeRowsPerPage} // 表示行数変更時のハンドラ
                    />
                </Paper>
            )}
            {unitToDelete && ( // unitToDelete がある場合のみダイアログを意味のあるものとしてレンダリング
                <ConfirmationDialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    onConfirm={handleConfirmDelete}
                    title="Confirm Deletion"
                    message={
                        <>
                        Are you sure you want to delete the unit
                        "<strong>{unitToDelete.name}</strong>" (ID: {unitToDelete.id})?
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
export default UnitListPage;
