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
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Tab,
    Tabs
} from '@mui/material';
import {Doughnut} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

import {paymentAPI} from '../../api/api';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

// Tab Panel Component
function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`monthly-tabpanel-${index}`}
            aria-labelledby={`monthly-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{pt: 3}}>{children}</Box>}
        </div>
    );
}

const MonthlyDetail = () => {
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchReportData();
    }, [filter]);

    const fetchReportData = async () => {
        try {
            setIsLoading(true);
            const response = await paymentAPI.getMonthlyDetail(filter.year, filter.month);
            setReportData(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching monthly report data:', error);
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilter(prev => ({...prev, [name]: parseInt(value)}));
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getMonthName = (monthNumber) => {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return months[monthNumber - 1];
    };

    const incomeChartData = {
        labels: ['Keamanan', 'Kebersihan'],
        datasets: [
            {
                data: [
                    reportData?.payments?.filter(p => p.payment_type === 'security' && p.is_paid)
                        .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0,
                    reportData?.payments?.filter(p => p.payment_type === 'cleaning' && p.is_paid)
                        .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0
                ],
                backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(75, 192, 192, 0.8)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const expenseChartData = {
        labels: ['Keamanan', 'Kebersihan', 'Perawatan', 'Lainnya'],
        datasets: [
            {
                data: [
                    reportData?.expenses?.filter(e => e.expense_type === 'security')
                        .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
                    reportData?.expenses?.filter(e => e.expense_type === 'cleaning')
                        .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
                    reportData?.expenses?.filter(e => e.expense_type === 'maintenance')
                        .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
                    reportData?.expenses?.filter(e => e.expense_type === 'other')
                        .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
        },
    };

    return (
        <>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Detail Laporan Bulanan
                </Typography>

                <Box sx={{display: 'flex', gap: 2}}>
                    <FormControl sx={{minWidth: 120}}>
                        <InputLabel id="month-select-label">Bulan</InputLabel>
                        <Select
                            labelId="month-select-label"
                            id="month-select"
                            name="month"
                            value={filter.month}
                            label="Bulan"
                            onChange={handleFilterChange}
                        >
                            {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                                <MenuItem key={month} value={month}>
                                    {getMonthName(month)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{minWidth: 120}}>
                        <InputLabel id="year-select-label">Tahun</InputLabel>
                        <Select
                            labelId="year-select-label"
                            id="year-select"
                            name="year"
                            value={filter.year}
                            label="Tahun"
                            onChange={handleFilterChange}
                        >
                            {Array.from({length: 5}, (_, i) => (
                                <MenuItem key={i} value={new Date().getFullYear() - 2 + i}>
                                    {new Date().getFullYear() - 2 + i}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
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
                                        Rp {(reportData?.total_income || 0).toLocaleString()}
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
                                        Rp {(reportData?.total_expenses || 0).toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Saldo Bersih
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: ((reportData?.total_income || 0) - (reportData?.total_expenses || 0)) >= 0
                                                ? 'success.main'
                                                : 'error.main',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Rp {((reportData?.total_income || 0) - (reportData?.total_expenses || 0)).toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{mb: 4}}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{p: 3, height: '100%'}}>
                                <Typography variant="h6" gutterBottom>
                                    Rincian Pemasukan
                                </Typography>
                                <Divider sx={{mb: 2}}/>

                                {!reportData?.payments?.length ? (
                                    <Box sx={{
                                        height: '250px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography variant="body1" color="textSecondary">
                                            Tidak ada data pemasukan untuk bulan ini
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{height: '250px'}}>
                                        <Doughnut data={incomeChartData} options={chartOptions}/>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{p: 3, height: '100%'}}>
                                <Typography variant="h6" gutterBottom>
                                    Rincian Pengeluaran
                                </Typography>
                                <Divider sx={{mb: 2}}/>

                                {!reportData?.expenses?.length ? (
                                    <Box sx={{
                                        height: '250px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography variant="body1" color="textSecondary">
                                            Tidak ada data pengeluaran untuk bulan ini
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{height: '250px'}}>
                                        <Doughnut data={expenseChartData} options={chartOptions}/>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper sx={{mb: 4}}>
                        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                aria-label="monthly report tabs"
                            >
                                <Tab label="Detail Pembayaran" id="monthly-tab-0"/>
                                <Tab label="Detail Pengeluaran" id="monthly-tab-1"/>
                            </Tabs>
                        </Box>

                        <TabPanel value={tabValue} index={0}>
                            {!reportData?.payments?.length ? (
                                <EmptyState message="Tidak ada data pembayaran untuk bulan ini"/>
                            ) : (
                                <TableContainer>
                                    <Table aria-label="payment details table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Penghuni</TableCell>
                                                <TableCell>Rumah</TableCell>
                                                <TableCell>Jenis</TableCell>
                                                <TableCell>Jumlah</TableCell>
                                                <TableCell>Tanggal Pembayaran</TableCell>
                                                <TableCell>Periode</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {reportData.payments.map(payment => (
                                                <TableRow key={payment.id}>
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
                                                    <TableCell>{payment.payment_date?.split('T')[0]}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                            {payment.payment_period === 'yearly' ? (
                                                                <Chip size="small" label="Tahunan" color="info"
                                                                      sx={{mr: 1}}/>
                                                            ) : (
                                                                <Chip size="small" label="Bulanan" color="default"
                                                                      sx={{mr: 1}}/>
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
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </TabPanel>

                        <TabPanel value={tabValue} index={1}>
                            {!reportData?.expenses?.length ? (
                                <EmptyState message="Tidak ada data pengeluaran untuk bulan ini"/>
                            ) : (
                                <TableContainer>
                                    <Table aria-label="expense details table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Deskripsi</TableCell>
                                                <TableCell>Jenis</TableCell>
                                                <TableCell>Jumlah</TableCell>
                                                <TableCell>Tanggal</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {reportData.expenses.map(expense => (
                                                <TableRow key={expense.id}>
                                                    <TableCell>{expense.description}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={expense.expense_type === 'security' ? 'Keamanan' :
                                                                expense.expense_type === 'maintenance' ? 'Perawatan' :
                                                                    expense.expense_type === 'cleaning' ? 'Kebersihan' :
                                                                        expense.expense_type === 'other' ? 'Lainnya' :
                                                                            'Tidak Diketahui'}
                                                            color={
                                                                expense.expense_type === 'security' ? 'primary' :
                                                                    expense.expense_type === 'cleaning' ? 'secondary' :
                                                                        expense.expense_type === 'maintenance' ? 'warning' : 'default'
                                                            }
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        Rp {parseFloat(expense.amount).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>{expense.expense_date}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </TabPanel>
                    </Paper>
                </>
            )}
        </>
    );
};

export default MonthlyDetail;