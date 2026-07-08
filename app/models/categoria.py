from typing import TYPE_CHECKING, List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.producto import Producto


class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    nombre: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    descripcion: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    productos: Mapped[List["Producto"]] = relationship(
        back_populates="categoria",
        cascade="all, delete-orphan"
    )