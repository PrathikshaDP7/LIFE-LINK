
// ========================================
// 1. INITIALIZE BENGALURU MAP
// ========================================

const map = L.map('map').setView(
    [12.9716, 77.5946], 11
);


// OpenStreetMap tiles

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// Layer for ambulance search markers and route

const ambulanceLayer = L.layerGroup().addTo(map);


// ========================================
// 2. ACCIDENT HOTSPOT LOCATIONS
// ========================================

const locations = [
    {
        name: "Silk Board",
        lat: 12.9177,
        lng: 77.6233,
        risk: "HIGH"
    },
    {
        name: "Electronic City",
        lat: 12.8399,
        lng: 77.6770,
        risk: "MEDIUM"
    },
    {
        name: "Hebbal",
        lat: 13.0358,
        lng: 77.5970,
        risk: "HIGH"
    }
];


// Display hotspot markers

locations.forEach(location => {

    const color = location.risk === "HIGH"
        ? "red"
        : "orange";

    L.circleMarker(
        [location.lat, location.lng],
        {
            radius: 10,
            color: color,
            fillColor: color,
            fillOpacity: 0.7
        }
    )
    .addTo(map)
    .bindPopup(`
        <b>${location.name}</b><br>
        Accident Risk: ${location.risk}
    `);

});


// ========================================
// 3. FIND NEAREST AMBULANCE
// ========================================

document.getElementById("findAmbulanceBtn")
.addEventListener("click", async function () {

    const lat = parseFloat(
        document.getElementById("accidentLat").value
    );

    const lng = parseFloat(
        document.getElementById("accidentLng").value
    );

    const result = document.getElementById("ambulanceResult");

    // Validate coordinates

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 || lat > 90 ||
        lng < -180 || lng > 180
    ) {
        result.innerHTML = "Please enter valid coordinates.";
        return;
    }

    result.innerHTML = "Searching for nearest ambulance...";

    try {

        const response = await fetch(
            `/find_ambulance?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
        );

        const data = await response.json();

        if (!response.ok || data.error) {
            result.textContent = data.error || "Unable to find ambulance.";
            return;
        }

        if (!data.ambulance) {
            result.textContent = data.message;
            ambulanceLayer.clearLayers();
            return;
        }

        const ambulance = data.ambulance;

        // Clear previous search markers and route

        ambulanceLayer.clearLayers();


        // ========================================
        // 4. ACCIDENT LOCATION MARKER
        // ========================================

        const accidentMarker = L.circleMarker(
            [lat, lng],
            {
                radius: 11,
                color: "red",
                fillColor: "red",
                fillOpacity: 1,
                weight: 3
            }
        )
        .addTo(ambulanceLayer)
        .bindPopup("<b>Accident Location</b>");

        
        // ========================================
        // 5. NEAREST AMBULANCE MARKER
        // ========================================

        const ambulanceMarker = L.circleMarker(
            [ambulance.lat, ambulance.lng],
            {
                radius: 11,
                color: "blue",
                fillColor: "#2563eb",
                fillOpacity: 1,
                weight: 3
            }
        )
        .addTo(ambulanceLayer)
        .bindPopup(`
            <b>Nearest Ambulance</b><br>
            ID: ${ambulance.id}<br>
            Status: ${ambulance.status}<br>
            Distance: ${ambulance.distance} km
        `);


        // ========================================
        // 6. CONNECT BOTH LOCATIONS
        // ========================================

        const route = L.polyline(
            [
                [lat, lng],
                [ambulance.lat, ambulance.lng]
            ],
            {
                color: "blue",
                weight: 4,
                dashArray: "8, 8"
            }
        ).addTo(ambulanceLayer);


        // ========================================
        // 7. AUTO ZOOM MAP
        // ========================================

        const bounds = L.latLngBounds([
            [lat, lng],
            [ambulance.lat, ambulance.lng]
        ]);

        map.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: 14
        });


        // ========================================
        // 8. DISPLAY RESULTS
        // ========================================

        result.innerHTML = `
            <h3>🚑 Nearest Ambulance Found!</h3>

            <p><b>Ambulance ID:</b> ${ambulance.id}</p>

            <p><b>Status:</b> ${ambulance.status}</p>

            <p><b>Distance:</b> ${ambulance.distance} km</p>

            <p><b>Accident Location:</b>
            ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>

            <p><b>Ambulance Location:</b>
            ${ambulance.lat}, ${ambulance.lng}</p>

            <p style="color:green;">
            <b>Ambulance location displayed on map!</b>
            </p>

            <small>
            Distance is calculated in a straight line.
            </small>
        `;

    } catch (error) {

        result.textContent =
            "Unable to find ambulance. Please try again.";

        console.error(error);
    }

});
