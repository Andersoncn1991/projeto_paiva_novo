# Arquitetura do Projeto Paivas Burguers

Este documento descreve a arquitetura geral do sistema, separação de camadas, fluxos principais e boas práticas para desenvolvimento e manutenção.

## Estrutura de Pastas

- `backend/` - API FastAPI (Python)
  - `app/routers/` - Rotas da API
  - `app/models/` - Modelos do banco de dados
  - `app/schemas/` - Schemas Pydantic (validação)
  - `app/services/` - Lógica de negócio e serviços
- `frontend/` - Aplicação React (Vite + Ant Design)
- `docs/` - Documentação técnica e de negócio

## Fluxo Básico

1. Cliente acessa o frontend (React/PWA)
2. Frontend faz requisições para a API (FastAPI)
3. API processa, valida e responde usando modelos e schemas
4. Banco de dados armazena pedidos, clientes, produtos, etc.

## Boas Práticas
- Comente e documente tudo em português
- Separe responsabilidades por camadas
- Use exemplos e docstrings
- Atualize este documento sempre que houver mudanças relevantes
