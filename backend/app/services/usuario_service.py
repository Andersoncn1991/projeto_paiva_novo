
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.db import SessionLocal
from passlib.context import CryptContext

# Contexto para hash e verificação de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    """
    Busca um usuário pelo e-mail no banco de dados.
    :param db: Sessão do banco de dados
    :param email: E-mail do usuário
    :return: Objeto Usuario ou None
    """
    return db.query(Usuario).filter(Usuario.email == email).first()

def create_usuario(db: Session, usuario_data: dict):
    """
    Cria um novo usuário no banco de dados.
    :param db: Sessão do banco de dados
    :param usuario_data: Dicionário com dados do usuário
    :return: Objeto Usuario criado
    """
    usuario = Usuario(**usuario_data)
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    # Cria cliente vinculado ao usuário
    from app.models.cliente import Cliente
    cliente_data = {
        "nome": usuario.nome,
        "email": usuario.email,
        "telefone": usuario.telefone,
        "rua": usuario.rua,
        "numero": usuario.numero,
        "complemento": usuario.complemento,
        "bairro": usuario.bairro,
        "cidade": usuario.cidade,
        "cep": usuario.cep,
        "senha_hash": usuario.senha_hash,
        "aceite_termos": usuario.aceite_termos,
        "role": usuario.role,
        "ativo": usuario.ativo,
    }
    cliente = Cliente(**cliente_data)
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return usuario

def verify_password(plain_password, hashed_password):
    """
    Verifica se a senha informada confere com o hash armazenado.
    :param plain_password: Senha em texto puro
    :param hashed_password: Hash da senha
    :return: True se coincidir, False caso contrário
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """
    Gera o hash seguro da senha informada.
    :param password: Senha em texto puro
    :return: Hash seguro da senha
    """
    return pwd_context.hash(password)

def update_usuario(db: Session, usuario_id: int, update_data: dict):
    """
    Atualiza os dados do usuário pelo ID.
    :param db: Sessão do banco de dados
    :param usuario_id: ID do usuário
    :param update_data: Dicionário com campos a atualizar
    :return: Objeto Usuario atualizado
    """
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        return None
    for key, value in update_data.items():
        if hasattr(usuario, key):
            setattr(usuario, key, value)
    db.commit()
    db.refresh(usuario)
    return usuario
