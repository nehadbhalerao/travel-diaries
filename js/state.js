// App state and map view logic

//initial state
const state = {
  view:        "world",   
  activeTrip:  null,      
  isLoading:   false      
};

// Leaflet layer references — cleared when switching views
const layers = {
  tripMarkers:  null,   
  routeLine:    null,   
  worldMarkers: {}      
};


// Call this after every state change — makes the map match state
async function applyState() {

  if (state.view === "world") {
    cleanupTripLayers();

    Object.values(TRIPS).forEach(trip => {
      if (!layers.worldMarkers[trip.id]) {
        layers.worldMarkers[trip.id] = createWorldMarker(trip);
      }
      if (!map.hasLayer(layers.worldMarkers[trip.id])) {
        layers.worldMarkers[trip.id].addTo(map);
      }
    });
  }

  if (state.view === "trip") {
    const trip = TRIPS[state.activeTrip];

    Object.values(layers.worldMarkers).forEach(m => {
      if (map.hasLayer(m)) m.remove();
    });

    if (!state.isLoading && !layers.tripMarkers) {
      await loadTrip(trip);
    }
  }
}


// Fetches geojson, draws markers and route
async function loadTrip(trip) {
  state.isLoading = true;

  const res  = await fetch(trip.geojson);
  const data = await res.json();

  if (state.view !== "trip" || state.activeTrip !== trip.id) {
    state.isLoading = false;
    return;
  }

  const bounds = data.features.map(f => [
    f.geometry.coordinates[1],
    f.geometry.coordinates[0]
  ]);
  map.fitBounds(bounds, { padding: trip.fitPadding, animate: true, duration: 1.2 });

  layers.tripMarkers = createTripMarkers(data);
  layers.tripMarkers.addTo(map);

  await drawRoute(data.features);

  // Same check after route fetch
  if (state.view !== "trip" || state.activeTrip !== trip.id) {
    cleanupTripLayers();
    state.isLoading = false;
    return;
  }

  state.isLoading = false;
}


// Calls OSRM for a real road route, draws it as a polyline
async function drawRoute(features) {
  const sorted = features
    .slice()
    .sort((a, b) => a.properties.order - b.properties.order);

  const coords = sorted
    .map(f => f.geometry.coordinates[0] + "," + f.geometry.coordinates[1])
    .join(";");

  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  const res  = await fetch(url);
  const data = await res.json();

  // State may have changed while waiting for OSRM
  if (state.view !== "trip") return;

  if (data.routes && data.routes[0]) {
    const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    layers.routeLine = L.polyline(routeCoords, {
      color:   "#00C8FF",
      weight:  3,
      opacity: 1
    }).addTo(map);
  }
}


// Removes trip markers and route, resets layer refs
function cleanupTripLayers() {
  if (layers.tripMarkers) {
    layers.tripMarkers.remove();
    layers.tripMarkers = null;
  }
  if (layers.routeLine) {
    layers.routeLine.remove();
    layers.routeLine = null;
  }
}