import {useState, useEffect} from 'react';
import {
    Paper,
    Box,
    Grid,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {Bar} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

import {paymentAPI} from '../../api/api';
import Loading from '../../components/common/Loading';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const PaymentSummary = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchSummaryData();
    }, [year]);

    const fetchSummaryData = async () => {
        try {
            setIsLoading(true);
            const response = await paymentAPI.getSummary(year);
            setSummaryData(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching summary data:', error);
            setIsLoading(false);
        }
    };

    const handleYearChange = (e) => {
        setYear(parseInt(e.target.value));
    };

    const chartData = {
        labels: summaryData?.monthly_data?.map(item => item.month) || [],
        datasets: [
            {
                label: 'Pemasukan Keamanan',
                data: summaryData?.monthly_data?.map(item => item.security_income) || [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
            {
                label: 'Pemasukan Kebersihan',
                data: summaryData?.monthly_data?.map(item => item.cleaning_income) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: 'Pengeluaran',
                data: summaryData?.monthly_data?.map(item => item.total_expenses) || [],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Catatan keuangan periode ${year}`,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    const calculateTotal = (key) => {
        if (!summaryData?.monthly_data) return 0;
        return summaryData.monthly_data.reduce((sum, month) => sum + parseFloat(month[key] || 0), 0);
    };

    return (
        <>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Ringkasan Laporan Keuangan
                </Typography>

                <FormControl sx={{minWidth: 120}}>
                    <InputLabel id="year-select-label">Tahun</InputLabel>
                    <Select
                        labelId="year-select-label"
                        id="year-select"
                        value={year}
                        label="Tahun"
                        onChange={handleYearChange}
                    >
                        {Array.from({length: 5}, (_, i) => (
                            <MenuItem key={i} value={new Date().getFullYear() - 2 + i}>
                                {new Date().getFullYear() - 2 + i}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {isLoading ? (
                <Loading/>
            ) : (
                <>
                    <Grid container spacing={3} sx={{mb: 4}}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Total Pemasukan
                                    </Typography>
                                    <Typography variant="h4" sx={{color: 'success.main', fontWeight: 'bold'}}>
                                        Rp {calculateTotal('total_income').toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Total Pengeluaran
                                    </Typography>
                                    <Typography variant="h4" sx={{color: 'error.main', fontWeight: 'bold'}}>
                                        Rp {calculateTotal('total_expenses').toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Total Saldo
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: calculateTotal('balance') >= 0 ? 'success.main' : 'error.main',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Rp {calculateTotal('balance').toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Paper sx={{p: 3, mb: 4}}>
                        <Typography variant="h6" gutterBottom>
                            Ringkasan Bulanan
                        </Typography>
                        <Box sx={{height: '400px'}}>
                            <Bar data={chartData} options={chartOptions}/>
                        </Box>
                    </Paper>

                    <Paper>
                        <TableContainer>
                            <Table aria-label="monthly summary table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Month</TableCell>
                                        <TableCell align="right">Pemasukan Keamanan</TableCell>
                                        <TableCell align="right">Pemasukan Kebersihan</TableCell>
                                        <TableCell align="right">Total Pemasukan</TableCell>
                                        <TableCell align="right">Pengeluaran</TableCell>
                                        <TableCell align="right">Saldo</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {summaryData?.monthly_data?.map((month, index) => (
                                        <TableRow key={index}>
                                            <TableCell component="th" scope="row">
                                                {month.month}
                                            </TableCell>
                                            <TableCell align="right">
                                                Rp {parseFloat(month.security_income).toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                Rp {parseFloat(month.cleaning_income).toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                <strong>Rp {parseFloat(month.total_income).toLocaleString()}</strong>
                                            </TableCell>
                                            <TableCell align="right">
                                                Rp {parseFloat(month.total_expenses).toLocaleString()}
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    color: parseFloat(month.balance) >= 0 ? 'success.main' : 'error.main',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Rp {parseFloat(month.balance).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </>
            )}
        </>
    );
};

export default PaymentSummary;