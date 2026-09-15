from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import LateReturnRiskRequest, DemandForecastRequest, RouteOptimizationRequest, MaintenanceRequest
from app.predictors.late_return_predictor import LateReturnRiskPredictor
from app.predictors.demand_forecaster import DemandForecaster
from app.predictors.predictive_maintenance import PredictiveMaintenanceEngine
from app.predictors.route_optimizer import RouteOptimizer

app = FastAPI(
    title="Rental Management Predictive ML Microservice",
    version="1.0.0",
    description="Microservice powering risk prediction, demand forecasting, maintenance scoring, and delivery routing."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

late_predictor = LateReturnRiskPredictor()
demand_forecaster = DemandForecaster()
maintenance_engine = PredictiveMaintenanceEngine()
route_optimizer = RouteOptimizer()

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "rental-ml-microservice",
        "models_loaded": ["LateReturnPredictor", "DemandForecaster", "MaintenanceScorer", "RouteOptimizer"]
    }

@app.post("/predict/late-return-risk")
def predict_late_return(req: LateReturnRiskRequest):
    predictions = late_predictor.predict_orders(req.orders)
    return {"predictions": predictions}

@app.post("/predict/demand-forecast")
def predict_demand(req: DemandForecastRequest):
    forecast = demand_forecaster.forecast_next_7_days(req.products)
    return forecast

@app.post("/predict/maintenance")
def score_maintenance(req: MaintenanceRequest):
    recommendations = maintenance_engine.score_assets(req.items)
    return {"recommendations": recommendations}

@app.post("/optimize/routes")
def optimize_routes(req: RouteOptimizationRequest):
    result = route_optimizer.optimize_stops(req.depot, req.stops)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
