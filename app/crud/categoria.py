from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate


def get_categorias(db: Session):
    return db.query(Categoria).order_by(Categoria.id).all()


def get_categoria(db: Session, categoria_id: int):
    return db.query(Categoria).filter(Categoria.id == categoria_id).first()


def create_categoria(db: Session, categoria_in: CategoriaCreate):
    categoria = Categoria(**categoria_in.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


def update_categoria(db: Session, categoria_id: int, datos: CategoriaUpdate):
    categoria = get_categoria(db, categoria_id)
    if not categoria:
        return None

    for key, value in datos.model_dump(exclude_unset=True).items():
        setattr(categoria, key, value)

    db.commit()
    db.refresh(categoria)
    return categoria


def delete_categoria(db: Session, categoria_id: int):
    categoria = get_categoria(db, categoria_id)
    if not categoria:
        return None

    db.delete(categoria)
    db.commit()
    return categoria
