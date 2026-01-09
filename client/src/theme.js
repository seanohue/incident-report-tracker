import { createTheme } from '@mui/material/styles';

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
    secondary: {
      main: '#9c27b0',
      contrastText: lightTextOnPrimary,
    },
    error: {
      main: '#d32f2f',
      contrastText: lightTextOnPrimary,
    },
    success: {
      main: '#1b5e20',
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
        containedPrimary: {
          color: lightTextOnPrimary,
          '& .MuiButton-startIcon': {
            color: lightTextOnPrimary,
          },
        },
        containedSecondary: {
          color: lightTextOnPrimary,
          '& .MuiButton-startIcon': {
            color: lightTextOnPrimary,
          },
        },
        containedError: {
          color: lightTextOnPrimary,
          '& .MuiButton-startIcon': {
            color: lightTextOnPrimary,
          },
        },
        containedSuccess: {
          color: lightTextOnPrimary,
          '& .MuiButton-startIcon': {
            color: lightTextOnPrimary,
          },
        },
        containedWarning: {
          color: lightTextOnPrimary,
          '& .MuiButton-startIcon': {
            color: lightTextOnPrimary,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          color: lightTextOnPrimary,
          '& .MuiChip-label': {
            color: lightTextOnPrimary,
          },
        },
        colorError: {
          backgroundColor: '#b71c1c', 
        },
        colorPrimary: {
          backgroundColor: '#2d7fa3',
        },
        colorSecondary: {
          backgroundColor: '#7b1fa2', 
        },
        colorSuccess: {
          backgroundColor: '#1b5e20',
        },
        colorWarning: {
          backgroundColor: '#e65100',
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
    secondary: {
      main: '#ba68c8', 
      contrastText: lightTextOnPrimary,
    },
      error: {
        main: '#f44336',
        contrastText: lightTextOnPrimary,
      },
      success: {
        main: '#388e3c',
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
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          color: lightTextOnPrimary,
          '& .MuiChip-label': {
            color: lightTextOnPrimary,
          },
        },
        colorError: {
          backgroundColor: '#c62828',
        },
        colorPrimary: {
          backgroundColor: '#2d7fa3',
        },
        colorSecondary: {
          backgroundColor: '#8e24aa',
        },
        colorSuccess: {
          backgroundColor: '#388e3c',
        },
        colorWarning: {
          backgroundColor: '#f57c00',
        },
      },
    },
  },
});

