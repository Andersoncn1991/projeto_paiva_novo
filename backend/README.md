
# Backend - Paivas Burguers

Este diretório contém a API desenvolvida em FastAPI para o sistema Paivas Burguers.

## Estrutura da pasta
- `app/routers/` - Rotas da API (endpoints)
- `app/models/` - Modelos de dados (Pydantic/ORM)
- `app/schemas/` - Schemas de validação
- `app/services/` - Lógica de negócio

## Rotas e Endpoints Implementados

### Autenticação, Cadastro e Perfil
- `POST /auth/register` — Cadastro de usuário (validação completa, senha, aceite de termos)
- `POST /auth/token` — Login tradicional (usuário/senha, retorna JWT)
- `POST /auth/google-login` — Login/cadastro automático via Google OAuth2
- `GET /auth/google-login/web` — Inicia fluxo web do Google OAuth2 (popup)
- `GET /auth/google-login/web/callback` — Callback do Google OAuth2 (retorna JWT ao frontend)
- `GET /auth/me` — Retorna dados do usuário autenticado (JWT, inclui avatar e data de cadastro)
- `PUT /auth/update-profile` — Atualiza dados do perfil (exceto nome/email)
- `POST /auth/change-password` — Troca de senha
- `POST /auth/avatar` — Upload de avatar (imagem de perfil)
- `DELETE /auth/delete-account` — Exclui a conta do usuário

### Outras rotas (em breve)
- `/pedidos/` — CRUD de pedidos
- `/produtos/` — CRUD de produtos



## Funcionalidades recentes
- Promoções automáticas: produtos/tamanhos entram e saem da aba Promoções conforme o preço promocional.
- Integração total com frontend para exibição dinâmica de promoções.
- Fluxo completo de perfil: edição de dados, troca de senha, upload de avatar, exclusão de conta, campos `avatar_url` e `created_at` no modelo usuário.

## O que falta fazer
- Área administrativa para promoções via painel
- Notificações para clientes
- Testes automatizados


## Orientações para manutenção
- Comente todas as funções, rotas e serviços em português
- Explique regras de negócio e integrações nos comentários
- Atualize este README sempre que criar ou alterar rotas/funcionalidades
- Use Alembic para migrar o banco sem perder dados:
  ```bash
  alembic revision --autogenerate -m "mensagem"
  alembic upgrade head
  ```

---
Para detalhes completos do projeto, consulte o README.md principal na raiz.
