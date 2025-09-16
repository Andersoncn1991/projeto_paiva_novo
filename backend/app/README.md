# backend/app/README.md

## Sobre esta pasta
Esta pasta contém o código principal da API FastAPI do Paivas Burguers, organizada em subpastas para facilitar a manutenção e evolução do sistema.

- `routers/`: Rotas/endpoints da API (ex: autenticação, clientes, pedidos)
- `models/`: Modelos ORM (SQLAlchemy) e entidades do banco de dados
- `schemas/`: Schemas Pydantic para validação e documentação de dados
- `services/`: Lógica de negócio, integrações externas e utilitários

## Padrão de documentação
- Todos os arquivos, funções, classes e endpoints devem conter comentários explicativos em português.
- Explique regras de negócio, integrações e validações nos comentários.
- Exemplos de uso e fluxos devem ser documentados sempre que possível.

## Exemplo de endpoint documentado
```python
@router.post("/auth/register")
def register(request: RegisterRequest):
    """
    Endpoint para cadastro de usuário.
    Valida dados, verifica duplicidade de e-mail, confere senha e aceite de termos.
    Cria novo usuário no banco de dados.
    """
    # ...código...
```

## Atualização
Mantenha este README atualizado sempre que criar ou alterar arquivos nesta pasta.
