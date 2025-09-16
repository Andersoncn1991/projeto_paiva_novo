import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Spin, Empty } from 'antd';

const { Title } = Typography;

// Exemplo de endpoint de notificações
const API_URL = 'http://localhost:8000';

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotificacoes() {
      setLoading(true);
      try {
        const resp = await fetch(`${API_URL}/notificacoes/usuario`);
        const data = resp.ok ? await resp.json() : [];
        setNotificacoes(data);
      } catch {
        setNotificacoes([]);
      }
      setLoading(false);
    }
    fetchNotificacoes();
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
  <Title level={2} style={{ marginBottom: 18, textAlign: 'center', width: '100%' }}>Notificações</Title>
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px #0001', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <Spin tip="Carregando notificações..." />
        ) : notificacoes.length === 0 ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description={<span style={{ textAlign: 'center', width: '100%' }}>Nenhuma notificação encontrada.</span>} />
          </div>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={notificacoes}
            renderItem={item => (
              <List.Item key={item.id} style={{ padding: '18px 0', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <List.Item.Meta
                  title={<span style={{ fontWeight: 700, color: '#e53935', textAlign: 'center', display: 'block' }}>{item.titulo || 'Notificação'}</span>}
                  description={<span style={{ color: '#555', textAlign: 'center', display: 'block' }}>{item.mensagem || item.texto}</span>}
                />
                <div style={{ fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center', width: '100%' }}>
                  {item.data ? new Date(item.data).toLocaleString('pt-BR') : ''}
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
