from sqlalchemy.orm import Session

from app.celery_app import celery_app
from app.database import SessionLocal
from app.models.alerta import Alerta
from app.models.producto import Producto


def generate_low_stock_alerts(db: Session) -> list[Alerta]:
    productos = (
        db.query(Producto)
        .filter(Producto.stock <= Producto.stock_minimo)
        .all()
    )

    alertas_creadas: list[Alerta] = []

    for producto in productos:
        alerta_existente = (
            db.query(Alerta)
            .filter(Alerta.producto_id == producto.id, Alerta.resuelta.is_(False))
            .first()
        )

        if alerta_existente:
            continue

        alerta = Alerta(
            producto_id=producto.id,
            tipo="stock_bajo",
            mensaje=(
                f"El producto '{producto.nombre}' está por debajo del stock mínimo "
                f"({producto.stock} disponibles, mínimo {producto.stock_minimo})."
            ),
            resuelta=False,
        )
        db.add(alerta)
        alertas_creadas.append(alerta)

    db.commit()
    return alertas_creadas


@celery_app.task(name="app.tasks.check_stock_alerts")
def check_stock_alerts() -> int:
    db = SessionLocal()
    try:
        alertas_creadas = generate_low_stock_alerts(db)
        return len(alertas_creadas)
    finally:
        db.close()
