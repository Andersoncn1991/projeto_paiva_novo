import React, { useState } from 'react';
import '../src/styles/global.css';
// Componente do menu mobile
const MobileMenu: React.FC<{ links: any[], user: any, logout: () => void }> = ({ links, user, logout }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setOpen(true)}>
        <span style={{ fontSize: 28 }}>&#9776;</span>
      </button>
      {open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#fff',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <button style={{ position: 'absolute', top: 18, right: 18, fontSize: 32, background: 'none', border: 'none', color: '#e53935', cursor: 'pointer' }} onClick={() => setOpen(false)}>&times;</button>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {links.map((link, idx) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#e53935',
                    fontWeight: 700,
                    fontSize: 22,
                    textDecoration: 'none',
                    gap: 10,
                  }}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={28} /> {link.label}
                </Link>
              );
            })}
            {user && (
              <button
                onClick={() => { logout(); setOpen(false); }}
                style={{
                  color: '#e53935',
                  fontWeight: 700,
                  fontSize: 22,
                  background: 'none',
                  border: 'none',
                  marginTop: 12,
                  cursor: 'pointer',
                }}
              >Sair</button>
            )}
          </nav>
        </div>
      )}
    </>
  );
};
import Notificacoes from './pages/notificacoes';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { MdFastfood, MdOutlineRestaurantMenu, MdLocalOffer, MdPerson, MdHistory, MdShoppingCart, MdNotifications, MdLogout } from 'react-icons/md';
import CartCountBadge from './components/CartCountBadge';
import { GiHamburger } from 'react-icons/gi';
import { FaRegAddressBook } from 'react-icons/fa';
import CompleteProfile from './pages/CompleteProfile';
import Cookies from './pages/Cookies';
import Login from './pages/Login';
import Privacidade from './pages/Privacidade';
import Register from './pages/Register';
import Termos from './pages/Termos';
import Cardapio from './components/Cardapio';
import Contato from './pages/Contato';



import LanchesPorCategoria from './pages/LanchesPorCategoria';
import Promocoes from './pages/Promocoes';
import Inicio from './pages/Inicio';
import logo from './assets/logo-paivas.png';
import UserMenu from './components/UserMenu';
import MeusPedidos from './pages/MeusPedidos';
import { useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Carrinho from './pages/Carrinho';
import Pagamento from './pages/Pagamento';
import PagamentoPix from './pages/PagamentoPix';
import LogoutLogoLoading from './components/LogoutLogoLoading';
import LogoLoading from './components/LogoLoading';


const navLinks = [
  { to: '/', label: 'Início', icon: GiHamburger, size: 28 },
  { to: '/cardapio', label: 'Cardápio', icon: MdOutlineRestaurantMenu, size: 28 },
  { to: '/lanches', label: 'Lanches', icon: MdFastfood, size: 28 },
  { to: '/carrinho', label: 'Carrinho', icon: MdShoppingCart, size: 26 }, // novo, sempre visível
  { to: '/notificacoes', label: 'Notificações', icon: MdNotifications, size: 26 }, // novo, só logado
  { to: '/pedidos', label: 'Meus Pedidos', icon: MdHistory, size: 26 },
  { to: '/perfil', label: 'Perfil', icon: MdPerson, size: 26 },
  { to: '/contato', label: 'Contato', icon: FaRegAddressBook, size: 26 }
];


const Sidebar: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const { user, logout, setSessionError } = useAuth();
  const navigate = useNavigate();
  const [showLogoutLoading, setShowLogoutLoading] = useState(false);
  // Filtra links: só mostra Perfil, Meus Pedidos e Notificações se logado
  const filteredLinks = navLinks.filter(link => {
    if ((link.label === 'Perfil' || link.label === 'Meus Pedidos' || link.label === 'Notificações') && !user) {
      return false;
    }
    if (link.label === 'Início' && user) {
      return false;
    }
    return true;
  });
  // Função de logout com redirecionamento
  const handleLogout = () => {
    setSessionError && setSessionError(null);
    setShowLogoutLoading(true);
    setTimeout(() => {
      logout();
      setShowLogoutLoading(false);
      navigate('/');
    }, 1200);
  };
  if (showLogoutLoading) {
    // Só renderiza o overlay de logout, bloqueando tudo
    return <LogoutLogoLoading text="Saindo..." />;
  }
  // Renderiza sidebar apenas em telas grandes
  return (
    <>
      <aside className="sidebar" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: 90,
        background: '#fff',
        borderRight: '2px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 0',
        zIndex: 200,
        boxShadow: '2px 0 16px #0001',
      }}>
        <img src={logo} alt="Paivas Burguers" style={{ height: 88, width: 88, maxWidth: '100%', objectFit: 'contain', marginBottom: 24, display: 'block' }} />
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filteredLinks.map((link, idx) => {
            const Icon = link.icon;
            const isHovered = hovered === idx;
            const isCart = link.label === 'Carrinho';
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: isHovered ? '#e53935' : '#232323',
                  fontWeight: 700,
                  fontSize: 18,
                  textDecoration: 'none',
                  padding: '7px 0',
                  borderRadius: 12,
                  transition: 'background 0.2s, color 0.2s',
                  background: isHovered ? '#eee' : 'transparent',
                  position: 'relative',
                }}
                onMouseOver={() => setHovered(idx)}
                onMouseOut={() => setHovered(null)}
              >
                <span style={{ fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Icon size={link.size} color={isHovered ? '#e53935' : '#232323'} />
                  {isCart && <CartCountBadge />}
                </span>
                <span style={{ fontSize: 13, marginTop: 2 }}>{link.label}</span>
              </Link>
            );
          })}
          {/* Botão de sair para usuários logados, visual igual aos ícones */}
          {user && (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e53935',
                fontWeight: 700,
                fontSize: 18,
                textDecoration: 'none',
                padding: '7px 0',
                borderRadius: 12,
                border: 'none',
                background: 'transparent',
                marginTop: 2,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#eee')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MdLogout size={26} color={'#e53935'} />
              </span>
              <span style={{ fontSize: 13, marginTop: 2 }}>Sair</span>
            </button>
          )}
        </nav>
      </aside>
      {/* Menu mobile */}
      <MobileMenu links={filteredLinks} user={user} logout={handleLogout} />
    </>
  );
};


const PUBLIC_ROUTES = [
  '/',
  '/cardapio',
  '/lanches', // agora lanches é público
  '/carrinho', // carrinho agora é público
  '/login',
  '/register',
  '/complete-profile',
  '/privacidade',
  '/cookies',
  '/termos',
  '/contato'
];

const PerfilPageLazy = React.lazy(() => import('./pages/Perfil'));

// Wrapper para proteger rota de perfil sem remover a definição da rota
const PerfilRoute: React.FC = () => {
  const { user, loadingUser } = useAuth();
  if (loadingUser) return <div style={{ padding: 32 }}>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <React.Suspense fallback={<div style={{ padding: 32 }}>Carregando...</div>}>
      <PerfilPageLazy />
    </React.Suspense>
  );
};

const RedirectOnLogoutOrLogin: React.FC = () => {
  const { user, loadingUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  React.useEffect(() => {
    if (!loadingUser) {
      // Se não logado e rota protegida, redireciona para login
      if (user === null) {
        const isPublic = PUBLIC_ROUTES.some(route => location.pathname === route || location.pathname.startsWith(route + '/'));
        if (!isPublic) {
          navigate('/login');
        }
      }
      // Se logado e está em /login ou /register, redireciona para área correta
      if (user && (location.pathname === '/login' || location.pathname === '/register')) {
        // Admins não são mais redirecionados para área admin
        navigate('/lanches');
      }
    }
  }, [user, loadingUser, navigate, location]);
  return null;
};


// Componente filho que usa os hooks do router
function AppRoutes() {
  const { user, logout, setUser } = useAuth();
  const [showLoginLoading, setShowLoginLoading] = useState(false);
  const [loginLoadingKey, setLoginLoadingKey] = useState(0);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Detecta se o modal de adicionais está aberto pela query string
  const isAdicionaisModalOpen = location.search.includes('modalAdicionais=1');
  // Função de login que mostra loading, atualiza contexto e navega
  const handleLogin = (token: string, userData: any) => {
    setResetLoading(true);
    setTimeout(async () => {
      setLoginLoadingKey(Date.now());
      setShowLoginLoading(true);
      setResetLoading(false);
      setTimeout(async () => {
        setShowLoginLoading(false);
        // Busca dados completos do usuário via /auth/me
        let fullUser = userData;
        try {
          const resp = await fetch('http://127.0.0.1:8000/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resp.ok) {
            fullUser = await resp.json();
          }
        } catch {}
        // Garante que avatarUrl seja camelCase
        const avatarUrl = fullUser.avatarUrl || fullUser.avatar_url || '';
        setUser({ ...fullUser, avatarUrl });
        localStorage.setItem('user', JSON.stringify({ ...fullUser, avatarUrl }));
        localStorage.setItem('token', token);
        // Debug: mostrar objeto do usuário após login
        console.log('Usuário após login:', fullUser);
        // Se for admin, redireciona para página inicial do admin
        if (fullUser.role === 'admin' || fullUser.tipo === 'admin' || fullUser.isAdmin) {
          navigate('/admin/inicio');
        } else {
          const from = location.state?.from || '/lanches';
          navigate(from);
        }
      }, 2000);
    }, 10);
  };

  // Aqui, se qualquer loading global estiver ativo, só renderiza o overlay de loading
  if (showLoginLoading) {
    return <LogoLoading text="Carregando..." />;
  }

  // Removido layout/admin: admins não acessam mais área admin pelo site
  // Layout do cliente (não-admin)
  return (
    <>
      <RedirectOnLogoutOrLogin />
      <Sidebar />
      {user && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 500,
          padding: '18px 32px 0 0',
        }}>
          <UserMenu
            nome={user.nome}
            avatarUrl={user.avatarUrl}
            onLogout={() => { logout(); }}
          />
        </div>
      )}
      <main style={{ background: '#fff', minHeight: '100vh', marginLeft: 90, padding: '32px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 201, position: 'relative' }}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/cardapio" element={<Cardapio open={true} onClose={() => {}} />} />
          <Route path="/lanches" element={<LanchesPorCategoria />} />
          <Route path="/pedidos" element={<MeusPedidos />} />
          <Route path="/promocoes" element={<Promocoes />} />
          <Route path="/perfil" element={<PerfilRoute />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/complete-profile" element={<CompleteProfile token="" />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/pagamento" element={<Pagamento />} />
          <Route path="/pagamento-pix" element={<PagamentoPix />} />
        </Routes>
      </main>
      <footer style={{
        position: 'fixed',
        left: 90,
        bottom: 0,
        width: 'calc(100% - 90px)',
        background: isAdicionaisModalOpen ? 'transparent' : '#fff',
        color: '#232323',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 400,
        letterSpacing: 0.5,
        borderTop: '1px solid #eee',
        padding: '4px 0 3px 0',
        minHeight: 0,
        lineHeight: '16px',
        zIndex: 300,
      }}>
        <div>
          <span style={{ fontWeight: 700, color: '#e53935' }}>Paivas Burguers &copy; {new Date().getFullYear()}.</span>
          {' '}Todos os direitos reservados. <a href="mailto:Paivasburguers@gmail.com" style={{ color: '#e53935', textDecoration: 'underline' }}>Paivasburguers@gmail.com</a>
        </div>
        <div>
          Endereço: Rua Exemplo, 123, Centro, Cidade/UF | Contato: <a href="tel:0000000000" style={{ color: '#e53935', textDecoration: 'underline' }}>(00) 0000-0000</a>
          {' '}|{' '}
          <Link to="/privacidade" style={{ color: '#e53935', textDecoration: 'underline', margin: '0 4px' }}>Privacidade</Link>
          {' '}|{' '}
          <Link to="/cookies" style={{ color: '#e53935', textDecoration: 'underline', margin: '0 4px' }}>Cookies</Link>
          {' '}|{' '}
          <Link to="/termos" style={{ color: '#e53935', textDecoration: 'underline', margin: '0 4px' }}>Termos</Link>
        </div>
      </footer>
    </>
  );
}

const AppRouter: React.FC = () => {
  return (
    <CartProvider>
      <AppRoutes />
    </CartProvider>
  );
};

export default AppRouter;

