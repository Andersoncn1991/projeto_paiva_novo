import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout as apiLogout } from '../services/api';

type LoginRedirectButtonProps = { onRedirect: () => void };
const LoginRedirectButton = ({ onRedirect }: LoginRedirectButtonProps) => {
  const navigate = useNavigate();
  const { setSessionError, logout } = useAuth();
  return (
    <button
      style={{
        marginLeft: 0,
        padding: '6px 18px',
        fontWeight: 700,
        border: '2px solid #e53935',
        background: '#fff',
        color: '#e53935',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 17,
        boxShadow: '0 2px 8px #e5393522',
        transition: 'all 0.2s',
      }}
      onClick={() => {
        setSessionError(null);
        logout();
        navigate('/login');
      }}
      onMouseOver={e => (e.currentTarget.style.background = '#ffe0e0')}
      onMouseOut={e => (e.currentTarget.style.background = '#fff')}
    >Fazer login</button>
  );
};

interface User {
  nome: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loadingUser: boolean;
  sessionError: string | null;
  setSessionError: (msg: string | null) => void;
  handleSessionExpired: (msg?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = window.location.pathname;
  const PUBLIC_ROUTES = [
    '/',
    '/cardapio',
    '/lanches',
    '/carrinho',
    '/login',
    '/register',
    '/complete-profile',
    '/privacidade',
    '/cookies',
    '/termos',
    '/contato'
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const accessToken = localStorage.getItem('access_token');
    // Função para verificar se o cadastro está completo
    function isProfileComplete(user: any) {
  if (!user) return false;
  // Se for admin, não exige perfil completo
  if (user.role === 'admin') return true;
  const requiredFields = ['telefone', 'rua', 'numero', 'bairro', 'cidade', 'cep'];
  return requiredFields.every(field => user[field] && String(user[field]).trim().length > 0);
    }
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // Garante que avatarUrl seja camelCase
      const avatarUrl = parsedUser.avatarUrl || parsedUser.avatar_url || '';
      const userObj = { ...parsedUser, avatarUrl };
      if (isProfileComplete(userObj)) {
        setUser(userObj);
      } else if (userObj.role === 'admin') {
        // Nunca remove admin do contexto, mesmo se faltar campos obrigatórios
        setUser(userObj);
      } else {
        // Log dos campos obrigatórios faltando
        const requiredFields = ['telefone', 'rua', 'numero', 'bairro', 'cidade', 'cep'];
        const missing = requiredFields.filter(field => !userObj[field] || String(userObj[field]).trim().length === 0);
        console.warn('Usuário removido do contexto. Campos obrigatórios faltando:', missing, userObj);
        setUser(null);
        const accessToken = localStorage.getItem('access_token');
        // Só redireciona se NÃO estiver em rota pública
        if (!PUBLIC_ROUTES.includes(location)) {
          if (accessToken) {
            navigate(`/complete-profile?token=${accessToken}`);
          } else {
            navigate('/complete-profile');
          }
        }
      }
      setLoadingUser(false);
    } else if (accessToken) {
      // Só tenta buscar perfil se houver access_token
      import('../services/api').then(({ apiFetch }) => {
        apiFetch('http://127.0.0.1:8000/auth/me')
          .then(userData => {
            if (isProfileComplete(userData)) {
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            } else if (userData.role === 'admin') {
              // Nunca remove admin do contexto, mesmo se faltar campos obrigatórios
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            } else {
              setUser(null);
              localStorage.removeItem('user');
              const accessToken = localStorage.getItem('access_token');
              // Só redireciona se NÃO estiver em rota pública
              if (!PUBLIC_ROUTES.includes(location)) {
                if (accessToken) {
                  navigate(`/complete-profile?token=${accessToken}`);
                } else {
                  navigate('/complete-profile');
                }
              }
            }
            setLoadingUser(false);
          })
          .catch((err) => {
            setUser(null);
            setLoadingUser(false);
            if (err.message && err.message.includes('Sessão expirada')) {
              setSessionError('Sessão expirada. Faça login novamente.');
              navigate('/login');
            }
          });
      });
    } else {
      // Não há token, não mostra erro de sessão expirada
      setLoadingUser(false);
    }
  }, [navigate]);

  // Centraliza logout e exibição de mensagem de sessão expirada
  const handleSessionExpired = (msg: string = 'Sessão expirada. Faça login novamente.') => {
    setUser(null);
    localStorage.removeItem('user');
    apiLogout();
    setSessionError(msg);
    navigate('/login'); // Redireciona para login ao expirar
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    apiLogout();
    setSessionError(null); // Apenas limpa, NÃO defina mensagem!
    
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loadingUser, sessionError, setSessionError, handleSessionExpired }}>
      {children}
      {sessionError && (
        <div style={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: 70, // abaixo do topo/menu
          zIndex: 9999,
          maxWidth: '700px',
          margin: '0 auto',
          background: 'linear-gradient(90deg,#fff 0%,#ffe0e0 100%)',
          color: '#e53935',
          fontWeight: 700,
          padding: '16px 0',
          textAlign: 'center',
          boxShadow: '0 2px 16px #e5393522',
          fontSize: 18,
          letterSpacing: 0.2,
          borderRadius: 14,
          border: '2px solid #e53935',
          animation: 'fadeInAvisoSessao 0.7s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
        }}>
          <span style={{marginRight:0,verticalAlign:'middle',fontSize:26,display:'inline-block'}} role="img" aria-label="alerta">⚠️</span>
          <span style={{fontWeight:700, fontSize:18}}>{sessionError}</span>
          <LoginRedirectButton onRedirect={() => { setSessionError(null); logout(); }} />
          <style>{`
            @keyframes fadeInAvisoSessao {
              from { opacity: 0; transform: translateY(-30px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};
