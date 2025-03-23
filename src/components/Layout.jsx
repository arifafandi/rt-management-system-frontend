import {useState} from "react";
import {Box, Container} from "@mui/material";
import Navbar from "./Navbar.jsx";


const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar open={open} handleDrawerToggle={handleDrawerToggle} />
      
      <Box component="main" sx={{ flexGrow: 1, py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;