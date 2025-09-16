"""
Arquivo principal da API FastAPI do Paivas Burguers.
Inicia a aplicação e inclui as rotas principais.
"""




from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Importação explícita do router de autenticação


from app.routers import auth
from app.routers import produtos
from app.routers import pedidos
from app.routers import clientes
from app.routers import notificacoes
from app.routers.adicionais import router as adicionais_router
from app.routers.produto_adicionais import router as produto_adicionais_router
from app.routers import admin_pedidos

from dotenv import load_dotenv
import os
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))


app = FastAPI(title="Paivas Burguers API", description="API para gerenciamento de pedidos e clientes da hamburgueria.")
# Inclusão das rotas principais

# Monta arquivos estáticos para imagens
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static'))
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Configuração de CORS para permitir acesso do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite qualquer origem (Electron, web, etc)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Inclusão das rotas principais

# Inclusão apenas do router de autenticação (auth)




from app.routers.taxa_entrega import router as taxa_entrega_router
app.include_router(auth.router)
app.include_router(produtos.router)
app.include_router(pedidos.router)
app.include_router(clientes.router)
app.include_router(adicionais_router)
app.include_router(produto_adicionais_router)
app.include_router(taxa_entrega_router)
app.include_router(notificacoes.router)
app.include_router(admin_pedidos.router)

@app.get("/")
def read_root():
    """Rota de teste para verificar se a API está online."""
    return {"mensagem": "API Paivas Burguers online!"}
