import React, { useState, useMemo } from 'react';
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
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';

const ShoppingRecordListPage: React.FC = () => {
    const queryClient = useQueryClient();

    // --- ページネーション用の State ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- フィルタリング用 State ---
    const [filterProductName, setFilterProductName] = useState('');
    const [filterStoreName, setFilterStoreName] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

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

    // --- フィルタリングされた購買記録リスト (useMemoで計算) ---
    const filteredRecords = useMemo(() => {
        if (!records) return [];
        return records.filter(record => {
            const productNameMatch = filterProductName
                ? record.product?.name.toLowerCase().includes(filterProductName.toLowerCase())
                : true;
            const storeNameMatch = filterStoreName
                ? record.store?.name.toLowerCase().includes(filterStoreName.toLowerCase())
                : true;

            // Purchase Dateの範囲フィルタリング
            let dateMatch = true;
            if (filterStartDate && record.purchase_date < filterStartDate) {
                dateMatch = false;
            }
            if (filterEndDate && record.purchase_date > filterEndDate) {
                dateMatch = false;
            }

            return productNameMatch && storeNameMatch && dateMatch;
        });
    }, [records, filterProductName, filterStoreName, filterStartDate, filterEndDate]);

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

    // --- ページネーション用のハンドラ関数 ---
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // 表示行数を変更したら最初のページに戻る
    };

    // --- フィルター入力変更ハンドラ ---
    const createFilterHandleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            setter(event.target.value);
            setPage(0);
        }
    };
    const handleFilterProductNameChange = createFilterHandleChange(setFilterProductName);
    const handleFilterStoreNameChange = createFilterHandleChange(setFilterStoreName);
    const handleFilterStartDateChange = createFilterHandleChange(setFilterStartDate);
    const handleFilterEndDateChange = createFilterHandleChange(setFilterEndDate);

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

    // 表示する購買記録データをスライス
    const paginatedRecords = filteredRecords
        ? (rowsPerPage === -1
            ? filteredRecords
            : filteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        )
        : [];

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Shopping Records
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
                <Stack spacing={1} sx={{ width: 'calc(100% - 220px)'}}>
                    <TextField
                        label="Filter by Product Name"
                        variant="outlined" size="small" fullWidth
                        value={filterProductName} onChange={handleFilterProductNameChange}
                    />
                    <TextField
                        label="Filter by Store Name"
                        variant="outlined" size="small" fullWidth
                        value={filterStoreName} onChange={handleFilterStoreNameChange}
                    />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Purchase Date From"
                                type="date"
                                variant="outlined" size="small" fullWidth
                                value={filterStartDate}
                                onChange={handleFilterStartDateChange}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Purchase Date To"
                                type="date"
                                variant="outlined" size="small" fullWidth
                                value={filterEndDate}
                                onChange={handleFilterEndDateChange}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                    </Grid>
                </Stack>
                <Button variant="contained" component={Link} to="/shopping-records/new" sx={{ height: 'fit-content', mt:'8px' }}>
                    Add New Record
                </Button>
            </Box>

            {(!records) ? (
                <Typography>Loading data or no records available.</Typography>
            ) : (!filteredRecords || filteredRecords.length === 0) ? (
                <Typography>No records match your filter criteria.</Typography>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table stickyHeader aria-label="shopping record table">
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
                                {paginatedRecords.map((record) => (
                                    <TableRow hover key={record.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
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
                                                color="error" aria-label="delete record" size="small"
                                                onClick={() => handleDeleteClick(record)}
                                                disabled={isDeleting && recordToDelete?.id === record.id}
                                            >
                                                {isDeleting && recordToDelete?.id === record.id ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="inherit"/>}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {paginatedRecords.length === 0 && page > 0 && (
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
                        count={filteredRecords?.length || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}

            {/* 確認ダイアログのレンダリング */}
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
