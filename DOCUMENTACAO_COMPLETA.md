# ===============================
# HISTÓRICO E RESUMO DO SISTEMA (ATUALIZAÇÃO AGOSTO/2025)
# ===============================
# Este bloco foi gerado automaticamente para facilitar futuras consultas e manutenções.
#
# Principais tópicos:
# - Rotas backend e frontend
# - Fluxo de pagamento e taxa de entrega
# - Correções de UI/UX
# - Integração Google, Pix, JWT
# - Exemplos de payloads e endpoints
# - Setup, migrations, boas práticas
# - Estrutura de arquivos
# - Observações e pendências
#
# Backend (FastAPI):
# - /auth/google-login (POST): Login via Google OAuth2
# - /auth/register (POST): Cadastro de usuário
# - /auth/complete-profile (POST): Completar cadastro
# - /auth/me (GET): Dados do usuário autenticado
# - /auth/token (POST): Geração de token JWT
# - /auth/update-profile (PUT): Atualiza dados do perfil
# - /auth/change-password (POST): Troca de senha
# - /auth/avatar (POST): Upload de avatar
# - /auth/delete-account (DELETE): Exclui conta
# - /clientes/ (CRUD): Clientes
# - /pedidos/ (CRUD): Pedidos
# - /produtos/ (CRUD): Produtos
# - /api/adicionais (GET): Lista todos os adicionais
# - /produtos/{produto_id}/adicionais (GET): Lista adicionais de um produto
# - /api/produtos (GET): Lista produtos, promoções, mais vendidos
# - /api/taxa-entrega (GET): Consulta taxa de entrega por bairro (fuzzy match, fallback R$ 20,00)
#
# Frontend (React):
# - / (página principal)
# - /login (login)
# - /register (cadastro)
# - /privacidade (política de privacidade)
# - /cookies (política de cookies)
# - /complete-profile (completar cadastro)
# - /admin/* (painel admin)
# - /pedidos (meus pedidos)
# - /pagamento (tela de pagamento)
# - /perfil (perfil do usuário)
# - /cardapio (modal de cardápio)
# - * (fallback para /)
#
# Exemplos de uso:
# fetch('http://127.0.0.1:8000/api/taxa-entrega?bairro=uniao')
# fetch('http://127.0.0.1:8000/pedidos/', { headers: { Authorization: `Bearer ${token}` } })
#
# Correções e fluxos:
# - Taxa de entrega calculada automaticamente pelo bairro, fuzzy match, fallback R$ 20,00
# - Dados do cliente exibidos completos na tela de pagamento
# - Carrinho persistente por usuário
# - Promoções automáticas por preço
# - Integração Pix Mercado Pago
# - Login Google OAuth2
# - Setup, migrations Alembic, boas práticas
# - UI/UX ajustada para responsividade, acessibilidade, rolagem, tags, banners, loaders
# - Documentação detalhada de todos os fluxos
# -----------------------------
# TROUBLESHOOTING: Atualização de Endereço no Perfil (/auth/update-profile)
# -----------------------------

Se ao atualizar o endereço na página de perfil aparece mensagem de sucesso, mas os dados continuam antigos, siga este checklist no backend:

1. **Verifique o schema Pydantic**  
  No arquivo do schema usado pelo endpoint `/auth/update-profile` (ex: `schemas/usuario_schema.py`), confira se todos os campos de endereço enviados pelo frontend estão presentes:
  - rua
  - número
  - bairro
  - cidade
  - complemento
  - cep
  - etc.

2. **Garanta o update de todos os campos**  
  No método de atualização do usuário (service ou rota), certifique-se de que todos esses campos recebidos do frontend estão realmente sendo atualizados no banco de dados.

3. **Nomes dos campos**  
  Verifique se os nomes dos campos enviados pelo frontend são exatamente iguais aos esperados pelo backend (atenção a acentos, maiúsculas/minúsculas, underline, etc).

4. **Teste manual**  
  Use uma ferramenta como Postman ou Insomnia para enviar um payload de exemplo para `/auth/update-profile` e confira se os dados realmente mudam no banco.

5. **Precisa de ajuda?**  
  Se quiser uma revisão detalhada, envie o código do endpoint `/auth/update-profile` e do schema correspondente. Assim posso mostrar exatamente onde e como ajustar!
# -----------------------------
# CORREÇÃO: Exibição da Taxa de Entrega em "Meus Pedidos" (Frontend)
# -----------------------------

## O que foi corrigido
- A lógica de exibição da taxa de entrega na página "Meus Pedidos" foi ajustada para refletir corretamente a escolha do cliente:
  - Se o cliente seleciona "entregar no endereço", a taxa de entrega é sempre exibida, mesmo que o valor seja o padrão (ex: R$ 20,00) por não encontrar o bairro no banco.
  - Se o cliente seleciona "retirada no balcão", a taxa de entrega nunca é exibida.
  - Se o backend não envia o campo `tipo_entrega`/`tipoEntrega`, mas existe uma taxa de entrega (> 0), o sistema considera como entrega no endereço.
  - O total do pedido soma a taxa de entrega apenas quando for entrega no endereço.

## Lógica aplicada (frontend/src/pages/MeusPedidos.tsx)
- Exibe taxa de entrega se:
  - `pedido.tipo_entrega === 'entrega'` (case-insensitive)
  - ou `pedido.tipoEntrega === 'entrega'`
  - ou (se ambos não existirem) houver taxa de entrega (`taxa_entrega` ou `valor_entrega` > 0)
- Não exibe taxa de entrega se:
  - `tipo_entrega`/`tipoEntrega` for "retirada" ou não houver taxa (> 0)
- O cálculo do total do pedido também segue essa lógica para somar a taxa.

## Exemplo de código:
```tsx
const isEntrega =
  (pedido.tipo_entrega && String(pedido.tipo_entrega).toLowerCase() === 'entrega') ||
  (pedido.tipoEntrega && String(pedido.tipoEntrega).toLowerCase() === 'entrega') ||
  ((!pedido.tipo_entrega && !pedido.tipoEntrega) &&
    ((pedido.taxa_entrega !== undefined && pedido.taxa_entrega !== null && Number(pedido.taxa_entrega) > 0) ||
     (pedido.valor_entrega !== undefined && pedido.valor_entrega !== null && Number(pedido.valor_entrega) > 0)));
```

## Rotas envolvidas
- **Frontend:**
  - `/pedidos` (página Meus Pedidos)
- **Backend:**
  - `GET /pedidos/` (retorna todos os pedidos do usuário autenticado, incluindo campos: tipo_entrega, taxa_entrega, valor_entrega, total, etc)
  - `POST /pedidos/` (criação do pedido, recebe tipo_entrega, taxa_entrega, etc)

## Observações
- A lógica foi testada para todos os cenários: entrega com bairro cadastrado, entrega com bairro não cadastrado (taxa padrão), retirada no balcão.
- O sistema agora reflete corretamente a escolha do cliente e o valor da taxa de entrega em todas as telas.
# -----------------------------
# Rotas e Fluxo de Pagamento
# -----------------------------

## Frontend

## Backend
#### pages/
...outros componentes reutilizáveis

---


## Persistência e Atualização de Preços do Carrinho (Frontend)

- O carrinho é salvo no `localStorage` com uma chave específica para cada usuário (`cart_items_<email>`).
- Ao fazer login, o sistema carrega o carrinho salvo do usuário (se existir).
- Ao fazer logout, o carrinho é limpo visualmente, mas permanece salvo para o usuário.
- Se o usuário logar novamente, seu carrinho anterior é restaurado automaticamente.
- Se o usuário não estiver logado, o carrinho é temporário e não persiste entre sessões.

- **Atualização automática de preços:** ao abrir o carrinho ou logar, o sistema busca os preços atuais dos produtos na API e atualiza os itens do carrinho, garantindo que o valor exibido/refletido seja sempre o mais recente cadastrado no sistema.


### Arquivos Envolvidos
- `frontend/src/contexts/CartContext.tsx`: lógica de salvar, restaurar, limpar e atualizar automaticamente os preços do carrinho por usuário.
- `frontend/src/contexts/AuthContext.tsx`: dispara eventos de login/logout que afetam o carrinho.


### Fluxo Resumido
1. Usuário loga → carrinho restaurado do `localStorage`.
2. Ao abrir o carrinho, os preços dos produtos são atualizados automaticamente para o valor mais recente cadastrado no sistema.
3. Usuário adiciona/remove itens → carrinho salvo em `cart_items_<email>`.
4. Usuário faz logout → carrinho limpo visualmente.
5. Usuário loga novamente → carrinho restaurado e atualizado.

---
- O backend armazena a forma de pagamento e demais dados junto com o pedido, permitindo consulta posterior.

## Observações
- Não há uma rota separada exclusiva para pagamento: o pagamento é parte do payload do pedido.
- O frontend pode exibir diferentes campos conforme a forma de pagamento escolhida (ex: campo de troco para dinheiro, chave pix para pix, bandeira para cartão).

# -----------------------------
# HISTÓRICO DE IMPLEMENTAÇÕES - 08/08/2025
# -----------------------------

## Backend
- Criação e aplicação de migrations Alembic para adicionar os campos `forma_pagamento`, `tipo_entrega`, `bairro` e `taxa_entrega` na tabela `pedidos`.
- Correção de múltiplos erros 500/422 relacionados a campos ausentes no banco de dados.
- Ajuste da configuração de CORS para aceitar tanto `localhost` quanto `127.0.0.1` no frontend.
- Garantia de que o backend retorna todos os campos necessários para o frontend na rota `/pedidos/`.

## Frontend
- Correção do payload enviado ao backend na finalização do pedido, garantindo que todos os campos obrigatórios estejam presentes e corretos.
- Conversão do campo `produto_id` para número, evitando erro de tipo no backend.
- Ajuste do fluxo de finalização de pedido para redirecionar automaticamente o cliente para a tela "Meus Pedidos" após sucesso.
- Correção do erro de tela branca em "Meus Pedidos" causado por `.toFixed()` em valores nulos.
- Aumento da espessura da borda dos cards de pedidos para maior destaque visual.
- Remoção dos filtros de status e busca por número do pedido na tela "Meus Pedidos", exibindo todos os pedidos sem filtros.

## Depuração e Testes
- Debug detalhado do payload e dos itens enviados ao backend.
- Testes de fluxo completo: cadastro de pedido, visualização em "Meus Pedidos", e integração frontend-backend.
- Ajuste de mensagens e navegação para melhor experiência do usuário.

## Observações Gerais
- Todas as alterações e correções foram documentadas e aplicadas para garantir o funcionamento pleno do fluxo de pedidos.
- O sistema está pronto para uso do cliente final no fluxo de pedidos e visualização de histórico.

# -----------------------------
# Funcionalidade: Meus Pedidos (Frontend e Backend)
# -----------------------------

## Frontend (src/pages/MeusPedidos.tsx)
- Página moderna e responsiva para o usuário visualizar seus pedidos.
- Filtros por status e busca por número do pedido.
- Modal com detalhes completos do pedido (itens, endereço, pagamento, entrega, desconto, total, etc).
- Badges para pedidos novos e entregues recentemente.
- Integração real com backend via JWT.

## Backend (FastAPI)
- Rota autenticada `/pedidos/` (GET):
  - Retorna todos os pedidos do usuário autenticado.
  - Suporta filtros por status (`/pedidos/?status=entregue`) e por número/id do pedido (`/pedidos/?pedido_id=123`).
  - Retorna todos os campos necessários para o frontend: id, status, data, itens (nome, quantidade, preço), total, valor_entrega, desconto, endereço, forma_pagamento, observacoes.
- Serviço `listar_pedidos_usuario` em `app/services/pedido_service.py`:
  - Busca pedidos do usuário autenticado no banco de dados, com filtros.
- Ajuste no `main.py` para registrar o router de pedidos.
- Ajuste de dependência do banco de dados para evitar erro 422.

### Exemplo de uso da rota:
```
GET /pedidos/                # Lista todos os pedidos do usuário autenticado
GET /pedidos/?status=pronto  # Lista apenas pedidos com status "pronto"
GET /pedidos/?pedido_id=10   # Busca pedido específico pelo número/id
Headers: Authorization: Bearer <token>
```

### Observações:
- O backend só retorna pedidos do usuário autenticado (segurança).
- Os campos retornados são compatíveis com o frontend.

## Visão Geral
Sistema fullstack para gestão de lanchonete, com backend FastAPI (Python) e frontend React (TypeScript). Funcionalidades: cadastro/login (Google), gerenciamento de usuários, produtos, pedidos, painel administrativo, e consumo de API.


## Índice

## Histórico de Setup e Migração (2025)

### Sincronização do Banco de Dados e Backend

  ```python
  DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///../db.sqlite3")
  ```
  Isso garante que tanto o FastAPI quanto o Alembic usam o mesmo arquivo `db.sqlite3` na raiz do projeto.

  - Parar o servidor FastAPI.
  - Apagar o arquivo `db.sqlite3` (certifique-se de que nenhum processo está usando o arquivo).
  - Limpar a pasta `alembic/versions/`.
  - Corrigir o `sys.path` no `alembic/env.py` para garantir que o pacote `app` seja encontrado.
  - Gerar nova migração Alembic:
    ```bash
    .\venv\Scripts\activate
    alembic revision --autogenerate -m "init"
    alembic upgrade head
    ```
  - Iniciar novamente o FastAPI:
    ```bash
    uvicorn app.main:app --reload
    ```


### Boas Práticas

  - [Arquivos e Funções](#arquivos-e-funcoes-backend)
  - [Rotas e Exemplos](#rotas-e-exemplos-backend)
  - [Arquivos e Funções](#arquivos-e-funcoes-frontend)
  - [Rotas e Exemplos](#rotas-e-exemplos-frontend)


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

### Pagamento e Dados do Cliente (Frontend)
- Exibição dos dados completos do cliente na tela de pagamento, com campos separados: Nome, Telefone, Rua, Número, Complemento (apenas se houver), Bairro, Cidade, CEP.
- Cálculo e exibição da taxa de entrega somada ao total do pedido.
- Campo de complemento só aparece se houver valor preenchido.
- Ajuste visual para melhor organização dos dados do cliente e do pedido.

### Arquivos Alterados/Envolvidos
- `frontend/src/pages/Pagamento.tsx`: lógica e UI da tela de pagamento, exibição dos dados do cliente, cálculo de taxa de entrega, soma do total, exibição condicional do complemento.

### Rotas Relacionadas
- `/pagamento` (frontend): tela de pagamento, exibe resumo do pedido e dados do cliente.
- `/pedidos/` (backend): criação e listagem de pedidos, recebe os dados do cliente e do pedido.

### Backend
- Nenhuma alteração estrutural recente, apenas consumo dos dados já existentes do cliente e pedido.

## O que falta fazer
- Área administrativa para cadastrar/editar promoções via painel (atualmente só via API ou banco).
- Melhorias no painel admin: CRUD completo de produtos, clientes e pedidos.
- Implementar notificações para clientes sobre novas promoções.
- Testes automatizados (frontend e backend).
- Melhorias de acessibilidade e responsividade mobile.
- Documentar exemplos de payloads e respostas para todas as rotas.
- Atualizar prints e diagramas se necessário.


```
backend/
  app/
    models/        # Modelos ORM (tabelas do banco)
    routers/       # Rotas/endpoints da API
    schemas/       # Schemas Pydantic (validação)
    services/      # Lógica de negócio/serviços
    db.py          # Conexão e utilitários do banco
    init_db.py     # Inicialização do banco
    main.py        # Inicialização do FastAPI, CORS, rotas
frontend/
  src/
    pages/         # Páginas principais (React)
    components/    # Componentes reutilizáveis
    services/      # Consumo da API
    styles/        # CSS
```

---

## Dependências Principais

### Backend (FastAPI)
- fastapi
- uvicorn
- sqlalchemy
- pydantic
- passlib[bcrypt]
- python-jose
- python-dotenv
- sqlite3

### Frontend (React)
- react
- react-dom
- react-router-dom
- antd
- typescript
- vite
- inputmask

---

## Como Executar o Projeto

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app/init_db.py  # Cria o banco
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Backend (FastAPI)

### <a name="arquivos-e-funcoes-backend"></a>Arquivos e Funções

#### models/
- **cliente.py**: Modelo Cliente (campos: nome, email, endereço, telefone...)
- **pedido.py**: Modelo Pedido (campos: cliente, produtos, status, data...)
- **produto.py**: Modelo Produto (campos: nome, descrição, preço, imagem, tamanhos...)
  - **TamanhoProduto**: inclui campos de preço original (`preco_original`, `preco_media_original`, `preco_grande_original`) e campos promocionais. A lógica de promoção é automática: se o preço atual de qualquer tamanho for menor que o original, o produto/tamanho entra em promoção; se voltar ao original, sai da promoção.
- **usuario.py**: Modelo Usuário (campos: nome, email, senha, Google ID, endereço, avatar_url (novo), created_at (novo))
- **adicional.py**: Modelo Adicional (campos: nome, preco, tipo, descricao, produtos (relação com Produto))

#### routers/
- **auth.py**: Rotas de autenticação e perfil:
  - **POST /auth/register**: Cadastro de usuário
  - **POST /auth/token**: Login tradicional (JWT)
  - **POST /auth/google-login**: Login/cadastro Google
  - **GET /auth/me**: Dados do usuário autenticado (inclui avatar e data de cadastro)
  - **PUT /auth/update-profile**: Atualiza dados do perfil (exceto nome/email)
  - **POST /auth/change-password**: Troca de senha
  - **POST /auth/avatar**: Upload de avatar (retorna URL)
  - **DELETE /auth/delete-account**: Exclui a conta do usuário
- **clientes.py**: Rotas CRUD de clientes
- **pedidos.py**: Rotas CRUD de pedidos
- **produtos.py**: Rotas CRUD de produtos
- **adicionais.py**: Rotas CRUD de adicionais
- **produto_adicionais.py**: Rotas para gerenciamento de adicionais por produto

#### schemas/
- **cliente_schema.py**: Schemas de entrada/saída para cliente
- **pedido_schema.py**: Schemas de entrada/saída para pedido
- **produto_schema.py**: Schemas de entrada/saída para produto
- **adicional_schema.py**: Schemas de entrada/saída para adicional

#### services/
- **cliente_service.py**: Lógica de negócio para clientes
- **pedido_service.py**: Lógica de negócio para pedidos
- **produto_service.py**: Lógica de negócio para produtos
- **usuario_service.py**: Lógica de negócio para usuários (hash de senha, update, upload de avatar, exclusão de conta)
- **adicional_service.py**: Lógica de negócio para adicionais

#### Arquivos principais
- **main.py**: Inicializa FastAPI, configura CORS, inclui routers, serve arquivos estáticos
- **db.py**: Conexão SQLite e utilitários
- **init_db.py**: Criação e inicialização do banco

---

### <a name="rotas-e-exemplos-backend"></a>Rotas e Exemplos


#### Autenticação e Perfil
- **POST /auth/google-login**: Login via Google OAuth2
- **POST /auth/register**: Cadastro de usuário
- **POST /auth/token**: Geração de token JWT
- **GET /auth/me**: Dados do usuário autenticado (inclui avatar e data de cadastro)
- **PUT /auth/update-profile**: Atualiza dados do perfil (exceto nome/email)
- **POST /auth/change-password**: Troca de senha
- **POST /auth/avatar**: Upload de avatar (envia arquivo, retorna URL)
- **DELETE /auth/delete-account**: Exclui a conta do usuário

#### CRUD
- **/clientes/**: Listar, criar, editar, deletar clientes
- **/pedidos/**: Listar, criar, editar, deletar pedidos
- **/produtos/**:
  - **GET /**: Listar produtos (inclui campos de promoção e preço original)
  - **PATCH /{produto_id}**: Atualizar produto/tamanhos. Se o preço de um tamanho for reduzido abaixo do original, ele entra em promoção automaticamente; se voltar ao original, sai da promoção. Exemplo de payload:
    ```json
    {
      "nome": "X-Burger",
      "tamanhos": [
        { "nome": "Médio", "preco": 18.0 },
        { "nome": "Grande", "preco": 22.0 }
      ]
    }
    ```
- **/adicionais/**: Listar, criar, editar, deletar adicionais
- **/produtos/{produto_id}/adicionais**: Gerenciar adicionais de um produto específico (GET, POST, DELETE)

#### Exemplo de uso (fetch):
```js
fetch('http://127.0.0.1:8000/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
})
```

---

## Frontend (React + TypeScript)

### <a name="arquivos-e-funcoes-frontend"></a>Arquivos e Funções

#### pages/
- **App.tsx**: Página principal, roteamento
- **Login.tsx**: Tela de login (Google)
- **Register.tsx**: Tela de cadastro
- **CompleteProfile.tsx**: Completar cadastro (formulário de endereço, telefone, etc)
- **AdminDashboard.tsx**: Painel administrativo
- **Inicio.tsx**: Página inicial
- **Privacidade.tsx**: Política de privacidade
- **Cookies.tsx**: Política de cookies
- **LanchesPorCategoria.tsx**: Página de lanches por categoria
- **Termos.tsx**: Termos de uso
- **Carrinho.tsx**: Página do carrinho, gerenciamento de adicionais
- **Promocoes.tsx**: Página de promoções, exibe produtos/tamanhos em promoção

#### components/
- **Cardapio.tsx**: Exibe cardápio de produtos, agora com visualização de imagens
- **CookieConsent.tsx**: Banner de cookies
- **MaisPedidosCarrossel.tsx**: Carrossel de produtos mais pedidos
- ...outros componentes reutilizáveis

#### services/
- **api.ts**: Consumo da API backend (fetch, axios, etc), agora com funções utilitárias e renovação de token

#### styles/
- CSS customizado para páginas e componentes

---


### <a name="rotas-e-exemplos-frontend"></a>Rotas do App (AppRouter)
```jsx
<Route path="/" element={<App />} />
<Route path="/login" element={<Login onLogin={handleLogin} />} />
<Route path="/register" element={<Register />} />
<Route path="/privacidade" element={<Privacidade />} />
<Route path="/cookies" element={<Cookies />} />
<Route path="/complete-profile" element={<CompleteProfile token={token || ''} />} />
<Route path="/perfil" element={<Perfil />} />
<Route path="/admin/*" element={
  <React.Suspense fallback={<div>Carregando...</div>}>
    <AdminDashboard />
  </React.Suspense>
} />
<Route path="*" element={<Navigate to="/" />} />
```
- Botão "Meus Pedidos" usa a rota: `/pedidos`
- Botão "Cardápio" abre modal, não rota

---

## Fluxos do Sistema


### Fluxo de Perfil do Usuário
1. Usuário faz login (Google ou tradicional)
2. Pode completar/editar perfil em `/perfil` (campos: telefone, endereço, CEP, etc)
3. Pode trocar senha em modal próprio
4. Pode fazer upload de avatar (imagem de perfil)
5. Pode excluir a conta (ação irreversível)
6. Todos os dados são salvos e atualizados via endpoints protegidos (JWT)

### Login Google
1. Usuário clica em "Login com Google"
2. Recebe token do Google
3. Backend valida token, cria usuário se novo
4. Se necessário, usuário completa perfil
5. Usuário autenticado recebe JWT

### Cadastro
1. Usuário preenche dados e aceita termos
2. Dados enviados para `/auth/register`
3. Usuário pode ser redirecionado para completar perfil

### Admin
- Acesso ao painel administrativo para gerenciar produtos, pedidos, clientes
- **Promoção automática:** ao atualizar o preço de um produto/tamanho para abaixo do original, ele entra em promoção automaticamente. Se o preço voltar ao original, sai da promoção. Não é necessário marcar manualmente promoções.

### Pedidos
- Cliente pode visualizar e criar pedidos

---

## FAQ e Dicas

- **Como rodar o backend?**
  - Siga os passos em "Como Executar o Projeto"
- **Como rodar o frontend?**
  - Siga os passos em "Como Executar o Projeto"
- **Como adicionar uma nova rota?**
  - Backend: crie um novo arquivo em `routers/` e registre no `main.py`
  - Frontend: adicione no `AppRouter.tsx`
- **Como adicionar um novo modelo?**
  - Crie em `models/`, schema em `schemas/`, service em `services/`, e rotas em `routers/`
- **Como funciona a autenticação?**
  - JWT é gerado no login, enviado no header Authorization para rotas protegidas
- **Onde ficam as imagens?**
  - Em `backend/app/static/img/`, servidas pelo backend
- **Como migrar o banco?**
  - Use Alembic para criar e atualizar campos sem perder dados:
    ```bash
    alembic revision --autogenerate -m "sua mensagem"
    alembic upgrade head
    ```
  - Exemplo: para adicionar avatar_url e created_at, foi criada a migration `20250805_add_avatar_url_and_created_at.py`.
  - Não deleta dados, apenas altera a estrutura.

---

Se precisar detalhar algum arquivo, rota ou fluxo, consulte esta documentação ou peça exemplos específicos!

---

# ATUALIZAÇÃO COMPLETA - Agosto/2025

## Novas Rotas e Endpoints Backend

- **/api/adicionais**: Lista todos os adicionais disponíveis (GET)
- **/produtos/{produto_id}/adicionais**: Lista adicionais de um produto específico (GET)
- **/api/produtos**: CRUD de produtos, lógica de promoção automática, listagem de mais vendidos
- **/pedidos**: Listagem e criação de pedidos do usuário autenticado
- **/clientes**: Listagem de clientes
- **/auth**: Autenticação, perfil, avatar, senha, exclusão de conta

## Novos Arquivos Backend
- **routers/adicionais.py**: Rotas de adicionais
- **routers/produto_adicionais.py**: Rotas de adicionais por produto
- **models/adicional.py**: Modelo ORM de adicional
- **schemas/adicional_schema.py**: Schema Pydantic de adicional
- **services/produto_service.py, adicional_service.py**: Lógica de negócio

## Novos Arquivos Frontend
- **pages/Carrinho.tsx**: Carrinho com adicionais, integração com API
- **pages/Promocoes.tsx**: Página de promoções, exibe produtos/tamanhos em promoção
- **pages/LanchesPorCategoria.tsx**: Página de lanches por categoria, filtro, tags, seleção de tamanho
- **components/Cardapio.tsx**: Visualização de imagens do cardápio
- **services/api.ts**: Consumo centralizado da API, renovação de token, funções utilitárias

## Novos Fluxos e Funcionalidades
- **Adicionais no Carrinho**: Seleção, edição e remoção de adicionais por produto, integração com `/api/adicionais` e `/produtos/{produto_id}/adicionais`
- **Promoções Automáticas**: Produtos/tamanhos entram/saiem da aba Promoções conforme preço promocional
- **Visualização de Cardápio**: Imagens lidas da pasta `src/cardapio/`, exibidas em modal
- **Tags Dinâmicas**: "Mais vendido", "Novo", "Promoção" sempre em linha separada
- **CRUD completo de produtos, clientes, pedidos**
- **Integração JWT em todas as rotas protegidas**

## Exemplos de Uso de Endpoints
```js
// Listar adicionais globais
fetch('http://127.0.0.1:8000/api/adicionais')

// Listar adicionais de um produto
fetch('http://127.0.0.1:8000/produtos/1/adicionais')

// Listar produtos (inclui promoções)
fetch('http://127.0.0.1:8000/api/produtos/')

// Listar pedidos do usuário autenticado
fetch('http://127.0.0.1:8000/pedidos/', { headers: { Authorization: `Bearer ${token}` } })
```

## Exemplos de Payloads
```json
// PATCH produto para ativar promoção
{
  "nome": "X-Burger",
  "tamanhos": [
    { "nome": "Médio", "preco": 18.0 },
    { "nome": "Grande", "preco": 22.0 }
  ]
}
```

## Novos Componentes e Padrões Visuais
- **Cardapio.tsx**: Exibe imagens do cardápio em duas linhas, modal de visualização
- **Carrinho.tsx**: Adicionais, edição, integração com API
- **LanchesPorCategoria.tsx**: Filtro, tags, seleção de tamanho, padrão visual
- **Promocoes.tsx**: Exibe todos os produtos/tamanhos em promoção, embaralhados

## Integração Real Backend/Frontend
- Todas as rotas protegidas usam JWT
- Adicionais, promoções, pedidos, produtos e clientes integrados
- Cardápio visual e responsivo
- Fluxos de login, cadastro, perfil, promoções, carrinho e pedidos completos

---

# Consulte esta seção para referência completa e atualizada do sistema!
