import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Termos: React.FC = () => (
  <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', padding: 24, borderRadius: 8 }}>
    <Title level={2}>Termos de Uso</Title>
    <Paragraph>
      Ao utilizar o site Paivas Burguers, você concorda com os seguintes termos:
    </Paragraph>
    <Title level={4}>1. Cadastro e Conta</Title>
    <Paragraph>
      O usuário é responsável por fornecer informações verdadeiras e manter seus dados atualizados. O acesso à conta é pessoal e intransferível.
    </Paragraph>
    <Title level={4}>2. Privacidade e Dados</Title>
    <Paragraph>
      Os dados fornecidos são utilizados apenas para cadastro, autenticação, processamento de pedidos e melhoria da experiência. Consulte a <a href="/privacidade">Política de Privacidade</a> para mais detalhes.
    </Paragraph>
    <Title level={4}>3. Pedidos e Pagamentos</Title>
    <Paragraph>
      Os pedidos realizados estão sujeitos à confirmação de pagamento. O não pagamento pode resultar no cancelamento do pedido.
    </Paragraph>
    <Title level={4}>4. Propriedade Intelectual</Title>
    <Paragraph>
      Todo o conteúdo do site, incluindo textos, imagens, logotipos e marcas, é protegido por direitos autorais e não pode ser utilizado sem autorização.
    </Paragraph>
    <Title level={4}>5. Responsabilidades</Title>
    <Paragraph>
      O site não se responsabiliza por indisponibilidade temporária, falhas técnicas ou danos decorrentes do uso indevido da plataforma.
    </Paragraph>
    <Title level={4}>6. Alterações nos Termos</Title>
    <Paragraph>
      Os termos podem ser alterados a qualquer momento. O uso contínuo do site implica concordância com as alterações.
    </Paragraph>
    <Title level={4}>7. Contato</Title>
    <Paragraph>
      Dúvidas ou solicitações podem ser enviadas para: paivasburguers@gmail.com
    </Paragraph>
  </div>
);

export default Termos;
