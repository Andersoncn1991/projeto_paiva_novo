# Documentação de Ajustes UI/UX - 2025

## Ajustes realizados no frontend (React)

### 1. Carrossel "Mais vendidos" (MaisPedidosCarrossel.tsx)
- Exibição dos botões de tamanho "Médio" e "Grande" sempre que existirem, com normalização de acentos e caixa para garantir que ambos apareçam corretamente.
- Botões de tamanho agora são selecionáveis: ao clicar, o botão fica com texto e borda vermelha (fundo branco), igual ao padrão visual da página de lanches.
- O valor exibido do produto muda conforme o tamanho selecionado.
- As tags "Mais vendido", "Novo" e "Promoção" sempre aparecem em uma linha separada, logo abaixo do nome do produto.
- Correção de normalização de nomes de tamanho para evitar problemas com acentos ("Médio"/"medio"/"MÉDIO").

### 2. Página de Lanches por Categoria (LanchesPorCategoria.tsx)
- As tags "Mais vendido", "Novo" e "Promoção" agora aparecem sempre em uma linha separada, logo abaixo do nome do produto, padronizando o layout dos cards.
- Botões de tamanho (quando houver mais de um) seguem o padrão: selecionado fica com texto e borda vermelha, fundo branco.
- Normalização dos nomes dos tamanhos para garantir que "Médio" e "Grande" sejam reconhecidos mesmo com variações de acento e caixa.
- O valor exibido do produto muda conforme o tamanho selecionado.

### 3. Padrão visual dos botões de tamanho
- Botão selecionado: texto vermelho (`#e53935`), borda vermelha, fundo branco, fonte em negrito.
- Botão não selecionado: texto preto, borda cinza clara, fundo branco.

### 4. Outras melhorias
- Garantia de que a imagem do produto sempre recebe uma string válida.
- Ajustes de segurança para evitar warnings de TypeScript sobre possíveis valores undefined.

## Ajuste: Exibição correta da tag "Promoção" para tamanhos específicos

### Problema
Ao ativar uma promoção para um tamanho específico (ex: "Médio") de um produto, a tag "Promoção" não aparecia no card do produto nem na categoria "Promoções" do frontend.

### Causa
O backend não enviava o campo `precoPromocional` no JSON do tamanho quando a promoção era ativada via `preco_media_promocional` ou `preco_grande_promocional` no banco. O frontend só reconhece a promoção se receber o campo `precoPromocional` (camelCase) no objeto do tamanho.

### Solução
- **Backend:**
  - Ajustado o endpoint `/api/produtos/` para, ao montar o dicionário de cada tamanho, preencher o campo `precoPromocional` com o valor de `preco_media_promocional` (se houver), ou `preco_grande_promocional`, ou `precoPromocional`.
  - Exemplo do trecho alterado:
    ```python
    preco_promocional = None
    if t.preco_media_promocional is not None:
        preco_promocional = t.preco_media_promocional
    elif t.preco_grande_promocional is not None:
        preco_promocional = t.preco_grande_promocional
    elif t.precoPromocional is not None:
        preco_promocional = t.precoPromocional
    # ...
    'precoPromocional': preco_promocional,
    'emPromocao': (
        preco_promocional is not None and preco_original is not None and preco_promocional < preco_original
        # ...
    )
    ```
- **Frontend:**
  - Nenhuma alteração necessária. O frontend já busca o campo `precoPromocional` para exibir a tag e filtrar promoções.

### Como ativar uma promoção para um tamanho específico
1. No banco, altere o valor de `preco_media_promocional` ou `preco_grande_promocional` para o valor promocional desejado.
2. Exemplo SQL para ativar promoção no tamanho "Médio" do produto 26:
    ```sql
    UPDATE tamanhos_produto SET preco_media_promocional = 26.0 WHERE produto_id = 26 AND nome = 'Médio';
    ```
3. Reinicie o backend (se necessário) e atualize o frontend.

### Resultado esperado
- A tag "Promoção" aparece no card do produto/tamanho correto.
- O produto aparece na categoria "Promoções".
- Se o produto for também "Mais vendido" ou "Novo", as tags aparecem juntas, sempre abaixo do nome.

---

# Histórico dos Ajustes UI/UX - Agosto/2025

## Passo a passo dos últimos ajustes

1. **Loader visual moderno**
   - Implementado overlay de loading com logo e barra animada, alinhado ao centro, para todas as telas de carregamento global.
   - Loader não bloqueia mais a rolagem da página (pointerEvents: 'none').

2. **Remoção do bloqueio de rolagem**
   - O overlay de loading (LogoLoading e LogoutLogoLoading) foi ajustado para não impedir a rolagem vertical do site.
   - Removido qualquer uso de `document.body.style.overflow` nos componentes de loading.

3. **Correção do bloqueio global via CSS**
   - O arquivo `global-loading.css` estava com `overflow: hidden` no `html, body`, bloqueando toda rolagem do site.
   - Essa linha foi removida/comentada para liberar a rolagem normalmente.

4. **Remoção da barra de rolagem horizontal**
   - Adicionado `overflow-x: hidden` no CSS global para garantir que nunca apareça barra horizontal.

5. **Testes e validação**
   - Testado o carregamento, login, logout e navegação em todas as páginas para garantir que a rolagem vertical funciona e a horizontal não aparece.
   - Orientação para recarregar o navegador com Ctrl+F5 após as mudanças.

---

## Resumo dos arquivos alterados
- `frontend/src/components/MaisPedidosCarrossel.tsx`
- `frontend/src/pages/LanchesPorCategoria.tsx`

---

## Observações
- Todos os ajustes visuais e funcionais foram feitos para garantir consistência entre o carrossel da home e os cards da página de lanches.
- A normalização de nomes de tamanho evita problemas de cadastro e garante que o usuário sempre veja as opções corretas.
- O padrão visual dos botões foi unificado para facilitar a navegação e a escolha do tamanho pelo usuário.

---

*Data dos ajustes: Agosto/2025*
