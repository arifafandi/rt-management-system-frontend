import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
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
    MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { paymentAPI } from '../../api/api';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const PaymentList = () => {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    useEffect(() => {
        fetchPayments();
    }, [filter]);

    const fetchPayments = async () => {
        try {
            setIsLoading(true);
            const response = await paymentAPI.getAll(filter);
            setPayments(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Gagal mengambil data pembayaran');
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
        setDeleteDialog({ open: true, id });
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, id: null });
    };

    const handleDeleteConfirm = async () => {
        try {
            await paymentAPI.delete(deleteDialog.id);
            toast.success('Data pembayaran berhasil dihapus');
            fetchPayments();
            setDeleteDialog({ open: false, id: null });
        } catch (error) {
            console.error('Error deleting payment:', error);
            toast.error('Gagal menghapus data pembayaran');
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    const getMonthName = (monthNumber) => {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return months[monthNumber - 1];
    };

    return (
        <>
            <PageHeader
                title="Data Pembayaran"
                buttonText="Catat Pembayaran"
                buttonPath="/payments/create"
                buttonIcon={<AddIcon />}
            />

            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="month-select-label">Bulan</InputLabel>
                            <Select
                                labelId="month-select-label"
                                id="month"
                                name="month"
                                value={filter.month}
                                label="Month"
                                onChange={handleFilterChange}
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
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
                                label="Year"
                                onChange={handleFilterChange}
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
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
                <Loading />
            ) : payments.length === 0 ? (
                <EmptyState
                    message="Tidak ada data pembayaran untuk bulan tersebut"
                    secondaryMessage="Catat pembayaran atau ubah filter"
                    buttonText="Catat Pembayaran"
                    buttonPath="/payments/create"
                    buttonIcon={<AddIcon />}
                />
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table aria-label="payments table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Penghuni</TableCell>
                                    <TableCell>Rumah</TableCell>
                                    <TableCell>Jenis</TableCell>
                                    <TableCell>Jumlah</TableCell>
                                    <TableCell>Tanggal</TableCell>
                                    <TableCell>Periode</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payments
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((payment) => (
                                        <TableRow key={payment.id} hover>
                                            <TableCell>
                                                {payment.house_resident?.resident?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {payment.house_resident?.house?.house_number || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={payment.payment_type === 'security' ? 'Keamanan' : 'Kebersihan'}
                                                    color={payment.payment_type === 'security' ? 'primary' : 'secondary'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                Rp {parseFloat(payment.amount).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{payment.payment_date ? payment.payment_date.split('T')[0] : ''}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {payment.payment_period === 'yearly' ? (
                                                        <Chip size="small" label="Tahunan" color="info" sx={{ mr: 1 }} />
                                                    ) : (
                                                        <Chip size="small" label="Bulanan" color="default" sx={{ mr: 1 }} />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={payment.is_paid ? 'Lunas' : 'Belum Lunas'}
                                                    color={payment.is_paid ? 'success' : 'error'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    component={RouterLink}
                                                    to={`/payments/edit/${payment.id}`}
                                                    color="primary"
                                                    aria-label="edit payment"
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    aria-label="delete payment"
                                                    onClick={() => handleDeleteClick(payment.id)}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
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
                        count={payments.length}
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
                title="Hapus Pembayaran"
                content="Kamu yakin ingin menghapus data pembayaran ini? Data ini tidak dapat dikembalikan. Data yang sudah dihapus tidak dapat dikembalikan lagi."
            />
        </>
    );
};

export default PaymentList;