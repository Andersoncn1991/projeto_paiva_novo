import React from 'react';
import { Card, Typography, Row, Col, Button, Tooltip } from 'antd';
import { MailOutlined, WhatsAppOutlined, InstagramOutlined, FacebookOutlined, PhoneOutlined } from '@ant-design/icons';

const contatos = [
  {
    label: 'WhatsApp',
    value: '(11) 97095-8687',
    link: 'https://wa.me/5511970958687',
    icon: <WhatsAppOutlined style={{ color: '#25D366', fontSize: 28 }} />,
    tooltip: 'Conversar no WhatsApp',
  },
  {
    label: 'E-mail',
    value: 'paivasburgers@gmail.com',
    link: 'mailto:paivasburgers@gmail.com',
    icon: <MailOutlined style={{ color: '#e53935', fontSize: 28 }} />,
    tooltip: 'Enviar e-mail',
  },
  {
    label: 'Instagram',
    value: '@paiva_burgues',
    link: 'https://www.instagram.com/paiva_burgues/',
    icon: <InstagramOutlined style={{ color: '#C13584', fontSize: 28 }} />,
    tooltip: 'Ver Instagram',
  },
  {
    label: 'Facebook',
    value: '/lanchonetepaiva',
    link: 'https://www.facebook.com/lanchonetepaiva/',
    icon: <FacebookOutlined style={{ color: '#1877F3', fontSize: 28 }} />,
    tooltip: 'Ver Facebook',
  },
  {
    label: 'Telefone Fixo',
    value: '(11) 4019-0516',
    link: 'tel:1140190516',
    icon: <PhoneOutlined style={{ color: '#232323', fontSize: 28 }} />,
    tooltip: 'Ligar',
  },
];

const Contato: React.FC = () => {
  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 0 }}>
      <Card bordered style={{ borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 0 }}>
        <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Contato & Suporte
        </Typography.Title>
        <Row gutter={[0, 18]} justify="center">
          {contatos.map((contato, idx) => (
            <Col span={24} key={contato.label}>
              <Card
                style={{ borderRadius: 12, marginBottom: 0, background: '#fafbfc', border: '1px solid #eee', boxShadow: '0 1px 6px #0001' }}
                bodyStyle={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}
              >
                <Tooltip title={contato.tooltip} placement="left">
                  <Button
                    type="text"
                    shape="circle"
                    size="large"
                    icon={contato.icon}
                    href={contato.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: 8 }}
                  />
                </Tooltip>
                <div style={{ flex: 1 }}>
                  <Typography.Text strong style={{ fontSize: 16 }}>{contato.label}</Typography.Text>
                  <br />
                  <Typography.Text style={{ fontSize: 15 }}>{contato.value}</Typography.Text>
                </div>
                <Button
                  type="link"
                  href={contato.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 600, fontSize: 15 }}
                >
                  {contato.label === 'E-mail' ? 'Enviar' : 'Abrir'}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default Contato;
