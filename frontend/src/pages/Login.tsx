import React, { useState } from 'react';
import '../styles/global.css';
import { Spin } from 'antd';
import '../pages/LoginOverlay.css';
import LogoLoading from '../components/LogoLoading';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { login as apiLogin, apiFetch, setTokens } from '../services/api';
import { solicitarTokenFCM } from '../services/auth';

// Função utilitária para abrir popup centralizada
function openCenteredPopup(url: string, title: string, w: number, h: number) {
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
  const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
  const left = ((width / 2) - (w / 2)) + dualScreenLeft;
  const top = ((height / 2) - (h / 2)) + dualScreenTop;
  const newWindow = window.open(url, title, `scrollbars=yes, width=${w}, height=${h}, top=${top}, left=${left}`);
  if (newWindow) newWindow.focus();
  return newWindow;
}

interface LoginProps {
  onLogin: (token: string, userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setSessionError } = useAuth();

  const onFinish = async (values: any) => {
    setError(null);
    setLoading(true);
    const start = Date.now();
    try {
      const data = await apiLogin(values.username, values.password);
      setSessionError(null);
      const userData = await apiFetch('http://127.0.0.1:8000/auth/me');
      const obrigatorios = ['rua','numero','bairro','cidade','cep','telefone'];
      const needsProfile = obrigatorios.some(campo => !userData[campo]);
      const elapsed = Date.now() - start;
      const minDelay = 2000;
      if (needsProfile) {
        setTimeout(() => {
          setLoading(false);
          window.location.href = `/complete-profile?token=${encodeURIComponent(data.access_token)}`;
        }, Math.max(0, minDelay - elapsed));
        return;
      }
      setTimeout(() => {
        // Salva dados do usuário no localStorage para manter login
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          // Solicita permissão de notificações e salva token FCM
          solicitarTokenFCM(userData.id);
        }
        setLoading(false);
        navigate(location.state?.from || '/');
      }, Math.max(0, minDelay - elapsed));
    } catch (err: any) {
      let msg = err.message;
      if (err.response) {
        try {
          const json = await err.response.json();
          msg += ' | ' + (json.detail || JSON.stringify(json));
        } catch {}
      }
      setError(msg);
      setLoading(false);
      console.error('Erro no login:', err);
    }
  };

  // Handler para login com Google (ajustado: loading só após token)
  const handleGoogleLogin = async () => {
    setError(null);
    const start = Date.now();
    try {
      const googleLoginUrl = 'http://127.0.0.1:8000/auth/google-login/web';
      const popup = openCenteredPopup(googleLoginUrl, 'Login Google', 500, 600);
      function onMessage(event: any) {
        if (event.origin !== 'http://127.0.0.1:8000') return;
        if (event.data && event.data.type === 'google-jwt') {
          setLoading(true); // Só ativa loading após receber token!
          const { token, refresh_token, needs_registration } = event.data;
          window.removeEventListener('message', onMessage);
          if (popup) popup.close();
          const elapsed = Date.now() - start;
          const minDelay = 2000;
          setTokens(token, refresh_token ?? '');
          if (needs_registration === true) {
            setTimeout(() => {
              setLoading(false);
              window.location.href = `/complete-profile?token=${encodeURIComponent(token)}`;
            }, Math.max(0, minDelay - elapsed));
            return;
          }
          apiFetch('http://127.0.0.1:8000/auth/me')
            .then(userData => {
              const obrigatorios = ['rua','numero','bairro','cidade','cep','telefone'];
              const needsProfile = obrigatorios.some(campo => !userData[campo]);
              if (needsProfile) {
                setTimeout(() => {
                  setLoading(false);
                  window.location.href = `/complete-profile?token=${encodeURIComponent(token)}`;
                }, Math.max(0, minDelay - elapsed));
                return;
              }
              setTimeout(() => {
                // Após cadastro/login Google, salva usuário e navega para área correta
                if (userData) {
                  localStorage.setItem('user', JSON.stringify(userData));
                  setUser(userData);
                  solicitarTokenFCM(userData.id);
                }
                setLoading(false);
                navigate(location.state?.from || '/');
              }, Math.max(0, minDelay - elapsed));
            })
            .catch(err => {
              setError('Erro ao buscar dados do usuário Google.');
              setLoading(false);
            });
        }
      }
      window.addEventListener('message', onMessage);
    } catch (err: any) {
      setError('Erro ao autenticar com Google.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container-responsive" style={{
      maxWidth: 520,
      width: '100%',
      margin: '60px auto',
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 2px 16px #0001',
      padding: 38,
      position: 'relative',
    }}>
      <Typography.Title level={4} style={{ textAlign: 'center', marginBottom: 18, fontWeight: 800, color: '#232323' }}>Entrar</Typography.Title>
      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item label="E-mail" name="username" rules={[{ required: true, message: 'Informe o e-mail!' }]}> 
          <Input 
            placeholder="Seu e-mail" 
            autoComplete="username" 
            size="large" 
            style={{ borderRadius: 8, width: '100%', height: 34, fontSize: 14.5, paddingLeft: 8, paddingRight: 8 }} 
          />
        </Form.Item>
        <Form.Item label="Senha" name="password" rules={[{ required: true, message: 'Informe a senha!' }]}> 
          <Input.Password 
            placeholder="Sua senha" 
            autoComplete="current-password" 
            size="large" 
            style={{ borderRadius: 8, width: '100%', height: 34, fontSize: 14.5, paddingLeft: 8, paddingRight: 8 }} 
          />
        </Form.Item>
        <Button 
          type="default"
          htmlType="submit" 
          block 
          style={{
            marginTop: 8,
            fontWeight: 700,
            fontSize: 16,
            background: '#fff',
            color: '#232323',
            borderColor: '#232323',
            borderWidth: 2,
            borderRadius: 8,
            width: '100%',
            transition: 'all 0.2s',
            outline: 'none',
            boxShadow: 'none',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#e53935';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#e53935';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#232323';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#232323';
          }}
          onFocus={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#232323';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#232323';
          }}
          onBlur={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#232323';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#232323';
          }}
        >Entrar</Button>
        <Button
          type="default"
          block
          icon={<img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 18, marginRight: 8, verticalAlign: 'middle', background: 'transparent' }} />}
          style={{
            marginTop: 12,
            fontWeight: 700,
            fontSize: 15,
            background: '#fff',
            color: '#232323',
            borderColor: '#e0e0e0',
            borderWidth: 2,
            borderRadius: 8,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: 'none',
            transition: 'all 0.2s',
          }}
          onClick={handleGoogleLogin}
          onMouseOver={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#e53935';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#e53935';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#232323';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#e0e0e0';
          }}
          onFocus={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#e53935';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#e53935';
          }}
          onBlur={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#232323';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#e0e0e0';
          }}
        >Entrar com Google</Button>
      </Form>
      {error && <Alert type="error" message={error} style={{ marginTop: 16 }} />}
      <div style={{ textAlign: 'center', margin: '22px 0 0 0', fontSize: 15 }}>
        <span style={{ color: '#444' }}>Ainda não tem conta?</span> <a href="/register" style={{ color: '#e53935', fontWeight: 600 }}>Cadastre-se</a>
      </div>
      {loading && (
          <div className="login-overlay">
            <LogoLoading />
          </div>
      )}
    </div>
  );
};

export default Login;