from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Alerta(Base):
    __tablename__ = "alertas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    producto_id: Mapped[int] = mapped_column(
        ForeignKey("productos.id"),
        nullable=False,
        index=True,
    )
    tipo: Mapped[str] = mapped_column(String(50), nullable=False)
    mensaje: Mapped[str] = mapped_column(String(255), nullable=False)
    resuelta: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    producto = relationship("Producto", back_populates="alertas")
