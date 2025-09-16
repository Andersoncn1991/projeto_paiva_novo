import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Privacidade: React.FC = () => (
  <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', padding: 24, borderRadius: 8 }}>
    <Title level={2}>Política de Privacidade</Title>
    <Paragraph>
      Seus dados pessoais são coletados apenas para fins de cadastro, autenticação, processamento de pedidos e pagamentos, e para melhorar sua experiência no site. Não compartilhamos seus dados com terceiros, exceto quando necessário para processar pagamentos (Mercado Pago) ou autenticação (Google). Você pode solicitar a qualquer momento acesso, correção ou exclusão dos seus dados pelo canal de contato informado nesta página.
    </Paragraph>
    <Title level={4}>Quais dados são coletados?</Title>
    <Paragraph>
      Nome, e-mail, telefone, endereço, dados de pagamento, preferências de contato e informações de navegação (cookies).
    </Paragraph>
    <Title level={4}>Finalidade da coleta</Title>
    <Paragraph>
      Cadastro, autenticação, pedidos, pagamentos, analytics e melhoria da experiência do usuário.
    </Paragraph>
    <Title level={4}>Compartilhamento de dados</Title>
    <Paragraph>
      Apenas com Mercado Pago (pagamentos) e Google (login), quando necessário.
    </Paragraph>
    <Title level={4}>Tempo de retenção</Title>
    <Paragraph>
      Os dados são mantidos enquanto sua conta estiver ativa ou conforme exigido por lei.
    </Paragraph>
    <Title level={4}>Direitos do titular</Title>
    <Paragraph>
      Você pode solicitar acesso, correção, exclusão, portabilidade ou revogação do consentimento a qualquer momento.
    </Paragraph>
    <Title level={4}>Contato</Title>
    <Paragraph>
      E-mail: paivasburguers@gmail.com<br />
      Telefone/WhatsApp: (11) 4019-0516 / (11) 97095-8687
    </Paragraph>
    <Title level={4}>Segurança</Title>
    <Paragraph>
      Seus dados são armazenados de forma segura, com criptografia, acesso restrito e uso de cookies httpOnly para autenticação.
    </Paragraph>
    <Title level={4}>Consentimento</Title>
    <Paragraph>
      O uso do site implica no consentimento para coleta e uso dos dados conforme esta política. Você pode gerenciar suas preferências de cookies a qualquer momento.
    </Paragraph>
  </div>
);

export default Privacidade;
