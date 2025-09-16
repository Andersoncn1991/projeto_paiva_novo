import './styles/logo-pulse.css';
// Arquivo principal de entrada do frontend (Vite + React)
// Responsável por renderizar o App e aplicar o tema do Ant Design

import React from 'react';
import ReactDOM from 'react-dom/client';

import AppRouter from './AppRouter';
import CookieConsent from './components/CookieConsent';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom'; // Adicione esta linha
import 'antd/dist/reset.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <CookieConsent />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);