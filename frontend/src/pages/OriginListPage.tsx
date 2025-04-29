import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getOrigins, deleteOrigin } from '../api/client';

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
                    Error fetching origins: {error instanceof Error ? error.message : 'Unknown error'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Origins
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    component={Link}
                    to="/origins/new"
                >
                    Add New Origin
                </Button>
            </Box>

            {(!origins || origins.length === 0) ? (
                <Typography>No origins found.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="origin table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {origins.map((origin) => (
                                <TableRow key={origin.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">{origin.id}</TableCell>
                                    <TableCell>{origin.name}</TableCell>
                                    <TableCell align="right">
                                        {/* 編集ボタン (IconButton) */}
                                        <IconButton
                                            component={Link}
                                            to={`/origins/${origin.id}/edit`}
                                            color="primary"
                                            aria-label="edit origin"
                                            size="small"
                                        >
                                            <EditIcon fontSize="inherit" />
                                        </IconButton>
                                        {/* 削除ボタン (IconButton) */}
                                        <IconButton
                                            color="error"
                                            aria-label="delete origin"
                                            size="small"
                                            onClick={() => handleDelete(origin.id, origin.name)}
                                            // 削除処理中はボタンを無効化
                                            disabled={isDeleting && deletingId === origin.id}
                                        >
                                            {/* 削除処理中はアイコンの代わりにローディング表示 */}
                                            {isDeleting && deletingId === origin.id ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="inherit"/>}
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
export default OriginListPage;
