import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {
    Paper,
    Grid,
    Button,
    Box,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentsIcon from '@mui/icons-material/Payments';

import {paymentAPI, houseAPI} from '../../api/api';
import {
    SelectInput,
    DateInput,
    NumberInput,
    SwitchInput
} from '../../components/common/FormFields';
import Loading from '../../components/common/Loading';
import PageHeader from '../../components/common/PageHeader';

const PaymentForm = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        house_resident_id: '',
        payment_type: 'security',
        amount: 100000, // Default security fee amount
        payment_date: new Date().toISOString().split('T')[0],
        payment_period: 'monthly',
        period_start: new Date().toISOString().split('T')[0],
        period_end: '',
        is_paid: true,
    });

    const [houses, setHouses] = useState([]);
    const [residents, setResidents] = useState([]);
    const [selectedHouse, setSelectedHouse] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchHouses();

        if (isEditing) {
            fetchPaymentData();
        } else {
            calculatePeriodEnd();
        }
    }, []);

    useEffect(() => {
        calculatePeriodEnd();
    }, [formData.period_start, formData.payment_period]);

    const fetchHouses = async () => {
        try {
            const response = await houseAPI.getAll();
            setHouses(response.data.filter(house => house.occupancy_status === 'occupied'));
        } catch (error) {
            console.error('Error fetching houses:', error);
            toast.error('Gagal mengambil data rumah. Silahkan coba lagi nanti.');
        }
    };

    const fetchHouseResidents = async (houseId) => {
        try {
            const response = await houseAPI.getById(houseId);
            const currentResidents = response.data.current_residents || [];

            if (currentResidents.length) {
                // Also fetch the history to get house_resident_id
                const historyResponse = await houseAPI.getHistory(houseId);
                const history = historyResponse.data;
                console.log(history);

                // Add the house_resident_id to each resident
                const residentsWithId = currentResidents.map(item => {
                    const historyEntry = history.find(
                        h => h.resident_id === item.resident.id && h.is_current
                    );
                    return {
                        ...item,
                        house_resident_id: historyEntry?.id
                    };
                }).filter(r => r.house_resident_id); // Only include residents with a valid house_resident_id

                setResidents(residentsWithId);

                // If only one resident, automatically select them
                if (residentsWithId.length === 1) {
                    setFormData({
                        ...formData,
                        house_resident_id: residentsWithId[0].house_resident_id
                    });
                }
            } else {
                setResidents([]);
            }
        } catch (error) {
            console.error('Error fetching house residents:', error);
            toast.error('Gagal mengambil data penghuni rumah. Silahkan coba lagi nanti.');
        }
    };

    const fetchPaymentData = async () => {
        try {
            setIsLoading(true);
            const response = await paymentAPI.getById(id);
            const payment = response.data;

            setFormData({
                house_resident_id: payment.house_resident_id,
                payment_type: payment.payment_type,
                amount: payment.amount,
                payment_date: payment.payment_date,
                payment_period: payment.payment_period,
                period_start: payment.period_start,
                period_end: payment.period_end,
                is_paid: payment.is_paid,
            });

            // Set selected house based on the payment's house_resident
            if (payment.houseResident && payment.houseResident.house) {
                setSelectedHouse(payment.houseResident.house.id);
                await fetchHouseResidents(payment.houseResident.house.id);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching payment:', error);
            toast.error('Gagal mengambil data pembayaran. Silahkan coba lagi nanti.');
            setIsLoading(false);
            navigate('/payments');
        }
    };

    const calculatePeriodEnd = () => {
        if (formData.period_start) {
            const startDate = new Date(formData.period_start);
            let endDate;

            if (formData.payment_period === 'yearly') {
                // Set end date to one year after start date, minus one day
                endDate = new Date(startDate);
                endDate.setFullYear(endDate.getFullYear() + 1);
                endDate.setDate(endDate.getDate() - 1);
            } else {
                // Set end date to one month after start date, minus one day
                endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(endDate.getDate() - 1);
            }

            setFormData(prev => ({
                ...prev,
                period_end: endDate.toISOString().split('T')[0]
            }));
        }
    };

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;

        if (type === 'checkbox') {
            setFormData({...formData, [name]: checked});
        } else if (name === 'payment_type') {
            // Set default amount based on payment type
            const baseAmount = value === 'security' ? 100000 : 15000;
            const finalAmount = formData.payment_period === 'yearly' ? baseAmount * 12 : baseAmount;
            setFormData({...formData, [name]: value, amount: finalAmount});
        } else if (name === 'payment_period') {
            let amount;
            if (value === 'monthly') {
                amount = formData.payment_type === 'security' ? 100000 : 15000;
            } else {
                amount = (formData.payment_type === 'security' ? 100000 : 15000) * 12;
            }
            setFormData({...formData, [name]: value, amount});
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

    const handleHouseChange = async (e) => {
        const houseId = e.target.value;
        setSelectedHouse(houseId);
        setFormData({
            ...formData,
            house_resident_id: ''
        });

        if (houseId) {
            await fetchHouseResidents(houseId);
        } else {
            setResidents([]);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.house_resident_id && !isEditing) {
            newErrors.house_resident_id = 'Mohon pilih rumah dan penghuni rumah terlebih dahulu';
        }

        if (!formData.payment_date) {
            newErrors.payment_date = 'Tanggal pembayaran wajib diisi';
        }

        if (!formData.period_start) {
            newErrors.period_start = 'Periode mulai wajib diisi';
        }

        if (!formData.period_end) {
            newErrors.period_end = 'Periode akhir wajib diisi';
        }

        if (formData.period_end && new Date(formData.period_end) <= new Date(formData.period_start)) {
            newErrors.period_end = 'Periode akhir harus lebih besar dari periode mulai';
        }

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Jumlah pembayaran wajib diisi dan harus lebih besar dari 0';
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
                await paymentAPI.update(id, formData);
                toast.success('Pembayaran berhasil');
            } else {
                await paymentAPI.create(formData);
                toast.success('Pembayaran berhasil dicatat');
            }

            setIsSaving(false);
            navigate('/payments');
        } catch (error) {
            console.error('Error saving payment:', error);

            // Handle validation errors from backend
            if (error.response && error.response.status === 422) {
                const backendErrors = error.response.data.errors;
                const formattedErrors = {};

                Object.keys(backendErrors).forEach(key => {
                    formattedErrors[key] = backendErrors[key][0];
                });

                setErrors(formattedErrors);
                toast.error('Mohon periksa kembali data yang diinputkan');
            } else {
                toast.error(`Gagal ${isEditing ? 'memperbarui' : 'mencatat'} pembayaran`);
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
                title={isEditing ? 'Perbarui Data Pembayaran' : 'Catat Pembayaran'}
            />

            <Paper sx={{p: 3}}>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        {!isEditing && (
                            <>
                                <Grid item xs={12} md={6}>
                                    <FormControl
                                        fullWidth
                                        margin="normal"
                                        error={!!errors.selectedHouse}
                                    >
                                        <InputLabel id="house-select-label">Rumah</InputLabel>
                                        <Select
                                            labelId="house-select-label"
                                            id="house"
                                            value={selectedHouse}
                                            label="Rumah"
                                            onChange={handleHouseChange}
                                            disabled={isSaving}
                                        >
                                            <MenuItem value="">
                                                <em>-- Pilih Rumah --</em>
                                            </MenuItem>
                                            {houses.map((house) => (
                                                <MenuItem key={house.id} value={house.id}>
                                                    {house.house_number}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.selectedHouse && (
                                            <FormHelperText>{errors.selectedHouse}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl
                                        fullWidth
                                        margin="normal"
                                        error={!!errors.house_resident_id}
                                        disabled={!selectedHouse || residents.length === 0}
                                    >
                                        <InputLabel id="resident-select-label">Penghuni</InputLabel>
                                        <Select
                                            labelId="resident-select-label"
                                            id="house_resident_id"
                                            name="house_resident_id"
                                            value={formData.house_resident_id}
                                            label="Penghuni"
                                            onChange={handleChange}
                                            disabled={!selectedHouse || residents.length === 0 || isSaving}
                                        >
                                            <MenuItem value="">
                                                <em>-- Pilih Penghuni --</em>
                                            </MenuItem>
                                            {residents.map((item) => (
                                                <MenuItem key={item.resident.id} value={item.id}>
                                                    {item.resident.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.house_resident_id && (
                                            <FormHelperText>{errors.house_resident_id}</FormHelperText>
                                        )}
                                        {selectedHouse && residents.length === 0 && (
                                            <FormHelperText>Tidak ada penghuni di rumah ini</FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12} md={6}>
                            <SelectInput
                                name="payment_type"
                                label="Jenis Pembayaran"
                                value={formData.payment_type}
                                onChange={handleChange}
                                options={[
                                    {value: 'security', label: 'Keamanan (Rp 100,000)'},
                                    {value: 'cleaning', label: 'Kebersihan (Rp 15,000)'}
                                ]}
                                disabled={isSaving}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
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

                        <Grid item xs={12} md={6}>
                            <DateInput
                                name="payment_date"
                                label="Tanggal Pembayaran"
                                value={formData.payment_date?.split('T')[0]}
                                onChange={handleChange}
                                error={!!errors.payment_date}
                                helperText={errors.payment_date}
                                required
                                disabled={isSaving}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <SelectInput
                                name="payment_period"
                                label="Payment Period"
                                value={formData.payment_period}
                                onChange={handleChange}
                                options={[
                                    {value: 'monthly', label: 'Bulanan'},
                                    {value: 'yearly', label: 'Tahunan'}
                                ]}
                                disabled={isSaving}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <DateInput
                                name="period_start"
                                label="Periode Mulai"
                                value={formData.period_start?.split('T')[0]}
                                onChange={handleChange}
                                error={!!errors.period_start}
                                helperText={errors.period_start}
                                required
                                disabled={isSaving}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <DateInput
                                name="period_end"
                                label="Periode Berakhir"
                                value={formData.period_end?.split('T')[0]}
                                onChange={handleChange}
                                error={!!errors.period_end}
                                helperText={errors.period_end}
                                required
                                disabled={true}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <SwitchInput
                                name="is_paid"
                                label="Sudah dibayar"
                                checked={formData.is_paid}
                                onChange={handleChange}
                                disabled={isSaving}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{my: 2}}/>
                            <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 2}}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    startIcon={<ArrowBackIcon/>}
                                    onClick={() => navigate('/payments')}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<PaymentsIcon/>}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Menyimpan...' : isEditing ? 'Perbarui Pembayaran' : 'Catat Pembayaran'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </>
    );
};

export default PaymentForm;