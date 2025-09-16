// Componente para exibir o contador de itens do carrinho na sidebar
import React from 'react';
import { useCart } from '../contexts/CartContext';

const CartCountBadge: React.FC = () => {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantidade, 0);
  if (count === 0) return null;
  return (
    <span style={{
      position: 'absolute',
      top: -4,
      right: -8,
      background: '#e53935',
      color: '#fff',
      borderRadius: '50%',
      fontSize: 13,
      fontWeight: 700,
      minWidth: 22,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 6px',
      boxShadow: '0 1px 4px #0002',
      zIndex: 10
    }}>{count}</span>
  );
};

export default CartCountBadge;
