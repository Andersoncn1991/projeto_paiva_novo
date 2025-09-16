# Como colocar produtos/tamanhos em promoção (exemplo prático)

## Para produtos com tamanhos (ex: Porções, Batata Frita)

- Cada tamanho pode ter seu próprio preço promocional.
- Basta definir o campo `precoPromocional` (ou `preco_promocional` no banco) menor que o preço normal (`preco`).

---

## Como marcar um produto como Promoção, Mais Vendido ou Novo

### 1. Promoção
- Basta definir o campo `precoPromocional` menor que o preço normal (`preco`) para o tamanho desejado (pode ser Médio, Grande, etc.).
- O sistema detecta automaticamente e exibe o card na aba Promoções e com a tag "Promoção" apenas no(s) tamanho(s) que estiver(em) com preço promocional. Os outros tamanhos continuam com preço normal, sem a tag.
- **Para colocar todos os tamanhos de um produto em promoção de uma vez:**
```sql
UPDATE tamanhos_produto SET precoPromocional = <NOVO_PRECO> WHERE produto_id = <ID_DO_PRODUTO>;
```
- Substitua `<NOVO_PRECO>` pelo valor promocional desejado para cada tamanho (pode rodar comandos diferentes para cada tamanho, se quiser valores distintos).
- **Se o campo no banco for `preco_media_promocional` ou `preco_grande_promocional` (ou nomes similares):**
  - Atualize o campo correto para cada tamanho. Exemplo:
```sql
UPDATE tamanhos_produto SET preco_media_promocional = 26 WHERE produto_id = 26 AND nome = 'Médio';
```
- O importante é que o campo promocional do tamanho fique menor que o preço normal correspondente.

### 2. Mais Vendido
- Marque o campo `maisVendido` (ou `mais_vendido`, `maisvendido`, etc.) como `true` (ou 1) no banco ou via API/admin.
- Comando SQL para marcar como mais vendido:
```sql
UPDATE produtos SET maisVendido = 1 WHERE id = <ID_DO_PRODUTO>;
```
- Exemplo via API (PATCH):
```json
{
  "maisVendido": true
}
```
- O card aparecerá no carrossel "Mais vendidos" e com a tag vermelha "Mais vendido".

### 3. Novo
- Marque o campo `novidade` como `true` (ou 1) no banco ou via API/admin.
- Comando SQL para marcar como novo:
```sql
UPDATE produtos SET novidade = 1 WHERE id = <ID_DO_PRODUTO>;
```
- Exemplo via API (PATCH):
```json
{
  "novidade": true
}
```
- O card aparecerá com a tag verde "Novo".

---

### Exemplo para Batata Frita (produto_id = 6)

Se os preços normais são:
- Médio: 14
- Grande: 19

E você quer colocar em promoção:
- Médio por 12
- Grande por 16

Use os comandos SQL:

```sql
UPDATE tamanhos_produto SET preco = 14, precoPromocional = 12 WHERE produto_id = 6 AND nome = 'Médio';
UPDATE tamanhos_produto SET preco = 19, precoPromocional = 16 WHERE produto_id = 6 AND nome = 'Grande';
```

Se quiser só um tamanho em promoção, atualize apenas ele.

Depois, recarregue o frontend: o(s) tamanho(s) aparecerão automaticamente na aba Promoções.
Se não houver nenhum produto/tamanho em promoção, será exibida uma mensagem animada personalizada. Assim que houver promoções, os cards aparecem normalmente.

> Guarde este exemplo para referência rápida ao criar a área do admin ou cadastrar promoções manualmente.
