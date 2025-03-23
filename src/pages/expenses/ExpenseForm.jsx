import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Paper, 
  Grid, 
  Button, 
  Box, 
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptIcon from '@mui/icons-material/Receipt';

import { expenseAPI } from '../../api/api';
import { 
  TextInput, 
  SelectInput, 
  DateInput,
  NumberInput
} from '../../components/common/FormFields';
import Loading from '../../components/common/Loading';
import PageHeader from '../../components/common/PageHeader';

const ExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    description: '',
    expense_type: 'security',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isEditing) {
      fetchExpenseData();
    }
  }, [id]);
  
  const fetchExpenseData = async () => {
    try {
      setIsLoading(true);
      const response = await expenseAPI.getById(id);
      const expense = response.data;
      
      setFormData({
        description: expense.description,
        expense_type: expense.expense_type,
        amount: expense.amount,
        expense_date: expense.expense_date,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching expense:', error);
      toast.error('Gagal memuat data pengeluaran');
      setIsLoading(false);
      navigate('/expenses');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description) {
      newErrors.description = 'Deskripsi pengeluaran wajib diisi';
    }
    
    if (!formData.expense_date) {
      newErrors.expense_date = 'Tanggal pengeluaran wajib diisi';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Jumlah pengeluaran wajib diisi dan harus lebih dari 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      if (isEditing) {
        await expenseAPI.update(id, formData);
        toast.success('Pengeluaran berhasil diperbarui');
      } else {
        await expenseAPI.create(formData);
        toast.success('Pengeluaran berhasil ditambahkan');
      }
      
      setIsSaving(false);
      navigate('/expenses');
    } catch (error) {
      console.error('Error saving expense:', error);
      
      // Handle validation errors from backend
      if (error.response && error.response.status === 422) {
        const backendErrors = error.response.data.errors;
        const formattedErrors = {};
        
        Object.keys(backendErrors).forEach(key => {
          formattedErrors[key] = backendErrors[key][0];
        });
        
        setErrors(formattedErrors);
        toast.error('Mohon perbaiki kesalahan di formulir');
      } else {
        toast.error(`Gagal ${isEditing ? 'memperbarui' : 'mencatat'} pengeluaran`);
      }
      
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <Loading />;
  }
  
  return (
    <>
      <PageHeader 
        title={isEditing ? 'Perbarui Data Pengeluaran' : 'Catat Pengeluaran'}
      />
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextInput
                name="description"
                label="Deskripsi"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                required
                disabled={isSaving}
                autoFocus
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <SelectInput
                name="expense_type"
                label="Jenis Pengeluaran"
                value={formData.expense_type}
                onChange={handleChange}
                options={[
                  { value: 'security', label: 'Keamanan' },
                  { value: 'cleaning', label: 'Kebersihan' },
                  { value: 'maintenance', label: 'Perawatan' },
                  { value: 'other', label: 'Lainnya' }
                ]}
                disabled={isSaving}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <NumberInput
                name="amount"
                label="Jumlah (Rp)"
                value={formData.amount}
                onChange={handleChange}
                error={!!errors.amount}
                helperText={errors.amount}
                required
                min="0"
                disabled={isSaving}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <DateInput
                name="expense_date"
                label="Tanggal Pengeluaran"
                value={formData.expense_date?.split('T')[0]}
                onChange={handleChange}
                error={!!errors.expense_date}
                helperText={errors.expense_date}
                required
                disabled={isSaving}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/expenses')}
                  disabled={isSaving}
                >
                  Batalkan
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<ReceiptIcon />}
                  disabled={isSaving}
                >
                  {isSaving ? 'Menyimpan...' : isEditing ? 'Perbarui Pengeluaran' : 'Catat Pengeluaran'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};

export default ExpenseForm;