from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class LateReturnRiskRequest(BaseModel):
    orders: List[Dict[str, Any]]

class DemandForecastRequest(BaseModel):
    products: List[Dict[str, Any]]

class RouteOptimizationRequest(BaseModel):
    depot: Dict[str, Any]
    stops: List[Dict[str, Any]]

class MaintenanceRequest(BaseModel):
    items: List[Dict[str, Any]]
