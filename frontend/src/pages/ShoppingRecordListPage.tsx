import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getShoppingRecords, deleteShoppingRecord, ShoppingRecord } from '../api/client';
import ConfirmationDialog from '../components/ConfirmationDialog';

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

    // --- ダイアログの状態管理 ---
    const [dialogOpen, setDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<ShoppingRecord | null>(null);

    // 購買記録一覧データを取得
    const { data: records, isLoading, isError, error } = useQuery<ShoppingRecord[], Error>({
        queryKey: ['shoppingRecords'],
        queryFn: getShoppingRecords,
    });

    // 削除処理 (useMutation)
    const { mutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteShoppingRecord,
        onSuccess: (_, deletedRecordId) => {
            console.log(`Shopping Record (ID: ${deletedRecordId}) deleted successfully`);
            queryClient.invalidateQueries({ queryKey: ['shoppingRecords'] });
            handleDialogClose();
        },
        onError: (error, deletedRecordId) => {
            console.error(`Error deleting shopping record (ID: ${deletedRecordId}):`, error);
            alert(`Error deleting shopping record: ${error instanceof Error ? error.message : 'Unknown error'}`);
            handleDialogClose();
        },
    });

    // --- 削除ボタンクリック時の処理を変更 ---
    const handleDeleteClick = (record: ShoppingRecord) => {
        setRecordToDelete(record);
        setDialogOpen(true);
    };

    // --- ダイアログの確認ボタン押下時の処理 ---
    const handleConfirmDelete = () => {
        if (recordToDelete) {
        mutate(recordToDelete.id);
        }
    };

    // --- ダイアログのクローズ処理 ---
    const handleDialogClose = () => {
        setDialogOpen(false);
        setRecordToDelete(null);
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
                                        <IconButton
                                            color="error"
                                            aria-label="delete record"
                                            size="small"
                                            onClick={() => handleDeleteClick(record)} // ★ record オブジェクトを渡す
                                            disabled={isDeleting && recordToDelete?.id === record.id}
                                        >
                                            {isDeleting && recordToDelete?.id === record.id ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="inherit"/>}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* ★ 確認ダイアログのレンダリング */}
            {recordToDelete && (
                <ConfirmationDialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    onConfirm={handleConfirmDelete}
                    title="Confirm Record Deletion"
                    message={
                        <>
                        Are you sure you want to delete this shopping record?
                        <br />
                        <strong>Product:</strong> {recordToDelete.product?.name ?? 'N/A'}
                        <br />
                        <strong>Store:</strong> {recordToDelete.store?.name ?? 'N/A'}
                        <br />
                        <strong>Date:</strong> {recordToDelete.purchase_date}
                        <br />
                        <strong>Price:</strong> {recordToDelete.price}, <strong>Quantity:</strong> {recordToDelete.quantity}
                        <br />
                        (ID: {recordToDelete.id})
                        <br /><br />
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

export default ShoppingRecordListPage;
