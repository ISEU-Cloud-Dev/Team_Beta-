from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models.categoria import Categoria
from app.models.producto import Producto
from app.routers import categorias, productos

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Inventory API",
    description="API para la gestión de inventario",
    version="1.0.0"
)

app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).resolve().parent / "static"),
    name="static"
)

app.include_router(categorias.router)
app.include_router(productos.router)


def _render_template(template_name: str) -> HTMLResponse:
    template_path = Path(__file__).resolve().parent / "templates" / template_name
    return HTMLResponse(content=template_path.read_text(encoding="utf-8"))


@app.get("/", response_class=HTMLResponse)
def login_page():
    return _render_template("login.html")


@app.get("/login", response_class=HTMLResponse)
def login_page_alias():
    return _render_template("login.html")


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard_page():
    return _render_template("dashboard.html")


@app.post("/api/auth/login")
def login(payload: dict):
    email = str((payload or {}).get("email", "")).strip()
    password = str((payload or {}).get("password", "")).strip()

    if not email or not password:
        return JSONResponse(
            status_code=400,
            content={"ok": False, "message": "Correo y contraseña requeridos."}
        )

    return {
        "ok": True,
        "message": "Inicio de sesión correcto",
        "redirect": "/dashboard"
    }


@app.get("/api/dashboard")
def dashboard_summary(db: Session = Depends(get_db)):
    return {
        "productos": db.query(Producto).count(),
        "categorias": db.query(Categoria).count(),
        "alertas": 0
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}