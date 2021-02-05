from utility.coordinates import get_distance, get_bearing


class WayPoint:
    lat = 0
    lng = 0
    danger_point = False

    def __init__(self, lat: float, lng: float):
        self.lat = lat
        self.lng = lng

    def distance(self, from_lat: float, from_lng: float):
        return get_distance(from_lat, from_lng, self.lat, self.lng)

    def magnetic_bearing(self, from_lat: float, from_lng: float):
        return get_bearing(from_lat, from_lng, self.lat, self.lng)

    def to_dict(self):
        return {
            'lat': self.lat,
            'lng': self.lng
        }
