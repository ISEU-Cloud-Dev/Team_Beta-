import sys
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base
from app.models.alerta import Alerta
from app.models.categoria import Categoria
from app.models.producto import Producto
from app.tasks import generate_low_stock_alerts


def test_generate_low_stock_alerts_creates_alert_for_products_below_minimum():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)

    with SessionLocal() as session:
        categoria = Categoria(nombre="Herramientas", descripcion="Herramientas varias")
        session.add(categoria)
        session.flush()

        producto = Producto(
            nombre="Taladro",
            descripcion="Taladro eléctrico",
            precio=99.99,
            stock=2,
            stock_minimo=5,
            categoria_id=categoria.id,
        )
        session.add(producto)
        session.commit()

        generate_low_stock_alerts(session)
        session.refresh(producto)

        alerts = session.query(Alerta).all()
        assert len(alerts) == 1
        assert alerts[0].producto_id == producto.id
        assert "stock mínimo" in alerts[0].mensaje
