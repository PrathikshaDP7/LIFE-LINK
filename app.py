
from flask import Flask, render_template, request, jsonify
from math import radians, sin, cos, sqrt, atan2

app = Flask(__name__)

# Demonstration ambulance data
ambulances = [
    {
        "id": "AMB-01",
        "lat": 12.9177,
        "lng": 77.6233,
        "status": "Available"
    },
    {
        "id": "AMB-02",
        "lat": 12.9716,
        "lng": 77.5946,
        "status": "Busy"
    },
    {
        "id": "AMB-03",
        "lat": 13.0358,
        "lng": 77.5970,
        "status": "Available"
    },
    {
        "id": "AMB-04",
        "lat": 12.8399,
        "lng": 77.6770,
        "status": "Available"
    }
]


# Correct Haversine distance calculation
def calculate_distance(lat1, lon1, lat2, lon2):

    R = 6371

    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/find_ambulance")
def find_ambulance():

    try:
        accident_lat = float(request.args.get("lat"))
        accident_lng = float(request.args.get("lng"))

    except (TypeError, ValueError):
        return jsonify({
            "error": "Please enter valid coordinates."
        }), 400

    # Validate Bengaluru-compatible geographic coordinate ranges
    if not (-90 <= accident_lat <= 90 and
            -180 <= accident_lng <= 180):

        return jsonify({
            "error": "Coordinates are outside valid latitude/longitude ranges."
        }), 400

    available_ambulances = []

    for ambulance in ambulances:

        if ambulance["status"] == "Available":

            distance = calculate_distance(
                accident_lat,
                accident_lng,
                ambulance["lat"],
                ambulance["lng"]
            )

            available_ambulances.append({
                **ambulance,
                "distance": round(distance, 2)
            })

    if not available_ambulances:
        return jsonify({
            "message": "No available ambulances found."
        })

    nearest = min(
        available_ambulances,
        key=lambda ambulance: ambulance["distance"]
    )

    return jsonify({
        "message": "Nearest ambulance found.",
        "accident": {
            "lat": accident_lat,
            "lng": accident_lng
        },
        "ambulance": nearest
    })


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
