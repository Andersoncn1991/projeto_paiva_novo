# Otimização Mobile - Paivas Burguers

Este documento descreve os principais ajustes realizados para tornar o site responsivo, bonito e funcional em celulares, sem exigir a instalação do app PWA.

## Melhorias implementadas

- Sidebar lateral transformada em menu hambúrguer (drawer) para mobile.
- Botão do menu mobile ajustado para não sobrepor conteúdo, com fundo transparente e z-index correto.
- CSS global com media queries para adaptar containers, botões, fontes e espaçamentos em telas pequenas.
- Telas de login e inicial otimizadas para visualização mobile.
- Layout, espaçamentos e botões adaptados para toque e navegação fácil.
- Garantia de navegação fluida e visual atraente mesmo sem instalar o app.

## Arquivos alterados/criados

- `src/AppRouter.tsx` — Sidebar responsiva e menu mobile.
- `src/pages/Login.tsx` — Layout e responsividade da tela de login.
- `src/pages/Inicio.tsx` — Layout e responsividade da tela inicial.
- `src/styles/global.css` — Estilos globais e media queries para mobile.

## Como testar

- Acesse o site em um celular ou reduza a largura do navegador.
- O menu hambúrguer aparecerá no topo esquerdo, sem tapar o conteúdo.
- Todas as telas principais devem se adaptar e ficar bonitas em telas pequenas.

---

Se precisar de mais ajustes ou quiser personalizar ainda mais o visual mobile, basta pedir!
