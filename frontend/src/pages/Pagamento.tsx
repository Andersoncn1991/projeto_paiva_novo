import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Radio, Button, Input, Select, Divider, Typography, message } from 'antd';
import { ShopOutlined, CarOutlined, DollarCircleOutlined, CreditCardOutlined, QrcodeOutlined } from '@ant-design/icons';

import visaImg from '../assets/visa.png';
import masterImg from '../assets/master.png';
import eloImg from '../assets/elo.png';
import { criarPedido } from '../services/api';
import { getTaxaEntrega } from '../services/taxaEntrega';

const { Title } = Typography;
const bandeiras = [
  { value: 'visa', label: 'Visa', img: visaImg },
  { value: 'master', label: 'Master', img: masterImg },
  { value: 'elo', label: 'Elo', img: eloImg },
];

interface PagamentoProps {
  pedido?: any;
  cliente?: any;
}

const Pagamento: React.FC<PagamentoProps> = (props) => {
  const { clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  // Tenta pegar pedido do location.state ou das props
  const pedido = location.state?.pedido || props.pedido;
  const { user } = useAuth();
  const [cliente, setCliente] = useState<any>(user);

  useEffect(() => {
    async function fetchCliente() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const resp = await fetch('http://127.0.0.1:8000/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          setCliente(data);
        }
      } catch (err) {
        // erro silencioso
      }
    }
    fetchCliente();
  }, []);

  React.useEffect(() => {
    if (!pedido) {
      navigate('/carrinho');
    }
  }, [pedido, navigate]);

  if (!pedido) {
    return (
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <h2>Pedido não encontrado. Redirecionando...</h2>
      </div>
    );
  }
  const [entrega, setEntrega] = useState('');
  const [bairro, setBairro] = useState(cliente?.bairro || '');
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  async function finalizarPedido() {
  try {
      let pixKey = chavePix;
      let qr = qrCode;
      // Se for Pix, gera chave e QR Code automaticamente
      if (pagamento === 'pix') {
        pixKey = 'chave-pix-mercadopago-123';
        qr = 'https://api.qrserver.com/v1/create-qr-code/?data=chave-pix-mercadopago-123';
        setChavePix(pixKey);
        setQrCode(qr);
        setPixGerado(true);
      }
      // Monta o payload do pedido
        const itensFormatados = (pedido.items || []).map((item: any) => {
          let produtoId = item.produto_id ?? item.id ?? 0;
          if (typeof produtoId === 'string') {
            // Extrai apenas a parte numérica do id (ex: '1_Único' => 1)
            const match = produtoId.match(/\d+/);
            produtoId = match ? parseInt(match[0], 10) : 0;
          }
          return {
            produto_id: produtoId,
            nome: item.nome || '',
            quantidade: item.quantidade ?? 1,
            preco: item.preco ?? 0,
            adicionais: Array.isArray(item.adicionais) ? item.adicionais : [],
            observacoes: item.observacoes || ''
          };
        });
        console.log('Itens formatados para o backend:', itensFormatados);
        const payload = {
          cliente: cliente?.nome || cliente?.name || '',
          tipo_entrega: entrega,
          bairro: bairro || '',
          taxa_entrega: taxaEntrega,
          forma_pagamento: pagamento,
          troco,
          bandeira,
          pix: pagamento === 'pix' ? pixKey : '',
          itens: itensFormatados,
          total: pedido.total,
        };
        console.log('Payload enviado para o backend:', payload);
      await criarPedido(payload);
      clearCart(); // Limpa o carrinho após finalizar o pedido
      message.success('Pedido finalizado com sucesso!');
      if (pagamento === 'pix') {
        navigate('/pagamento-pix', { state: { chavePix: pixKey, qrCode: qr } });
      } else {
        navigate('/pedidos');
      }
    } catch (err: any) {
      message.error('Erro ao finalizar pedido: ' + (err.message || err));
    }
  }
  const [pagamento, setPagamento] = useState('');
  const [troco, setTroco] = useState('');
  const [bandeira, setBandeira] = useState('');
  const [pixGerado, setPixGerado] = useState(false);
  const [chavePix, setChavePix] = useState('');
  const [qrCode, setQrCode] = useState('');


  async function calcularTaxa() {
    console.log('Executando calcularTaxa. Entrega:', entrega, 'Bairro:', bairro);
    if (entrega === 'entrega') {
      if (!bairro) {
        setTaxaEntrega(20);
        return;
      }
      const valor = await getTaxaEntrega(bairro);
      console.log('Taxa de entrega retornada pela API:', valor, 'Bairro:', bairro);
      if (valor === null || valor === undefined || isNaN(valor) || valor <= 0) {
        setTaxaEntrega(20);
      } else {
        setTaxaEntrega(valor);
      }
    } else {
      setTaxaEntrega(0);
    }
  }

  React.useEffect(() => {
    // Preenche bairro automaticamente se vier do cliente
    if (cliente && cliente.bairro && !bairro) {
      setBairro(cliente.bairro);
    }
  }, [cliente]);

  useEffect(() => {
    if (entrega === 'entrega' && bairro) {
      calcularTaxa();
    } else if (entrega === 'entrega') {
      setTaxaEntrega(20);
    } else {
      setTaxaEntrega(0);
    }
  }, [entrega, bairro]);

  function gerarPix() {
    // Simulação de geração de chave e QR Code
    setChavePix('chave-pix-mercadopago-123');
    setQrCode('https://api.qrserver.com/v1/create-qr-code/?data=chave-pix-mercadopago-123');
    setPixGerado(true);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 'calc(100vh - 80px)', padding: '32px 0' }}>
      <Card style={{ width: '100%', maxWidth: 1400, minWidth: 340, boxShadow: '0 2px 16px #0001', borderRadius: 18, padding: '40px 48px 32px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>Pagamento</Title>
          <Divider>Dados do Cliente</Divider>
          {cliente && (
            <div style={{ marginBottom: 18, background: '#f5f5f5', borderRadius: 10, padding: '16px 24px', boxShadow: '0 1px 6px #0001', border: '1px solid #eee' }}>
              <div><b>Nome:</b> {cliente.nome || cliente.name || '-'}</div>
              <div><b>Telefone:</b> {cliente.telefone || cliente.phone || '-'}</div>
              <div><b>Rua:</b> {cliente.rua || '-'}</div>
              <div><b>Número:</b> {cliente.numero || '-'}</div>
              {cliente.complemento && (
                <div><b>Complemento:</b> {cliente.complemento}</div>
              )}
              <div><b>Bairro:</b> {cliente.bairro || '-'}</div>
              <div><b>Cidade:</b> {cliente.cidade || '-'}</div>
              <div><b>CEP:</b> {cliente.cep || '-'}</div>
            </div>
          )}
          <Divider>Resumo do Pedido</Divider>
          <div style={{ marginBottom: 18 }}>
          {pedido?.items && pedido.items.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {pedido.items.map((item: any, idx: number) => {
                // Remove '(Único)' do nome do produto
                const nomeProduto = (item.nome || item.nome_produto || 'Produto').replace(/\s*\(\s*Único\s*\)/i, '');
                return (
                  <li key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fafafa',
                    borderRadius: 10,
                    marginBottom: 12,
                    boxShadow: '0 1px 6px #0001',
                    padding: '12px 24px',
                    border: '1px solid #eee',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
                      <span style={{ fontWeight: 700, fontSize: 17, flex: 1, whiteSpace: 'normal', wordBreak: 'break-word' }}>{nomeProduto}</span>
                      <span style={{ fontWeight: 600, color: '#e53935', fontSize: 16, flexShrink: 0 }}>R$ {item.preco?.toFixed(2) || '...'}</span>
                    </div>
                    <div style={{ fontSize: 15, color: '#555', marginTop: 2 }}>
                      Quantidade: <b>{item.quantidade || 1}</b>
                    </div>
                    {item.adicionais && item.adicionais.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        {item.adicionais.map((ad: any, i: number) => {
                          // Se o adicional tem campo quantidade, soma o valor
                          const qtd = ad.quantidade || 1;
                          const valorTotal = (ad.preco || 0) * qtd;
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                              <span style={{ color: '#e53935', fontWeight: 700, fontSize: 16, marginRight: 4 }}>+ {ad.nome.toUpperCase()}</span>
                              <span style={{ color: '#888', fontWeight: 500, fontSize: 15, marginLeft: 2 }}>
                                (R$ {valorTotal.toFixed(2)})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {item.observacoes && (
                      <div style={{ fontSize: 13, color: '#888', marginTop: 2, fontStyle: 'italic' }}>
                        Obs: {item.observacoes}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p style={{ color: '#888', textAlign: 'center' }}>Nenhum item no pedido.</p>
          )}
          {/* Exibe taxa de entrega acima do total apenas se entrega for 'entrega' */}
          {entrega === 'entrega' && (
            <div style={{ textAlign: 'right', fontWeight: 500, fontSize: 16, marginTop: 8, color: '#555' }}>
              Taxa de entrega: <span style={{ color: '#e53935' }}>R$ {taxaEntrega.toFixed(2)}</span>
            </div>
          )}
          <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 18, marginTop: 8 }}>
            <span>Total: </span>
            <span style={{ color: '#e53935' }}>
              {entrega === 'entrega'
                ? `R$ ${((pedido?.total || 0) + (taxaEntrega || 0)).toFixed(2)}`
                : `R$ ${(pedido?.total || 0).toFixed(2)}`}
            </span>
          </div>
        </div>
        {/* ...restante do conteúdo do card... */}
        <Divider>Entrega ou Retirada</Divider>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, width: '100%' }}>
          <Radio.Group
            value={entrega || null}
            onChange={e => {
              setEntrega(e.target.value);
              setTimeout(calcularTaxa, 0);
            }}
            style={{ display: 'flex', gap: 32, width: '100%', justifyContent: 'center' }}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button
              value="retirada"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '0 30px',
                fontSize: 18,
                background: entrega === 'retirada' ? '#fff' : '#f5f5f5',
                color: entrega === 'retirada' ? '#1890ff' : '#333',
                border: entrega === 'retirada' ? '2px solid #1890ff' : '1px solid #ddd',
                boxShadow: entrega === 'retirada' ? '0 2px 8px #1890ff22' : 'none',
                transition: 'all 0.2s',
                fontWeight: entrega === 'retirada' ? 700 : 500,
                minWidth: 210,
                justifyContent: 'center',
              }}
            >
              <ShopOutlined style={{ fontSize: 26, color: entrega === 'retirada' ? '#1890ff' : '#b0b0b0', marginRight: 8 }} />
              Retirar no balcão
            </Radio.Button>
            <Radio.Button
              value="entrega"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '0 30px',
                fontSize: 18,
                background: entrega === 'entrega' ? '#1890ff' : '#f5f5f5',
                color: entrega === 'entrega' ? '#fff' : '#333',
                border: entrega === 'entrega' ? '2px solid #1890ff' : '1px solid #ddd',
                boxShadow: entrega === 'entrega' ? '0 2px 8px #1890ff22' : 'none',
                transition: 'all 0.2s',
                fontWeight: entrega === 'entrega' ? 700 : 500,
                minWidth: 210,
                justifyContent: 'center',
              }}
            >
              <CarOutlined style={{ fontSize: 26, color: entrega === 'entrega' ? '#fff' : '#52c41a', marginRight: 8 }} />
              Entregar no endereço
            </Radio.Button>
          </Radio.Group>
          {/* Campo de bairro removido conforme solicitado */}
        </div>
        <Divider>Método de Pagamento</Divider>
        {entrega === 'entrega' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
            <Radio.Group value={pagamento} onChange={e => setPagamento(e.target.value)} style={{ display: 'flex', gap: 32 }}>
              <Radio value="dinheiro">
                <DollarCircleOutlined style={{ fontSize: 22, color: pagamento === 'dinheiro' ? '#1890ff' : '#b0b0b0', marginRight: 8, verticalAlign: 'middle' }} />
                Dinheiro
              </Radio>
              <Radio value="cartao">
                <CreditCardOutlined style={{ fontSize: 22, color: pagamento === 'cartao' ? '#1890ff' : '#b0b0b0', marginRight: 8, verticalAlign: 'middle' }} />
                Cartão (Débito/Crédito)
              </Radio>
              <Radio value="pix">
                <QrcodeOutlined style={{ fontSize: 22, color: pagamento === 'pix' ? '#1890ff' : '#b0b0b0', marginRight: 8, verticalAlign: 'middle' }} />
                Pix
              </Radio>
            </Radio.Group>
            {pagamento === 'dinheiro' && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <p>Precisa de troco?</p>
                <Input
                  placeholder="Valor do troco (opcional)"
                  value={troco}
                  onChange={e => setTroco(e.target.value)}
                  style={{ maxWidth: 200, margin: '0 auto', display: 'block' }}
                />
              </div>
            )}
          </div>
        )}
        {entrega === 'entrega' && pagamento === 'cartao' && (
          <div style={{ marginTop: 16 }}>
            <p>Selecione a bandeira:</p>
            <Select
              value={bandeira}
              onChange={setBandeira}
              style={{ width: 200 }}
              placeholder="Escolha a bandeira"
            >
              {bandeiras.map(b => (
                <Select.Option key={b.value} value={b.value}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={b.img} alt={b.label} style={{ width: 24, marginRight: 8 }} />
                    {b.label}
                  </span>
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
      {/* Exibe QR Code Pix só na página dedicada */}
      <Divider />
        <Button 
          type="primary" 
          block 
          style={{ marginTop: 24, height: 48, fontSize: 18, fontWeight: 700 }} 
          onClick={finalizarPedido}
          disabled={!entrega || (entrega === 'entrega' && !pagamento)}
        >
          Finalizar Pedido
        </Button>
        </div>
      </Card>
    </div>
  );
};

export default Pagamento;
