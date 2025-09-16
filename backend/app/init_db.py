
from app.db import engine, Base
from app.models.usuario import Usuario
from app.models.produto import Produto

def create_tables():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()
