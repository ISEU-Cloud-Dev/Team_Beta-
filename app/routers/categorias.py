from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import categoria as crud
from app.schemas.categoria import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaResponse
)

router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"]
)


@router.get("/", response_model=list[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return crud.get_categorias(db)


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def obtener_categoria(
    categoria_id: int,
    db: Session = Depends(get_db)
):

    categoria = crud.get_categoria(db, categoria_id)

    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada."
        )

    return categoria


@router.post(
    "/",
    response_model=CategoriaResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db)
):

    try:
        return crud.create_categoria(db, categoria)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{categoria_id}", response_model=CategoriaResponse)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    db: Session = Depends(get_db)
):

    categoria = crud.update_categoria(
        db,
        categoria_id,
        datos
    )

    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada."
        )

    return categoria


@router.delete("/{categoria_id}")
def eliminar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db)
):

    try:

        categoria = crud.delete_categoria(
            db,
            categoria_id
        )

        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada."
            )

        return {
            "message": "Categoría eliminada correctamente."
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )