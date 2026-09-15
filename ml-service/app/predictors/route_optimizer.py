import math

class RouteOptimizer:
    def euclidean_distance_km(self, p1, p2):
        dlat = (p1['lat'] - p2['lat']) * 111.0
        dlng = (p1['lng'] - p2['lng']) * 111.0 * math.cos(math.radians((p1['lat'] + p2['lat']) / 2))
        return math.sqrt(dlat * dlat + dlng * dlng)

    def optimize_stops(self, depot, stops):
        if not stops:
            return {"totalStops": 0, "totalDistanceKm": 0, "optimizedRoute": []}

        unvisited = list(stops)
        sequenced = []
        current = depot
        total_distance = 0.0

        while unvisited:
            best_idx = 0
            best_dist = float('inf')

            for i, candidate in enumerate(unvisited):
                dist = self.euclidean_distance_km(current, candidate)
                if dist < best_dist:
                    best_dist = dist
                    best_idx = i

            chosen = unvisited.pop(best_idx)
            total_distance += best_dist

            sequenced.append({
                "sequence": len(sequenced) + 1,
                **chosen,
                "legDistanceKm": round(best_dist, 1),
                "estimatedArrivalTime": f"{9 + len(sequenced)}:30 AM"
            })
            current = chosen

        return {
            "depot": depot,
            "totalStops": len(sequenced),
            "totalDistanceKm": round(total_distance, 1),
            "estimatedDurationHours": round(total_distance / 25.0, 1),
            "optimizedRoute": sequenced
        }
