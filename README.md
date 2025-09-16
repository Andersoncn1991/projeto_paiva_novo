
Bem-vindo ao projeto **Paivas Burguers**!

## Estrutura do Projeto

Este projeto possui duas áreas principais:

### 1. Site do Usuário
- Localização: pasta `frontend` dentro de `Projeto_paiva_novo`
- Função: é o site onde o usuário final realiza compras e navega pelos produtos.

### 2. Painel Administrativo (Admin)
- Localização: pasta `App_desktop/admin-app`
- Função: é o painel de administração do sistema, onde o gestor/admin realiza configurações, gerencia produtos, pedidos, usuários, etc.

> Atenção: mantenha essa distinção para evitar confusões durante o desenvolvimento e manutenção do projeto.

Este projeto tem como objetivo criar uma solução para gerenciamento e divulgação da hamburgueria Paivas Burguers.


## Índice Rápido




## Fluxo de Autenticação e Acesso

O sistema possui um fluxo de autenticação moderno, seguro e fácil de entender. Veja abaixo como funciona para cada perfil:

### 1. Login/Cadastro tradicional (e-mail e senha)

1. O usuário acessa a tela de login ou cadastro.
2. Informa e-mail e senha (ou realiza cadastro, se for o primeiro acesso).
3. Após login bem-sucedido:
   - Se for **cliente**, é redirecionado para a área do cliente (meus pedidos, dados pessoais, etc.).
   - Se for **administrador**, é redirecionado automaticamente para o **dashboard administrativo**.
4. O sistema valida o perfil (role) retornado pelo backend e faz o redirecionamento correto.

### 2. Login com Google (OAuth2)

1. O usuário clica no botão “Entrar com Google” na tela de login.
2. É aberta a janela de autenticação do Google.
3. Após autenticar, o backend valida o token do Google e cria/atualiza o usuário no sistema.
4. O sistema identifica o perfil (cliente/admin) e faz o redirecionamento automático:
   - **Cliente:** área do cliente
   - **Administrador:** dashboard admin

> **Importante:** O login com Google estará disponível para ambos os perfis, mas apenas administradores previamente cadastrados como admin terão acesso ao dashboard.

#### Resumo visual do fluxo:

```mermaid
flowchart TD
    A[Usuário acessa tela de login/cadastro] --> B{Escolhe método}
    B -- E-mail e senha --> C[Autentica via backend]
    B -- Google --> D[Autentica via Google OAuth2]
    C --> E{Perfil}
    D --> E
    E -- Cliente --> F[Redireciona para área do cliente]
    E -- Admin --> G[Redireciona para dashboard admin]
```

Esse fluxo garante segurança, praticidade e uma experiência profissional para todos os usuários.

# RESUMO DAS ÚLTIMAS IMPLEMENTAÇÕES

## O que foi feito
- Promoções automáticas: produtos/tamanhos entram e saem da aba Promoções conforme o preço promocional (campo `precoPromocional` menor que o preço original).
- Mensagem animada e personalizada quando não há promoções, com nome do estabelecimento (Paivas Burguers).
- Botão "Adicionar" sempre alinhado ao final do card, mantendo o padrão visual do Ant Design.
- Ajustes de layout para garantir que todos os cards fiquem visíveis e responsivos.
- Filtro de categorias com opção "Todas".
- Correção de imports e scripts de importação de produtos.
- Documentação de como funciona a promoção automática e exemplos práticos.
- Garantia de que a mensagem de promoções some automaticamente quando houver produtos em promoção.

## O que falta fazer
- Área administrativa para cadastrar/editar promoções via painel (atualmente só via API ou banco).
- Melhorias no painel admin: CRUD completo de produtos, clientes e pedidos.
- Implementar notificações para clientes sobre novas promoções.
- Testes automatizados (frontend e backend).
- Melhorias de acessibilidade e responsividade mobile.
- Documentar exemplos de payloads e respostas para todas as rotas.
- Atualizar prints e diagramas se necessário.

---
## Histórico de Implementações

Esta seção lista as principais funcionalidades já implementadas no backend e frontend, para facilitar rastreabilidade e futuras manutenções.

### Backend (FastAPI)
- Estrutura de projeto com separação em routers, models, schemas e services
- Cadastro completo de clientes (nome, e-mail, telefone, endereço, senha, aceite de termos)
- Autenticação JWT (login, registro, proteção de rotas)
- Validação de dados e padronização de nomes
- Integração inicial para pagamentos (Pix via Mercado Pago)
- Modelos e schemas documentados em português
- Preparação para integração com login Google OAuth2

### Frontend (Vite + React + TypeScript + Ant Design)
- Estrutura de pastas organizada (components, pages, hooks, contexts, styles)
- Página de cadastro de clientes com validação completa e mensagens em português
- Página de login integrada ao backend (JWT)
- Banner de consentimento de cookies (LGPD), profissional, em português, com opções de aceitar, rejeitar ou personalizar
- Página de Política de Privacidade (em português, clara e profissional)
- Página de Política de Cookies (em português, clara e profissional)
- Integração do banner e das páginas de política nas rotas principais
- Layout responsivo e visual alinhado ao Ant Design
- Consentimento de cookies salvo no localStorage, impedindo reexibição do banner após aceite

### LGPD e Privacidade
- Banner de cookies exibido na primeira visita, com consentimento granular
- Páginas de política de privacidade e cookies acessíveis e claras
- Estrutura pronta para permitir remoção de cookies/dados pelo usuário
- Textos e fluxos alinhados à legislação brasileira

### Documentação e Boas Práticas
- README.md atualizado com requisitos, fluxos e instruções de uso
- Comentários detalhados no código backend e frontend
- Estrutura Copilot-friendly para facilitar futuras evoluções

---
## Estrutura do Projeto


### Estrutura de Pastas e Arquivos Principais
```
backend/
  app/
    models/        # Modelos ORM (tabelas do banco)
      cliente.py, pedido.py, produto.py, usuario.py
    routers/       # Rotas/endpoints da API
      auth.py, clientes.py, pedidos.py, produtos.py
    schemas/       # Schemas Pydantic (validação)
      cliente_schema.py, pedido_schema.py, produto_schema.py
    services/      # Lógica de negócio/serviços
      cliente_service.py, pedido_service.py, produto_service.py, usuario_service.py
    db.py          # Conexão e utilitários do banco
    init_db.py     # Inicialização do banco
    main.py        # Inicialização do FastAPI, CORS, rotas
frontend/
  src/
    pages/         # Páginas principais (React)
      App.tsx, Login.tsx, Register.tsx, CompleteProfile.tsx, AdminDashboard.tsx, ...
    components/    # Componentes reutilizáveis
      Cardapio.tsx, CookieConsent.tsx, ...
    services/      # Consumo da API
      api.ts
    styles/        # CSS customizado
```

---

## Rotas Backend e Frontend

### Backend (FastAPI)
- `/auth/google-login` (POST): Login via Google OAuth2
- `/auth/register` (POST): Cadastro de usuário
- `/auth/complete-profile` (POST): Completar cadastro
- `/auth/me` (GET): Dados do usuário autenticado
- `/auth/token` (POST): Geração de token JWT
- `/clientes/` (CRUD): Clientes
- `/pedidos/` (CRUD): Pedidos
- `/produtos/` (CRUD): Produtos

### Frontend (React)
- `/` → Página principal
- `/login` → Login
- `/register` → Cadastro
- `/privacidade` → Política de privacidade
- `/cookies` → Política de cookies
- `/complete-profile` → Completar cadastro
- `/admin/*` → Painel admin
- `*` → Fallback para `/`
- (Botão "Meus Pedidos" usa `/pedidos`, "Cardápio" abre modal)

---

## Exemplos de Uso da API

**Exemplo: Buscar dados do usuário autenticado**
```js
fetch('http://127.0.0.1:8000/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
})
```

**Exemplo: Cadastro de usuário**
```json
POST /auth/register
{
  "nome": "João",
  "email": "joao@email.com",
  "senha": "123456",
  ...
}
```

**Exemplo: Completar perfil**
```json
POST /auth/complete-profile
{
  "rua": "Rua X",
  "numero": "123",
  ...
}
```

---

## Dependências Principais

### Backend
- fastapi, uvicorn, sqlalchemy, pydantic, passlib[bcrypt], python-jose, python-dotenv, sqlite3
### Frontend
- react, react-dom, react-router-dom, antd, typescript, vite, inputmask

---

## FAQ e Dicas

- **Como rodar o backend?** Siga "Como rodar o projeto" abaixo.
- **Como rodar o frontend?** Siga "Como rodar o projeto" abaixo.
- **Como adicionar uma nova rota?**
  - Backend: crie um novo arquivo em `routers/` e registre no `main.py`
  - Frontend: adicione no `AppRouter.tsx`
- **Como funciona a autenticação?** JWT é gerado no login, enviado no header Authorization para rotas protegidas.
- **Onde ficam as imagens?** Em `backend/app/static/img/`, servidas pelo backend.
- **Como migrar o banco?** Rode `python app/init_db.py` para criar/atualizar o banco SQLite.

---

## Documentação Detalhada

Consulte também:
- `DOCUMENTACAO_COMPLETA.md` (mapa completo do sistema, arquivos, rotas, exemplos)
- `docs/ARQUITETURA.md` (arquitetura e fluxos principais)



## Páginas estáticas e experiência do usuário

Para garantir uma navegação rápida, segura e uma experiência agradável, o projeto deve utilizar páginas estáticas sempre que possível para conteúdos institucionais, políticas (privacidade, cookies, termos de uso), contato, cardápio, promoções, FAQ e outras informações que não dependam de autenticação ou dados dinâmicos do usuário.

Páginas estáticas:
- Carregam mais rápido e melhoram o SEO
- São mais seguras e estáveis
- Facilitam o acesso a informações importantes mesmo sem login
- Proporcionam uma experiência mais fluida para o usuário

Sempre que for criar uma nova página informativa, avalie se ela pode ser estática. Isso contribui para um site mais profissional e eficiente.

## Descrição do sistema




O Paivas Burguers é um site de vendas de lanches online, permitindo que os clientes façam pedidos diretamente pela internet.


**Cadastro de clientes e administradores:**
Para criar uma conta, tanto clientes quanto administradores devem informar:
- Nome completo (com iniciais maiúsculas, conforme padrão do sistema)
- E-mail
- Telefone (WhatsApp preferencialmente)
- Endereço completo:
  - Rua/Avenida
  - Número
  - Complemento (opcional)
  - Bairro
  - Cidade
  - CEP
- Senha
- Confirmação de senha
- Aceite dos termos de uso e política de privacidade

**Confirmação de e-mail:**
Após o cadastro, o sistema enviará um e-mail automático com um link de confirmação. O usuário só poderá acessar o sistema após clicar no link e confirmar o e-mail.

**Recuperação de senha:**
Caso o usuário esqueça a senha, poderá solicitar a recuperação informando o e-mail cadastrado. O sistema enviará um token de 4 dígitos por e-mail, que deverá ser informado para criar uma nova senha.

O cadastro pode ser realizado tanto na área do cliente quanto no dashboard administrativo (para adicionar novos administradores ou funcionários). O sistema deve validar se o e-mail já está cadastrado e garantir que a senha e a confirmação de senha sejam iguais antes de permitir o cadastro.

No dashboard, administradores autenticados podem cadastrar novas pessoas com perfil de admin, além de editar ou remover contas existentes.

O endereço pode ser opcional apenas para pedidos de retirada no balcão, mas o sistema sempre solicitará o cadastro completo para padronização e futuras compras.

**Padronização de nomes:**
Em todo o sistema, nomes de clientes, funcionários e demais cadastros serão exibidos sempre com as iniciais maiúsculas (exemplo: João da Silva), independentemente de como o usuário digitar no cadastro. Para buscas, validações e login, o sistema será inteligente e tratará letras maiúsculas e minúsculas de forma adequada, garantindo uma experiência amigável e padronizada.

**Formas de pagamento:**
O sistema aceitará três tipos de pagamento:
- Dinheiro
- Cartão de Crédito ou Débito
- Pix (pagamento automático e integrado)

O cliente poderá escolher a forma de pagamento no momento do pedido.

- Pagamentos em Dinheiro e Cartão (Crédito ou Débito) são manuais, ou seja, o valor será pago presencialmente na entrega (delivery) ou na retirada no balcão. Ao selecionar essas formas de pagamento, o pedido será liberado imediatamente para produção com status "pendente".
- O Pix será processado automaticamente pelo sistema, e o pedido só poderá ser realizado após a confirmação automática do pagamento pelo Mercado Pago. Assim que confirmado, o pedido já será apresentado ao cliente com status "aceito".


**Fluxo do pedido:**
1. O cliente realiza o cadastro (ou login).
2. Adiciona itens ao carrinho.
3. Para cada item adicionado (exceto bebidas), o sistema pergunta quais adicionais o cliente deseja incluir e exibe um campo de observação para informar se deseja retirar ou modificar algum ingrediente.
4. Para bebidas, ao selecionar o item, ele é adicionado diretamente ao carrinho, sem opções de adicionais ou observação.
5. O sistema pergunta se o pedido será para entrega no endereço cadastrado ou para retirada no balcão.
6. Após essa escolha, o cliente segue para a seleção da forma de pagamento.





**Produtos Mais Vendidos / Mais Pedidos:**
O sistema exibirá uma seção especial no topo do cardápio destacando os produtos mais vendidos (ou mais pedidos) da semana ou do mês. Os itens mais populares aparecerão primeiro, com ordenação automática baseada no volume de vendas.

Além disso, cada produto que estiver entre os mais vendidos receberá um selo visual (ex: 🔥 Mais Vendido) no card, facilitando a identificação pelos clientes.

O usuário poderá filtrar ou ordenar o cardápio por "Mais vendidos", "Menor preço" ou "Novidades". Por padrão, os mais vendidos aparecem primeiro, mas o cliente pode mudar a ordem se desejar.

Essas estratégias aumentam a conversão e ajudam o cliente a escolher rapidamente os favoritos da casa.

---

O site contará com uma área específica para exibição do cardápio, onde todos os itens e categorias cadastrados ficarão disponíveis para consulta dos clientes, mesmo sem necessidade de login.

Cada lanche será apresentado em um card visual, que obrigatoriamente deve conter:
- Foto do lanche
- Descrição detalhada do produto
- Valor (preço)


Ao clicar no card do lanche, deve ser exibido um modal com a imagem em tamanho maior e a descrição completa do produto, facilitando a leitura de descrições longas e a visualização dos detalhes do lanche.


## Categorias do Cardápio

Os produtos são organizados nas seguintes categorias:

- **Lanches Individuais**
- **Lanches** *(possui tamanhos Médio e Grande)*
- **Combos**
- **Lanches na Baguete**
- **Burgers Artesanais**
- **Porções** *(possui tamanhos Médio e Grande)*
- **Bebidas**
- **Promoções**

> **Observação:** Somente as categorias **Lanches** e **Porções** possuem opções de tamanho *Médio* e *Grande*. As demais categorias não possuem variação de tamanho.

Para as categorias **Porções** e **Lanches**, cada item poderá ser oferecido em dois tamanhos: Médio e Grande, com valores distintos para cada tamanho. O cliente poderá escolher o tamanho desejado no momento do pedido.

**Adicionais:**
Produtos adicionais (ex: queijo extra, bacon, ovo, etc.) poderão ser incluídos em todas as categorias de lanches, exceto Bebidas. Os adicionais exibidos para o cliente serão sempre aqueles previamente cadastrados no banco de dados. O cliente poderá selecionar quantos adicionais desejar para cada item escolhido.


**Área do cliente:**
A área do cliente (minha conta, pedidos, dados pessoais, etc.) deve ter um design bonito, moderno e profissional, utilizando componentes visuais de alta qualidade (ex: Ant Design).



**Área do administrador:**
A área administrativa contará com um dashboard moderno e responsivo, desenvolvido com Ant Design, apresentando os principais indicadores do negócio, como:
  - **Painel de controle de pedidos:**
    - Área separada no dashboard, dedicada exclusivamente ao gerenciamento dos pedidos em tempo real.
    - Lista clara e organizada de todos os pedidos, mostrando:
      - Número do pedido
      - Nome do cliente
      - Forma de pagamento
      - Status atual do pedido (com opção de alterar o status diretamente na lista, de forma rápida e intuitiva)
      - Botão para visualizar todos os detalhes do pedido (itens, adicionais, endereço, observações, valores, etc.) em um modal ou página dedicada
      - Botão para falar diretamente com o cliente via WhatsApp (abrindo o WhatsApp Web com o número do cliente já preenchido; não utiliza API oficial nem bot), facilitando a comunicação rápida em caso de dúvidas, confirmações ou suporte.
      - Botão para exportar relatórios de vendas e pedidos em formato Excel (.xlsx) ou CSV, permitindo ao administrador baixar facilmente os dados para análise, prestação de contas ou controle financeiro.
    - O painel deve ser bonito, moderno, fácil de usar e responsivo, utilizando os melhores componentes do Ant Design (ex: tabelas, tags coloridas para status, botões de ação, modal de detalhes, filtros por status/data).
    - O objetivo é facilitar o controle dos pedidos em tempo real, agilizar a produção e garantir uma gestão eficiente e visualmente agradável.

  - **Indicadores de faturamento:**
    - Área separada no dashboard, dedicada a exibir os principais indicadores financeiros do negócio.
    - Total vendido por forma de pagamento (Dinheiro, Cartões, Pix), permitindo ao administrador visualizar rapidamente quanto foi faturado em cada modalidade.
    - Total de pedidos do dia, semana e mês
    - Faturamento geral
    - Produtos mais vendidos
    - Avaliações/feedbacks recentes
    - Gráficos e estatísticas visuais
    - Pedidos em andamento

  - **Painel de feedbacks:**
    - Área dedicada no dashboard para visualizar todas as avaliações e feedbacks enviados pelos clientes.
    - Permite ao administrador responder avaliações diretamente pelo painel, promovendo interação e mostrando atenção ao cliente.
    - Exibe nota, comentário, data, nome do cliente e status da resposta.
    - Possibilidade de filtrar feedbacks por período, nota ou status de resposta.


**Modo de manutenção da área do cliente:**
O administrador poderá ativar/desativar, pelo dashboard, um modo de manutenção para a área do cliente. Quando ativado, todos os usuários que tentarem acessar a área do cliente verão uma mensagem informando que o sistema está em manutenção, impedindo o uso temporário até a normalização.

Essa opção facilita atualizações, correções ou melhorias sem impactar negativamente a experiência dos clientes.

O dashboard deve utilizar o layout padrão do Ant Design com barra lateral (Sidebar/Menu) exibindo ícones e nomes das seções. Quando a barra for encolhida (collapsed), devem aparecer apenas os ícones, mantendo a navegação intuitiva e economizando espaço na tela. Esse padrão é recomendado para painéis administrativos modernos e melhora a experiência do usuário.

Além dos indicadores, o dashboard administrativo deve permitir visualizar, cadastrar e editar absolutamente tudo que está disponível na área do cliente, incluindo:
- Dados pessoais dos clientes (nome, e-mail, telefone, endereços, senha)
- Histórico de pedidos de cada cliente (com detalhes, status, avaliações)
- Endereços de entrega cadastrados
- Preferências de contato (WhatsApp, e-mail)
- Avaliações/feedbacks enviados
- Itens do carrinho de cada cliente (para suporte ou análise)
- Notificações e mensagens recebidas pelo cliente
- Aceite de termos e políticas

O objetivo é garantir que nenhum dado ou funcionalidade da área do cliente fique inacessível para o administrador, permitindo total gestão, suporte e auditoria do sistema.


> **Importante:** Somente administradores autenticados podem acessar a área administrativa (dashboard). Usuários comuns não têm acesso a essa área, garantindo a segurança e a privacidade dos dados.

O dashboard deve ser de fácil navegação, com filtros por período e visualização clara dos dados para facilitar a gestão da hamburgueria.


<!--
Orientação para documentação e desenvolvimento:
- Toda a documentação de rotas, telas, componentes, regras de negócio e funcionalidades deve ser feita por escrito, em Markdown, dentro do próprio código ou em arquivos `.md`.
- Para cada rota, função, componente ou bloco importante, explique claramente para que serve, como funciona e exemplos de uso.
- Use comentários detalhados e, sempre que possível, inclua exemplos de chamadas, respostas e fluxos esperados.
- O objetivo é facilitar a leitura, manutenção e evolução do sistema, tornando o projeto Copilot-friendly e acessível para qualquer desenvolvedor.
- Exemplos:
  - No backend, explique cada rota FastAPI com docstrings e comentários em português, detalhando parâmetros, retornos e regras.
  - No frontend, documente cada página, componente e hook com comentários e exemplos em Markdown.
  - Mantenha arquivos de documentação atualizados, com explicações claras sobre cada parte do sistema.
-- Sempre que for criar uma nova tela, página ou componente visual, apresente ao cliente pelo menos 2 opções de layout/design.
-- Sugira nomes claros e descritivos para cada tela, componente ou variação apresentada.
-- Mostre exemplos de ícones, cores e estilos para facilitar a escolha.
-- Documente as opções no próprio código ou em arquivos de documentação, para facilitar futuras manutenções e decisões de UX/UI.
-->

O frontend deve oferecer opções para testar diferentes telas, ícones e experiências visuais, facilitando a personalização e validação do layout antes da publicação.

**Lembrete de itens no carrinho:**
Sempre que o cliente adicionar itens ao carrinho e sair do site sem finalizar o pedido, ao retornar ele será lembrado de forma amigável (ex: mensagem ou banner) de que ainda há produtos aguardando no carrinho.
Essa funcionalidade visa aumentar a conversão e melhorar a experiência do usuário.



**Cupom detalhado do pedido:**
Após a finalização do pedido, para todos os tipos de pagamento, será gerado automaticamente um cupom detalhado contendo:
- **Cabeçalho:** Dados do estabelecimento (nome, CNPJ, endereço, telefone/WhatsApp)
- **Corpo:** Lista dos itens comprados, descrição de cada produto, adicionais, quantidades e valores unitários
- **Totais:** Taxa de entrega destacada, valor total da compra
- **Dados do cliente:** Nome, endereço de entrega, telefone
- **Mensagem final:** "Obrigado pela preferência!"

O cupom deve ser visualmente organizado, com cada seção separada e alinhada, facilitando a leitura e conferência tanto para o cliente quanto para a equipe de entrega.

Esse cupom poderá ser impresso, salvo em PDF ou enviado por e-mail/WhatsApp conforme a necessidade do cliente.

**Feedback pós-pedido:**
Após o pedido ser concluído, o cliente será convidado a avaliar sua experiência com uma mensagem bonita e profissional, podendo dar uma nota de 1 a 5 estrelas. O objetivo é coletar feedbacks para melhorar continuamente o serviço e a experiência do usuário.

O sistema contará com notificações push, permitindo que o cliente receba atualizações em tempo real sobre o status do seu pedido. Assim que o pedido for realizado, o cliente receberá uma notificação, mesmo que o status inicial seja "pendente". Todas as mudanças de status também geram notificações para o cliente.

Os status das notificações serão:

**Para pedidos delivery:**
  - Pedido pendente
  - Pedido aceito
  - Em preparo
  - Pronto
  - Saiu para entrega
  - Concluído
  - Cancelado (opção disponível para o cliente enquanto o pedido não estiver em preparo)

**Para pedidos online com retirada no balcão:**
  - Pedido pendente
  - Pedido aceito
  - Em preparo
  - Pronto para retirada
  - Concluído
  - Cancelado (opção disponível para o cliente enquanto o pedido não estiver em preparo)

Observação: Para pedidos com retirada no balcão, não será calculada taxa de entrega, mesmo que o bairro informado não esteja cadastrado no sistema.

Além disso, haverá uma caixa de avisos/mensagens no site, onde o cliente poderá visualizar notas do pedido, avisos importantes do restaurante e informações detalhadas sobre a compra, mesmo que tenha perdido alguma notificação push.




A taxa de entrega será calculada automaticamente de acordo com o bairro informado pelo cliente, utilizando os valores cadastrados no banco de dados.

Caso o bairro do endereço de entrega não esteja cadastrado, a taxa de entrega será fixada em R$ 20,00 (vinte reais) e o cliente poderá finalizar o pedido normalmente, seguindo o fluxo padrão de compra.

Essa regra visa garantir agilidade e praticidade para o cliente, evitando bloqueios no fechamento do pedido. O valor fixo será informado de forma clara na tela de checkout.


O pedido só será liberado para produção após o reconhecimento automático do pagamento via Pix, garantindo segurança e agilidade no processo.


O sistema contará também com login via Google, facilitando o acesso dos clientes e agilizando o processo de cadastro e autenticação.


## Tecnologias utilizadas

- FastAPI (backend Python)
- Vite + React com TypeScript (frontend moderno)
- Ant Design (biblioteca de componentes UI para React)
- SWC (compilação/transpiler para JavaScript/TypeScript)
- PWA (Progressive Web App para experiência mobile)
- API do Mercado Pago (integração Pix com geração de QR Code)
- Login com Google (autenticação OAuth)
- SQLite (banco de dados para testes e desenvolvimento)
- PostgreSQL (banco de dados para produção)


## Como rodar o projeto

### Pré-requisitos

- Python 3.10+
- Node.js 18+
- Yarn ou npm
- Conta Mercado Pago (para integração Pix)
- Conta Google (para OAuth)



---

## 🚀 Guia Rápido: Como Rodar o Projeto

Este passo a passo foi pensado para ser simples, didático e facilitar a vida de qualquer pessoa, mesmo sem experiência prévia. Siga cada bloco na ordem!

---

### 1️⃣ Clonar o repositório (baixar o projeto)

1. Instale o **Git** se ainda não tiver ([download aqui](https://git-scm.com/downloads)).
2. Abra o terminal (Prompt de Comando ou PowerShell no Windows).
3. Execute:
   ```bash
   git clone <url-do-repositorio>
   cd Projeto_paiva_novo
   ```

---

### 2️⃣ Configurar o Backend (API - FastAPI)

1. Crie e ative o ambiente virtual Python:
   - **Windows:**
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux/Mac:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
3. Crie o arquivo `.env` na raiz do projeto com as configurações (exemplo abaixo):
   ```env
   SECRET_KEY=uma_chave_secreta_forte
   DATABASE_URL=sqlite:///./db.sqlite3  # ou postgresql://user:senha@host:porta/db
   MERCADO_PAGO_ACCESS_TOKEN=seu_token
   GOOGLE_CLIENT_ID=seu_client_id
   GOOGLE_CLIENT_SECRET=seu_client_secret
   ```
4. Inicie o backend:
   ```bash
   uvicorn app.main:app --reload
   ```

---

### 3️⃣ Configurar o Frontend (Vite + React + Ant Design)

1. Entre na pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   yarn install # ou npm install
   ```
3. Crie o arquivo `.env` na pasta `frontend/` (exemplo abaixo):
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_GOOGLE_CLIENT_ID=seu_client_id
   ```
4. Inicie o frontend:
   ```bash
   yarn dev # ou npm run dev
   ```

---

### 4️⃣ Observações Importantes

- O login com Google utiliza OAuth2, integrado ao backend FastAPI.
- A autenticação usa JWT para proteger rotas e recursos.
- O pagamento Pix é processado via Mercado Pago, com atualização automática do status do pedido.
- O sistema envia notificações push para o cliente acompanhar o status do pedido em tempo real.
- Em desenvolvimento, use SQLite; em produção, configure o PostgreSQL.
- O frontend é PWA, podendo ser instalado no celular.

---

### 5️⃣ Organização do Projeto e Boas Práticas

- **Separação de Pastas:**
  - `backend/` para FastAPI (API)
  - `frontend/` para Vite + React (site)
- **No backend:**
  - Use subpastas como `app/routers`, `app/models`, `app/schemas`, `app/services` para organizar rotas, modelos, schemas e serviços.
- **No frontend:**
  - Separe componentes, páginas, hooks, contextos e estilos em pastas próprias.
  - Na tela de cadastro/edição de produtos no dashboard, inclua uma opção para desativar temporariamente um produto (ex: quando acabar um ingrediente). Produtos desativados não poderão ser comprados, mas continuarão visíveis para o cliente com a indicação clara de "Indisponível" ou similar, evitando frustração e mantendo transparência.
- **Comentários Detalhados:**
  - Comente o código em português, explicando a função de cada arquivo, classe, função e bloco importante.
  - Use docstrings em Python e comentários JSDoc/TypeScript no frontend.
  - Exemplos:
    - Python: `# Esta função realiza a autenticação do usuário via Google OAuth2`
    - React: `// Componente responsável por exibir o cardápio de lanches`
- **README e Documentação:**
  - Mantenha este README atualizado com a estrutura de pastas e exemplos de código.
  - Adicione um arquivo `docs/ARQUITETURA.md` detalhando a arquitetura e fluxos principais.
- **Facilitando o uso do Copilot:**
  - Nomeie arquivos e funções de forma clara e descritiva.
  - Use comentários para facilitar buscas e navegação pelo Copilot/Chat.
  - Sempre explique regras de negócio e integrações externas nos comentários.

---

#### 2. Configure o backend (FastAPI)

1. Crie e ative o ambiente virtual Python:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
2. Instale as dependências do backend:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure as variáveis de ambiente do backend (crie um arquivo `.env` na raiz do projeto):
   ```env
   SECRET_KEY=uma_chave_secreta_forte
   DATABASE_URL=sqlite:///./db.sqlite3  # ou postgresql://user:senha@host:porta/db
   MERCADO_PAGO_ACCESS_TOKEN=seu_token
   GOOGLE_CLIENT_ID=seu_client_id
   GOOGLE_CLIENT_SECRET=seu_client_secret
   ```
4. Inicie o backend:
   ```bash
   uvicorn app.main:app --reload
   ```

#### 3. Configure o frontend (Vite + React + Ant Design)

1. Acesse a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências do frontend:
   ```bash
   yarn install # ou npm install
   ```
3. Configure as variáveis de ambiente do frontend (crie um arquivo `.env` na pasta `frontend/`):
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_GOOGLE_CLIENT_ID=seu_client_id
   ```
4. Inicie o frontend:
   ```bash
   yarn dev # ou npm run dev
   ```

#### 4. Observações importantes

- O login com Google utiliza OAuth2, integrado ao backend FastAPI.
- A autenticação usa JWT para proteger rotas e recursos.
- O pagamento Pix é processado via Mercado Pago, com atualização automática do status do pedido.
- O sistema envia notificações push para o cliente acompanhar o status do pedido em tempo real.
- Em desenvolvimento, use SQLite; em produção, configure o PostgreSQL.
- O frontend é PWA, podendo ser instalado no celular.

#### 5. Organização do Projeto e Boas Práticas

- **Separação de Pastas:**
  - Separe o backend (FastAPI) e o frontend (Vite+React) em pastas distintas, por exemplo: `backend/` e `frontend/`.
  - Dentro do backend, use subpastas como `app/routers`, `app/models`, `app/schemas`, `app/services` para organizar rotas, modelos, schemas e serviços.
  - No frontend, separe componentes, páginas, hooks, contextos e estilos em pastas próprias.
  - Na tela de cadastro/edição de produtos no dashboard, inclua uma opção para desativar temporariamente um produto (ex: quando acabar um ingrediente). Produtos desativados não poderão ser comprados, mas continuarão visíveis para o cliente com a indicação clara de "Indisponível" ou similar, evitando frustração e mantendo transparência.
- **Comentários Detalhados:**
  - Comente o código em português, explicando a função de cada arquivo, classe, função e bloco importante.
  - Use docstrings em Python e comentários JSDoc/TypeScript no frontend.
  - Exemplos:
    - Python: `# Esta função realiza a autenticação do usuário via Google OAuth2`
    - React: `// Componente responsável por exibir o cardápio de lanches`
- **README e Documentação:**
  - Mantenha este README atualizado com a estrutura de pastas e exemplos de código.
  - Adicione um arquivo `docs/ARQUITETURA.md` detalhando a arquitetura e fluxos principais.
- **Facilitando o uso do Copilot:**
  - Nomeie arquivos e funções de forma clara e descritiva.
  - Use comentários para facilitar buscas e navegação pelo Copilot/Chat.
  - Sempre explique regras de negócio e integrações externas nos comentários.




<!--
## Privacidade, Cookies e LGPD

Este projeto seguirá as melhores práticas de privacidade e proteção de dados, conforme exigido pela LGPD (Lei Geral de Proteção de Dados) e demais legislações brasileiras.

### Contatos para dúvidas e solicitações sobre dados pessoais

- **E-mail:** paivasburguers@gmail.com
- **Telefone:** (11) 4019-0516
- **WhatsApp:** (11) 97095-8687

Esses contatos devem estar visíveis na página de Política de Privacidade e na página de Contato do site.

### Itens obrigatórios para conformidade com a LGPD:

- Exibir banner de consentimento de cookies na primeira visita, permitindo ao usuário aceitar, rejeitar ou personalizar cookies.
- Disponibilizar página de Política de Privacidade clara, informando:
  - Quais dados são coletados (nome, e-mail, dados de pagamento, etc.)
  - Finalidade da coleta (cadastro, autenticação, pedidos, pagamentos, analytics, etc.)
  - Com quem os dados podem ser compartilhados (ex: Mercado Pago, Google)
  - Tempo de retenção dos dados
  - Direitos do titular (acesso, correção, exclusão, portabilidade, revogação de consentimento)
  - Canal de contato para solicitações sobre dados pessoais
- Permitir que o usuário solicite acesso, correção ou exclusão de seus dados pessoais facilmente.
- Garantir armazenamento seguro dos dados (criptografia, acesso restrito, uso de cookies httpOnly para JWT).
- Registrar e documentar o consentimento do usuário para uso de dados e cookies.
- Atualizar a documentação e políticas sempre que houver mudanças no tratamento de dados.

### Exemplo de texto para Política de Privacidade

> "Seus dados pessoais são coletados apenas para fins de cadastro, autenticação, processamento de pedidos e pagamentos, e para melhorar sua experiência no site. Não compartilhamos seus dados com terceiros, exceto quando necessário para processar pagamentos (Mercado Pago) ou autenticação (Google). Você pode solicitar a qualquer momento acesso, correção ou exclusão dos seus dados pelo canal de contato informado nesta página."

### Exemplo de texto para Política de Cookies

> "Utilizamos cookies para garantir o funcionamento do site, autenticação de usuários e análise de uso. Você pode aceitar todos os cookies, rejeitar ou personalizar suas preferências. Cookies essenciais são necessários para o funcionamento do site e não podem ser desativados."

### Recomendações técnicas

- Utilize bibliotecas como `cookieconsent` para banner de cookies.
- Implemente rotas e páginas `/privacidade` e `/cookies` no frontend, com textos claros e objetivos.
- Mantenha logs de consentimento e solicitações dos usuários.
- Consulte sempre a LGPD e mantenha a documentação atualizada.

Links úteis:
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [Exemplo de Política de Cookies](https://www.cookiesandyou.com/)
- [Exemplo de Política de Privacidade](https://www.privacypolicies.com/blog/sample-privacy-policy-template/)
-->

## Contribuições

Sinta-se à vontade para contribuir com sugestões, correções ou melhorias.


<!--
Orientação para documentação e desenvolvimento:
...existing code...
-- Mostre exemplos de ícones, cores e estilos para facilitar a escolha.
-- Documente as opções no próprio código ou em arquivos de documentação, para facilitar futuras manutenções e decisões de UX/UI.
-- O sistema deve oferecer ao cliente, a qualquer momento, a opção de remover todos os cookies e dados armazenados localmente, garantindo controle total sobre sua privacidade.
-->
# $env:GOOGLE_CLIENT_ID="449901950745-1j1vlolaj169vve831970lcbj86fafk5.apps.googleusercontent.com"