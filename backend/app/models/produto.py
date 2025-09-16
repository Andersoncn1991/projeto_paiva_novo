
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
try:
    from app.db import Base
except ImportError:
    from db import Base
from app.models.adicional import produto_adicional

class Produto(Base):
    __tablename__ = 'produtos'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(String(500), nullable=True)
    categoria = Column(String(50), nullable=True)
    imagem = Column(String(255), nullable=True)
    disponivel = Column(Boolean, default=True)
    maisVendido = Column(Boolean, default=False)
    novidade = Column(Boolean, default=False)
    tamanhos = relationship('TamanhoProduto', back_populates='produto')
    adicionais = relationship('Adicional', secondary=produto_adicional, back_populates='produtos')

class TamanhoProduto(Base):
    __tablename__ = 'tamanhos_produto'
    id = Column(Integer, primary_key=True, autoincrement=True)
    produto_id = Column(Integer, ForeignKey('produtos.id'))
    nome = Column(String(50), nullable=False)  # Médio, Grande, Único, etc
    preco = Column(Float, nullable=False)
    preco_original = Column(Float, nullable=True)  # Preço original para comparação
    preco_media = Column(Float, nullable=True)
    preco_media_original = Column(Float, nullable=True)
    preco_grande = Column(Float, nullable=True)
    preco_grande_original = Column(Float, nullable=True)
    preco_media_promocional = Column(Float, nullable=True)
    preco_grande_promocional = Column(Float, nullable=True)
    precoPromocional = Column(Float, nullable=True)
    # Adiciona relacionamento reverso para Produto
    produto = relationship("Produto", back_populates="tamanhos")

    def to_dict(self):
        return {
            'id': self.id,
            'produto_id': self.produto_id,
            'nome': self.nome,
            'preco': self.preco,
            'preco_original': self.preco_original,
            'preco_media': self.preco_media,
            'preco_media_original': self.preco_media_original,
            'preco_grande': self.preco_grande,
            'preco_grande_original': self.preco_grande_original,
            'preco_media_promocional': self.preco_media_promocional,
            'preco_grande_promocional': self.preco_grande_promocional,
            'precoPromocional': self.precoPromocional,
        }
