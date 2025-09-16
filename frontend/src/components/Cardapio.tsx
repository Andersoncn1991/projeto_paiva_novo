// Componente visual do cardápio de lanches
// Lê arquivos da pasta cardapio/ e exibe os produtos organizados por categoria
// Exibe cards com foto, nome, descrição, preço e destaque para mais vendidos
// Ao clicar, mostra modal com detalhes

import React, { useState } from 'react';
import { Modal, Typography, Button } from 'antd';
import { FireOutlined, StarFilled, ShoppingCartOutlined, CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import './Cardapio.css'; // (crie um arquivo de estilos para customização extra)

// Exemplo de estrutura de produto gourmet (depois será lido dos arquivos)
const exemploProdutos = [
  {
    id: 1,
    nome: 'Burger Artesanal',
    descricao: 'Pão brioche, 180g de carne Angus, queijo cheddar premium, bacon crocante, alface, tomate e molho especial da casa.',
    preco: 32.9,
    categoria: 'Burgers Artesanais',
    imagem: '/cardapio/burger-artesanal.jpg',
    maisVendido: true,
    novidade: false,
    disponivel: true,
    destaque: true,
  },
  {
    id: 2,
    nome: 'Combo Família',
    descricao: '2 Burgers artesanais, 2 porções de batata rústica, 2 refrigerantes lata. Ideal para compartilhar.',
    preco: 69.9,
    categoria: 'Combos',
    imagem: '/cardapio/combo-familia.jpg',
    maisVendido: false,
    novidade: true,
    disponivel: true,
    destaque: false,
  },
  {
    id: 3,
    nome: 'Porção de Batata Grande',
    descricao: 'Batata frita crocante, porção grande, acompanha molho especial.',
    preco: 19.9,
    categoria: 'Porções',
    imagem: '/cardapio/batata-grande.jpg',
    maisVendido: true,
    novidade: false,
    disponivel: false,
    destaque: false,
  },
  // ...adicione mais exemplos gourmet
];

const categorias = [
  'Burgers Artesanais',
  'Lanches',
  'Lanches Individuais',
  'Combos',
  'Lanches na Baguete',
  'Porções',
  'Bebidas',
];



interface CardapioProps {
  open?: boolean;
  onClose?: () => void;
}

// Exibe as imagens do cardápio diretamente na página
const Cardapio: React.FC<CardapioProps> = () => {
  const imagens = Object.values(
    import.meta.glob('/src/cardapio/*.{jpg,png,jpeg,gif,webp}', { eager: true, as: 'url' })
  ) as string[];

  const [modalOpen, setModalOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (imagens.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Typography.Title level={2}>Cardápio</Typography.Title>
        <span>Nenhuma imagem de cardápio encontrada na pasta <b>src/cardapio/</b>.</span>
      </div>
    );
  }

  // Divide as imagens em duas linhas
  const metade = Math.ceil(imagens.length / 2);
  const linhas = [imagens.slice(0, metade), imagens.slice(metade)];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, padding: 0, background: '#fff' }}>
      <Typography.Title level={2} style={{ marginTop: 24, marginBottom: 12 }}>Cardápio</Typography.Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24, width: '100%', maxWidth: 900 }}>
        {linhas.map((linha, lidx) => (
          <div key={lidx} style={{ display: 'flex', flexDirection: 'row', gap: 18, justifyContent: 'center', width: '100%' }}>
            {linha.map((img, idx) => (
              <img
                key={img}
                src={img}
                alt={`Cardápio ${lidx * metade + idx + 1}`}
                style={{ width: 'calc(100%/2 - 36px)', minWidth: 340, maxWidth: 480, height: 260, objectFit: 'cover', borderRadius: 18, boxShadow: '0 4px 18px #0002', cursor: 'pointer', background: '#fff', border: '2px solid #eee', transition: 'transform 0.15s' }}
                onClick={() => { setIndex(lidx * metade + idx); setModalOpen(true); }}
              />
            ))}
          </div>
        ))}
      </div>
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
        title={<span style={{ fontWeight: 700, fontSize: 24 }}>Cardápio</span>}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 620, padding: 0, background: '#fff' }}>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', padding: 0, marginTop: 18, marginBottom: 18, display: 'inline-block' }}>
            <img
              src={imagens[index]}
              alt={`Cardápio ${index + 1}`}
              style={{ maxWidth: 540, maxHeight: 660, width: '100%', height: 'auto', objectFit: 'contain', borderRadius: 12, boxShadow: '0 4px 18px rgba(0,0,0,0.10)', background: '#fff', display: 'block' }}
            />
          </div>
          {imagens.length > 1 && (
            <div style={{ marginTop: 0, marginBottom: 24, display: 'flex', justifyContent: 'center', gap: 18 }}>
              <Button onClick={() => setIndex(i => (i - 1 + imagens.length) % imagens.length)} disabled={imagens.length <= 1}>&lt; Anterior</Button>
              <span style={{ lineHeight: '36px' }}>{index + 1} / {imagens.length}</span>
              <Button onClick={() => setIndex(i => (i + 1) % imagens.length)} disabled={imagens.length <= 1}>Próxima &gt;</Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Cardapio;
