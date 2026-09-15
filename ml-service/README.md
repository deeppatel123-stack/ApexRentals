# Rental Management AI/ML Microservice

A modular Python + FastAPI microservice providing predictive intelligence for equipment rental operations.

## Features
1. **Late Return Risk Predictor**: Calculates risk scores (0-100) and provides early-warning notifications for ongoing rentals.
2. **7-Day Demand Forecaster**: Predicts weekly booking demand and potential stockouts based on temporal factors and product popularity.
3. **Predictive Maintenance Scorer**: Assesses asset wear based on cumulative operating hours, inspection logs, and historical damages.
4. **Smart Route Optimizer**: Nearest-neighbor TSP algorithm for sequencing multi-stop doorstep delivery schedules.

## Running Locally

```bash
cd ml-service
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

Health check: `http://127.0.0.1:8000/health`
