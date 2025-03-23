import {useState, useEffect} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {toast} from 'react-toastify';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Box,
    TablePagination,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import {expenseAPI} from '../../api/api';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ExpenseList = () => {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({open: false, id: null});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    useEffect(() => {
        fetchExpenses();
    }, [filter]);

    const fetchExpenses = async () => {
        try {
            setIsLoading(true);
            const response = await expenseAPI.getAll(filter);
            setExpenses(response.data);
            console.log(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error('Gagal mengambil data pengeluaran');
            setIsLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (id) => {
        setDeleteDialog({open: true, id});
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({open: false, id: null});
    };

    const handleDeleteConfirm = async () => {
        try {
            await expenseAPI.delete(deleteDialog.id);
            toast.success('Expense deleted successfully');
            await fetchExpenses();
            setDeleteDialog({open: false, id: null});
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Gagal menghapus data pengeluaran');
        }
    };

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilter(prev => ({...prev, [name]: value}));
    };

    const getMonthName = (monthNumber) => {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return months[monthNumber - 1];
    };

    const calculateTotal = () => {
        return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    };

    const getExpenseTypeColor = (type) => {
        switch (type) {
            case 'security':
                return 'primary';
            case 'cleaning':
                return 'secondary';
            case 'maintenance':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <>
            <PageHeader
                title="Pengeluaran"
                buttonText="Catat Pengeluaran"
                buttonPath="/expenses/create"
                buttonIcon={<AddIcon/>}
            />

            <Paper sx={{p: 3, mb: 4}}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="month-select-label">Bulan</InputLabel>
                            <Select
                                labelId="month-select-label"
                                id="month"
                                name="month"
                                value={filter.month}
                                label="Bulan"
                                onChange={handleFilterChange}
                            >
                                {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                                    <MenuItem key={month} value={month}>
                                        {getMonthName(month)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="year-select-label">Tahun</InputLabel>
                            <Select
                                labelId="year-select-label"
                                id="year"
                                name="year"
                                value={filter.year}
                                label="Tahun"
                                onChange={handleFilterChange}
                            >
                                {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {isLoading ? (
                <Loading/>
            ) : expenses.length === 0 ? (
                <EmptyState
                    message="Tidak ada data pengeluaran untuk periode tersebut"
                    secondaryMessage="Catat pengeluaran atau ubah filter"
                    buttonText="Catat Pengeluaran"
                    buttonPath="/expenses/create"
                    buttonIcon={<AddIcon/>}
                />
            ) : (
                <Paper sx={{width: '100%', overflow: 'hidden'}}>
                    <Box sx={{
                        p: 3,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Typography variant="h6">
                            Pengeluaran periode {getMonthName(filter.month)} {filter.year}
                        </Typography>
                        <Typography variant="h6">
                            Total: Rp {calculateTotal().toLocaleString()}
                        </Typography>
                    </Box>

                    <TableContainer>
                        <Table aria-label="expenses table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Deskripsi</TableCell>
                                    <TableCell>Jenis</TableCell>
                                    <TableCell>Jumlah</TableCell>
                                    <TableCell>Tanggal</TableCell>
                                    <TableCell align="right">Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {expenses
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((expense) => (
                                        <TableRow key={expense.id} hover>
                                            <TableCell>{expense.description}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={expense.expense_type === 'security' ? 'Keamanan' :
                                                        expense.expense_type === 'maintenance' ? 'Perawatan' :
                                                            expense.expense_type === 'cleaning' ? 'Kebersihan' :
                                                                expense.expense_type === 'other' ? 'Lainnya' :
                                                                    'Tidak Diketahui'}
                                                    color={getExpenseTypeColor(expense.expense_type)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                Rp {parseFloat(expense.amount).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{expense.expense_date?.split('T')[0]}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    component={RouterLink}
                                                    to={`/expenses/edit/${expense.id}`}
                                                    color="primary"
                                                    aria-label="edit expense"
                                                    size="small"
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    aria-label="delete expense"
                                                    onClick={() => handleDeleteClick(expense.id)}
                                                    size="small"
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={expenses.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}

            <ConfirmDialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Hapus Pengeluaran"
                content="Apakah kamu yakin ingin menghapus data pengeluaran ini? Data ini tidak dapat dikembalikan. Data yang sudah dihapus tidak dapat dikembalikan lagi."
            />
        </>
    );
};

export default ExpenseList;
