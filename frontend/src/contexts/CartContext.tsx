import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../services/api';

export interface Adicional {
  id: number;
  nome: string;
  preco?: number;
}

export interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
  adicionais?: Adicional[];
  observacoes?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantidade: number) => void;
  updateAdicionais: (id: string, adicionais: Adicional[], observacoes?: string) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de CartProvider');
  return context;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  // Chave do carrinho depende do usuário logado
  const getCartKey = () => (user && user.email ? `cart_items_${user.email}` : 'cart_items');

  // Para detectar login/logout
  const prevUserRef = useRef(user);

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(getCartKey());
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  // Novo estado para produtos
  const [produtos, setProdutos] = useState<any[]>([]);

  // Busca produtos apenas uma vez ao montar
  useEffect(() => {
    let isMounted = true;
    async function fetchProdutos() {
      try {
        const resp = await apiFetch('http://127.0.0.1:8000/api/produtos/');
        if (isMounted) setProdutos(resp);
      } catch {}
    }
    fetchProdutos();
    return () => { isMounted = false; };
  }, []);

  // Atualiza preços dos produtos do carrinho quando produtos ou items mudam
  useEffect(() => {
    if (!items || items.length === 0 || produtos.length === 0) return;
    setItems((prevItems: CartItem[]) => prevItems.map((item: CartItem) => {
      const produtoAtual = produtos.find((p: any) => p.id === Number(item.id) || p.id === item.id);
      if (!produtoAtual) return item;
      if (produtoAtual.tamanhos && Array.isArray(produtoAtual.tamanhos)) {
        const tam = produtoAtual.tamanhos.find((t: any) => t.nome === item.nome);
        if (tam && tam.preco !== undefined && tam.preco !== item.preco) {
          return { ...item, preco: tam.preco };
        }
      } else if (produtoAtual.preco !== undefined && produtoAtual.preco !== item.preco) {
        return { ...item, preco: produtoAtual.preco };
      }
      return item;
    }));
    // eslint-disable-next-line
  }, [produtos]);

  // Detecta login/logout e faz a migração correta do carrinho
  useEffect(() => {
    const prevUser = prevUserRef.current;
    // LOGIN: de null para user
    if (!prevUser && user && user.email) {
      // Ao logar, só migra o carrinho anônimo se o usuário não tiver carrinho salvo
      const userCartRaw = localStorage.getItem(`cart_items_${user.email}`);
      let userCart: any[] = [];
      if (userCartRaw) {
        try {
          userCart = JSON.parse(userCartRaw);
        } catch { userCart = []; }
      }
      if (userCart && Array.isArray(userCart) && userCart.length > 0) {
        setItems(userCart);
        prevUserRef.current = user;
        return;
      }
      // Se não tem carrinho salvo OU está vazio, migra o anônimo
      const anon = localStorage.getItem('cart_items');
      if (anon) {
        localStorage.setItem(`cart_items_${user.email}`, anon);
        localStorage.removeItem('cart_items');
        setItems(JSON.parse(anon));
        prevUserRef.current = user;
        return;
      }
      setItems([]);
      prevUserRef.current = user;
      return;
    }
    // LOGOUT: de user para null
    if (prevUser && !user) {
      // Limpa carrinho anônimo
      localStorage.removeItem('cart_items');
      setItems([]);
      prevUserRef.current = user;
      return;
    }
    // Troca de usuário (login de outro)
    if (prevUser && user && prevUser.email !== user.email) {
      const saved = localStorage.getItem(`cart_items_${user.email}`);
      setItems(saved ? JSON.parse(saved) : []);
      prevUserRef.current = user;
      return;
    }
    // Primeira montagem ou sem troca
    const saved = localStorage.getItem(getCartKey());
    setItems(saved ? JSON.parse(saved) : []);
    prevUserRef.current = user;
    // eslint-disable-next-line
  }, [user && user.email, user]);

  // Permite atualizar adicionais e opcionalmente observações
  const updateAdicionais = (id: string, adicionais: Adicional[], observacoes?: string) => {
    setItems((prev: CartItem[]) => prev.map((i: CartItem) =>
      i.id === id
        ? { ...i, adicionais, observacoes: observacoes !== undefined ? observacoes : i.observacoes }
        : i
    ));
  };

  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(items));
  }, [items, user]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      // Sempre adiciona como novo item, nunca soma quantidade
      // Gera id único se já existe igual
      let newItem = { ...item };
      // Se já existe um item com mesmo id, gera id único
      if (prev.find(i => i.id === item.id)) {
        newItem.id = item.id + '_uniq_' + Date.now();
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Limpa só visualmente, não apaga o localStorage do usuário
  const clearCart = () => setItems([]);

  const updateQuantity = (id: string, quantidade: number) => {
    console.log('updateQuantity chamada', { id, quantidade });
    setItems(prev => {
      if (quantidade <= 0) {
        return prev.filter(i => i.id !== id);
      }
      return prev.map(i => i.id === id ? { ...i, quantidade } : i);
    });
  };

  const total = items.reduce((sum, i) => sum + i.preco * i.quantidade, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, updateQuantity, updateAdicionais, total }}>
      {children}
    </CartContext.Provider>
  );
};