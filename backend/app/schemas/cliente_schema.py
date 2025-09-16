
"""
Schema Pydantic para validação de dados de Cliente.
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class ClienteCreateSchema(BaseModel):
    nome: str = Field(..., min_length=3, max_length=100, description="Nome completo")
    email: EmailStr
    telefone: str = Field(..., min_length=8, max_length=20, description="Telefone (WhatsApp)")
    @validator('telefone')
    def validar_celular_brasileiro(cls, v):
        import re
        # Aceita apenas números no formato 11 dígitos (celular brasileiro)
        if not re.fullmatch(r'\d{11}', v):
            raise ValueError('O celular deve conter 11 dígitos (apenas números, DDD + número).')
        return v
    rua: str = Field(..., min_length=2, max_length=100)
    numero: str = Field(..., min_length=1, max_length=10)
    complemento: Optional[str] = None
    bairro: str = Field(..., min_length=2, max_length=50)
    cidade: str = Field(..., min_length=2, max_length=50)
    cep: str = Field(..., min_length=8, max_length=10)
    senha: str = Field(..., min_length=6, max_length=100)
    confirmacao_senha: str = Field(..., min_length=6, max_length=100)
    aceite_termos: bool
    role: Optional[str] = "cliente"
    fcm_token: Optional[str] = None

class ClienteResponseSchema(BaseModel):
    id: int
    nome: str
    email: EmailStr

# ================================
# Schemas Pydantic para validação de dados de Cliente
# Utilizados para validação de entrada e resposta de dados nas rotas e serviços.
# ================================
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class ClienteCreateSchema(BaseModel):
    nome: str = Field(..., min_length=3, max_length=100, description="Nome completo")
    email: EmailStr
    telefone: str = Field(..., min_length=8, max_length=20, description="Telefone (WhatsApp)")
    @validator('telefone')
    def validar_celular_brasileiro(cls, v):
        import re
        # Aceita apenas números no formato 11 dígitos (celular brasileiro)
        if not re.fullmatch(r'\d{11}', v):
            raise ValueError('O celular deve conter 11 dígitos (apenas números, DDD + número).')
        return v
    rua: str = Field(..., min_length=2, max_length=100)
    numero: str = Field(..., min_length=1, max_length=10)
    complemento: Optional[str] = None
    bairro: str = Field(..., min_length=2, max_length=50)
    cidade: str = Field(..., min_length=2, max_length=50)
    cep: str = Field(..., min_length=8, max_length=10)
    senha: str = Field(..., min_length=6, max_length=100)
    confirmacao_senha: str = Field(..., min_length=6, max_length=100)
    aceite_termos: bool
    role: Optional[str] = "cliente"

class ClienteResponseSchema(BaseModel):
    id: int
    nome: str
    email: EmailStr
    telefone: str
    rua: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cidade: str
    cep: str
    aceite_termos: bool
    role: Optional[str] = "cliente"
    ativo: Optional[bool] = False
    fcm_token: Optional[str] = None
