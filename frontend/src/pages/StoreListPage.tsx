import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getStores, deleteStore } from '../api/client';

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

    const { data: stores, isLoading, isError, error } = useQuery({
        queryKey: ['stores'], // ★ クエリキー
        queryFn: getStores,   // ★ 取得関数
    });

    const { mutate, isPending: isDeleting, variables: deletingId } = useMutation({
        mutationFn: deleteStore, // ★ 削除関数
        onSuccess: (_, id) => {
        console.log(`Store (ID: ${id}) deleted successfully`);
        queryClient.invalidateQueries({ queryKey: ['stores'] }); // ★ クエリキー
        },
        onError: (err, id) => {
        console.error(`Error deleting store (ID: ${id}):`, err);
        alert(`Error deleting store: ${err instanceof Error ? err.message : 'Unknown error'}`);
        },
    });

    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Delete store "${name}" (ID: ${id})?`)) {
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
                                        <IconButton color="error" aria-label="delete store" size="small" onClick={() => handleDelete(store.id, store.name)} disabled={isDeleting && deletingId === store.id}>
                                            {isDeleting && deletingId === store.id ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="inherit"/>}
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
export default StoreListPage;
