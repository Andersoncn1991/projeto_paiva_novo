# Fluxo Completo - Tela de Pagamento

---

## Tela de Pagamento (após finalizar o carrinho)

### 1. Informações do Pedido
- Listagem completa dos itens do carrinho (nome, quantidade, preço, adicionais).
- Total dos produtos.
- Informações do cliente (nome, endereço, telefone).

### 2. Escolha: Entrega ou Retirada
- Cliente deve escolher entre "Entregar no endereço" ou "Retirar no balcão" antes de finalizar o pedido.
  - Se "Retirar no balcão": não calcula taxa de entrega.
  - Se "Entregar no endereço":
    - Consulta tabela de taxa de entrega por bairro.
    - Se o cliente digitar o bairro com erro (letra trocada, acento faltando, etc), o sistema tenta reconhecer o bairro correto usando correspondência aproximada (fuzzy match) e atribui a taxa correta.
    - Se não for possível reconhecer o bairro, atribui taxa de entrega padrão de R$ 20,00.
    - Exibe taxa de entrega calculada e total atualizado.

### 3. Pagamento
- Seleção do método de pagamento:
  - **Dinheiro**
    - Pergunta: "Precisa de troco?"
      - Se sim, campo para informar valor do troco.
      - Status inicial do pedido: "Pendente".
  - **Cartão (Débito/Crédito)**
    - Seleção de bandeira do cartão (apenas Visa, Master, Elo) com imagem da bandeira.
    - Pagamento feito manualmente na entrega/retirada.
    - Status inicial do pedido: "Pendente".
  - **Pix**
    - Gera QR Code com chave Pix do Mercado Pago.
    - Cliente faz pagamento via Pix.
    - Integração automática: ao receber confirmação do Mercado Pago, status do pedido muda para "Pagamento aprovado" e "Aceito".
    - Se não aprovado, permanece "Pendente".

### 4. Status do Pedido
- Para entrega:
  - Pendente → Aceito → Em preparo → Pronto → Saiu para entrega → Concluído
- Para retirada no balcão:
  - Pendente → Aceito → Em preparo → Pronto para retirada → Concluído

### 5. Resumo Visual
- Exibe resumo do pedido, taxa de entrega, total, método de pagamento selecionado.
- Botão para finalizar pedido.

---

## O que está faltando/pendente
- Validação visual do endereço e bairro (sugestão automática, autocomplete, fuzzy match).
- Mensagem de erro amigável se o bairro não for reconhecido.
- Exibir bandeiras dos cartões com imagem.
- Integração real com Mercado Pago para Pix (webhook, confirmação automática).
- Exibir status do pedido em tempo real para o cliente (página de acompanhamento).
- Campo para observação do pedido (ex: "entregar sem maionese").
- Exibir adicionais detalhados em cada item do resumo.
- Botão para editar endereço antes de finalizar.
- Botão para editar itens do carrinho antes de pagar.
- Mensagem de confirmação visual após finalizar pedido.

Se quiser adicionar mais detalhes ou campos, me avise!
