# Frontend - Paivas Burguers

Este diretório contém o frontend do sistema, desenvolvido em Vite + React + TypeScript + Ant Design.

## Estrutura da pasta
- `src/components/` - Componentes reutilizáveis
- `src/pages/` - Páginas principais do sistema
- `src/hooks/` - Hooks customizados
- `src/contexts/` - Contextos globais
- `src/styles/` - Estilos globais e temas


## Páginas e Componentes Implementados
- `/register` - Página de cadastro de clientes (validação completa, mensagens em português)
- `/login` - Página de login integrada ao backend (JWT)
- `/perfil` - Página de perfil do usuário (edição de dados, troca de senha, upload de avatar, exclusão de conta)
- `/privacidade` - Política de Privacidade (em português, clara e profissional)
- `/cookies` - Política de Cookies (em português, clara e profissional)
- `CookieConsent` - Banner de consentimento de cookies (LGPD), com opções de aceitar, rejeitar ou personalizar


## Como iniciar o frontend


## Funcionalidades recentes
- Promoções automáticas: produtos/tamanhos entram e saem da aba Promoções conforme o preço promocional.
- Mensagem animada personalizada quando não há promoções, com nome do estabelecimento.
- Botão "Adicionar" sempre alinhado ao final do card, mantendo o padrão visual.
- Filtro de categorias com opção "Todas".
- Ajustes de layout para garantir que todos os cards fiquem visíveis e responsivos.
- Página de perfil integrada ao backend: edição de dados, troca de senha, upload de avatar, exclusão de conta, exibição de data de cadastro e avatar.

## O que falta fazer
- Área administrativa para promoções via painel
- Notificações para clientes
- Testes automatizados


1. Instale as dependências:
   ```bash
   yarn install # ou npm install
   ```
2. Crie o arquivo `.env` conforme exemplo no README principal.
3. Inicie o frontend:
   ```bash
   yarn dev # ou npm run dev
   ```


## Orientações para manutenção
- Comente todos os componentes e páginas em português
- Explique regras de negócio e integrações nos comentários
- Atualize este README sempre que criar ou alterar páginas/componentes
- Siga o padrão visual do Ant Design
- Sempre integre com os endpoints de perfil do backend para manter dados sincronizados (edição, senha, avatar, exclusão)

## Changelog UI/UX - Agosto/2025

- Loader visual centralizado com barra animada implementado.
- Loader e overlay de logout não bloqueiam mais a rolagem vertical.
- Removido bloqueio global de rolagem do CSS (`overflow: hidden` em html/body).
- Adicionado `overflow-x: hidden` para remover barra de rolagem horizontal.
- Testes realizados em todas as páginas para garantir experiência fluida.

---
Para detalhes completos do projeto, consulte o README.md principal na raiz.
