// main.js — map setup, markers, and event wiring


// Create Map

const map = L.map("map").setView([20, 0], 2);

// Tile layers
const tileLayers = {
  light: L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"),
  dark: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}")
};

let currentTile = "light";
tileLayers.light.addTo(map);

applyState();


// World marker — hover preview + click to open trip
function createWorldMarker(trip) {

  const marker = L.marker(trip.markerLatLng);

  marker.on("mouseover", function() {
    const html = `
      <div class="preview-card">
        <div class="preview-title">${trip.label}</div>
        <div class="preview-sub">${trip.subtitle}</div>
        <img src="${trip.cover}" />
      </div>
    `;
    this.bindPopup(html, { closeButton: false, offset: [0, 10] }).openPopup();
  });

  marker.on("mouseout", function() {
    this.closePopup();
  });

  marker.on("click", function() {
    state.view       = "trip";
    state.activeTrip = trip.id;
    applyState();
  });

  return marker;
}


// Trip markers — clustered photo pins
function createTripMarkers(data) {

  const clusterGroup = L.markerClusterGroup();

  const geoLayer = L.geoJSON(data, {

    pointToLayer: function(feature, latlng) {
      const firstPhoto = feature.properties.media[0];

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: 46px;
            height: 46px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            overflow: hidden;
            cursor: pointer;
          ">
            <img src="${firstPhoto}" style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            " />
          </div>
        `,
        iconSize:   [46, 46],
        iconAnchor: [23, 23]
      });

      const marker = L.marker(latlng, { icon });

      marker.on("mouseover", function() {
        this.getElement().querySelector("div").style.transform = "scale(1.15)";
      });
      marker.on("mouseout", function() {
        this.getElement().querySelector("div").style.transform = "scale(1)";
      });

      return marker;
    },

    onEachFeature: function(feature, layer) {
      layer.on("click", function() {
        openPhotoPanel(feature.properties);
      });
    }

  });

  clusterGroup.addLayer(geoLayer);
  return clusterGroup;
}


// Event listeners

map.on("zoomend", function() {
  if (map.getZoom() < 5 && state.view === "trip") {
    state.view       = "world";
    state.activeTrip = null;
    applyState();
  }
});

map.on("click", function() {
  closePhotoPanel();
});

document.getElementById("homeBtn").onclick = function() {
  state.view       = "world";
  state.activeTrip = null;
  map.setView([20, 0], 2);
  closePhotoPanel();
  applyState();
};

document.getElementById("toggleTheme").onclick = function() {
  if (currentTile === "light") {
    map.removeLayer(tileLayers.light);
    tileLayers.dark.addTo(map);
    currentTile = "dark";
    this.innerHTML = "☀️";
  } else {
    map.removeLayer(tileLayers.dark);
    tileLayers.light.addTo(map);
    currentTile = "light";
    this.innerHTML = "🌙";
  }
};