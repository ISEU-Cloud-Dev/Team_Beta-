from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

# Cargar variables del archivo .env
load_dotenv()

# Obtener la URL de conexión
DATABASE_URL = os.getenv("DATABASE_URL")

# Crear el motor de conexión
engine = create_engine(
    DATABASE_URL,
    echo=True
)

# Crear las sesiones para interactuar con la BD
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Clase base para los modelos
Base = declarative_base()


# Dependencia para obtener una sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()