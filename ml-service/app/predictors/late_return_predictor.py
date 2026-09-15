import datetime
import numpy as np

class LateReturnRiskPredictor:
    def __init__(self):
        # Weights for heuristic scoring model based on historical rental features
        self.w_customer_history = 0.40
        self.w_weekend = 0.20
        self.w_duration = 0.20
        self.w_order_value = 0.20

    def predict_orders(self, orders):
        results = []
        for order in orders:
            cust = order.get('customerId', {}) or {}
            total_rentals = cust.get('totalRentalsCompleted', 0)
            late_count = cust.get('lateReturnsCount', 0)
            hist_ratio = (late_count / total_rentals) if total_rentals > 0 else 0.15

            # Dates
            ret_scheduled_str = order.get('returnScheduledAt')
            if ret_scheduled_str:
                try:
                    ret_date = datetime.datetime.fromisoformat(ret_scheduled_str.replace('Z', '+00:00'))
                    is_weekend = ret_date.weekday() >= 5
                except Exception:
                    is_weekend = False
            else:
                is_weekend = False

            fee = float(order.get('totalRentalFee', 0))

            # Feature vector
            score = 15.0
            score += hist_ratio * 45.0
            if is_weekend:
                score += 20.0
            if fee > 5000:
                score += 15.0

            normalized_score = int(np.clip(np.round(score), 5, 95))
            
            if normalized_score > 65:
                level = "High"
                rec = "Send proactive SMS/WhatsApp alert 3 hours before deadline with extension link."
            elif normalized_score > 35:
                level = "Medium"
                rec = "Standard automated reminder notification at 9:00 AM."
            else:
                level = "Low"
                rec = "Nominal tracking. No proactive escalation necessary."

            results.append({
                "orderId": order.get("_id"),
                "orderNumber": order.get("orderNumber"),
                "customerName": cust.get("name", "Customer"),
                "scheduledReturn": ret_scheduled_str,
                "riskScore": normalized_score,
                "riskLevel": level,
                "keyFactors": [
                    f"Customer historical late return rate: {int(hist_ratio * 100)}%",
                    f"Return window: {'Weekend (High friction)' if is_weekend else 'Weekday (Normal)'}",
                    f"Order commitment value: ₹{fee:,.0f}"
                ],
                "recommendation": rec
            })
        return results
