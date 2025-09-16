import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, Input, Button } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { QrcodeOutlined, CopyOutlined, CheckCircleTwoTone } from '@ant-design/icons';

const { Title } = Typography;

const PagamentoPix: React.FC = () => {
  // Função para copiar chave Pix
  const handleCopyPix = () => {
    navigator.clipboard.writeText(fakeChavePix);
  };
  // Temporizador de 15 minutos
  const [secondsLeft, setSecondsLeft] = React.useState(15 * 60);
  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Formata mm:ss
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };
  const location = useLocation();
  const navigate = useNavigate();
  // Recebe dados via state
  const { chavePix, qrCode } = location.state || {};

  React.useEffect(() => {
    if (!chavePix || !qrCode) {
      navigate('/');
    }
  }, [chavePix, qrCode, navigate]);

  if (!chavePix || !qrCode) return null;
  // Chave Pix fake e QR Code fake para teste
  const fakeChavePix = chavePix || '123e4567-e89b-12d3-a456-426614174000';
  const fakeQrCode = qrCode || 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=pagamentopix-teste';

  return (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', background: '#fff', paddingTop: '6vh' }}>
  <Title level={3} style={{ textAlign: 'center', marginBottom: 32, fontWeight: 800, letterSpacing: 1 }}>
        <CheckCircleTwoTone twoToneColor="#00e676" style={{ fontSize: 32, marginRight: 8 }} /> Pagamento via Pix
      </Title>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
        <ClockCircleOutlined style={{ fontSize: 32, color: '#e53935' }} />
        <span style={{ fontWeight: 800, fontSize: 28, color: '#e53935', fontFamily: 'monospace', letterSpacing: 2, background: '#fff', borderRadius: 12, padding: '6px 18px', boxShadow: '0 2px 8px #e5393522' }}>
          {formatTime(secondsLeft)}
        </span>
      </div>
  <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <CopyOutlined style={{ fontSize: 22, color: '#1c6bb9ff' }} /> Chave Pix:
        </p>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          <Input value={fakeChavePix} readOnly style={{ maxWidth: 320, textAlign: 'center', fontSize: 16, borderRadius: 8, background: '#fff' }} />
          <Button icon={<CopyOutlined />} onClick={handleCopyPix} style={{ fontWeight: 600, borderRadius: 8 }}>
            Copiar
          </Button>
        </div>
        <p style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
          <QrcodeOutlined style={{ fontSize: 22, color: '#388e3c', marginRight: 6 }} /> QR Code:
        </p>
  <img src={fakeQrCode} alt="QR Code Pix" style={{ width: 200, margin: '0 auto', borderRadius: 16, boxShadow: '0 2px 12px #0002', marginBottom: 32 }} />
      </div>
  <Button type="primary" size="large" style={{ width: 220, fontWeight: 700, fontSize: 18, borderRadius: 8, marginTop: 0, background: '#1976d2', border: 'none' }} onClick={() => navigate('/pedidos')}>Voltar para pedidos</Button>
    </div>
  );
};

export default PagamentoPix;
