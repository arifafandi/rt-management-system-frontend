import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Box, 
  Paper, 
  Grid, 
  Typography, 
  Button, 
  Chip, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import HomeIcon from '@mui/icons-material/Home';

import { houseAPI, residentAPI } from '../../api/api';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { 
  DateInput, 
  SelectInput 
} from '../../components/common/FormFields';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`house-tabpanel-${index}`}
      aria-labelledby={`house-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const HouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [house, setHouse] = useState(null);
  const [residents, setResidents] = useState([]);
  const [allResidents, setAllResidents] = useState([]);
  const [history, setHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Form states
  const [addResidentForm, setAddResidentForm] = useState({
    resident_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });
  
  const [removeResidentForm, setRemoveResidentForm] = useState({
    resident_id: '',
    end_date: new Date().toISOString().split('T')[0]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    fetchData();
  }, [id]);
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch house details with current residents
      const houseResponse = await houseAPI.getById(id);
      setHouse(houseResponse.data.house);
      console.log(houseResponse.data.current_residents);
      setResidents(houseResponse.data.current_residents || []);
      
      // Fetch residence history
      const historyResponse = await houseAPI.getHistory(id);
      setHistory(historyResponse.data);
      
      // Fetch payment history
      const paymentResponse = await houseAPI.getPaymentHistory(id);
      setPaymentHistory(paymentResponse.data);
      
      // Fetch all residents for select dropdown
      const residentsResponse = await residentAPI.getAll();
      setAllResidents(residentsResponse.data);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching house data:', error);
      toast.error('Failed to load house data');
      setIsLoading(false);
      navigate('/houses');
    }
  };

  const renderCurrentMonthPaymentStatus = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Flatten all payments for this house
    const allHousePayments = paymentHistory.flatMap(entry => entry.payments || []);

    // Check if security payment is made for current month
    const securityPaid = allHousePayments.some(payment => {
      const periodStart = new Date(payment.period_start);
      return periodStart.getMonth() === currentMonth &&
          periodStart.getFullYear() === currentYear &&
          payment.payment_type === 'security' &&
          payment.is_paid;
    });

    // Check if cleaning payment is made for current month
    const cleaningPaid = allHousePayments.some(payment => {
      const periodStart = new Date(payment.period_start);
      return periodStart.getMonth() === currentMonth &&
          periodStart.getFullYear() === currentYear &&
          payment.payment_type === 'cleaning' &&
          payment.is_paid;
    });

    return (
        <>
          <Chip
              label="Keamanan"
              color={securityPaid ? "success" : "error"}
              size="small"
              variant={securityPaid ? "filled" : "outlined"}
          />
          <Chip
              label="Kebersihan"
              color={cleaningPaid ? "success" : "error"}
              size="small"
              variant={cleaningPaid ? "filled" : "outlined"}
          />
        </>
    );
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddResidentForm({ ...addResidentForm, [name]: value });
    
    // Clear error
    if (errors[`add_${name}`]) {
      setErrors({
        ...errors,
        [`add_${name}`]: null
      });
    }
  };
  
  const handleRemoveFormChange = (e) => {
    const { name, value } = e.target;
    setRemoveResidentForm({ ...removeResidentForm, [name]: value });
    
    // Clear error
    if (errors[`remove_${name}`]) {
      setErrors({
        ...errors,
        [`remove_${name}`]: null
      });
    }
  };
  
  const validateAddForm = () => {
    const newErrors = {};
    
    if (!addResidentForm.resident_id) {
      newErrors.add_resident_id = 'Mohon pilih penghuni yang akan ditambahkan';
    }
    
    if (!addResidentForm.start_date) {
      newErrors.add_start_date = 'Tanggal mulai harus diisi';
    }
    
    if (addResidentForm.end_date && new Date(addResidentForm.end_date) <= new Date(addResidentForm.start_date)) {
      newErrors.add_end_date = 'Tanggal akhir harus lebih dari tanggal mulai';
    }
    
    setErrors({ ...errors, ...newErrors });
    return Object.keys(newErrors).length === 0;
  };
  
  const validateRemoveForm = () => {
    const newErrors = {};
    
    if (!removeResidentForm.resident_id) {
      newErrors.remove_resident_id = 'Mohon pilih penghuni yang akan dihapus';
    }
    
    if (!removeResidentForm.end_date) {
      newErrors.remove_end_date = 'Tanggal akhir harus diisi';
    }
    
    setErrors({ ...errors, ...newErrors });
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddResident = async (e) => {
    e.preventDefault();
    
    if (!validateAddForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await houseAPI.addResident(id, addResidentForm);
      toast.success('Penghuni berhasil ditambahkan');
      
      // Reset form
      setAddResidentForm({
        resident_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
      });
      
      // Refresh data
      fetchData();
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error adding resident:', error);
      toast.error('Gagal menambahkan penghuni');
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveResident = async (e) => {
    e.preventDefault();
    
    if (!validateRemoveForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await houseAPI.removeResident(id, removeResidentForm);
      toast.success('Penghuni berhasil dihapus');
      
      // Reset form
      setRemoveResidentForm({
        resident_id: '',
        end_date: new Date().toISOString().split('T')[0]
      });
      
      // Refresh data
      fetchData();
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error removing resident:', error);
      toast.error('Gagal menghapus penghuni');
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!house) {
    return (
      <EmptyState 
        message="Rumah tidak ditemukan"
        buttonText="Kembali ke Data Rumah"
        buttonPath="/houses" 
        buttonIcon={<ArrowBackIcon />} 
      />
    );
  }
  
  // Filter out residents that are already assigned to this house
  const availableResidents = allResidents.filter(
    resident => !residents.some(r => r.id === resident.id)
  );
  
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 1 }} fontSize="large" />
            Rumah: {house.house_number}
          </Box>
        </Typography>
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={`/houses/edit/${house.id}`}
            startIcon={<EditIcon />}
            sx={{ mr: 2 }}
          >
            Perbaharui Rumah
          </Button>
          
          <Button
            variant="outlined"
            component={RouterLink}
            to="/houses"
            startIcon={<ArrowBackIcon />}
          >
            Kembali ke Data Rumah
          </Button>
        </Box>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={house.occupancy_status === 'occupied' ? 'Berpenghuni' : 'Tidak Berpenghuni'}
                  color={house.occupancy_status === 'occupied' ? 'success' : 'error'}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Jumlah Penghuni</Typography>
              <Typography variant="body1">
                {residents.length} orang
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Status Pembayaran</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                {renderCurrentMonthPaymentStatus()}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="house tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Penghuni Aktif" id="house-tab-0" />
            <Tab label="Riwayat Penghuni" id="house-tab-1" />
            <Tab label="Riwayat Pembayaran" id="house-tab-2" />
            <Tab label="Manajemen Penghuni" id="house-tab-3" />
          </Tabs>
        </Box>
        
        {/* Current Residents Tab */}
        <TabPanel value={tabValue} index={0}>
          {residents.length === 0 ? (
            <EmptyState 
              message="Tidak ada penghuni saat ini"
              secondaryMessage="Tambah penghuni di manajemen penghuni"
              buttonText="Manajemen Penghuni"
              buttonPath="#"
              buttonIcon={<PersonAddIcon />}
              buttonOnClick={() => setTabValue(3)}
            />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Penghuni</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Nomor Telepon</TableCell>
                    <TableCell>Tanggal Mulai</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {residents.map(item => {
                    // Find history entry for this resident
                    const historyEntry = history.find(
                      entry => entry.resident_id === item.resident.id && entry.is_current
                    );
                    
                    return (
                      <TableRow key={item.resident.id}>
                        <TableCell>{item.resident.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.resident.resident_status === 'permanent' ? 'Permanen' : 'Kontrak'}
                            color={item.resident.resident_status === 'permanent' ? 'success' : 'warning'}
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{item.resident.phone_number}</TableCell>
                        <TableCell>{historyEntry?.start_date?.split('T')[0] || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            component={RouterLink}
                            to={`/residents/edit/${item.resident.id}`}
                            size="small"
                            color="primary"
                          >
                            Lihat Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        
        {/* Resident History Tab */}
        <TabPanel value={tabValue} index={1}>
          {history.length === 0 ? (
            <EmptyState message="Tidak ada riwayat penghuni untuk rumah ini" />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Penghuni</TableCell>
                    <TableCell>Tanggal Mulai</TableCell>
                    <TableCell>Tanggal Berakhir</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.resident?.name || 'Unknown'}</TableCell>
                      <TableCell>{entry.start_date?.split('T')[0]}</TableCell>
                      <TableCell>{entry.end_date?.split('T')[0] || 'Present'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={entry.is_current ? 'Sekarang' : 'Sebelumnya'}
                          color={entry.is_current ? 'success' : 'default'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        
        {/* Payment History Tab */}
        <TabPanel value={tabValue} index={2}>
          {paymentHistory.length === 0 ? (
            <EmptyState message="Tidak ada riwayat pembayaran untuk rumah ini" />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Penghuni</TableCell>
                    <TableCell>Jenis Pembayaran</TableCell>
                    <TableCell>Jumlah</TableCell>
                    <TableCell>Tanggal Pembayaran</TableCell>
                    <TableCell>Periode</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.flatMap(entry => 
                    entry.payments?.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{entry.resident?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          {payment.payment_type === 'security' ? 'Keamanan' : 'Kebersihan'}
                        </TableCell>
                        <TableCell>Rp {parseFloat(payment.amount).toLocaleString()}</TableCell>
                        <TableCell>{payment.payment_date?.split('T')[0]}</TableCell>
                        <TableCell>
                          {payment.period_start?.split('T')[0]} - {payment.period_end?.split('T')[0]}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.is_paid ? 'Lunas' : 'Belum Lunas'}
                            color={payment.is_paid ? 'success' : 'error'} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    )) ?? []
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        
        {/* Manage Residents Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Add Resident Form */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Tambah Penghuni
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box component="form" onSubmit={handleAddResident}>
                  <SelectInput
                    name="resident_id"
                    label="Pilih Penghuni"
                    value={addResidentForm.resident_id}
                    onChange={handleAddFormChange}
                    options={availableResidents.map(r => ({ value: r.id, label: `${r.name} (${r.resident_status === 'permanent' ? 'Permanen' : 'Kontrak'})` }))}
                    error={!!errors.add_resident_id}
                    helperText={errors.add_resident_id}
                    disabled={availableResidents.length === 0 || isSubmitting}
                    fullWidth
                  />
                  
                  <DateInput
                    name="start_date"
                    label="Tanggal Mulai"
                    value={addResidentForm.start_date}
                    onChange={handleAddFormChange}
                    error={!!errors.add_start_date}
                    helperText={errors.add_start_date}
                    required
                    disabled={isSubmitting}
                  />
                  
                  <DateInput
                    name="end_date"
                    label="Tanggal Berakhir (opsional)"
                    value={addResidentForm.end_date}
                    onChange={handleAddFormChange}
                    error={!!errors.add_end_date}
                    helperText={errors.add_end_date || "Biarkan kosong jika penghuni permanen"}
                    minDate={addResidentForm.start_date}
                    disabled={isSubmitting}
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={availableResidents.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? 'Menambahkan...' : 'Tambah Penghuni'}
                  </Button>
                  
                  {availableResidents.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                      No available residents to add
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            {/* Remove Resident Form */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Hapus Penghuni
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {residents.length === 0 ? (
                  <Typography>Tidak ada penghuni</Typography>
                ) : (
                  <Box component="form" onSubmit={handleRemoveResident}>
                    <SelectInput
                      name="resident_id"
                      label="Pilih Penghuni"
                      value={removeResidentForm.resident_id}
                      onChange={handleRemoveFormChange}
                      options={residents.map(item => ({ value: item.resident.id, label: item.resident.name }))}
                      error={!!errors.remove_resident_id}
                      helperText={errors.remove_resident_id}
                      disabled={isSubmitting}
                      fullWidth
                    />
                    
                    <DateInput
                      name="end_date"
                      label="Tanggal Berakhir"
                      value={removeResidentForm.end_date}
                      onChange={handleRemoveFormChange}
                      error={!!errors.remove_end_date}
                      helperText={errors.remove_end_date}
                      required
                      disabled={isSubmitting}
                    />
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="error"
                      startIcon={<PersonRemoveIcon />}
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Menghapus...' : 'Hapus Penghuni'}
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </>
  );
};

export default HouseDetail;