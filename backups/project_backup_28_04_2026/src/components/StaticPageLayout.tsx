import React from 'react';
import { Box, Container, Paper, Typography, CssBaseline, createTheme, ThemeProvider } from '@mui/material';

const staticPageTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#555555',
    },
    primary: {
      main: '#1a237e',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontFamily: 'Orbitron, sans-serif',
      fontWeight: 'bold',
    },
    h6: {
      fontFamily: 'Orbitron, sans-serif',
      fontWeight: 'bold',
      marginTop: '24px',
      marginBottom: '8px',
      color: '#004d40',
    },
    body1: {
      lineHeight: 1.8,
    },
  },
});

interface StaticPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({ title, children }) => {
  return (
    <ThemeProvider theme={staticPageTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, py: 5 }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: '12px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            <Box sx={{ mt: 3 }}>
              {children}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default StaticPageLayout;
