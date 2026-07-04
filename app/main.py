from fastapi import FastAPI

from app.database import Base, engine
from app.routers import categorias, productos

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear la aplicación
app = FastAPI(
    title="Smart Inventory API",
    description="API para la gestión de inventario",
    version="1.0.0"
)

# Registrar routers
app.include_router(categorias.router)
app.include_router(productos.router)


@app.get("/")
def root():
    return {
        "message": "Bienvenido a Smart Inventory API"
    }