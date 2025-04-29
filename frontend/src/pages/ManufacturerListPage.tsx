import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getManufacturers, deleteManufacturer } from '../api/client';

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
                    Error fetching manufacturers: {error instanceof Error ? error.message : 'Unknown error'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Manufacturers
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    component={Link}
                    to="/manufacturers/new"
                >
                    Add New Manufacturer
                </Button>
            </Box>

            {(!manufacturers || manufacturers.length === 0) ? (
                <Typography>No manufacturers found.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="manufacturer table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {manufacturers.map((manufacturer) => (
                                <TableRow key={manufacturer.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">{manufacturer.id}</TableCell>
                                    <TableCell>{manufacturer.name}</TableCell>
                                    <TableCell align="right">
                                        {/* 編集ボタン (IconButton) */}
                                        <IconButton
                                            component={Link}
                                            to={`/manufacturers/${manufacturer.id}/edit`}
                                            color="primary"
                                            aria-label="edit manufacturer"
                                            size="small"
                                        >
                                            <EditIcon fontSize="inherit" />
                                        </IconButton>
                                        {/* 削除ボタン (IconButton) */}
                                        <IconButton
                                            color="error"
                                            aria-label="delete manufacturer"
                                            size="small"
                                            onClick={() => handleDelete(manufacturer.id, manufacturer.name)}
                                            // 削除処理中はボタンを無効化
                                            disabled={isDeleting && deletingId === manufacturer.id}
                                        >
                                            {/* 削除処理中はアイコンの代わりにローディング表示 */}
                                            {isDeleting && deletingId === manufacturer.id ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="inherit"/>}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};
export default ManufacturerListPage;
