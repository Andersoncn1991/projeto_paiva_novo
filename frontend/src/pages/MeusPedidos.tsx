import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPedidos } from '../services/api';
import { Card, Typography, Spin, Alert, Tag, Button, Timeline, Empty, Row, Col, Divider, Modal, Descriptions, Tooltip, message } from 'antd';
import { InfoCircleOutlined, ReloadOutlined as IconeRecarregar, DollarOutlined, CreditCardOutlined, QrcodeOutlined } from '@ant-design/icons';
// Função utilitária para formatar valores monetários
const formatarMoeda = (valor: number | null | undefined) => `R$ ${(valor ?? 0).toFixed(2)}`;
// Linha do tempo dos status do pedido
const linhaTempoStatusPedido = [
  { chave: 'pendente', rotulo: 'Pedido realizado' },
  { chave: 'em_preparo', rotulo: 'Em preparo' },
  { chave: 'pronto', rotulo: 'Pronto para entrega' },
  { chave: 'entregue', rotulo: 'Entregue' },
  { chave: 'cancelado', rotulo: 'Cancelado' },
];

const ModalDetalhePedido: React.FC<{ pedido: any, aberto: boolean, aoFechar: () => void }> = ({ pedido, aberto, aoFechar }) => {
  if (!pedido) return null;
  // Linha do tempo de status
  const idxStatus = linhaTempoStatusPedido.findIndex(s => s.chave === pedido.status);
  return (
  <Modal open={aberto} onCancel={aoFechar} footer={null} title={`Detalhes do Pedido ${pedido.id}`}
      width={560}>
  <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Status">
          {(() => {
            const statusKey = pedido.status as keyof typeof mapaStatus;
            const statusInfo = mapaStatus[statusKey];
            return (
              <Tag color={statusInfo?.cor} icon={statusInfo?.icone} style={pedido.status === 'em_preparo' ? { animation: 'pulse 1.2s infinite' } : {}}>
                {statusInfo?.rotulo || pedido.status}
              </Tag>
            );
          })()}
        </Descriptions.Item>
        <Descriptions.Item label="Data/Hora">
          {(() => {
            const rawDate = pedido.data || pedido.created_at || pedido.data_pedido;
            if (!rawDate) return '-';
            const d = new Date(rawDate);
            if (isNaN(d.getTime())) return '-';
            // Exibe no formato: 18/08/2025, 21:46
            return d.toLocaleDateString('pt-BR') + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          })()}
        </Descriptions.Item>
        <Descriptions.Item label="Progresso">
          <Timeline style={{ marginLeft: 8 }}>
            {linhaTempoStatusPedido.slice(0, pedido.status === 'cancelado' ? 5 : 4).map((s, idx) => (
              <Timeline.Item key={s.chave} color={idx < idxStatus ? 'green' : idx === idxStatus ? '#1890ff' : '#ccc'}>
                <span style={{ fontWeight: idx === idxStatus ? 700 : 400 }}>{s.rotulo}</span>
              </Timeline.Item>
            ))}
            {pedido.status === 'cancelado' && (
              <Timeline.Item color="red"><b>Cancelado</b></Timeline.Item>
            )}
          </Timeline>
        </Descriptions.Item>
        {/* Endereço de Entrega: só mostra se houver endereço */}
        {pedido.endereco && pedido.endereco.trim() !== '' && (
          <Descriptions.Item label="Endereço de Entrega">{pedido.endereco}</Descriptions.Item>
        )}
        {/* Pagamento: mostrar sempre, inclusive para retirada */}
        <Descriptions.Item label="Pagamento">
          {(() => {
            const forma = (pedido.forma_pagamento || '').toLowerCase();
            if (!pedido.forma_pagamento && (!pedido.endereco || pedido.endereco.trim() === '')) {
              // Retirada em balcão sem forma_pagamento
              return (
                <span style={{ color: '#ff0c0ce8', fontWeight: 600, fontSize: 18, letterSpacing: 1 }}>
                  <span role="img" aria-label="balcao" style={{ marginRight: 4 }}>🛎️</span> Em Balcão
                </span>
              );
            }
            if (forma.includes('dinheiro')) {
              return <span style={{ color: '#388e3c', fontWeight: 500 }}><DollarOutlined /> Dinheiro</span>;
            }
            if (forma.includes('pix')) {
              return <span style={{ color: '#1976d2', fontWeight: 500 }}><QrcodeOutlined /> Pix</span>;
            }
            if (forma.includes('cartao') || forma.includes('cartão')) {
              return <span style={{ color: '#e53935', fontWeight: 500 }}><CreditCardOutlined /> Cartão</span>;
            }
            if (forma.includes('balcao') || forma.includes('balcão')) {
              return (
                <span style={{ color: '#faad14', fontWeight: 600, fontSize: 18, letterSpacing: 1 }}>
                  <span role="img" aria-label="balcao" style={{ marginRight: 4 }}>🛎️</span> Em Balcão
                </span>
              );
            }
            return <span style={{ fontWeight: 500 }}>{pedido.forma_pagamento}</span>;
          })()}
        </Descriptions.Item>
        {pedido.observacoes && (
          <Descriptions.Item label="Observações">{pedido.observacoes}</Descriptions.Item>
        )}
        <Descriptions.Item label="Itens do Pedido">
          <Timeline style={{ marginLeft: 8 }}>
            {pedido.itens.map((item: any, idx: number) => (
              <Timeline.Item key={idx} color="#e53935">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontWeight: 600, wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{item.nome.replace(/\s*\(\s*Único\s*\)/i, '')}</span> <span style={{ color: '#888' }}>x{item.quantidade}</span>
                  </div>
                  <span style={{ color: '#232323', fontWeight: 500, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {formatarMoeda(item.preco * item.quantidade)}
                  </span>
                </div>
                {item.adicionais && item.adicionais.length > 0 && (
                  <div style={{ marginLeft: 16, color: '#555', fontSize: 13, marginTop: 2 }}>
                    {item.adicionais.map((adc: any, i: number) => (
                      <div key={adc.id || i}>
                        + {adc.nome}
                        {adc.quantidade > 1 && (
                          <span style={{ color: 'red', fontWeight: 'bold' }}> x{adc.quantidade}</span>
                        )}
                        {typeof adc.valor_total === 'number' ? ` (R$ ${adc.valor_total.toFixed(2)})` : adc.preco ? ` (R$ ${(adc.preco * (adc.quantidade || 1)).toFixed(2)})` : ''}
                      </div>
                    ))}
                  </div>
                )}
                {item.observacoes && (
                  <div style={{ marginLeft: 16, color: '#888', fontSize: 13, marginTop: 2, fontStyle: 'italic' }}>
                    Obs: {item.observacoes}
                  </div>
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        </Descriptions.Item>
  {/* Removido campo 'Entrega', pois já existe 'Taxa de Entrega' acima do total */}
        {pedido.desconto !== undefined && pedido.desconto > 0 && (
          <Descriptions.Item label="Desconto">- {formatarMoeda(pedido.desconto)}</Descriptions.Item>
        )}
        {/* Bloco de taxa de entrega acima do total */}
        {/* Mostra taxa de entrega se for entrega OU se não houver tipo_entrega e houver taxa (> 0) */}
        {(
          (pedido.tipo_entrega && String(pedido.tipo_entrega).toLowerCase() === 'entrega') ||
          (pedido.tipoEntrega && String(pedido.tipoEntrega).toLowerCase() === 'entrega') ||
          (!pedido.tipo_entrega && !pedido.tipoEntrega && ((pedido.taxa_entrega ?? 0) > 0 || (pedido.valor_entrega ?? 0) > 0))
        ) ? (
          <Descriptions.Item label={<b>Taxa de Entrega</b>}>
            <b>{formatarMoeda(
              (pedido.taxa_entrega !== undefined && pedido.taxa_entrega !== null)
                ? Number(pedido.taxa_entrega)
                : (pedido.valor_entrega !== undefined && pedido.valor_entrega !== null)
                  ? Number(pedido.valor_entrega)
                  : 0
            )}</b>
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label={<b>Total</b>}>
          <b>{(() => {
            let taxa = (pedido.taxa_entrega !== undefined && pedido.taxa_entrega !== null)
              ? Number(pedido.taxa_entrega)
              : (pedido.valor_entrega !== undefined && pedido.valor_entrega !== null)
                ? Number(pedido.valor_entrega)
                : 0;
            // Soma taxa só se for entrega OU se não houver tipo_entrega e houver taxa (> 0)
            const isEntrega =
              (pedido.tipo_entrega && String(pedido.tipo_entrega).toLowerCase() === 'entrega') ||
              (pedido.tipoEntrega && String(pedido.tipoEntrega).toLowerCase() === 'entrega') ||
              (!pedido.tipo_entrega && !pedido.tipoEntrega && (taxa > 0));
            let total = typeof pedido.total === 'number' && !isNaN(pedido.total)
              ? pedido.total
              : (pedido.itens?.reduce((sum: number, i: any) => {
                  let subtotal = (i.preco * i.quantidade) || 0;
                  if (i.adicionais && Array.isArray(i.adicionais)) {
                    subtotal += i.adicionais.reduce((adcSum: number, adc: any) => {
                      // Usa valor_total do banco se existir, senão calcula
                      if (typeof adc.valor_total === 'number') {
                        return adcSum + adc.valor_total;
                      }
                      const qtd = adc.quantidade || 1;
                      const preco = adc.preco || 0;
                      return adcSum + (preco * qtd);
                    }, 0);
                  }
                  return sum + subtotal;
                }, 0) || 0)
                + (isEntrega ? taxa : 0)
                - (pedido.desconto || 0);
            if (total < 0) total = 0;
            return formatarMoeda(total);
          })()}</b>
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Row justify="end" gutter={8}>
        <Col>
          <Tooltip title="Repetir este pedido">
            <Button type="primary" ghost icon={<IconeRecarregar />} onClick={() => message.info('Função de repetir pedido em breve!')}>Repetir Pedido</Button>
          </Tooltip>
        </Col>
        <Col>
          <Tooltip title="Avaliar este pedido">
            <Button disabled={pedido.status !== 'entregue'} icon={<CheckCircleOutlined />} onClick={() => message.info('Função de avaliação em breve!')}>Avaliar Pedido</Button>
          </Tooltip>
        </Col>
        {pedido.status === 'pendente' && (
          <Col>
            <Tooltip title="Cancelar este pedido">
              <Button danger onClick={() => message.info('Função cancelar pedido em breve!')}>Cancelar Pedido</Button>
            </Tooltip>
          </Col>
        )}
        <Col><Button onClick={aoFechar}>Fechar</Button></Col>
      </Row>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 #1890ff44; }
          70% { box-shadow: 0 0 0 8px #1890ff11; }
          100% { box-shadow: 0 0 0 0 #1890ff44; }
        }
      `}</style>
    </Modal>
  );
};
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ShoppingCartOutlined, ReloadOutlined } from '@ant-design/icons';

// Mapa de status e cores
const mapaStatus = {
  'pendente': { cor: 'orange', rotulo: 'Pendente', icone: <ClockCircleOutlined /> },
  'em_preparo': { cor: 'blue', rotulo: 'Em preparo', icone: <ReloadOutlined spin /> },
  'pronto': { cor: 'green', rotulo: 'Pronto', icone: <CheckCircleOutlined /> },
  'entregue': { cor: 'cyan', rotulo: 'Entregue', icone: <CheckCircleOutlined /> },
  'cancelado': { cor: 'red', rotulo: 'Cancelado', icone: <CloseCircleOutlined /> },
};

// Busca real dos pedidos do usuário autenticado
const buscarPedidos = async () => {
  const dados = await getPedidos();
  return dados.map((pedido: any) => ({
    ...pedido,
    data: pedido.data || pedido.created_at || pedido.data_pedido,
    itens: pedido.itens || pedido.produtos || [],
  }));
};

const PaginaMeusPedidos: React.FC = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [buscaId, setBuscaId] = useState<string>('');
  const { setSessionError } = useAuth();

  useEffect(() => {
    setCarregando(true);
    setErro(null);
    buscarPedidos()
      .then(dados => setPedidos(dados))
      .catch((err: any) => {
        if (err.message && err.message.includes('Sessão expirada')) {
          setSessionError('Sua sessão expirou. Faça login novamente.');
        } else {
          setErro('Erro ao buscar pedidos');
        }
      })
      .finally(() => setCarregando(false));
  }, [setSessionError]);

  // Filtros removidos conforme solicitado, mostrando todos os pedidos
  const pedidosFiltrados = pedidos;

  return (
    <div style={{ maxWidth: 700, minWidth: 400, margin: '40px auto', padding: 0 }}>
      <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        <ShoppingCartOutlined style={{ color: '#e53935', marginRight: 10 }} />Meus Pedidos
      </Typography.Title>
  {/* Filtros removidos conforme solicitado, mostrando todos os pedidos */}
      {carregando ? (
        <Spin style={{ display: 'block', margin: '60px auto' }} />
      ) : erro ? (
        <Alert type="error" message={erro} style={{ margin: 32 }} />
      ) : pedidosFiltrados.length === 0 ? (
        <Empty description={<> 
          Nenhum pedido encontrado.<br />
          <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/lanches')}>Fazer meu primeiro pedido</Button>
        </>} style={{ margin: 48 }} />
      ) : (
        <>
          <Row gutter={[0, 24]}>
            {pedidosFiltrados.map(pedido => {
              // Badge para novo pedido (feito nas últimas 24h) ou entregue nas últimas 24h
              const agora = Date.now();
              const dataPedido = new Date(pedido.data).getTime();
              const ehNovo = agora - dataPedido < 1000 * 60 * 60 * 24 && pedido.status === 'pendente';
              const ehEntregueRecente = agora - dataPedido < 1000 * 60 * 60 * 24 && pedido.status === 'entregue';
              return (
                <Col span={24} key={pedido.id}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    {(ehNovo || ehEntregueRecente) && (
                      <span style={{
                        position: 'absolute',
                        top: -10,
                        right: 18,
                        background: ehNovo ? '#ff9800' : '#52c41a',
                        color: '#fff',
                        borderRadius: 8,
                        padding: '2px 10px',
                        fontSize: 13,
                        fontWeight: 600,
                        zIndex: 2,
                        boxShadow: '0 2px 8px #0002',
                        letterSpacing: 0.5,
                        animation: 'badgePop 0.7s',
                      }}>
                        {ehNovo ? 'Novo!' : 'Entregue!'}
                      </span>
                    )}
                    <Card
                      bordered
                      hoverable
                      onClick={() => { setPedidoSelecionado(pedido); setModalAberto(true); }}
                      style={{
                        width: '100%',
                        minHeight: 220,
                        borderRadius: 16,
                        boxShadow: '0 2px 16px #0001',
                        marginBottom: 0,
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s, transform 0.18s',
                        border: '2.5px solid #e53935',
                        ...(ehNovo ? { border: '2.5px solid #ff9800' } : ehEntregueRecente ? { border: '2.5px solid #52c41a' } : {}),
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      bodyStyle={{ padding: 20 }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px #0002')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 16px #0001')}
                    >
                      <Row align="middle" justify="space-between">
                        <Col>
                          <Typography.Text strong style={{ fontSize: 17 }}>
                            Pedido {pedido.id}
                            <Tooltip title="Ver detalhes"><InfoCircleOutlined style={{ marginLeft: 8, color: '#888' }} /></Tooltip>
                          </Typography.Text>
                          <br />
                          <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                            {new Date(pedido.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                          </Typography.Text>
                        </Col>
                        <Col>
                          {(() => {
                            const statusKey = pedido.status as keyof typeof mapaStatus;
                            const statusInfo = mapaStatus[statusKey];
                            return (
                              <Tag color={statusInfo?.cor} icon={statusInfo?.icone} style={{ fontSize: 15, padding: '4px 12px', ...(pedido.status === 'em_preparo' ? { animation: 'pulse 1.2s infinite' } : {}) }}>
                                {statusInfo?.rotulo || pedido.status}
                              </Tag>
                            );
                          })()}
                        </Col>
                      </Row>
                      <Divider style={{ margin: '12px 0' }} />
                      <Timeline style={{ marginLeft: 8 }}>
                        {pedido.itens.map((item: any, idx: number) => (
                          <Timeline.Item key={idx} color="#e53935">
                            <div>
                              <span style={{ fontWeight: 600 }}>{item.nome.replace(/\s*\(\s*Único\s*\)/i, '')}</span> <span style={{ color: '#888' }}>x{item.quantidade}</span>
                              <span style={{ float: 'right', color: '#232323', fontWeight: 500 }}>
                                {formatarMoeda(item.preco * item.quantidade)}
                              </span>
                            </div>
                            {item.adicionais && item.adicionais.length > 0 && (
                              <div style={{ marginLeft: 16, color: '#555', fontSize: 13, marginTop: 2 }}>
                                {item.adicionais.map((adc: any, i: number) => {
                                  return (
                                    <div key={adc.id || i}>
                                      + {adc.nome}
                                      {adc.quantidade > 1 && (
                                        <span style={{ color: 'red', fontWeight: 'bold' }}> x{adc.quantidade}</span>
                                      )}
                                      {typeof adc.valor_total === 'number' ? ` (R$ ${adc.valor_total.toFixed(2)})` : adc.preco ? ` (R$ ${(adc.preco * (adc.quantidade || 1)).toFixed(2)})` : ''}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {item.observacoes && (
                              <div style={{ marginLeft: 16, color: '#888', fontSize: 13, marginTop: 2, fontStyle: 'italic' }}>
                                Obs: {item.observacoes}
                              </div>
                            )}
                          </Timeline.Item>
                        ))}
                      </Timeline>
                      <Divider style={{ margin: '12px 0' }} />
                      {/* Taxa de entrega e total no card - versão única, limpa */}
                      <Row justify="end">
                        <Col>
                          <div style={{ minWidth: 220 }}>
                            {/* Só mostra taxa de entrega se for entrega no endereço */}
                            {(
                              (pedido.tipo_entrega && String(pedido.tipo_entrega).toLowerCase() === 'entrega') ||
                              (pedido.tipoEntrega && String(pedido.tipoEntrega).toLowerCase() === 'entrega') ||
                              (!pedido.tipo_entrega && !pedido.tipoEntrega && ((pedido.taxa_entrega ?? 0) > 0 || (pedido.valor_entrega ?? 0) > 0))
                            ) ? (
                              <div style={{ fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                                <span style={{ fontWeight: 'bold', marginRight: 6 }}>Entrega:</span>
                                <span>
                                  {formatarMoeda(
                                    (pedido.taxa_entrega !== undefined && pedido.taxa_entrega !== null)
                                      ? Number(pedido.taxa_entrega)
                                      : (pedido.valor_entrega !== undefined && pedido.valor_entrega !== null)
                                        ? Number(pedido.valor_entrega)
                                        : 0
                                  )}
                                </span>
                              </div>
                            ) : null}
                            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                              <span style={{ fontWeight: 'bold', marginRight: 6 }}>Total:</span>
                              <span style={{ fontWeight: 'bold' }}>
                                {(() => {
                                  let taxa = (pedido.taxa_entrega !== undefined && pedido.taxa_entrega !== null)
                                    ? Number(pedido.taxa_entrega)
                                    : (pedido.valor_entrega !== undefined && pedido.valor_entrega !== null)
                                      ? Number(pedido.valor_entrega)
                                      : 0;
                                  // Soma taxa só se for entrega OU se não houver tipo_entrega e houver taxa (> 0)
                                  const isEntrega =
                                    (pedido.tipo_entrega && String(pedido.tipo_entrega).toLowerCase() === 'entrega') ||
                                    (pedido.tipoEntrega && String(pedido.tipoEntrega).toLowerCase() === 'entrega') ||
                                    (!pedido.tipo_entrega && !pedido.tipoEntrega && (taxa > 0));
                                  let total = typeof pedido.total === 'number' && !isNaN(pedido.total)
                                    ? pedido.total
                                    : (pedido.itens?.reduce((sum: number, i: any) => {
                                        let subtotal = (i.preco * i.quantidade) || 0;
                                        if (i.adicionais && Array.isArray(i.adicionais)) {
                                          subtotal += i.adicionais.reduce((adcSum: number, adc: any) => {
                                            if (typeof adc.valor_total === 'number') {
                                              return adcSum + adc.valor_total;
                                            }
                                            const qtd = adc.quantidade || 1;
                                            const preco = adc.preco || 0;
                                            return adcSum + (preco * qtd);
                                          }, 0);
                                        }
                                        return sum + subtotal;
                                      }, 0) || 0)
                                      + (isEntrega ? taxa : 0)
                                      - (pedido.desconto || 0);
                                  if (total < 0) total = 0;
                                  return formatarMoeda(total);
                                })()}
                              </span>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </div>
                </Col>
              );
            })}
          </Row>
          <ModalDetalhePedido pedido={pedidoSelecionado} aberto={modalAberto} aoFechar={() => setModalAberto(false)} />
          <style>{`
            @keyframes badgePop {
              0% { transform: scale(0.7); opacity: 0; }
              60% { transform: scale(1.15); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

export default PaginaMeusPedidos;
