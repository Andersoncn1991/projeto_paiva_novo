// Página de dashboard administrativo (acesso restrito)
// Só deve ser acessível para usuários autenticados com perfil admin

import React from 'react';
import { Layout, Typography, Alert } from 'antd';

const { Header, Content, Footer } = Layout;

const AdminDashboard: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Typography.Title style={{ color: '#fff', margin: 0 }} level={3}>
          Dashboard Administrativo
        </Typography.Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Alert type="info" message="Área administrativa restrita. Em breve: painel de pedidos, indicadores, gestão de produtos e clientes." />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        &copy; {new Date().getFullYear()} Paivas Burguers
      </Footer>
    </Layout>
  );
};

export default AdminDashboard;
