class PredictiveMaintenanceEngine:
    def score_assets(self, items):
        scored = []
        for item in items:
            hours = item.get("cumulativeRentalHours", 0)
            rentals = item.get("totalRentalsCount", 0)
            condition = item.get("currentCondition", "excellent")

            # Base score derived from wear hours (threshold 300 hrs = 100%)
            score = min(int((hours / 300.0) * 100), 100)
            if condition == "fair":
                score += 25
            elif condition == "damaged":
                score = 100

            score = min(score, 100)

            if score > 75:
                status = "Urgent Service Required"
                recommendation = "Lock unit from active booking queue. Dispatch for calibration and workshop servicing."
            elif score > 45:
                status = "Service Recommended"
                recommendation = "Inspect thoroughly on next return. Schedule routine lubrication/sensor cleaning."
            else:
                status = "Good"
                recommendation = "Asset operates within nominal wear tolerances."

            scored.append({
                "inventoryItemId": item.get("_id"),
                "serialNumber": item.get("serialNumber"),
                "productTitle": item.get("productTitle", "Asset"),
                "hoursUsed": hours,
                "rentalsCount": rentals,
                "currentCondition": condition,
                "maintenanceScore": score,
                "status": status,
                "recommendation": recommendation
            })
        return scored
