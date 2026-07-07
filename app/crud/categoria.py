from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate


def get_categorias(db: Session):
    return db.query(Categoria).all()


def get_categoria(db: Session, categoria_id: int):
    return db.query(Categoria).filter(
        Categoria.id == categoria_id
    ).first()


def create_categoria(db: Session, categoria: CategoriaCreate):

    categoria_existente = db.query(Categoria).filter(
        Categoria.nombre == categoria.nombre
    ).first()

    if categoria_existente:
        raise ValueError("Ya existe una categoría con ese nombre.")

    nueva_categoria = Categoria(
        nombre=categoria.nombre,
        descripcion=categoria.descripcion
    )

    db.add(nueva_categoria)
    db.commit()
    db.refresh(nueva_categoria)

    return nueva_categoria


def update_categoria(
    db: Session,
    categoria_id: int,
    datos: CategoriaUpdate
):

    categoria = get_categoria(db, categoria_id)

    if not categoria:
        return None

    datos_actualizados = datos.model_dump(exclude_unset=True)

    for campo, valor in datos_actualizados.items():
        setattr(categoria, campo, valor)

    db.commit()
    db.refresh(categoria)

    return categoria


def delete_categoria(
    db: Session,
    categoria_id: int
):

    categoria = get_categoria(db, categoria_id)

    if not categoria:
        return None

    db.delete(categoria)
    db.commit()

    return categoria