import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {
    Paper,
    Grid,
    Button,
    Box,
    Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

import {residentAPI} from '../../api/api';
import {
    TextInput,
    RadioGroupInput,
    SwitchInput,
    FileInput
} from '../../components/common/FormFields';
import Loading from '../../components/common/Loading';
import PageHeader from '../../components/common/PageHeader';
import axios from 'axios';

const ResidentForm = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: '',
        id_card_photo: null,
        resident_status: 'permanent',
        phone_number: '',
        is_married: 0,
    });

    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditing) {
            fetchResidentData();
        }
    }, [id]);

    const fetchResidentData = async () => {
        try {
            setIsLoading(true);
            const response = await residentAPI.getById(id);
            const resident = response.data;

            setFormData({
                name: resident.name,
                id_card_photo: null, // Don't set the file input value
                resident_status: resident.resident_status,
                phone_number: resident.phone_number,
                is_married: resident.is_married ? 1 : 0,
            });

            setPreview(`${axios.defaults.baseURL}/storage/${resident.id_card_photo}`);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching resident:', error);
            toast.error('Gagal memuat data penghuni');
            setIsLoading(false);
            navigate('/residents');
        }
    };

    const handleChange = (e) => {
        const {name, value, type, checked, files} = e.target;

        if (type === 'checkbox') {
            setFormData({...formData, [name]: checked ? 1 : 0});
        } else if (type === 'file' && files.length > 0) {
            setFormData({...formData, [name]: files[0]});

            // Create preview for the image
            if (files[0]) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(files[0]);
            }
        } else {
            setFormData({...formData, [name]: value});
        }

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

        if (!formData.name) {
            newErrors.name = 'Nama lengkap wajib diisi';
        }

        if (!isEditing && !formData.id_card_photo) {
            newErrors.id_card_photo = 'Foto KTP wajib diisi';
        }

        if (!formData.phone_number) {
            newErrors.phone_number = 'Nomor Telepon wajib diisi';
        } else if (!/^\d{10,13}$/.test(formData.phone_number.replace(/\D/g, ''))) {
            newErrors.phone_number = 'Nomor Telepon harus 10-13 digit';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        console.info(formData);
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSaving(true);

            if (isEditing) {
                await residentAPI.update(id, formData);
                toast.success('Penghuni berhasil diperbarui');
            } else {
                await residentAPI.create(formData);
                toast.success('Penghuni berhasil ditambahkan');
            }

            setIsSaving(false);
            navigate('/residents');
        } catch (error) {
            console.error('Error saving resident:', error);

            // Handle validation errors from backend
            if (error.response && error.response.status === 422) {
                const backendErrors = error.response.data.errors;
                const formattedErrors = {};

                Object.keys(backendErrors).forEach(key => {
                    formattedErrors[key] = backendErrors[key][0];
                });

                setErrors(formattedErrors);
                console.log(formattedErrors);
                toast.error(`Mohon perbaiki kesalahan di formulir`);
            } else {
                toast.error(`Gagal ${isEditing ? 'memperbarui' : 'menambah'} penghuni`);
            }

            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <Loading/>;
    }

    return (
        <>
            <PageHeader
                title={isEditing ? 'Ubah Data Penghuni' : 'Tambah Penghuni Baru'}
            />

            <Paper sx={{p: 3}}>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextInput
                                name="name"
                                label="Nama Lengkap"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                error={!!errors.name}
                                helperText={errors.name}
                                autoFocus
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FileInput
                                name="id_card_photo"
                                label={`Foto KTP ${isEditing ? '(biarkan jika tidak ingin diubah)' : ''}`}
                                onChange={handleChange}
                                required={!isEditing}
                                error={!!errors.id_card_photo}
                                helperText={errors.id_card_photo}
                                previewUrl={preview}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <RadioGroupInput
                                name="resident_status"
                                label="Status Penghuni"
                                value={formData.resident_status}
                                onChange={handleChange}
                                options={[
                                    {value: 'permanent', label: 'Permanen'},
                                    {value: 'contract', label: 'Kontrak'}
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextInput
                                name="phone_number"
                                label="Nomor Telepon"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                                error={!!errors.phone_number}
                                helperText={errors.phone_number}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <SwitchInput
                                name="is_married"
                                label="Status Pernikahan"
                                checked={formData.is_married}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{my: 2}}/>
                            <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 2}}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    startIcon={<ArrowBackIcon/>}
                                    onClick={() => navigate('/residents')}
                                >
                                    Batalkan
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SaveIcon/>}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Menyimpan...' : isEditing ? 'Perbarui Penghuni' : 'Simpan Penghuni'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </>
    );
};

export default ResidentForm;