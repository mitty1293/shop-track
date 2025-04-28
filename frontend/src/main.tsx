import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import './index.css'
import App from './App.tsx'

// Roboto Font
import '@fontsource/roboto/300.css'; // Light
import '@fontsource/roboto/400.css'; // Regular (通常)
import '@fontsource/roboto/500.css'; // Medium (Buttonなどで使用)
import '@fontsource/roboto/700.css'; // Bold

// Material UI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const queryClient = new QueryClient()

const theme = createTheme({
  // ここでテーマをカスタマイズできます
  // palette: {
  //   primary: { main: '#1976d2' },
  //   secondary: { main: '#dc004e' },
  // },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
