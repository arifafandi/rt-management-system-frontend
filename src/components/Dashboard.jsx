import {useState, useEffect} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider
} from '@mui/material';
import {styled} from '@mui/material/styles';
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
import {paymentAPI, statisticAPI} from '../api/api';
import Loading from './common/Loading';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Quick link button
const QuickLinkButton = styled(Button)(({theme}) => ({
    padding: theme.spacing(2),
    justifyContent: 'flex-start',
    textAlign: 'left',
    width: '100%',
    borderRadius: 8,
    backgroundColor: theme.palette.background.default,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

// Action link
const ActionLink = styled(Button)(({theme}) => ({
    justifyContent: 'flex-start',
    padding: theme.spacing(1, 0),
    '&:hover': {
        backgroundColor: 'transparent',
        textDecoration: 'underline',
    },
}));

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState({
        residents: 0,
        houses: 0,
        occupiedHouses: 0,
        pendingPayments: 0
    });

    useEffect(() => {
        fetchData();
    }, [year]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await paymentAPI.getSummary(year);
            setSummary(response.data);

            const statisticsResponse = await statisticAPI.getDashboard(year);

            setStats({
                residents: statisticsResponse.data.residents,
                houses: statisticsResponse.data.houses,
                occupiedHouses: statisticsResponse.data.occupiedHouses,
                pendingPayments: statisticsResponse.data.pendingPayments,
                yearlyBalance: statisticsResponse.data.yearlyBalance,
            });

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setIsLoading(false);
        }
    };

    const handleYearChange = (event) => {
        setYear(event.target.value);
    };

    const chartData = {
        labels: summary?.monthly_data?.map(item => item.month) || [],
        datasets: [
            {
                label: 'Pemasukan',
                data: summary?.monthly_data?.map(item => item.total_income) || [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
            {
                label: 'Pengeluaran',
                data: summary?.monthly_data?.map(item => item.total_expenses) || [],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
            {
                label: 'Saldo Bersih',
                data: summary?.monthly_data?.map(item => item.balance) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }
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
                text: `Ringkasan Finansial Tahun ${year}`,
            },
        },
    };

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard
                </Typography>

                <FormControl variant="outlined" sx={{minWidth: 120}}>
                    <InputLabel id="year-select-label">Tahun</InputLabel>
                    <Select
                        labelId="year-select-label"
                        id="year-select"
                        value={year}
                        onChange={handleYearChange}
                        label="Year"
                    >
                        {Array.from({length: 5}, (_, i) => (
                            <MenuItem key={i} value={new Date().getFullYear() - 2 + i}>
                                {new Date().getFullYear() - 2 + i}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Stats cards */}
            <Grid container spacing={3} sx={{mb: 4}}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div" gutterBottom>
                                Penghuni
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <PeopleIcon fontSize="large" color="primary"/>
                                <Typography variant="h5" component="div" sx={{ml: 1, fontWeight: 'bold'}}>
                                    {stats.residents}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                Total penghuni
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div" gutterBottom>
                                Rumah
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <HomeIcon fontSize="large" color="primary"/>
                                <Typography variant="h5" component="div" sx={{ml: 1, fontWeight: 'bold'}}>
                                    {stats.occupiedHouses}/{stats.houses}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                {stats.occupiedHouses} rumah berpenghuni
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div" gutterBottom>
                                Belum Dibayar
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <PaymentsIcon fontSize="large" color="secondary"/>
                                <Typography variant="h5" component="div" sx={{ml: 1, fontWeight: 'bold'}}>
                                    {stats.pendingPayments}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                Rumah terisi yang belum bayar
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div" gutterBottom>
                                Saldo Tahunan
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <ReceiptIcon fontSize="large" color="success"/>
                                <Typography variant="h5" component="div" sx={{ml: 1, fontWeight: 'bold'}}>
                                    Rp. {stats.yearlyBalance?.toLocaleString()}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                Saldo bersih tahunan
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Financial summary chart */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{p: 3, height: '100%'}}>
                        <Typography variant="h6" gutterBottom>
                            Ringkasan Finansial Bulanan
                        </Typography>

                        {isLoading ? (
                            <Loading message="Memuat data ringkasan finansial tahunan..."/>
                        ) : (
                            <Box sx={{height: 400}}>
                                <Bar data={chartData} options={chartOptions}/>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Grid container spacing={3} direction="column">
                        {/* Quick Actions */}
                        <Grid item>
                            <Paper sx={{p: 3}}>
                                <Typography variant="h6" gutterBottom>
                                    Manajemen Data
                                </Typography>
                                <Divider sx={{mb: 2}}/>

                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                    <ActionLink
                                        component={RouterLink}
                                        to="/residents/create"
                                        startIcon={<AddIcon/>}
                                        color="primary"
                                    >
                                        Tambah penghuni
                                    </ActionLink>

                                    <ActionLink
                                        component={RouterLink}
                                        to="/houses/create"
                                        startIcon={<AddIcon/>}
                                        color="primary"
                                    >
                                        Tambah rumah
                                    </ActionLink>

                                    <ActionLink
                                        component={RouterLink}
                                        to="/payments/create"
                                        startIcon={<AddIcon/>}
                                        color="primary"
                                    >
                                        Catat pembayaran
                                    </ActionLink>

                                    <ActionLink
                                        component={RouterLink}
                                        to="/expenses/create"
                                        startIcon={<AddIcon/>}
                                        color="primary"
                                    >
                                        Catat pengeluaran
                                    </ActionLink>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Reports */}
                        <Grid item>
                            <Paper sx={{p: 3}}>
                                <Typography variant="h6" gutterBottom>
                                    Laporan
                                </Typography>
                                <Divider sx={{mb: 2}}/>

                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                    <QuickLinkButton
                                        component={RouterLink}
                                        to="/reports/payment-summary"
                                        startIcon={<BarChartIcon/>}
                                        color="primary"
                                        variant="text"
                                    >
                                        Ringkasan Pembayaran
                                    </QuickLinkButton>

                                    <QuickLinkButton
                                        component={RouterLink}
                                        to="/reports/monthly-detail"
                                        startIcon={<CalendarViewMonthIcon/>}
                                        color="primary"
                                        variant="text"
                                    >
                                        Detail Pembayaran Bulanan
                                    </QuickLinkButton>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;