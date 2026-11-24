
// Initialize Bengaluru map

const map = L.map('map').setView(
    [12.9716, 77.5946], 11
);

// Load OpenStreetMap tiles

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// Accident risk locations (demonstration data)

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


// Display accident hotspot markers

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
    .bindPopup(
        `<b>${location.name}</b><br>
         Accident Risk: ${location.risk}`
    );

});

// Nearest Ambulance Finder

document.getElementById("findAmbulanceBtn")
.addEventListener("click", async function () {

    const lat = document.getElementById("accidentLat").value;
    const lng = document.getElementById("accidentLng").value;

    const result = document.getElementById("ambulanceResult");

    if (lat === "" || lng === "") {
        result.innerHTML = "Please enter both coordinates.";
        return;
    }

    result.innerHTML = "Searching for nearest ambulance...";

    try {
        const response = await fetch(
            `/find_ambulance?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
        );

        const data = await response.json();

        if (data.error || data.message === "No available ambulances found") {
            result.innerHTML = data.error || data.message;
            return;
        }

        const ambulance = data.ambulance;

        result.innerHTML = `
            <h3>Nearest Ambulance Found!</h3>
            <p>Ambulance ID: ${ambulance.id}</p>
            <p>Status: ${ambulance.status}</p>
            <p>Distance: ${ambulance.distance} km</p>
        `;

    } catch (error) {
        result.innerHTML = "Unable to find ambulance. Please try again.";
        console.error(error);
    }
});
