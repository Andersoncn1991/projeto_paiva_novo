# Como colocar produtos/tamanhos em promoção (exemplo prático)

## Para produtos com tamanhos (ex: Porções, Batata Frita)

- Cada tamanho pode ter seu próprio preço promocional.
- Basta definir o campo `precoPromocional` (ou `preco_promocional` no banco) menor que o preço normal (`preco`).

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

> Guarde este exemplo para referência rápida ao criar a área do admin ou cadastrar promoções manualmente.
