// Página de Promoções: exibe todos os produtos/tamanhos em promoção, agrupados aleatoriamente
import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Tag } from 'antd';
import { getPedidos } from '../services/api'; // só para exemplo, não usado aqui

const API_URL = 'http://localhost:8000';

const Promocoes: React.FC = () => {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [erroApi, setErroApi] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/produtos/`)
      .then(res => {
        if (!res.ok) throw new Error('Erro na resposta da API: ' + res.status);
        return res.json();
      })
      .then(data => {
        setProdutos(data);
        setErroApi(null);
      })
      .catch((err) => {
        setProdutos([]);
        setErroApi('Erro ao buscar produtos: ' + err.message);
      });
  }, []);

  // Extrai todos os tamanhos em promoção de todos os produtos
  const tamanhosPromocao: any[] = [];
  produtos.forEach(prod => {
    if (prod.tamanhos && Array.isArray(prod.tamanhos)) {
      prod.tamanhos.forEach((t: any) => {
        if ((t.precoPromocional && t.preco_original && t.precoPromocional < t.preco_original) ||
            (t.preco_media_promocional && t.preco_media_original && t.preco_media_promocional < t.preco_media_original) ||
            (t.preco_grande_promocional && t.preco_grande_original && t.preco_grande_promocional < t.preco_grande_original)) {
          tamanhosPromocao.push({
            ...t,
            produtoNome: prod.nome,
            produtoId: prod.id,
            produtoDescricao: prod.descricao,
            produtoImagem: prod.imagem,
            categoria: prod.categoria
          });
        }
      });
    }
  });

  // Embaralha a lista para exibir aleatoriamente
  function shuffle(arr: any[]) {
    return arr.map(a => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map(a => a[1]);
  }
  const tamanhosPromocaoAleatorio = shuffle(tamanhosPromocao);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <Typography.Title level={2} style={{ marginBottom: 16 }}>Promoções</Typography.Title>
      {erroApi && (
        <div style={{ color: 'red', fontWeight: 700, marginBottom: 16, fontSize: 16 }}>{erroApi}</div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'flex-start' }}>
        {tamanhosPromocaoAleatorio.length === 0 && !erroApi ? (
          <div style={{ fontSize: 18, color: '#888', marginTop: 32 }}>Nenhum produto em promoção no momento.</div>
        ) : (
          tamanhosPromocaoAleatorio.map((t, idx) => {
            let precoNormal = t.preco_original || t.preco || t.preco_media_original || t.preco_media || t.preco_grande_original || t.preco_grande;
            let precoPromo = t.precoPromocional || t.preco_media_promocional || t.preco_grande_promocional;
            return (
              <Card
                key={t.produtoId + '-' + t.nome + '-' + idx}
                hoverable
                style={{ width: 242, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}
                cover={<img alt={t.produtoNome} src={API_URL + '/static/img/' + t.produtoImagem} style={{ height: 125, width: 220, objectFit: 'cover', display: 'block', margin: '0 auto', borderRadius: '12px 12px 0 0' }} />}
              >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>
                    {t.produtoNome} <Tag style={{ background: '#ff9800', color: '#fff', border: 'none', fontWeight: 700 }}>Promoção</Tag>
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>
                    {t.produtoDescricao}
                  </div>
                  <div style={{ fontWeight: 700, color: '#e53935', fontSize: 18, marginBottom: 4 }}>
                    <span style={{ color: '#888', textDecoration: 'line-through', fontWeight: 400, fontSize: 15, marginRight: 8 }}>
                      R$ {precoNormal?.toFixed(2)}
                    </span>
                    R$ {precoPromo?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 15, color: '#232323', marginBottom: 4 }}>{t.nome}</div>
                  <Button type="default" size="small">Adicionar</Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Promocoes;
