import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getStores, deleteStore, Store } from '../api/client';
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

const StoreListPage: React.FC = () => {
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

    const { data: stores, isLoading, isError, error } = useQuery({
        queryKey: ['stores'], // ★ クエリキー
        queryFn: getStores,   // ★ 取得関数
    });

    const { mutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteStore, // ★ 削除関数
        onSuccess: (_, deletedStoreId) => {
            console.log(`Store (ID: ${deletedStoreId}) deleted successfully`);
            queryClient.invalidateQueries({ queryKey: ['stores'] }); // ★ クエリキー
            handleDialogClose();
        },
        onError: (err, deletedStoreId) => {
            console.error(`Error deleting store (ID: ${deletedStoreId}):`, err);
            alert(`Error deleting store: ${err instanceof Error ? err.message : 'Unknown error'}`);
            handleDialogClose();
        },
    });

    // --- 削除ボタンクリック時の処理を変更 ---
    const handleDeleteClick = (store: Store) => {
        setStoreToDelete(store);
        setDialogOpen(true);
    };

    // --- ダイアログの確認ボタン押下時の処理 ---
    const handleConfirmDelete = () => {
        if (storeToDelete) {
            mutate(storeToDelete.id);
        }
    };

    // --- ダイアログのクローズ処理 ---
    const handleDialogClose = () => {
        setDialogOpen(false);
        setStoreToDelete(null);
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
                    Error fetching stores: {error instanceof Error ? error.message : 'Unknown error'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Stores
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    component={Link}
                    to="/stores/new"
                >
                    Add New Store
                </Button>
            </Box>

            {(!stores || stores.length === 0) ? (
                <Typography>No stores found.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="store table">
                        <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                            {stores.map((store) => (
                                <TableRow key={store.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">{store.id}</TableCell>
                                    <TableCell>{store.name}</TableCell>
                                    <TableCell>{store.location}</TableCell>
                                    <TableCell align="right">
                                        <IconButton component={Link} to={`/stores/${store.id}/edit`} color="primary" aria-label="edit store" size="small">
                                            <EditIcon fontSize="inherit" />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            aria-label="delete store"
                                            size="small"
                                            onClick={() => handleDeleteClick(store)}
                                            disabled={isDeleting && storeToDelete?.id === store.id}
                                        >
                                            {isDeleting && storeToDelete?.id === store.id ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="inherit"/>}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                </Table>
                </TableContainer>
            )}

            {/* ★ 確認ダイアログのレンダリング */}
            {storeToDelete && (
                <ConfirmationDialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    onConfirm={handleConfirmDelete}
                    title="Confirm Store Deletion"
                    message={
                        <>
                        Are you sure you want to delete the store
                        "<strong>{storeToDelete.name}</strong>" (Location: {storeToDelete.location}, ID: {storeToDelete.id})?
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
export default StoreListPage;
