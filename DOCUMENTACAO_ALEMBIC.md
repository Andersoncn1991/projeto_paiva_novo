# Alembic e Migrations no Projeto

## O que é Alembic?
Alembic é uma ferramenta de migrations para bancos de dados SQL utilizada junto com SQLAlchemy. Ela permite versionar, criar, atualizar e sincronizar o esquema do banco de dados automaticamente a partir dos modelos Python do seu projeto.

## Para que serve?
- **Versionamento do banco:** Cada alteração no modelo (adicionar/remover campos, tabelas, etc.) pode ser registrada como uma migration, facilitando o controle de mudanças.
- **Criação automática de tabelas:** Ao rodar os comandos do Alembic, todas as tabelas necessárias são criadas no banco de dados conforme os modelos definidos no código.
- **Atualização incremental:** Permite atualizar o banco de dados sem perder dados, aplicando apenas as mudanças necessárias.
- **Facilita deploys e testes:** O banco pode ser recriado ou atualizado em qualquer ambiente (dev, prod, CI) de forma automática e segura.

## Fluxo básico de uso
1. **Gerar migration:**
   ```
   alembic revision --autogenerate -m "mensagem da migration"
   ```
   Isso cria um arquivo de migration na pasta `alembic/versions` com as alterações detectadas nos modelos.

2. **Aplicar migration:**
   ```
   alembic upgrade head
   ```
   Isso executa as migrations pendentes e atualiza o banco de dados.


## Exemplo de migration para perfil de usuário

Para adicionar os campos `avatar_url` e `created_at` na tabela `usuarios`:

1. Gere a migration:
   ```bash
   alembic revision -m "add avatar_url and created_at to usuarios"
   ```
2. No arquivo gerado, adicione:
   ```python
   def upgrade():
       op.add_column('usuarios', sa.Column('avatar_url', sa.String(), nullable=True))
       op.add_column('usuarios', sa.Column('created_at', sa.DateTime(), nullable=True))

   def downgrade():
       op.drop_column('usuarios', 'avatar_url')
       op.drop_column('usuarios', 'created_at')
   ```
3. Rode:
   ```bash
   alembic upgrade head
   ```

---

> **Resumo:**
> O Alembic garante que o banco de dados do seu sistema sempre estará igual ao que está definido nos modelos Python, facilitando manutenção, deploy e evolução do projeto.
