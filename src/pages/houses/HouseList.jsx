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
  Button,
  Chip,
  Box,
  TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HomeIcon from '@mui/icons-material/Home';

import { houseAPI } from '../../api/api';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const HouseList = () => {
  const [houses, setHouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setIsLoading(true);
      const response = await houseAPI.getAll();
      setHouses(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching houses:', error);
      toast.error('Gagal mengambil data rumah');
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
      await houseAPI.delete(deleteDialog.id);
      toast.success('Data rumah berhasil dihapus');
      fetchHouses();
      setDeleteDialog({ open: false, id: null });
    } catch (error) {
      console.error('Error deleting house:', error);
      toast.error('Gagal menghapus data rumah');
    }
  };

  return (
    <>
      <PageHeader 
        title="Data Rumah"
        buttonText="Tambah Rumah"
        buttonPath="/houses/create" 
        buttonIcon={<AddIcon />} 
      />

      {isLoading ? (
        <Loading />
      ) : houses.length === 0 ? (
        <EmptyState 
          message="Data rumah kosong"
          secondaryMessage="Tambahkan rumah pertama kali untuk memulai"
          buttonText="Tambah Rumah"
          buttonPath="/houses/create"
          buttonIcon={<AddIcon />}
        />
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table aria-label="houses table">
              <TableHead>
                <TableRow>
                  <TableCell>Nomor Rumah</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Penghuni</TableCell>
                  <TableCell>Status Pembayaran</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {houses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((house) => (
                    <TableRow key={house.id} hover>
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <HomeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          {house.house_number}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={house.occupancy_status === 'occupied' ? 'Berpenghuni' : 'Tidak Berpenghuni'}
                          color={house.occupancy_status === 'occupied' ? 'success' : 'error'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          component={RouterLink}
                          to={`/houses/${house.id}`}
                          color="primary"
                          startIcon={<VisibilityIcon />}
                          size="small"
                        >
                          Lihat Penghuni
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Chip
                            label={house.payment_status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                            color={house.payment_status === 'paid' ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          component={RouterLink}
                          to={`/houses/edit/${house.id}`}
                          color="primary"
                          aria-label="edit house"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          aria-label="delete house"
                          onClick={() => handleDeleteClick(house.id)}
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
            count={houses.length}
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
        title="Hapus Rumah"
        content="Kamu yakin ingin menghapus rumah ini? Tindakan ini tidak dapat dibatalkan. Data yang terkait akan terhapus secara permanen."
      />
    </>
  );
};

export default HouseList;