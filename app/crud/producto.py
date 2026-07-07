from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate


def get_productos(db: Session):
    return db.query(Producto).order_by(Producto.id).all()


def get_producto(db: Session, producto_id: int):
    return db.query(Producto).filter(Producto.id == producto_id).first()


def create_producto(db: Session, producto_in: ProductoCreate):
    categoria = db.query(Categoria).filter(Categoria.id == producto_in.categoria_id).first()
    if not categoria:
        raise ValueError("Categoría no encontrada")

    producto = Producto(**producto_in.model_dump())
    producto.categoria = categoria
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


def update_producto(db: Session, producto_id: int, datos: ProductoUpdate):
    producto = get_producto(db, producto_id)
    if not producto:
        return None

    update_data = datos.model_dump(exclude_unset=True)
    if "categoria_id" in update_data:
        categoria = db.query(Categoria).filter(Categoria.id == update_data["categoria_id"]).first()
        if not categoria:
            raise ValueError("Categoría no encontrada")
        producto.categoria = categoria

    for key, value in update_data.items():
        if key != "categoria_id":
            setattr(producto, key, value)

    db.commit()
    db.refresh(producto)
    return producto


def delete_producto(db: Session, producto_id: int):
    producto = get_producto(db, producto_id)
    if not producto:
        return None

    db.delete(producto)
    db.commit()
    return producto
