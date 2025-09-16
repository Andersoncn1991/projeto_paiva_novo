
import React, { useEffect, useState } from 'react';
// Botão manual para instalar o PWA
const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowButton(false);
      }
    }
  };

  if (!showButton) return null;
  return (
    <div style={{ textAlign: 'center', margin: '18px 0' }}>
      <button
        onClick={handleInstallClick}
        style={{
          padding: '10px 22px',
          fontSize: 17,
          fontWeight: 700,
          background: '#e53935',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          boxShadow: '0 2px 8px #0002',
          marginTop: 8
        }}
      >
        Instale o app Paivas Burguers
      </button>
    </div>
  );
};
import { useNavigate } from 'react-router-dom';
import './Inicio.css';
import { Link } from 'react-router-dom';
import MaisPedidosCarrossel from '../components/MaisPedidosCarrossel';
import { useAuth } from '../contexts/AuthContext';

const API_URL = "http://localhost:8000";


export default function Inicio() {
  const [produtosMaisVendidos, setProdutosMaisVendidos] = React.useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/lanches', { replace: true });
      return;
    }
    fetch(`${API_URL}/api/produtos/mais-vendidos`)
      .then(res => res.json())
      .then(data => setProdutosMaisVendidos(data))
      .catch(() => setProdutosMaisVendidos([]));
  }, [user, navigate]);

  if (user) return null;

  return (
    <div className="inicio-bg">
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="inicio-container" style={{ maxWidth: 540, margin: '0 auto 0 auto', padding: 36, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', textAlign: 'center' }}>
          <h2 className="inicio-title" style={{
            fontWeight: 700,
            color: '#e53935',
            marginBottom: 10,
            fontSize: 28,
            fontFamily: 'Poppins, Nunito, Arial, sans-serif',
            letterSpacing: 0.5,
          }}>
            Bem-vindo ao Paivas Burguers
          </h2>
          <p className="inicio-desc" style={{ color: '#444', fontSize: 16, marginBottom: 28 }}>Acesse sua conta ou cadastre-se para fazer seu pedido.</p>
          <InstallPWAButton />
          <div className="hero-btns">
            <Link to="/login" className="hero-btn">Entrar</Link>
            <Link to="/register" className="hero-btn-sec">Cadastrar</Link>
          </div>
        </div>
        <MaisPedidosCarrossel produtos={produtosMaisVendidos} />
      </div>
    </div>
  );
}
