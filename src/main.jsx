import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import 'react-datepicker/dist/react-datepicker.css';

// Global Axios interceptors for Supabase and Admin authentication
axios.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaHhudXhsb2Rzc2hka3VubmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NDEwOTEsImV4cCI6MjEwMzExNzA5MX0.3HYB8stLkxNE4j32PVwKL6s8bwulfIJI247MbBE6hqw';
    if (supabaseKey && !config.headers['apikey']) {
      config.headers['apikey'] = supabaseKey;
    }

    const token = localStorage.getItem('admin-auth');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else if (supabaseKey && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${supabaseKey}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

