import {Button, Paper, Typography} from "@mui/material";
import { Link as RouterLink } from 'react-router-dom';

const EmptyState = ({ 
  message, 
  secondaryMessage, 
  buttonText, 
  buttonPath, 
  buttonIcon 
}) => {
  return (
    <Paper 
      sx={{ 
        p: 4, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}
    >
      <Typography variant="h6" gutterBottom>{message}</Typography>
      
      {secondaryMessage && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {secondaryMessage}
        </Typography>
      )}
      
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
    </Paper>
  );
};

export default EmptyState;