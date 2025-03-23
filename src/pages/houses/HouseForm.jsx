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
import SaveIcon from '@mui/icons-material/Save';

import { houseAPI } from '../../api/api';
import { 
  TextInput, 
  SelectInput
} from '../../components/common/FormFields';
import Loading from '../../components/common/Loading';
import PageHeader from '../../components/common/PageHeader';

const HouseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    house_number: '',
    occupancy_status: 'vacant',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isEditing) {
      fetchHouseData();
    }
  }, [id]);
  
  const fetchHouseData = async () => {
    try {
      setIsLoading(true);
      const response = await houseAPI.getById(id);
      const house = response.data.house;
      
      setFormData({
        house_number: house.house_number,
        occupancy_status: house.occupancy_status,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching house:', error);
      toast.error('Gagal memuat data rumah');
      setIsLoading(false);
      navigate('/houses');
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
    
    if (!formData.house_number) {
      newErrors.house_number = 'Nomor rumah wajib diisi';
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
        await houseAPI.update(id, formData);
        toast.success('Rumah berhasil diperbarui');
      } else {
        await houseAPI.create(formData);
        toast.success('Rumah berhasil ditambahkan');
      }
      
      setIsSaving(false);
      navigate('/houses');
    } catch (error) {
      console.error('Error saving house:', error);
      
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
        toast.error(`Gagal ${isEditing ? 'memperbarui' : 'menambah'} rumah`);
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
        title={isEditing ? 'Perbarui Data Rumah' : 'Tambah Rumah Baru'}
      />
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextInput
                name="house_number"
                label="Nomor Rumah"
                value={formData.house_number}
                onChange={handleChange}
                required
                error={!!errors.house_number}
                helperText={errors.house_number}
                autoFocus
              />
            </Grid>
            
            <Grid item xs={12}>
              <SelectInput
                name="occupancy_status"
                label="Status Hunian"
                value={formData.occupancy_status}
                onChange={handleChange}
                options={[
                  { value: 'vacant', label: 'Tidak Berpenghuni' },
                  { value: 'occupied', label: 'Berpenghuni' },
                ]}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/houses')}
                >
                  Batalkan
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={isSaving}
                >
                  {isSaving ? 'Menyimpan...' : isEditing ? 'Perbarui Rumah' : 'Simpan Rumah'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};

export default HouseForm;