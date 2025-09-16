// Página de Lanches por Categoria
// Exibe todos os lanches organizados por categoria, com cards visuais e filtro
// Documentação: Veja README.md para requisitos e padrões de layout

import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Typography, Card, Tag, Button, Modal } from 'antd';
import './LanchesPorCategoria.css';


const categorias = [
  'Todas',
  'Lanches Individuais',
  'Lanches',
  'Combos',
  'Lanches na Baguete',
  'Burgers Artesanais',
  'Porções',
  'Bebidas',
  'Promoções',
];



const LanchesPorCategoria: React.FC = () => {
  const { addItem } = useCart();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('Lanches Individuais');
  const [busca, setBusca] = useState('');
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [modalDescricao, setModalDescricao] = useState<{ open: boolean, descricao: string, nome: string }>({ open: false, descricao: '', nome: '' });

  const API_URL = "http://localhost:8000";
  React.useEffect(() => {
    fetch(`${API_URL}/api/produtos/`)
      .then(res => {
        if (!res.ok) throw new Error('Erro na resposta da API: ' + res.status);
        return res.json();
      })
      .then(data => {
        console.log('Produtos carregados da API:', data);
        // Exibe todos os nomes de tamanhos de cada produto para conferência
        data.forEach(prod => {
          if (Array.isArray(prod.tamanhos)) {
            const nomesTamanhos = prod.tamanhos.map((t: any) => t.nome);
            console.log(`Produto ${prod.nome} - tamanhos encontrados:`, nomesTamanhos);
          }
        });
        // Comando para checar se cada produto tem os tamanhos "Médio" e "Grande"
        data.forEach(prod => {
          if (Array.isArray(prod.tamanhos)) {
            const nomesTamanhos = prod.tamanhos.map((t: any) => t.nome?.toLowerCase());
            if (nomesTamanhos.includes('médio') && nomesTamanhos.includes('grande')) {
              console.log(`Produto ${prod.nome} possui os dois tamanhos: Médio e Grande`);
            } else {
              console.log(`Produto ${prod.nome} NÃO possui ambos os tamanhos Médio e Grande. Tamanhos encontrados:`, nomesTamanhos);
            }
          }
        });
        setProdutos(data);
        setErroApi(null);
        if (!Array.isArray(data) || data.length === 0) {
          setErroApi('Nenhum produto retornado pela API. Verifique o backend e o banco de dados.');
        }
      })
      .catch((err) => {
        setProdutos([]);
        setErroApi('Erro ao buscar produtos: ' + err.message);
        console.error('Erro ao buscar produtos:', err);
      });
  }, []);
  // Removido filtro rápido, só busca

  // Função para saber se produto/tamanho está em promoção
  function produtoEmPromocao(prod: any) {
    if (prod.tamanhos && Array.isArray(prod.tamanhos)) {
      return prod.tamanhos.some((t: any) => t.precoPromocional && t.precoPromocional < t.preco);
    }
    return prod.precoPromocional && prod.precoPromocional < prod.preco;
  }

  // Se categoria for Promoções, filtra todos produtos/tamanhos em promoção
  let produtosFiltrados: any[];
  // Função para normalizar categoria (remove acentos, caixa baixa, troca espaço por underline)
  function normalizarCategoria(cat: string) {
    return cat
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos corretamente
      .toLowerCase()
      .replace(/ /g, '_');
  }
  
  // Corrige o caminho da imagem para garantir que sempre aponte para o backend
  // Adiciona a URL do backend para servir imagens corretamente
  function ajustarCaminhoImagem(imagem: string) {
    if (!imagem) return '';
    if (/^https?:\/\//.test(imagem)) return imagem;
    if (imagem.startsWith('/static')) return API_URL + imagem;
    if (imagem.startsWith('img/')) return API_URL + '/static/' + imagem;
    if (!imagem.startsWith('/')) return API_URL + '/static/img/' + imagem;
    return API_URL + imagem;
  }

  if (categoriaSelecionada === 'Promoções') {
    produtosFiltrados = produtos.filter(produtoEmPromocao);
  } else if (categoriaSelecionada === 'Todas') {
    produtosFiltrados = produtos;
  } else {
    produtosFiltrados = produtos.filter(p => normalizarCategoria(p.categoria || '') === normalizarCategoria(categoriaSelecionada));
  }
  // Busca por nome ou descrição
  if (busca.trim()) {
    produtosFiltrados = produtosFiltrados.filter(p =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.descricao.toLowerCase().includes(busca.toLowerCase())
    );
  }


  // Estado para tamanho selecionado por produto (id -> tamanho)
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState<{ [id: number]: string }>({});

  const handleSelecionarTamanho = (produtoId: number, tamanho: string) => {
    setTamanhosSelecionados(prev => ({ ...prev, [produtoId]: tamanho }));
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24, minHeight: '100vh', paddingBottom: 80 }}>
      <Typography.Title level={2} style={{ marginBottom: 16 }}>Lanches</Typography.Title>
      {erroApi && (
        <div style={{ color: 'red', fontWeight: 700, marginBottom: 16, fontSize: 16 }}>{erroApi}</div>
      )}
      {/* Busca simples */}
      <div className="busca-filtros">
        <input
          type="text"
          className="busca-input"
          placeholder="Buscar lanche ou ingrediente..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {categorias.map(cat => (
          <Button
            key={cat}
            type="default"
            className={cat === categoriaSelecionada ? 'categoria-btn categoria-btn-ativa' : 'categoria-btn'}
            onClick={() => setCategoriaSelecionada(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'flex-start' }}>
        {produtosFiltrados.length === 0 && !erroApi ? (
          categoriaSelecionada === 'Promoções' ? (
            <>
              <style>{`
                @keyframes fadeInPromo {
                  from { opacity: 0; transform: translateY(30px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bouncePromo {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-12px); }
                }
              `}</style>
              <div
                style={{
                  fontSize: 22,
                  color: '#e53935',
                  marginTop: 48,
                  fontWeight: 700,
                  textAlign: 'center',
                  background: 'linear-gradient(90deg, #fff0f0 0%, #ffe0e0 100%)',
                  border: '2px dashed #e53935',
                  borderRadius: 16,
                  padding: '32px 24px',
                  maxWidth: 440,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  boxShadow: '0 2px 12px rgba(229,57,53,0.08)',
                  animation: 'fadeInPromo 1s cubic-bezier(.4,1.4,.6,1)'
                }}
              >
                <span
                  role="img"
                  aria-label="Promoção"
                  style={{
                    fontSize: 48,
                    display: 'block',
                    marginBottom: 12,
                    animation: 'bouncePromo 1.2s infinite',
                  }}
                >🎉</span>
                Nenhuma promoção ativa no momento.<br />
                <span style={{ fontWeight: 400, color: '#b71c1c', fontSize: 16, display: 'block', marginTop: 8 }}>
                  Fique de olho! Em breve o <span style={{ color: '#e53935', fontWeight: 700 }}>Paivas Burguers</span> trará ofertas especiais e descontos imperdíveis para você aproveitar.
                </span>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 18, color: '#888', marginTop: 32 }}>Nenhum produto cadastrado nesta categoria.</div>
          )
        ) : (
          produtosFiltrados.map(prod => {
            // Se for Lanches ou Porções, exibe botões para todos os tamanhos disponíveis (ex: Médio e Grande)
            const temTamanhos = Array.isArray(prod.tamanhos);
            // Normaliza nomes dos tamanhos (corrigido regex)
            const norm = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            let tamanhosValidos: any[] = [];
            if (temTamanhos && ['Lanches', 'Porções'].includes(prod.categoria)) {
              tamanhosValidos = prod.tamanhos.filter((t: any) => {
                const n = norm(t.nome);
                // Aceita 'Médio', 'medio', 'MÉDIO', etc., e 'grande'
                return n === 'medio' || n === 'grande';
              });
              // Se não houver Médio/Grande, mostra qualquer tamanho (ex: Único)
              if (tamanhosValidos.length === 0) {
                tamanhosValidos = prod.tamanhos;
              }
            } else if (temTamanhos) {
              tamanhosValidos = prod.tamanhos;
            }

            // Seleção do tamanho
            let tamanhoSelecionado = temTamanhos
              ? (tamanhosSelecionados[prod.id] || tamanhosValidos[0]?.nome)
              : undefined;

            // Sempre pega o tamanho selecionado do estado
            let tSel: any = undefined;
            if (temTamanhos) {
              tSel = tamanhosValidos.find((t: any) => t.nome === tamanhoSelecionado) || tamanhosValidos[0];
            }
            let precoNormal = tSel?.preco ?? prod.preco;
            let precoPromocional = tSel?.precoPromocional ?? prod.precoPromocional;
            const emPromocao = precoPromocional && precoPromocional < precoNormal;
            const precoExibido = emPromocao ? precoPromocional : precoNormal;
            return (
              <Card
                key={prod.id + (tamanhoSelecionado || '')}
                hoverable
                style={{
                  width: 242,
                  minHeight: 370,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  overflow: 'hidden',
                  border: '2px solid #e0e0e0', // cor original, só mais grossa
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
                    onMouseOver={e => {
                      if (prod.disponivel) {
                        (e.currentTarget as HTMLButtonElement).style.color = '#e53935';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#e53935';
                      }
                    }}
                    onMouseOut={e => {
                      if (prod.disponivel) {
                        (e.currentTarget as HTMLButtonElement).style.color = '#232323';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#232323';
                      }
                    }}
                    onClick={() => {
                      if (!prod.disponivel) return;
                      let quantidade = 1;
                      let nome = prod.nome;
                      let preco = precoExibido;
                      let imagem = prod.imagem;
                      let id = String(prod.id);
                      if (temTamanhos && tSel) {
                        nome = prod.nome + ' (' + tSel.nome + ')';
                        preco = emPromocao ? tSel.precoPromocional : tSel.preco;
                        id = `${prod.id}_${tSel.nome}`;
                      }
                      addItem({ id, nome, preco, quantidade, imagem });
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
              <div style={{ marginBottom: 2, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
                {/* Tags sempre aparecem em linha, podem coexistir */}
                {(() => {
                  const isMaisVendido =
                    prod.maisVendido === 1 || prod.maisVendido === true || prod.maisVendido === "true" ||
                    prod.mais_vendido === 1 || prod.mais_vendido === true || prod.mais_vendido === "true" ||
                    prod.maisvendido === 1 || prod.maisvendido === true || prod.maisvendido === "true" ||
                    prod.MAISVENDIDO === 1 || prod.MAISVENDIDO === true || prod.MAISVENDIDO === "true" ||
                    prod.MaisVendido === 1 || prod.MaisVendido === true || prod.MaisVendido === "true";
                  return (
                    <>
                      {isMaisVendido && (
                        <Tag style={{ background: '#e53935', color: '#fff', border: 'none', fontWeight: 700 }}>Mais vendido</Tag>
                      )}
                      {prod.novidade && <Tag style={{ background: '#43a047', color: '#fff', border: 'none', fontWeight: 700 }}>Novo</Tag>}
                      {emPromocao && <Tag style={{ background: '#ff9800', color: '#fff', border: 'none', fontWeight: 700 }}>Promoção</Tag>}
                    </>
                  );
                })()}
              </div>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>
                    {prod.descricao && prod.descricao.length > 70 ? (
                      <>
                        {prod.descricao.slice(0, 70)}...{' '}
                        <Button type="link" size="small" style={{ padding: 0, fontSize: 14 }} onClick={() => setModalDescricao({ open: true, descricao: prod.descricao, nome: prod.nome })}>
                          Ver mais
                        </Button>
                      </>
                    ) : (
                      prod.descricao
                    )}
                  </div>
                  {/* Mostra seleção de tamanho se houver mais de um tamanho válido */}
                  {temTamanhos && tamanhosValidos.length > 1 && (
                    <div style={{ marginBottom: 8 }}>
                      {tamanhosValidos.map((t: any) => (
                        <Button
                          key={t.nome}
                          size="small"
                          type="default"
                          style={{
                            marginRight: 8,
                            marginBottom: 4,
                            fontWeight: 700,
                            color: tamanhoSelecionado === t.nome ? '#e53935' : '#232323',
                            borderColor: tamanhoSelecionado === t.nome ? '#e53935' : '#e0e0e0',
                            background: '#fff',
                          }}
                          onClick={() => handleSelecionarTamanho(prod.id, t.nome)}
                        >
                          {t.nome}
                        </Button>
                      ))}
                    </div>
                  )}
                  {/* Linha removida: não exibe mais o nome do tamanho selecionado */}
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
            );
          }) 
        )}
      </div>
      <Modal
        open={modalDescricao.open}
        title={modalDescricao.nome}
        onCancel={() => setModalDescricao({ open: false, descricao: '', nome: '' })}
        footer={null}
        styles={{ body: { fontSize: 18, padding: 24 } }}
      >
        <div style={{ whiteSpace: 'pre-line' }}>{modalDescricao.descricao}</div>
      </Modal>
    </div>
  );
};

export default LanchesPorCategoria;
