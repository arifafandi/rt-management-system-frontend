import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme';
import Layout from './components/Layout';

// Import pages
import Dashboard from './components/Dashboard';
import ResidentList from './pages/residents/ResidentList';
import ResidentForm from './pages/residents/ResidentForm';
import HouseList from './pages/houses/HouseList';
import HouseForm from './pages/houses/HouseForm';
import HouseDetail from './pages/houses/HouseDetail';
import PaymentList from './pages/payments/PaymentList';
import PaymentForm from './pages/payments/PaymentForm';
import ExpenseList from './pages/expenses/ExpenseList';
import ExpenseForm from './pages/expenses/ExpenseForm';
import PaymentSummary from './pages/reports/PaymentSummary';
import MonthlyDetail from './pages/reports/MonthlyDetail';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Residents */}
            <Route path="/residents" element={<ResidentList />} />
            <Route path="/residents/create" element={<ResidentForm />} />
            <Route path="/residents/edit/:id" element={<ResidentForm />} />
            
            {/* Houses */}
            <Route path="/houses" element={<HouseList />} />
            <Route path="/houses/create" element={<HouseForm />} />
            <Route path="/houses/edit/:id" element={<HouseForm />} />
            <Route path="/houses/:id" element={<HouseDetail />} />
            
            {/* Payments */}
            <Route path="/payments" element={<PaymentList />} />
            <Route path="/payments/create" element={<PaymentForm />} />
            <Route path="/payments/edit/:id" element={<PaymentForm />} />
            
            {/* Expenses */}
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/expenses/create" element={<ExpenseForm />} />
            <Route path="/expenses/edit/:id" element={<ExpenseForm />} />
            
            {/* Reports */}
            <Route path="/reports/payment-summary" element={<PaymentSummary />} />
            <Route path="/reports/monthly-detail" element={<MonthlyDetail />} />
          </Routes>
        </Layout>
        <ToastContainer position="bottom-right" />
      </Router>
    </ThemeProvider>
  );
}

export default App;