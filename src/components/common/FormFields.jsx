// Text Field
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText, FormLabel,
  InputLabel,
  MenuItem, Radio, RadioGroup,
  Select,
  Switch,
  TextField
} from "@mui/material";

export const TextInput = ({
  name, 
  label, 
  value, 
  onChange, 
  required = false, 
  error = false,
  helperText = '',
  fullWidth = true,
  ...props 
}) => {
  return (
    <TextField
      id={name}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      margin="normal"
      variant="outlined"
      {...props}
    />
  );
};

// Select Field
export const SelectInput = ({
  name,
  label,
  value,
  onChange,
  options = [],
  required = false,
  error = false,
  helperText = '',
  fullWidth = true,
  ...props
}) => {
  return (
    <FormControl
      required={required}
      error={error}
      fullWidth={fullWidth}
      margin="normal"
      variant="outlined"
      {...props}
    >
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        id={name}
        name={name}
        labelId={`${name}-label`}
        value={value}
        onChange={onChange}
        label={label}
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

// Switch Field
export const SwitchInput = ({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  ...props
}) => {
  return (
    <FormControlLabel
      control={
        <Switch
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
      }
      label={label}
    />
  );
};

// Radio Group
export const RadioGroupInput = ({
  name,
  label,
  value,
  onChange,
  options = [],
  row = true,
  required = false,
  error = false,
  helperText = '',
  ...props
}) => {
  return (
    <FormControl 
      component="fieldset" 
      required={required} 
      error={error}
      margin="normal"
      {...props}
    >
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup
        row={row}
        aria-label={label}
        name={name}
        value={value}
        onChange={onChange}
      >
        {options.map(option => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

// File Input with preview
export const FileInput = ({
  name,
  label,
  onChange,
  accept = 'image/*',
  required = false,
  error = false,
  helperText = '',
  previewUrl = null,
  ...props
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        type="file"
        id={name}
        name={name}
        label={label}
        onChange={onChange}
        required={required}
        error={error}
        helperText={helperText}
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
        inputProps={{
          accept: accept
        }}
        {...props}
      />
      
      {previewUrl && (
        <Box 
          sx={{ 
            mt: 2, 
            maxWidth: '100%', 
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <img 
            src={previewUrl} 
            alt="Preview" 
            style={{ 
              maxHeight: '200px', 
              maxWidth: '100%', 
              objectFit: 'contain',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '4px'
            }} 
          />
        </Box>
      )}
    </Box>
  );
};

// Date input
export const DateInput = ({
  name,
  label,
  value,
  onChange,
  required = false,
  error = false,
  helperText = '',
  fullWidth = true,
  minDate = '',
  maxDate = '',
  ...props
}) => {
  return (
    <TextField
      type="date"
      id={name}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      margin="normal"
      variant="outlined"
      InputLabelProps={{
        shrink: true,
      }}
      inputProps={{
        min: minDate,
        max: maxDate
      }}
      {...props}
    />
  );
};

// Number input
export const NumberInput = ({
  name,
  label,
  value,
  onChange,
  required = false,
  error = false,
  helperText = '',
  fullWidth = true,
  min = '',
  max = '',
  step = '1',
  ...props
}) => {
  return (
    <TextField
      type="number"
      id={name}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      margin="normal"
      variant="outlined"
      inputProps={{
        min: min,
        max: max,
        step: step
      }}
      {...props}
    />
  );
};