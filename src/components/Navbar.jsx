import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import HouseIcon from '@mui/icons-material/House';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Navbar = ({ open, handleDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const [reportAnchorEl, setReportAnchorEl] = useState(null);

  const handleReportMenuOpen = (event) => {
    setReportAnchorEl(event.currentTarget);
  };

  const handleReportMenuClose = () => {
    setReportAnchorEl(null);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <HomeIcon /> },
    { name: 'Penghuni', path: '/residents', icon: <PeopleIcon /> },
    { name: 'Rumah', path: '/houses', icon: <HouseIcon /> },
    { name: 'Pembayaran', path: '/payments', icon: <PaymentsIcon /> },
    { name: 'Pengeluaran', path: '/expenses', icon: <ReceiptIcon /> },
  ];

  const reportItems = [
    { name: 'Ringkasan Pembayaran', path: '/reports/payment-summary', icon: <BarChartIcon /> },
    { name: 'Detail Bulanan', path: '/reports/monthly-detail', icon: <CalendarViewMonthIcon /> },
  ];

  // Determine if a nav item is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Drawer content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          Neighborhood Admin
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon><BarChartIcon /></ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItemButton>
        </ListItem>

        {reportItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              onClick={handleDrawerToggle}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* App title */}
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: 'flex',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              RT ADMIN
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    my: 2,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    },
                  }}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Button>
              ))}

              <Button
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
                onClick={handleReportMenuOpen}
              >
                <span>Laporan</span>
                <KeyboardArrowDownIcon />
              </Button>
              <Menu
                anchorEl={reportAnchorEl}
                open={Boolean(reportAnchorEl)}
                onClose={handleReportMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'reports-button',
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                {reportItems.map((item) => (
                  <MenuItem
                    key={item.name}
                    component={RouterLink}
                    to={item.path}
                    onClick={handleReportMenuClose}
                    sx={{
                      backgroundColor: isActive(item.path) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                    }}
                  >
                    {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                    <ListItemText primary={item.name} />
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="RT Admin">
                <IconButton sx={{ p: 0 }}>
                  <Avatar alt="RT Admin" src="/static/images/avatar/admin.jpg" />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;