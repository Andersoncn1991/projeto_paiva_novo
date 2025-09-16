# Projeto_paiva_novo

## Resumo Geral
Este projeto integra um sistema completo de gestão de pedidos, clientes, produtos e notificações push para o Paivas Burguers, com backend em FastAPI, frontend em React/Vite/Electron e integração Firebase Cloud Messaging (FCM).

## Funcionalidades Implementadas

### Backend (FastAPI)
- Estrutura modular com Alembic para migrações e banco de dados (PostgreSQL/SQLite).
- Endpoints REST para clientes, produtos, pedidos, relatórios, configurações e notificações.
- Integração com Firebase Admin SDK para envio de notificações push.
- Registro automático de tokens FCM dos clientes.
- Endpoint `/clientes/fcm_tokens` para listar todos os tokens cadastrados.
- Endpoint `/notificacoes/push` para envio de notificações push (suporte a título, mensagem e imagem).
- CORS liberado para todas as origens (suporte a Electron e web).
- Serviços de importação de produtos e adicionais via CSV.
- Documentação dos fluxos de pagamento, promoções e arquitetura no diretório `docs/`.

### Frontend (app_paiva)
- Dashboard administrativo moderno e responsivo (React + Vite + Electron).
- Página de notificações push para envio em massa para todos os clientes cadastrados.
- Integração com Firebase para geração e registro do token FCM.
- Sugestões automáticas de mensagens, suporte a emoji picker, campo para imagem promocional.
- Layout compacto, responsivo e sem overflow lateral.
- Botão de envio funcional, feedback visual de sucesso/erro.
- Ocultação da lista de tokens para UX mais limpa.

### Outras Pastas
- `frontend/`: versão web do cardápio e fluxo do cliente.
- `backend/app/`: código principal do backend, modelos, rotas, serviços, schemas.
- `docs/`: documentação técnica, exemplos de promoções, arquitetura, fluxos.

## Principais Ajustes e Correções
- Correção de CORS para permitir integração com Electron.
- Ajuste do endpoint de envio de push para aceitar imagem.
- Tratamento de erros detalhado no frontend.
- Layout do admin ajustado para caber todo o conteúdo na tela.
- Logs e prints para depuração do fluxo FCM.

## Observações
- O sistema está pronto para envio de notificações push, inclusive com imagem promocional.
- Para upload de imagens locais e exclusão automática, basta solicitar a implementação.
- Documentação detalhada disponível em `docs/`.

---

# Histórico de Desenvolvimento
- Integração FCM completa (registro, envio, automação)
- UX aprimorada no admin
- Correções de layout e funcionalidade
- Suporte a promoções e imagens
- Backend robusto e documentado
