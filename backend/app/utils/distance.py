# backend/app/utils/distance.py
import math

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates using Haversine formula
    
    Args:
        lat1: Latitude of first point
        lon1: Longitude of first point
        lat2: Latitude of second point
        lon2: Longitude of second point
    
    Returns:
        Distance in kilometers
    """
    # Radius of Earth in kilometers
    R = 6371.0
    
    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Differences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formula
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * 
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    
    return round(distance, 2)

def get_pharmacies_within_radius(
    pharmacies: list,
    user_lat: float,
    user_lon: float,
    radius: float = 10.0
) -> list:
    """
    Filter pharmacies within specified radius and sort by distance
    
    Args:
        pharmacies: List of pharmacy dictionaries
        user_lat: User's latitude
        user_lon: User's longitude
        radius: Search radius in kilometers
    
    Returns:
        List of pharmacies within radius, sorted by distance
    """
    result = []
    
    for pharmacy in pharmacies:
        distance = calculate_distance(
            user_lat,
            user_lon,
            pharmacy['location']['latitude'],
            pharmacy['location']['longitude']
        )
        
        if distance <= radius:
            pharmacy_with_distance = pharmacy.copy()
            pharmacy_with_distance['distance'] = f"{distance} km"
            result.append(pharmacy_with_distance)
    
    # Sort by distance
    result.sort(key=lambda x: float(x['distance'].replace(' km', '')))
    
    return result