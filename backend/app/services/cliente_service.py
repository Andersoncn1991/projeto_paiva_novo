
# ================================
# Serviço de regras de negócio para clientes
# Funções utilitárias para cadastro, validação e manipulação de clientes.
# ================================

from typing import Dict, Optional
from passlib.context import CryptContext
from ..schemas.cliente_schema import ClienteCreateSchema, ClienteResponseSchema
from ..models.cliente import Cliente


# Simulação de banco de dados (substitua por ORM real depois)
fake_clientes_db: Dict[str, Cliente] = {}


# Contexto para hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def cadastrar_cliente(dados: ClienteCreateSchema) -> ClienteResponseSchema:
    """
    Realiza o cadastro de um novo cliente, validando regras de negócio:
    - E-mail único
    - Confirmação de senha
    - Aceite dos termos
    - Nome com iniciais maiúsculas
    - Usuário inativo até confirmação de e-mail
    :param dados: Dados do cliente (schema de criação)
    :return: ClienteResponseSchema
    """
    email = dados.email.lower()
    if email in fake_clientes_db:
        raise ValueError("E-mail já cadastrado.")
    if dados.senha != dados.confirmacao_senha:
        raise ValueError("As senhas não conferem.")
    if not dados.aceite_termos:
        raise ValueError("É necessário aceitar os termos de uso e privacidade.")

    # Padronizar nome
    nome = " ".join([parte.capitalize() for parte in dados.nome.strip().split()])

    # Hash da senha
    senha_hash = pwd_context.hash(dados.senha)

    # Simular ID auto-incremental
    novo_id = len(fake_clientes_db) + 1

    cliente = Cliente(
        id=novo_id,
        nome=nome,
        email=email,
        telefone=dados.telefone,
        rua=dados.rua,
        numero=dados.numero,
        complemento=dados.complemento,
        bairro=dados.bairro,
        cidade=dados.cidade,
        cep=dados.cep,
        senha_hash=senha_hash,
        aceite_termos=dados.aceite_termos,
        role=dados.role or "cliente",
        ativo=False  # Só ativa após confirmação de e-mail
    )
    fake_clientes_db[email] = cliente

    return ClienteResponseSchema(
        id=cliente.id,
        nome=cliente.nome,
        email=cliente.email,
        telefone=cliente.telefone,
        rua=cliente.rua,
        numero=cliente.numero,
        complemento=cliente.complemento,
        bairro=cliente.bairro,
        cidade=cliente.cidade,
        cep=cliente.cep,
        aceite_termos=cliente.aceite_termos,
        role=cliente.role,
        ativo=cliente.ativo
    )
