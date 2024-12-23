import Map from "https://cdn.skypack.dev/ol/Map.js";
import View from "https://cdn.skypack.dev/ol/View.js";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import OSM from "https://cdn.skypack.dev/ol/source/OSM.js";
import { fromLonLat } from "https://cdn.skypack.dev/ol/proj.js";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector.js";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector.js";
import Feature from "https://cdn.skypack.dev/ol/Feature.js";
import LineString from "https://cdn.skypack.dev/ol/geom/LineString.js";
import Polygon from "https://cdn.skypack.dev/ol/geom/Polygon.js";
import Point from "https://cdn.skypack.dev/ol/geom/Point.js";
import Style from "https://cdn.skypack.dev/ol/style/Style.js";
import Stroke from "https://cdn.skypack.dev/ol/style/Stroke.js";
import Fill from "https://cdn.skypack.dev/ol/style/Fill.js";
import Icon from "https://cdn.skypack.dev/ol/style/Icon.js";

// Koordinat Logic Coffee
const logicCoffeeCoords = [107.57504888132391, -6.874693043534695]; // Longitude, Latitude

// Basemap layer
const basemap = new TileLayer({
  source: new OSM(),
});

// Map view
const mapView = new View({
  center: fromLonLat(logicCoffeeCoords),
  zoom: 14,
});

// Marker untuk Logic Coffee
const logicMarkerLayer = new VectorLayer({
  source: new VectorSource({
    features: [
      new Feature({
        geometry: new Point(fromLonLat(logicCoffeeCoords)),
      }),
    ],
  }),
  style: new Style({
    image: new Icon({
      src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      scale: 0.07,
    }),
  }),
});

// Layer untuk jalan
const roadsLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: "red",
      width: 2,
    }),
  }),
});

// Layer untuk wilayah
const regionLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: "blue",
      width: 2,
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.1)",
    }),
  }),
});

// Fungsi untuk mendapatkan data jalan dari API menggunakan metode POST
async function fetchRoads() {
  const token = getCookie('login');
  const targetUrl = "https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/roads";
  
  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Login": token,
      },
      body: JSON.stringify({
        // Sesuaikan dengan parameter yang diharapkan API
        region: "Bandung",  // Contoh, ganti dengan parameter yang diperlukan
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    data.forEach((road) => {
      const coordinates = road.coordinates.map((coord) => fromLonLat(coord));
      const roadFeature = new Feature({
        geometry: new LineString(coordinates),
      });
      roadsLayer.getSource().addFeature(roadFeature);
    });
  } catch (error) {
    console.error("Gagal mendapatkan data jalan:", error);
  }
}

// Fungsi untuk mendapatkan data wilayah dari API menggunakan metode POST
async function fetchRegion() {
  const token = getCookie('login');
  const targetUrl = "https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/region";
  
  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Login": token,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // Pastikan data valid
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((region) => {
        if (region.coordinates && Array.isArray(region.coordinates)) {
          const coordinates = region.coordinates.map((ring) =>
            ring.map((coord) => fromLonLat(coord))
          );
          const regionFeature = new Feature({
            geometry: new Polygon(coordinates),
          });
          regionLayer.getSource().addFeature(regionFeature);
        }
      });
    } else {
      console.error("Data wilayah tidak valid:", data);
    }
  } catch (error) {
    console.error("Gagal mendapatkan data wilayah:", error);
  }
}

// Fungsi untuk mendapatkan nilai cookie berdasarkan nama
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null; // Jika cookie tidak ditemukan
}

// Fungsi untuk menampilkan peta
function displayMap() {
  const map = new Map({
    target: "map",
    layers: [basemap, roadsLayer, regionLayer, logicMarkerLayer],
    view: mapView,
  });
}

// Inisialisasi peta dan data
window.addEventListener("DOMContentLoaded", () => {
  displayMap();
  fetchRoads();
  fetchRegion();
});

// Fungsi untuk menangani form pencarian
document.getElementById("search-form").addEventListener("submit", function (event) {
  event.preventDefault();
  
  const maxDistance = document.getElementById("max-distance").value;
  const region = document.getElementById("region").value;
  
  console.log("Max Distance:", maxDistance);
  console.log("Region:", region);
  
  // Implementasi pencarian berdasarkan jarak dan wilayah
  searchNearbyLocations(maxDistance, region);
});

// Fungsi pencarian berdasarkan jarak dan wilayah
function searchNearbyLocations(maxDistance, region) {
  // Lakukan pencarian berdasarkan maxDistance dan region
  console.log("Mencari lokasi dalam jarak:", maxDistance, "km di wilayah:", region);
  // Implementasikan logika pencarian di sini (misalnya memfilter data jalan atau wilayah)
}
