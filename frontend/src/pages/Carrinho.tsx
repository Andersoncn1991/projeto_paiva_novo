
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MdRemoveCircleOutline, MdAddCircleOutline, MdDelete, MdFastfood, MdShoppingCartCheckout } from 'react-icons/md';



const Carrinho: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, updateAdicionais } = useCart();

  // Calcula o total do carrinho incluindo adicionais
  const totalCarrinho = items.reduce((sum, item) => {
    const adicionaisTotal = (item.adicionais || []).reduce((aSum, ad: any) => aSum + (ad.preco || 0) * (ad.quantidade ?? 1), 0);
    return sum + item.preco * item.quantidade + adicionaisTotal * item.quantidade;
  }, 0);
  // Estado para controlar modal de adicionais
  const [modalItemId, setModalItemId] = useState<string | null>(null);
  // Agora cada adicional selecionado terá {id, nome, preco, quantidade}
  const [selectedAdicionais, setSelectedAdicionais] = useState<any[]>([]);
  const [adicionais, setAdicionais] = useState<any[]>([]);
  const [loadingAdicionais, setLoadingAdicionais] = useState(false);
  const [erroAdicionais, setErroAdicionais] = useState<string | null>(null);
  const { user, sessionError, setSessionError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleFinalizar = () => {
    if (sessionError) {
      setSessionError('Sua sessão expirou. Faça login novamente para finalizar o pedido.');
      return;
    }
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    // Redireciona para a página de pagamento, passando os dados do pedido e cliente
    navigate('/pagamento', {
      state: {
        pedido: {
          items,
          total: totalCarrinho,
        },
        cliente: user,
      },
    });
  };

  return (
    <div style={{
      maxWidth: 670,
      width: '100%',
      margin: '0 auto',
      padding: 18,
      background: '#fff',
      borderRadius: 13,
      boxShadow: '0 2px 12px #0002',
      marginTop: 28,
      marginBottom: 56 // Mais espaço para o rodapé
    }}>
      <h2 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 23, color: '#e53935' }}>
        <MdShoppingCartCheckout size={28} /> Seu Carrinho
      </h2>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', margin: '48px 0' }}>
          <MdFastfood size={40} color="#eee" style={{ marginBottom: 10 }} />
          <p style={{ fontSize: 16, color: '#888' }}>O carrinho está vazio.</p>
          <Link to="/cardapio" style={{ color: '#e53935', textDecoration: 'underline', fontWeight: 700, fontSize: 15 }}>Ver Cardápio</Link>
        </div>
      ) : (
        <>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map(item => (
              <li key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 15,
                borderBottom: '1px solid #eee',
                paddingBottom: 12,
                gap: 12
              }}>
                {item.imagem ? (
                  <img src={item.imagem} alt={item.nome} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 9, boxShadow: '0 1px 6px #0001' }} />
                ) : (
                  <MdFastfood size={32} color="#e53935" style={{ marginRight: 8 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nome.replace(/ \(Único\)$/i, '')}</div>
                  {/* Adicionais do lanche, se houver */}
                  <div style={{ margin: '2px 0 0 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {item.adicionais && item.adicionais.length > 0 && (
                      <div style={{ fontSize: 13, color: '#e53935', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 2 }}>
                        {item.adicionais?.map((ad: any, idx: number) => (
                          <div key={ad.id || idx} style={{ background: '#f8f8f8', borderRadius: 5, padding: '1px 6px', display: 'flex', alignItems: 'center', gap: 3, width: 'fit-content' }}>
                            <span style={{ color: '#e53935', fontWeight: 700, marginRight: 2 }}>+</span>
                            {ad.nome}
                            {ad.quantidade > 1 && (
                              <span style={{ color: '#232', fontWeight: 700, marginLeft: 2 }}>x{ad.quantidade}</span>
                            )}
                            {ad.preco ? <span style={{ color: '#888', fontSize: 13, marginLeft: 2 }}> (R$ {(ad.preco * (ad.quantidade || 1)).toFixed(2)})</span> : null}
                            <button onClick={() => {
                              // Remove só esse adicional desse item
                              const novos = (item.adicionais || []).filter((a: any) => a.id !== ad.id);
                              updateAdicionais(item.id, novos);
                            }} style={{ marginLeft: 4, background: 'none', border: 'none', color: '#e53935', cursor: 'pointer', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center' }} title={`Remover ${ad.nome}`}>
                              <MdDelete size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {/* Só mostra o botão de adicionais se NÃO for bebida (por nome) */}
                      {!(item.nome && /coca|refrigerante|suco|água|agua|bebida|sprite|fanta|guaraná|guarana|pepsi|tônica|tonica|cerveja|heineken|skol|brahma|antarctica|schin|itubaína|itubaina|soda|chá|cha/i.test(item.nome)) && (
                        <button
                          onClick={async () => {
                            setModalItemId(item.id);
                            setSelectedAdicionais(item.adicionais || []);
                            setLoadingAdicionais(true);
                            setErroAdicionais(null);
                            try {
                              // Altere a URL abaixo se seu backend não estiver no mesmo host/porta do frontend
                              const resp = await fetch('/api/adicionais/');
                              if (!resp.ok) throw new Error('Erro ao buscar adicionais');
                              const data = await resp.json();
                              setAdicionais(data);
                            } catch (e: any) {
                              setAdicionais([]);
                              setErroAdicionais('Erro ao buscar adicionais. Verifique sua conexão ou backend.');
                            }
                            setLoadingAdicionais(false);
                          }}
                          style={{ fontSize: 12, padding: '2px 8px', borderRadius: 5, border: 'none', background: '#eee', color: '#e53935', cursor: 'pointer' }}
                        >{item.adicionais && item.adicionais.length > 0 ? 'Editar Adicionais' : 'Adicionar Adicionais'}</button>
                      )}
                    </div>
                  </div>
      {/* Modal de seleção de adicionais */}
      {modalItemId && ReactDOM.createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0003', zIndex: 2147483647,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          inset: 0
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, minWidth: 340, maxWidth: 520, boxShadow: '0 12px 48px #0007, 0 2px 12px #0003', zIndex: 2147483647 }}>
            <h3 style={{ marginBottom: 12, color: '#e53935', fontSize: 18 }}>Escolha os adicionais</h3>
            <div style={{ marginBottom: 18 }}>
              {loadingAdicionais ? (
                <div style={{ color: '#888', fontSize: 15 }}>Carregando...</div>
              ) : erroAdicionais ? (
                <div style={{ color: 'red', fontSize: 15 }}>{erroAdicionais}</div>
              ) : adicionais.length === 0 ? (
                <div style={{ color: '#888', fontSize: 15 }}>Nenhum adicional disponível.</div>
              ) : (
                (() => {
                  // Divide os adicionais em duas colunas
                  const metade = Math.ceil(adicionais.length / 2);
                  const col1 = adicionais.slice(0, metade);
                  const col2 = adicionais.slice(metade);
                  return (
                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: 'center' }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 18 }}>
                        {col1.map(ad => {
                          const sel = selectedAdicionais.find((a) => a.id === ad.id) || { ...ad, quantidade: 0 };
                          return (
                            <div key={ad.id} style={{
                              marginBottom: 10,
                              fontSize: 15,
                              padding: '2px 0',
                              borderBottom: '1px solid #f3f3f3',
                              minHeight: 36
                            }}>
                              <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{ad.nome}</div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {ad.preco ? <span style={{ color: '#888', fontSize: 14 }}>(R$ {ad.preco.toFixed(2)})</span> : <span></span>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                  <button onClick={() => {
                                    if (sel.quantidade > 0) {
                                      setSelectedAdicionais(selectedAdicionais.map(a => a.id === ad.id ? { ...a, quantidade: sel.quantidade - 1 } : a).filter(a => a.quantidade > 0));
                                    }
                                  }} style={{ fontSize: 18, width: 28, height: 28, borderRadius: 6, border: '1px solid #eee', background: '#fafafa', color: '#e53935', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                                  <span style={{ minWidth: 22, textAlign: 'center', fontWeight: 700, fontSize: 16 }}>{sel.quantidade || 0}</span>
                                  <button onClick={() => {
                                    if (sel.quantidade > 0) {
                                      setSelectedAdicionais(selectedAdicionais.map(a => a.id === ad.id ? { ...a, quantidade: sel.quantidade + 1 } : a));
                                    } else {
                                      setSelectedAdicionais([...selectedAdicionais, { ...ad, quantidade: 1 }]);
                                    }
                                  }} style={{ fontSize: 18, width: 28, height: 28, borderRadius: 6, border: '1px solid #eee', background: '#fafafa', color: '#43a047', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ width: 2, background: '#eee', height: '100%', margin: '0 4px', borderRadius: 2 }} />
                      <div style={{ flex: 1, minWidth: 0, paddingLeft: 18 }}>
                        {col2.map(ad => {
                          const sel = selectedAdicionais.find((a) => a.id === ad.id) || { ...ad, quantidade: 0 };
                          return (
                            <div key={ad.id} style={{
                              marginBottom: 10,
                              fontSize: 15,
                              padding: '2px 0',
                              borderBottom: '1px solid #f3f3f3',
                              minHeight: 36
                            }}>
                              <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{ad.nome}</div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {ad.preco ? <span style={{ color: '#888', fontSize: 14 }}>(R$ {ad.preco.toFixed(2)})</span> : <span></span>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                  <button onClick={() => {
                                    if (sel.quantidade > 0) {
                                      setSelectedAdicionais(selectedAdicionais.map(a => a.id === ad.id ? { ...a, quantidade: sel.quantidade - 1 } : a).filter(a => a.quantidade > 0));
                                    }
                                  }} style={{ fontSize: 18, width: 28, height: 28, borderRadius: 6, border: '1px solid #eee', background: '#fafafa', color: '#e53935', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                                  <span style={{ minWidth: 22, textAlign: 'center', fontWeight: 700, fontSize: 16 }}>{sel.quantidade || 0}</span>
                                  <button onClick={() => {
                                    if (sel.quantidade > 0) {
                                      setSelectedAdicionais(selectedAdicionais.map(a => a.id === ad.id ? { ...a, quantidade: sel.quantidade + 1 } : a));
                                    } else {
                                      setSelectedAdicionais([...selectedAdicionais, { ...ad, quantidade: 1 }]);
                                    }
                                  }} style={{ fontSize: 18, width: 28, height: 28, borderRadius: 6, border: '1px solid #eee', background: '#fafafa', color: '#43a047', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setModalItemId(null)}
                style={{ background: '#eee', color: '#e53935', border: 'none', borderRadius: 7, padding: '7px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}
              >Cancelar</button>
              <button
                onClick={() => {
                  // Só envia adicionais com quantidade > 0
                  updateAdicionais(modalItemId, selectedAdicionais.filter(a => a.quantidade > 0));
                  // Se o item tiver quantidade > 1, ajusta para 1
                  const item = items.find(i => i.id === modalItemId);
                  if (item && item.quantidade > 1) {
                    updateQuantity(item.id, 1);
                  }
                  setModalItemId(null);
                }}
                style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}
              >Salvar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
                  {/* Observações/tirar algo, se houver */}
                  {item.observacoes && (
                    <div style={{ fontSize: 13, color: '#888', margin: '2px 0 0 0', fontStyle: 'italic' }}>
                      Obs: {item.observacoes}
                    </div>
                  )}
                  <div style={{ color: '#888', fontSize: 14, marginTop: 2 }}>R$ {item.preco.toFixed(2)}</div>
                  <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantidade - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935', fontSize: 20 }} title="Diminuir">
                      <MdRemoveCircleOutline />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: 16, minWidth: 22, textAlign: 'center' }}>{item.quantidade}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                      style={{ background: 'none', border: 'none', cursor: item.adicionais && item.adicionais.length > 0 ? 'not-allowed' : 'pointer', color: '#43a047', fontSize: 20, opacity: item.adicionais && item.adicionais.length > 0 ? 0.5 : 1 }}
                      title={item.adicionais && item.adicionais.length > 0 ? 'Adicione cada lanche individualmente para especificar os adicionais.' : 'Aumentar'}
                      disabled={item.adicionais && item.adicionais.length > 0}
                    >
                      <MdAddCircleOutline />
                    </button>
                  </div>
                  {/* Campo de observações só para não-bebidas */}
                  {!(item.nome && /coca|refrigerante|suco|água|agua|bebida|sprite|fanta|guaraná|guarana|pepsi|tônica|tonica|cerveja|heineken|skol|brahma|antarctica|schin|itubaína|itubaina|soda|chá|cha/i.test(item.nome)) && (
                    <div style={{ marginTop: 10 }}>
                      <input
                        type="text"
                        value={item.observacoes || ''}
                        onChange={e => {
                          // Atualiza observação do item sem alterar adicionais
                          const novaObs = e.target.value;
                          updateAdicionais(item.id, item.adicionais || [], novaObs);
                        }}
                        placeholder="Observação (ex: tirar cebola, sem maionese...)"
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #eee', fontSize: 14, marginTop: 2 }}
                      />
                    </div>
                  )}
                </div>
                <button onClick={() => removeItem(item.id)} style={{ color: '#e53935', marginLeft: 8, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', fontSize: 20 }} title="Remover">
                  <MdDelete />
                </button>
              </li>
            ))}
          </ul>
          <div style={{ fontWeight: 700, fontSize: 18, margin: '22px 0 10px 0', textAlign: 'right', color: '#232323' }}>
            Total: <span style={{ color: '#e53935' }}>R$ {totalCarrinho.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, gap: 10 }}>
            <button onClick={clearCart} style={{ background: '#eee', color: '#e53935', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdDelete /> Limpar Carrinho
            </button>
            <button onClick={handleFinalizar} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px #e5393522' }}>
              <MdShoppingCartCheckout /> Finalizar Pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrinho;
