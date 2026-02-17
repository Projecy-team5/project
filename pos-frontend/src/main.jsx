import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        success: {
          style: { background: '#10B981', color: 'white' },
        },
        error: {
          style: { background: '#EF4444', color: 'white' },
        },
      }}
    />
    </AuthProvider>
    
  </React.StrictMode>
  
);