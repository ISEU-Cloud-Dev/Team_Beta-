from sqlalchemy.orm import Session

from app.models.producto import Producto
from app.models.categoria import Categoria
from app.schemas.producto import ProductoCreate, ProductoUpdate


def get_productos(db: Session):
    return db.query(Producto).all()


def get_producto(db: Session, producto_id: int):
    return db.query(Producto).filter(
        Producto.id == producto_id
    ).first()


def validar_datos_producto(
    precio=None,
    stock=None,
    stock_minimo=None,
    categoria_id=None,
    db: Session = None
):
    if precio is not None and precio <= 0:
        raise ValueError("El precio debe ser mayor que cero.")

    if stock is not None and stock < 0:
        raise ValueError("El stock no puede ser negativo.")

    if stock_minimo is not None and stock_minimo < 0:
        raise ValueError("El stock mínimo no puede ser negativo.")

    if categoria_id is not None:
        categoria = db.query(Categoria).filter(
            Categoria.id == categoria_id
        ).first()

        if not categoria:
            raise ValueError("La categoría no existe.")


def create_producto(db: Session, producto: ProductoCreate):

    validar_datos_producto(
        precio=producto.precio,
        stock=producto.stock,
        stock_minimo=producto.stock_minimo,
        categoria_id=producto.categoria_id,
        db=db
    )

    nuevo_producto = Producto(
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio=producto.precio,
        stock=producto.stock,
        stock_minimo=producto.stock_minimo,
        categoria_id=producto.categoria_id
    )

    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)

    return nuevo_producto


def update_producto(
    db: Session,
    producto_id: int,
    datos: ProductoUpdate
):

    producto = get_producto(db, producto_id)

    if not producto:
        return None

    datos_actualizados = datos.model_dump(exclude_unset=True)

    validar_datos_producto(
        precio=datos_actualizados.get("precio"),
        stock=datos_actualizados.get("stock"),
        stock_minimo=datos_actualizados.get("stock_minimo"),
        categoria_id=datos_actualizados.get("categoria_id"),
        db=db
    )

    for campo, valor in datos_actualizados.items():
        setattr(producto, campo, valor)

    db.commit()
    db.refresh(producto)

    return producto


def delete_producto(
    db: Session,
    producto_id: int
):

    producto = get_producto(db, producto_id)

    if not producto:
        return None

    db.delete(producto)
    db.commit()

    return producto