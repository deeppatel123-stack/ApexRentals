import datetime
import numpy as np

class DemandForecaster:
    def forecast_next_7_days(self, products):
        today = datetime.date.today()
        forecast_days = []
        product_count = len(products) if products else 5

        # Seasonality factors by day of week (Monday=0 ... Sunday=6)
        day_weights = [1.0, 1.05, 1.1, 1.25, 1.45, 1.80, 1.60]

        for i in range(1, 8):
            day = today + datetime.timedelta(days=i)
            dow = day.weekday()
            weight = day_weights[dow]
            
            # Base daily demand estimate
            predicted_bookings = int(np.round(product_count * 0.4 * weight))
            is_peak = weight > 1.3

            forecast_days.append({
                "date": day.isoformat(),
                "dayName": day.strftime("%a"),
                "expectedBookings": predicted_bookings,
                "demandLevel": "Peak Surge" if is_peak else "Nominal",
                "recommendedFleetPrep": "Pre-stage batteries & accessories" if is_peak else "Routine fleet turnover"
            })

        # Top demanded items
        sorted_prods = sorted(products, key=lambda p: p.get('totalRentals', 0), reverse=True)
        top_items = []
        for p in sorted_prods[:4]:
            top_items.append({
                "id": p.get("_id"),
                "title": p.get("title", "Equipment"),
                "projectedStockoutRisk": "High" if p.get("totalRentals", 0) > 10 else "Moderate",
                "recommendedBuffer": 2
            })

        return {
            "forecastDays": forecast_days,
            "topDemanded": top_items,
            "insight": "Weekend demand surge peaks between Friday evening and Sunday. Expedite return inspections on Friday afternoon."
        }
