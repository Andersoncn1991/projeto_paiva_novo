import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Cookies: React.FC = () => (
  <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', padding: 24, borderRadius: 8 }}>
    <Title level={2}>Política de Cookies</Title>
    <Paragraph>
      Esta página explica como e por que utilizamos cookies no site Paivas Burguers, em conformidade com a LGPD.
    </Paragraph>
    <Title level={4}>O que são cookies?</Title>
    <Paragraph>
      Cookies são pequenos arquivos de texto armazenados no seu navegador para garantir o funcionamento do site, autenticação, segurança, análise de uso e personalização da experiência.
    </Paragraph>
    <Title level={4}>Tipos de cookies utilizados</Title>
    <Paragraph>
      <b>Cookies essenciais:</b> Necessários para o funcionamento do site e não podem ser desativados.<br />
      <b>Cookies de análise de uso (analytics):</b> Ajudam a entender como os visitantes interagem com o site, permitindo melhorias contínuas. Só são ativados com seu consentimento.<br />
      <b>Cookies de marketing:</b> Utilizados para personalizar ofertas e campanhas. Só são ativados com seu consentimento.
    </Paragraph>
    <Title level={4}>Como gerenciar cookies?</Title>
    <Paragraph>
      Você pode aceitar, rejeitar ou personalizar cookies a qualquer momento pelo banner exibido na primeira visita ou nas configurações do seu navegador. Cookies essenciais não podem ser desativados.
    </Paragraph>
    <Title level={4}>Consentimento e registro</Title>
    <Paragraph>
      Seu consentimento é registrado e pode ser alterado a qualquer momento. O uso do site implica concordância com esta política.
    </Paragraph>
    <Title level={4}>Dúvidas?</Title>
    <Paragraph>
      Em caso de dúvidas, entre em contato pelo e-mail: paivasburguers@gmail.com
    </Paragraph>
  </div>
);

export default Cookies;
