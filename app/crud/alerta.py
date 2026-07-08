from sqlalchemy.orm import Session

from app.models.alerta import Alerta


def get_alertas(db: Session):
    return db.query(Alerta).order_by(Alerta.fecha_creacion.desc()).all()
