import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Card, Tag, Button } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco?: number;
  categoria?: string;
  imagem?: string;
  maisVendido?: boolean;
  novidade?: boolean;
  disponivel?: boolean;
  tamanhos?: Array<{ nome: string; preco: number; precoPromocional?: number }>;
}

interface MaisPedidosCarrosselProps {
  produtos: Produto[];
}


const MaisPedidosCarrossel: React.FC<MaisPedidosCarrosselProps> = ({ produtos }) => {
  const { addItem } = useCart();
  const [descExpandida, setDescExpandida] = useState<{ [id: number]: boolean }>({});
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<{ [id: number]: string }>({});
  const descLimit = 48;
  const handleVerMais = (id: number) => {
    setDescExpandida(prev => ({ ...prev, [id]: true }));
  };

  // Função igual à tela de lanches para ajustar caminho da imagem
  function ajustarCaminhoImagem(imagem: string) {
    if (!imagem) return '';
    if (/^https?:\/\//.test(imagem)) return imagem;
    if (imagem.startsWith('/static')) return 'http://localhost:8000' + imagem;
    if (imagem.startsWith('img/')) return 'http://localhost:8000/static/' + imagem;
    if (!imagem.startsWith('/')) return 'http://localhost:8000/static/img/' + imagem;
    return 'http://localhost:8000' + imagem;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '16px auto 24px auto', padding: '0 8px' }}>
      <h3 style={{ color: '#e53935', fontWeight: 800, fontSize: 22, margin: '0 0 2px 0', textAlign: 'center', position: 'relative', top: '-10px' }}>
        Lanches mais vendidos
      </h3>
      <Swiper
        modules={[Autoplay]}
        slidesPerView={Math.min(3, produtos.length)}
        spaceBetween={24}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        speed={900}
        loop={produtos.length > 3}
        breakpoints={{
          900: { slidesPerView: 2 },
          600: { slidesPerView: 1 }
        }}
        style={{ padding: '8px 0' }}
      >
        {produtos.map(prod => {
          const isLong = prod.descricao.length > descLimit;
          const showFullDesc = !!descExpandida[prod.id];
          // Lógica de preço igual ao card grande
          let precoNormal = 0, precoPromocional: number | undefined = undefined;
          let emPromocao = false;
          let tamanhosValidos: any[] = [];
          let tSel: any = undefined;
          if (prod.tamanhos && prod.tamanhos.length > 0) {
            const norm = (str: string) => str.normalize('NFD').replace(/[\u0000-\u001f\u0300-\u036f]/g, '').toLowerCase();
            tamanhosValidos = prod.tamanhos.filter((t: any) => {
              const n = norm(t.nome);
              return n === 'medio' || n === 'grande';
            });
            if (tamanhosValidos.length === 0) {
              tamanhosValidos = prod.tamanhos;
            }
            // Seleção do tamanho: pega do estado ou padrão Médio
            const nomeTamanho = tamanhoSelecionado[prod.id] || (tamanhosValidos.find((t: any) => norm(t.nome) === 'medio')?.nome) || tamanhosValidos[0]?.nome;
            tSel = tamanhosValidos.find((t: any) => t.nome === nomeTamanho) || tamanhosValidos[0];
            precoNormal = tSel?.preco ?? 0;
            precoPromocional = tSel?.precoPromocional;
            emPromocao = !!(precoPromocional && precoPromocional < precoNormal);
          } else {
            precoNormal = prod.preco ?? 0;
            precoPromocional = (prod as any).precoPromocional;
            emPromocao = !!(precoPromocional && precoPromocional < precoNormal);
          }
          const precoExibido = emPromocao && precoPromocional !== undefined ? precoPromocional : precoNormal;
          return (
            <SwiperSlide key={prod.id} style={{ padding: 8 }}>
              <Card
                hoverable
                style={{
                  width: 242,
                  minHeight: 370,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  overflow: 'hidden',
                  border: '2px solid #e0e0e0',
                  boxShadow: '0 2px 8px rgba(229,57,53,0.08)',
                  borderRadius: 16,
                  background: '#fff',
                }}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: 210,
                  padding: 12,
                  width: '100%',
                }}
                cover={<img alt={prod.nome} src={ajustarCaminhoImagem(prod.imagem)} style={{ height: 125, width: 220, objectFit: 'cover', display: 'block', margin: '0 auto', borderRadius: '12px 12px 0 0' }} />}
                actions={[
                  <Button
                    key="adicionar"
                    type="default"
                    size="small"
                    style={{
                      color: !prod.disponivel ? '#888' : '#232323',
                      borderColor: !prod.disponivel ? '#ccc' : '#232323',
                      background: '#fff',
                      fontWeight: 700,
                      transition: 'all 0.2s',
                      cursor: !prod.disponivel ? 'not-allowed' : 'pointer',
                      opacity: !prod.disponivel ? 0.5 : 1,
                    }}
                    disabled={!prod.disponivel}
                    onClick={() => {
                      if (!prod.disponivel) return;
                      // Monta o item para o carrinho
                      const id = prod.tamanhos && tSel ? `${prod.id}_${tSel.nome}` : String(prod.id);
                      addItem({
                        id,
                        nome: prod.tamanhos && tSel ? `${prod.nome} (${tSel.nome})` : prod.nome,
                        preco: precoExibido,
                        quantidade: 1,
                        imagem: prod.imagem,
                        adicionais: [],
                        observacoes: '',
                      });
                    }}
                  >
                    Adicionar
                  </Button>
                ]}
              >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>
                    {prod.nome}
                  </div>
                  <div style={{ marginBottom: 2 }}>
                    {prod.maisVendido && <Tag style={{ background: '#e53935', color: '#fff', border: 'none', fontWeight: 700, marginRight: 4 }}>Mais vendido</Tag>}
                    {prod.novidade && <Tag style={{ background: '#43a047', color: '#fff', border: 'none', fontWeight: 700, marginRight: 4 }}>Novo</Tag>}
                    {emPromocao && <Tag style={{ background: '#ff9800', color: '#fff', border: 'none', fontWeight: 700 }}>Promoção</Tag>}
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>
                    {isLong && !showFullDesc
                      ? <>
                          {prod.descricao.slice(0, 70)}...{' '}
                          <span style={{ color: '#e53935', cursor: 'pointer', fontWeight: 600 }} onClick={() => handleVerMais(prod.id)}>ver mais</span>
                        </>
                      : prod.descricao
                    }
                  </div>
                  {/* Sempre mostra ambos os botões 'Médio' e 'Grande' se existirem, igual à página de lanches */}
                  {prod.tamanhos && prod.tamanhos.length > 0 && (
                    <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                      {['Médio', 'Grande'].map((nomePadrao) => {
                          const norm = (str: string) => str.normalize('NFD').replace(/[\u0000-\u001f\u0300-\u036f]/g, '').toLowerCase();
                          const t = prod.tamanhos.find((t: any) => t.nome && norm(t.nome) === norm(nomePadrao));
                          if (!t) return null;
                          const selecionado = tamanhoSelecionado[prod.id] === t.nome || (!tamanhoSelecionado[prod.id] && nomePadrao === 'Médio');
                          return (
                            <Button
                              key={t.nome}
                              size="small"
                              type="default"
                              style={{
                                marginRight: 8,
                                marginBottom: 4,
                                fontWeight: 700,
                                color: selecionado ? '#e53935' : '#232323',
                                borderColor: selecionado ? '#e53935' : '#e0e0e0',
                                background: '#fff',
                              }}
                              onClick={() => setTamanhoSelecionado(prev => ({ ...prev, [prod.id]: t.nome }))}
                            >
                              {t.nome}
                            </Button>
                          );
                        })}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, color: '#e53935', fontSize: 18, marginBottom: 4 }}>
                    {emPromocao && (
                      <span style={{ color: '#888', textDecoration: 'line-through', fontWeight: 400, fontSize: 15, marginRight: 8 }}>
                        R$ {precoNormal.toFixed(2)}
                      </span>
                    )}
                    R$ {precoExibido ? precoExibido.toFixed(2) : '0,00'}
                  </div>
                  {!prod.disponivel && <Tag color="default">Indisponível</Tag>}
                </div>
              </Card>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default MaisPedidosCarrossel;
