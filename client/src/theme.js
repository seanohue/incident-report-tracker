import { createTheme } from '@mui/material/styles';

// Ideally, these would not be hardcoded but rather sourced from a theme file or CSS variables:
const primaryColor = '#42a8d2';
const lightTextOnPrimary = '#ffffff';
const textOnWhite = '#444444';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryColor,
      contrastText: lightTextOnPrimary,
    },
    text: {
      primary: textOnWhite,
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Montserrat", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Disable uppercase transformation
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: primaryColor,
      contrastText: lightTextOnPrimary,
    },
    text: {
      primary: lightTextOnPrimary,
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Montserrat", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

