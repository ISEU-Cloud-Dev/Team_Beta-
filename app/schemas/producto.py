from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.categoria import CategoriaResponse


class ProductoBase(BaseModel):
    nombre: str
    descripcion: str | None = None
    precio: Decimal
    stock: int
    stock_minimo: int
    categoria_id: int


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    precio: Decimal | None = None
    stock: int | None = None
    stock_minimo: int | None = None
    categoria_id: int | None = None


class ProductoResponse(ProductoBase):
    id: int
    categoria: CategoriaResponse

    model_config = ConfigDict(from_attributes=True)