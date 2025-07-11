import React, { useState, useMemo } from 'react';
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
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

const ProductListPage: React.FC = () => {
    const queryClient = useQueryClient();

    // --- ページネーション用の State ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- フィルタリング用 State ---
    const [filterName, setFilterName] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterUnit, setFilterUnit] = useState('');
    const [filterManufacturer, setFilterManufacturer] = useState('');
    const [filterOrigin, setFilterOrigin] = useState('');

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

    // --- フィルタリングされた商品リスト (useMemoで計算) ---
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(product => {
            const nameMatch = filterName ? product.name.toLowerCase().includes(filterName.toLowerCase()) : true;
            const categoryMatch = filterCategory ? product.category?.name.toLowerCase().includes(filterCategory.toLowerCase()) : true;
            const unitMatch = filterUnit ? product.unit?.name.toLowerCase().includes(filterUnit.toLowerCase()) : true;
            const manufacturerMatch = filterManufacturer ? product.manufacturer?.name.toLowerCase().includes(filterManufacturer.toLowerCase()) : true;
            const originMatch = filterOrigin ? product.origin?.name.toLowerCase().includes(filterOrigin.toLowerCase()) : true;
            return nameMatch && categoryMatch && unitMatch && manufacturerMatch && originMatch;
        });
    }, [products, filterName, filterCategory, filterUnit, filterManufacturer, filterOrigin]);

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

    // --- ページネーション用のハンドラ関数 ---
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // --- 汎用フィルター入力変更ハンドラ ---
    const createFilterHandleChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
        setter(event.target.value);
        setPage(0); // フィルター変更時は1ページ目に戻す
    };

    const handleFilterNameChange = createFilterHandleChange(setFilterName);
    const handleFilterCategoryChange = createFilterHandleChange(setFilterCategory);
    const handleFilterUnitChange = createFilterHandleChange(setFilterUnit);
    const handleFilterManufacturerChange = createFilterHandleChange(setFilterManufacturer);
    const handleFilterOriginChange = createFilterHandleChange(setFilterOrigin);

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

    // 表示する商品データをスライス
    const paginatedProducts = filteredProducts
        ? (rowsPerPage === -1
            ? filteredProducts
            : filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        )
        : [];

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Products
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
                <Stack spacing={1} sx={{ width: 'calc(100% - 220px)'}}>
                    <TextField
                        label="Filter by Product Name"
                        variant="outlined" size="small" fullWidth
                        value={filterName} onChange={handleFilterNameChange}
                    />
                    <TextField
                        label="Filter by Category Name"
                        variant="outlined" size="small" fullWidth
                        value={filterCategory} onChange={handleFilterCategoryChange}
                    />
                    <TextField
                        label="Filter by Unit Name"
                        variant="outlined" size="small" fullWidth
                        value={filterUnit} onChange={handleFilterUnitChange}
                    />
                    <TextField
                        label="Filter by Manufacturer Name"
                        variant="outlined" size="small" fullWidth
                        value={filterManufacturer} onChange={handleFilterManufacturerChange}
                    />
                    <TextField
                        label="Filter by Origin Name"
                        variant="outlined" size="small" fullWidth
                        value={filterOrigin} onChange={handleFilterOriginChange}
                    />
                </Stack>
                <Button variant="contained" component={Link} to="/products/new" sx={{ height: 'fit-content', mt:'8px' }}>
                    Add New Product
                </Button>
            </Box>

            {(!products) ? (
                <Typography>Loading data or no products available.</Typography>
            ) : (!filteredProducts || filteredProducts.length === 0) ? (
                <Typography>No products match your filter criteria.</Typography>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table stickyHeader aria-label="product table">
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
                                {paginatedProducts.map((product) => (
                                    <TableRow hover key={product.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
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
                                                color="error" aria-label="delete product" size="small"
                                                onClick={() => handleDeleteClick(product)}
                                                disabled={isDeleting && productToDelete?.id === product.id}
                                            >
                                                {isDeleting && productToDelete?.id === product.id ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="inherit"/>}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {paginatedProducts.length === 0 && page > 0 && (
                                    <TableRow style={{ height: 53 * (rowsPerPage > 0 ? rowsPerPage : 1) }}>
                                        <TableCell colSpan={7} align="center">
                                            No results found on this page.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50, { label: 'All', value: -1 }]}
                        component="div"
                        count={filteredProducts?.length || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}

            {/* 確認ダイアログのレンダリング */}
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
