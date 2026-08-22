import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
<<<<<<< HEAD
=======
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
>>>>>>> origin/main
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
<<<<<<< HEAD
    <App />
=======
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
>>>>>>> origin/main
  </StrictMode>
);
