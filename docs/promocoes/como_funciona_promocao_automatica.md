# Como funciona a promoção automática

Para que um produto/tamanho apareça automaticamente na aba "Promoções" do frontend, basta:

- O campo `precoPromocional` (ou `preco_promocional` no banco) deve estar preenchido e ser menor que o campo `preco` (ou `preco_original`).
- Não é necessário marcar nada manualmente, basta atualizar os valores no banco ou via API/admin.

## Exemplo prático

Se você quiser colocar um produto em promoção:

1. Deixe o campo `preco` com o valor normal (ex: 15.0)
2. Preencha o campo `precoPromocional` com o valor promocional (ex: 14.0)

Assim, o produto aparecerá automaticamente na aba Promoções.

### Exemplo de comando SQL
```sql
UPDATE tamanhos_produto SET preco = 15.0, precoPromocional = 14.0 WHERE id = 1;
```

> Guarde esta lógica para implementar na área do admin: basta permitir editar o preço promocional e o sistema já faz o resto!
