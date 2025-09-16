import React, { useEffect, useRef, useState } from 'react';
import logo from '../assets/logo-paivas.png';

interface LogoLoadingProps {
  text?: string;
  duration?: number; // em ms
}

const LogoLoading: React.FC<LogoLoadingProps> = ({ text = 'Carregando...', duration = 2000 }) => {
  // Não bloqueia mais a rolagem do body

  const barWidth = 180;
  const barHeight = 10;
  const barRadius = 8;
  const barBg = '#111';
  const barShadow = '0 2px 12px #0002';
  const progressColor = '#e53935';

  // Progresso controlado por estado
  const [progress, setProgress] = useState(0); // 0 a 1
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = Date.now();
    setProgress(0);
    const interval = setInterval(() => {
      const elapsed = Date.now() - (startRef.current || 0);
      const pct = Math.min(1, elapsed / duration);
      setProgress(pct);
      if (pct >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#fff',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none', // Permite rolar e interagir com a página mesmo com o loader visível
      overscrollBehavior: 'none',
      touchAction: 'none',
      userSelect: 'none',
    }}>
      <img
        src={logo}
        alt="Logo"
        style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 32 }}
        draggable={false}
      />
      <div style={{
        fontWeight: 700,
        fontSize: 22,
        color: '#232323',
        marginBottom: 32,
        letterSpacing: 1.2,
        textShadow: '0 1px 0 #fff',
        textAlign: 'center',
      }}>{text}</div>
      <div style={{
        position: 'relative',
        width: barWidth,
        height: barHeight,
        background: barBg,
        borderRadius: barRadius,
        overflow: 'hidden',
        boxShadow: barShadow,
        marginTop: 8,
      }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            background: 'transparent',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, ${progressColor} 0%, #e5393555 100%)`,
                borderRadius: barRadius,
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        </div>
        {/* Removido keyframes, agora é controlado por estado */}
      </div>
    </div>
  );
};

export default LogoLoading;