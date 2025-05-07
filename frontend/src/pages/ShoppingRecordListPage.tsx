import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getShoppingRecords, deleteShoppingRecord, ShoppingRecord } from '../api/client';

// --- Material UI ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
                    Error fetching records: {error instanceof Error ? error.message : 'Unknown error'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Shopping Records
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    component={Link}
                    to="/shopping-records/new"
                >
                    Add New Record
                </Button>
            </Box>
            {(!records || records.length === 0) ? (
                <Typography>No shopping records found.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 750 }} aria-label="shopping record table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Product</TableCell>
                                <TableCell>Store</TableCell>
                                <TableCell>Purchase Date</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {records.map((record) => (
                                <TableRow key={record.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">{record.id}</TableCell>
                                    <TableCell>{record.product?.name ?? 'N/A'}</TableCell>
                                    <TableCell>{record.store?.name ?? 'N/A'}</TableCell>
                                    <TableCell>{record.purchase_date}</TableCell>
                                    <TableCell align="right">{record.price}</TableCell>
                                    <TableCell align="right">{record.quantity} {record.product?.unit?.name ?? ''}</TableCell>
                                    <TableCell align="right">
                                        <IconButton component={Link} to={`/shopping-records/${record.id}/edit`} color="primary" aria-label="edit record" size="small">
                                            <EditIcon fontSize="inherit" />
                                        </IconButton>
                                        <IconButton color="error" aria-label="delete record" size="small" onClick={() => handleDelete(record.id, `${record.product?.name} on ${record.purchase_date}`)} disabled={isDeleting && deletingId === record.id}>
                                            {isDeleting && deletingId === record.id ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="inherit"/>}
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

export default ShoppingRecordListPage;
