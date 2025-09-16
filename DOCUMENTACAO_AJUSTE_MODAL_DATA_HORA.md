# Histórico de Ajustes - Data/Hora Modal de Pedido

**Data:** 18/08/2025

## Correções realizadas

- Adicionada coluna `created_at` na tabela `pedidos` do banco de dados (SQLite) via Alembic.
- Gerada e ajustada migração Alembic para evitar erros de alteração de tipo de coluna no SQLite.
- Corrigido erro de coluna duplicada na migração (campo já existia).
- Corrigida exibição da data/hora no modal de detalhes do pedido:
  - Removida duplicidade na renderização da data/hora.
  - Padronizado formato para `dd/mm/yyyy, hh:mm` (exemplo: 18/08/2025, 21:46).
  - Garantido uso do campo mais confiável: `data`, `created_at` ou `data_pedido`.
- Corrigida estrutura do JSX no componente do modal para evitar erros de renderização.

## Testes
- Testado cadastro de pedido e visualização do modal.
- Data/hora exibida corretamente e sem duplicidade.

---

*Este arquivo documenta as principais ações realizadas para corrigir a exibição da data/hora no modal de detalhes do pedido.*
