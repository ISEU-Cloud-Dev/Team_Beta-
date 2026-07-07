from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlertaResponse(BaseModel):
    id: int
    producto_id: int
    tipo: str
    mensaje: str
    resuelta: bool
    fecha_creacion: datetime

    model_config = ConfigDict(from_attributes=True)
