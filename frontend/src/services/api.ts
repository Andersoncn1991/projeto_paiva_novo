// Cria novo pedido
export async function criarPedido(payload: any) {
  return apiFetch(`${API_URL}/pedidos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// Serviço para consumir a API do backend
// src/services/api.ts


const API_URL = 'http://127.0.0.1:8000';

// Utilitário para obter tokens do localStorage
function getAccessToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}
function getRefreshToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
}
export function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}
function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// Função para renovar o token
export async function renovarToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('Refresh token não encontrado');
  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!response.ok) throw new Error('Falha ao renovar token');
  const data = await response.json();
  if (data.access_token && data.refresh_token) {
    setTokens(data.access_token, data.refresh_token);
    return data; // Retorna o objeto completo
  }
  throw new Error('Tokens inválidos na resposta');
}

// Função centralizada para requisições autenticadas
export async function apiFetch(url: string, options: any = {}, retry = true): Promise<any> {
  const token = getAccessToken();
  options.headers = options.headers || {};
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, options);
  if (response.status === 401 && retry) {
    // Se não houver refresh_token, faz logout automático
    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    try {
      const tokenData = await renovarToken();
      // tokenData é sempre objeto { access_token, refresh_token }
      setTokens(tokenData.access_token, tokenData.refresh_token);
      options.headers['Authorization'] = `Bearer ${tokenData.access_token}`;
      const retryResponse = await fetch(url, options);
      if (!retryResponse.ok) throw new Error('Erro após renovar token');
      return retryResponse.json();
    } catch (err) {
      clearTokens();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }
  if (!response.ok) throw new Error('Erro na requisição: ' + response.status);
  return response.json();
}

// Funções de login/logout
export async function login(email: string, senha: string) {
  // Limpa tokens antigos antes de login
  clearTokens();
  const response = await fetch(`${API_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password: senha }),
  });
  if (!response.ok) throw new Error('Login inválido');
  const data = await response.json();
  if (data.access_token && data.refresh_token) {
    setTokens(data.access_token, data.refresh_token);
    return data;
  }
  throw new Error('Tokens não recebidos do backend.');
}

export function logout() {
  clearTokens();
}

// Função para decodificar o token JWT e visualizar o payload (email, sub, etc) no frontend.
export function decodeAccessToken() {
  if (typeof window === 'undefined') return null;
  const token = getAccessToken();
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

// Exemplo de uso das funções autenticadas:
export async function getPedidos() {
  return apiFetch(`${API_URL}/pedidos/`);
}

export async function getClientes() {
  return apiFetch(`${API_URL}/clientes/`);
}

export async function patchProduto(produtoId: number, update: any) {
  return apiFetch(`${API_URL}/api/produtos/${produtoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
}

export async function getAdminPedidos() {
  return apiFetch(`${API_URL}/admin/pedidos/`);
}

export async function patchAdminPedidoStatus(pedidoId: number, novoStatus: string) {
  return apiFetch(`${API_URL}/admin/pedidos/${pedidoId}/status?novo_status=${novoStatus}`, {
    method: 'PATCH',
  });
}

export async function patchAdminPedidoCancelar(pedidoId: number) {
  return apiFetch(`${API_URL}/admin/pedidos/${pedidoId}/cancelar`, {
    method: 'PATCH',
  });
}
