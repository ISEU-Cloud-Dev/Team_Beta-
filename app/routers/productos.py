from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import producto as crud
from app.schemas.producto import (
    ProductoCreate,
    ProductoUpdate,
    ProductoResponse
)

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


@router.get("/", response_model=list[ProductoResponse])
def listar_productos(db: Session = Depends(get_db)):
    return crud.get_productos(db)


@router.get("/{producto_id}", response_model=ProductoResponse)
def obtener_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):

    producto = crud.get_producto(db, producto_id)

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado."
        )

    return producto


@router.post(
    "/",
    response_model=ProductoResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db)
):

    try:
        return crud.create_producto(db, producto)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    db: Session = Depends(get_db)
):

    try:

        producto = crud.update_producto(
            db,
            producto_id,
            datos
        )

        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado."
            )

        return producto

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{producto_id}")
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):

    producto = crud.delete_producto(
        db,
        producto_id
    )

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado."
        )

    return {
        "message": "Producto eliminado correctamente."
    }