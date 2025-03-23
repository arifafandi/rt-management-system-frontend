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
    Button,
    Chip,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

import {residentAPI} from '../../api/api';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import axios from 'axios';

const ResidentList = () => {
    const [residents, setResidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({open: false, id: null});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [ktpModal, setKtpModal] = useState({
        open: false,
        url: '',
        name: ''
    });

    useEffect(() => {
        fetchResidents();
    }, []);

    const fetchResidents = async () => {
        try {
            setIsLoading(true);
            const response = await residentAPI.getAll();
            setResidents(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching residents:', error);
            toast.error('Gagal mengambil data penghuni');
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
            await residentAPI.delete(deleteDialog.id);
            toast.success('Berhasil menghapus penghuni');
            fetchResidents();
            setDeleteDialog({open: false, id: null});
        } catch (error) {
            console.error('Error deleting resident:', error);
            toast.error('Gagal menghapus penghuni');
        }
    };

    const handleOpenKtpModal = (resident) => {
        setKtpModal({
            open: true,
            url: `${axios.defaults.baseURL}/storage/${resident.id_card_photo}`,
            name: resident.name
        });
    };

    const handleCloseKtpModal = () => {
        setKtpModal({
            open: false,
            url: '',
            name: ''
        });
    };

    return (
        <>
            <PageHeader
                title="Data Penghuni"
                buttonText="Tambah Penghuni"
                buttonPath="/residents/create"
                buttonIcon={<AddIcon/>}
            />

            {isLoading ? (
                <Loading/>
            ) : residents.length === 0 ? (
                <EmptyState
                    message="Data penghuni kosong"
                    secondaryMessage="Tambahkan penghuni pertama kali untuk memulai"
                    buttonText="Tambah Penghuni"
                    buttonPath="/residents/create"
                    buttonIcon={<AddIcon/>}
                />
            ) : (
                <Paper sx={{width: '100%', overflow: 'hidden'}}>
                    <TableContainer>
                        <Table aria-label="residents table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nama</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Nomor Telepon</TableCell>
                                    <TableCell>Status Pernikahan</TableCell>
                                    <TableCell>KTP</TableCell>
                                    <TableCell align="right">Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {residents
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((resident) => (
                                        <TableRow key={resident.id} hover>
                                            <TableCell component="th" scope="row">
                                                {resident.name}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={resident.resident_status === 'permanent' ? 'Permanen' : 'Kontrak'}
                                                    color={resident.resident_status === 'permanent' ? 'success' : 'warning'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{resident.phone_number}</TableCell>
                                            <TableCell>{resident.is_married ? 'Menikah' : 'Belum Menikah'}</TableCell>
                                            <TableCell>
                                                <Button
                                                    onClick={() => handleOpenKtpModal(resident)}
                                                    color="primary"
                                                    startIcon={<VisibilityIcon/>}
                                                    size="small"
                                                    variant="text"
                                                >
                                                    Lihat Foto KTP
                                                </Button>
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    component={RouterLink}
                                                    to={`/residents/edit/${resident.id}`}
                                                    color="primary"
                                                    aria-label="edit resident"
                                                    size="small"
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    aria-label="delete resident"
                                                    onClick={() => handleDeleteClick(resident.id)}
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
                        count={residents.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}

            <Dialog
                open={ktpModal.open}
                onClose={handleCloseKtpModal}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Foto KTP {ktpModal.name}
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseKtpModal}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        {ktpModal.url && (
                            <img
                                src={ktpModal.url}
                                alt={`KTP ${ktpModal.name}`}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain'
                                }}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseKtpModal}>Tutup</Button>
                    <Button
                        component="a"
                        href={ktpModal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                    >
                        Buka di Tab Baru
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Hapus Penghuni"
                content="Kamu yakin ingin menghapus penghuni ini? Tindakan ini tidak dapat dibatalkan. Data yang terkait akan terhapus secara permanen."
            />
        </>
    );
};

export default ResidentList;