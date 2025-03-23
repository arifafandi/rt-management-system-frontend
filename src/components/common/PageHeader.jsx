import {Box, Button, Typography} from "@mui/material";
import { Link as RouterLink } from 'react-router-dom';

const PageHeader = ({ title, buttonText, buttonPath, buttonIcon }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      
      {buttonText && buttonPath && (
        <Button
          component={RouterLink}
          to={buttonPath}
          variant="contained"
          color="primary"
          startIcon={buttonIcon}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  );
};

export default PageHeader;