import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, deleteProduct, Product } from '../api/client';
import { Link } from 'react-router';
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

const ProductListPage: React.FC = () => {
    const queryClient = useQueryClient();

    // --- ダイアログの状態管理 ---
    const [dialogOpen, setDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    // --- 商品一覧の取得 (useQuery) ---
    const { data: products, isLoading, isError, error } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    // --- 削除処理 (useMutation) ---
    const { mutate, isPending: isDeleting } = useMutation({
        mutationFn: deleteProduct,
        onSuccess: (_, deletedProductId) => {
            console.log(`商品 (ID: ${deletedProductId}) の削除成功`);
            // 商品一覧のキャッシュを無効化して再取得をトリガー
            queryClient.invalidateQueries({ queryKey: ['products'] });
            handleDialogClose();
        },
        onError: (error, deletedProductId) => {
            console.error(`商品 (ID: ${deletedProductId}) の削除エラー:`, error);
            // エラーメッセージを表示 (例: alert)
            alert(`Error deleting product: ${error instanceof Error ? error.message : 'Unknown error'}`);
            handleDialogClose();
        },
    });

    // --- 削除ボタンクリック時の処理 ---
    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
        setDialogOpen(true);
    };

    // --- ダイアログの確認ボタン押下時の処理 ---
    const handleConfirmDelete = () => {
        if (productToDelete) {
            mutate(productToDelete.id);
        }
    };

    // --- ダイアログのクローズ処理 ---
    const handleDialogClose = () => {
        setDialogOpen(false);
        setProductToDelete(null);
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
                    Error fetching products: {error instanceof Error ? error.message : 'Unknown error'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Products
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    component={Link}
                    to="/products/new"
                >
                    Add New Product
                </Button>
            </Box>

            {(!products || products.length === 0) ? (
                <Typography>No products found.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 750 }} aria-label="product table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Unit</TableCell>
                                <TableCell>Manufacturer</TableCell>
                                <TableCell>Origin</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">{product.id}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.category?.name ?? 'N/A'}</TableCell>
                                    <TableCell>{product.unit?.name ?? 'N/A'}</TableCell>
                                    <TableCell>{product.manufacturer?.name ?? 'N/A'}</TableCell>
                                    <TableCell>{product.origin?.name ?? 'N/A'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton component={Link} to={`/products/${product.id}/edit`} color="primary" aria-label="edit product" size="small">
                                            <EditIcon fontSize="inherit" />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            aria-label="delete product"
                                            size="small"
                                            onClick={() => handleDeleteClick(product)}
                                            disabled={isDeleting && productToDelete?.id === product.id}
                                        >
                                            {isDeleting && productToDelete?.id === product.id ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="inherit"/>}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* ★ 確認ダイアログのレンダリング */}
            {productToDelete && (
                <ConfirmationDialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    onConfirm={handleConfirmDelete}
                    title="Confirm Product Deletion"
                    message={
                        <>
                        Are you sure you want to delete the product
                        "<strong>{productToDelete.name}</strong>" (ID: {productToDelete.id})?
                        <br />
                        Category: {productToDelete.category?.name ?? 'N/A'}
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

export default ProductListPage;
