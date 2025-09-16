import React from 'react';
import logo from '../assets/logo-paivas.png';

const LogoutLogoLoading: React.FC<{ text?: string }> = ({ text }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(255,255,255,0.97)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.4s',
    pointerEvents: 'none', // Permite rolar e interagir com a página mesmo com o loader de logout
  }}>
    <img
      src={logo}
      alt="Logo Paivas"
      style={{
        width: 120,
        height: 120,
        objectFit: 'contain',
        marginBottom: 24,
        animation: 'logout-spin 0.8s cubic-bezier(0.4,0,0.2,1) forwards',
      }}
    />
    {text && <div style={{ fontWeight: 700, fontSize: 22, color: '#e53935', marginTop: 8 }}>{text}</div>}
    <style>{`
      @keyframes logout-spin {
        0% { transform: scale(1) rotate(0deg); opacity: 1; }
        80% { transform: scale(1.15) rotate(-20deg); opacity: 1; }
        100% { transform: scale(0.7) rotate(-90deg); opacity: 0; }
      }
    `}</style>
  </div>
);

export default LogoutLogoLoading;
