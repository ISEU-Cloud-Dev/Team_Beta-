from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud import alerta as crud
from app.database import get_db
from app.schemas.alerta import AlertaResponse

router = APIRouter(
    prefix="/alertas",
    tags=["Alertas"],
)


@router.get("/", response_model=list[AlertaResponse])
def listar_alertas(db: Session = Depends(get_db)):
    return crud.get_alertas(db)
