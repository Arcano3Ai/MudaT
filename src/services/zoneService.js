/**
 * Servicio geográfico para el módulo CONOCE LA ZONA.
 * Soporta Google Maps Platform (si se configura API key en tiempo de ejecución)
 * y OpenStreetMap (Overpass API) + OSRM como proveedor abierto de datos reales.
 * Nunca fabrica establecimientos, calificaciones, reseñas ni fotografías.
 */

import { L, getLang } from "./i18n.js";

export const ZONE_CATEGORIES = [
  {
    id: "compras",
    get label() { return L("Compras", "Shopping"); },
    get unitLabel() { return L("establecimientos", "places"); },
    icon: "🛍️",
    color: "#f59e0b",
    googleTypes: ["shopping_mall", "supermarket", "convenience_store", "department_store"],
    osmSelectors: [
      '["shop"="mall"]',
      '["shop"="supermarket"]',
      '["shop"="convenience"]',
      '["shop"="department_store"]'
    ]
  },
  {
    id: "educacion",
    get label() { return L("Educación", "Education"); },
    get unitLabel() { return L("instituciones", "institutions"); },
    icon: "🎓",
    color: "#3b82f6",
    googleTypes: ["school", "primary_school", "secondary_school", "university"],
    osmSelectors: [
      '["amenity"="school"]',
      '["amenity"="college"]',
      '["amenity"="university"]',
      '["amenity"="kindergarten"]'
    ]
  },
  {
    id: "salud",
    get label() { return L("Salud", "Healthcare"); },
    get unitLabel() { return L("centros", "centers"); },
    icon: "🏥",
    color: "#ef4444",
    googleTypes: ["hospital", "clinic", "doctor", "pharmacy"],
    osmSelectors: [
      '["amenity"="hospital"]',
      '["amenity"="clinic"]',
      '["amenity"="doctors"]',
      '["amenity"="pharmacy"]'
    ]
  },
  {
    id: "gastronomia",
    get label() { return L("Gastronomía", "Dining"); },
    get unitLabel() { return L("establecimientos", "places"); },
    icon: "🍽️",
    color: "#ec4899",
    googleTypes: ["restaurant", "cafe", "bar", "bakery"],
    osmSelectors: [
      '["amenity"="restaurant"]',
      '["amenity"="cafe"]',
      '["amenity"="bar"]',
      '["amenity"="fast_food"]'
    ]
  },
  {
    id: "recreacion",
    get label() { return L("Recreación", "Recreation"); },
    get unitLabel() { return L("espacios", "spaces"); },
    icon: "🌳",
    color: "#10b981",
    googleTypes: ["park", "movie_theater", "amusement_park", "tourist_attraction"],
    osmSelectors: [
      '["leisure"="park"]',
      '["leisure"="garden"]',
      '["leisure"="playground"]',
      '["amenity"="cinema"]'
    ]
  },
  {
    id: "deporte",
    get label() { return L("Deporte y bienestar", "Sports & Wellness"); },
    get unitLabel() { return L("centros", "centers"); },
    icon: "🏋️",
    color: "#8b5cf6",
    googleTypes: ["gym", "spa", "stadium"],
    osmSelectors: [
      '["leisure"="fitness_centre"]',
      '["leisure"="sports_centre"]',
      '["sport"="yoga"]',
      '["leisure"="swimming_pool"]'
    ]
  },
  {
    id: "movilidad",
    get label() { return L("Movilidad", "Transit"); },
    get unitLabel() { return L("accesos", "stops"); },
    icon: "🚌",
    color: "#06b6d4",
    googleTypes: ["transit_station", "bus_station", "subway_station", "train_station"],
    osmSelectors: [
      '["highway"="bus_stop"]',
      '["amenity"="bus_station"]',
      '["railway"="station"]',
      '["public_transport"="station"]'
    ]
  },
  {
    id: "servicios",
    get label() { return L("Servicios", "Services"); },
    get unitLabel() { return L("puntos", "locations"); },
    icon: "🏦",
    color: "#64748b",
    googleTypes: ["bank", "atm", "post_office", "police"],
    osmSelectors: [
      '["amenity"="bank"]',
      '["amenity"="atm"]',
      '["amenity"="post_office"]',
      '["amenity"="police"]'
    ]
  }
];

const CACHE_PREFIX = "mudat_zone_cache_v1_";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos
const memoryCache = new Map();
const inFlightRequests = new Map();
const routeCache = new Map();

export function hasValidCoordinates(location) {
  if (!location) return false;
  const lat = Number(location.lat);
  const lng = Number(location.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

export function getGoogleMapsApiKey() {
  if (typeof window !== "undefined" && window.MUDAT_GOOGLE_MAPS_KEY) {
    return String(window.MUDAT_GOOGLE_MAPS_KEY).trim();
  }
  try {
    const stored = localStorage.getItem("mudat_gmaps_key");
    return stored ? stored.trim() : "";
  } catch {
    return "";
  }
}

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function formatDistance(meters) {
  if (!Number.isFinite(meters)) return L("N/D", "N/A");
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs} h ${rem} min` : `${hrs} h`;
}

function readCache(key) {
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.ts < CACHE_TTL_MS) {
    return mem.data;
  }
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Date.now() - parsed.ts < CACHE_TTL_MS) {
      memoryCache.set(key, parsed);
      return parsed.data;
    }
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // Ignorar errores de cuota o JSON inválido
  }
  return null;
}

function writeCache(key, data) {
  const payload = { ts: Date.now(), data };
  memoryCache.set(key, payload);
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
  } catch {
    // Ignorar si localStorage está lleno
  }
}

export function loadGoogleMapsScript(apiKey) {
  if (typeof window === "undefined") return Promise.reject(new Error("Sin entorno navegador"));
  if (window.google?.maps?.places) return Promise.resolve(window.google.maps);

  const existing = document.getElementById("mudat-gmaps-sdk");
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(window.google.maps));
      existing.addEventListener("error", reject);
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "mudat-gmaps-sdk";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=${getLang()}`;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error(L("No se pudo cargar Google Maps Platform", "Could not load Google Maps Platform")));
    document.head.appendChild(script);
  });
}

export function loadLeafletAssets() {
  if (typeof window === "undefined") return Promise.reject(new Error("Sin entorno navegador"));
  if (window.L) return Promise.resolve(window.L);

  if (!document.getElementById("mudat-leaflet-css")) {
    const link = document.createElement("link");
    link.id = "mudat-leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }

  const existing = document.getElementById("mudat-leaflet-js");
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(window.L));
      existing.addEventListener("error", reject);
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "mudat-leaflet-js";
    script.async = true;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error(L("No se pudo cargar el motor cartográfico", "Could not load map engine")));
    document.head.appendChild(script);
  });
}

function classifyOsmElement(tags = {}) {
  if (["mall", "supermarket", "convenience", "department_store"].includes(tags.shop)) {
    return "compras";
  }
  if (["school", "college", "university", "kindergarten"].includes(tags.amenity)) {
    return "educacion";
  }
  if (["hospital", "clinic", "doctors", "pharmacy"].includes(tags.amenity)) {
    return "salud";
  }
  if (["restaurant", "cafe", "bar", "fast_food"].includes(tags.amenity)) {
    return "gastronomia";
  }
  if (
    ["park", "garden", "playground"].includes(tags.leisure) ||
    tags.amenity === "cinema"
  ) {
    return "recreacion";
  }
  if (
    ["fitness_centre", "sports_centre", "swimming_pool"].includes(tags.leisure) ||
    tags.sport === "yoga"
  ) {
    return "deporte";
  }
  if (
    tags.highway === "bus_stop" ||
    tags.amenity === "bus_station" ||
    tags.railway === "station" ||
    tags.public_transport === "station"
  ) {
    return "movilidad";
  }
  if (["bank", "atm", "post_office", "police"].includes(tags.amenity)) {
    return "servicios";
  }
  return null;
}

function formatOsmAddress(tags = {}) {
  const parts = [];
  if (tags["addr:street"]) {
    const num = tags["addr:housenumber"] ? ` ${tags["addr:housenumber"]}` : "";
    parts.push(`${tags["addr:street"]}${num}`);
  }
  if (tags["addr:suburb"] || tags["addr:neighbourhood"]) {
    parts.push(tags["addr:suburb"] || tags["addr:neighbourhood"]);
  }
  if (tags["addr:city"]) {
    parts.push(tags["addr:city"]);
  }
  return parts.length > 0 ? parts.join(", ") : null;
}

function buildOverpassQuery(lat, lng, radiusMeters) {
  return `[out:json][timeout:12];(
    nwr["shop"~"^(mall|supermarket|convenience|department_store)$"](around:${radiusMeters},${lat},${lng});
    nwr["amenity"~"^(school|college|university|kindergarten|hospital|clinic|doctors|pharmacy|restaurant|cafe|bar|fast_food|cinema|bus_station|bank|atm|post_office|police)$"](around:${radiusMeters},${lat},${lng});
    nwr["leisure"~"^(park|garden|playground|fitness_centre|sports_centre|swimming_pool)$"](around:${radiusMeters},${lat},${lng});
    nwr["sport"="yoga"](around:${radiusMeters},${lat},${lng});
    node["highway"="bus_stop"](around:${radiusMeters},${lat},${lng});
    nwr["railway"="station"](around:${radiusMeters},${lat},${lng});
    nwr["public_transport"="station"](around:${radiusMeters},${lat},${lng});
  );out center 150;`;
}

const ARCGIS_CATEGORY_GROUPS = [
  { catId: "compras", categories: "Shopping Center,Supermarket,Grocery,Convenience Store,Department Store" },
  { catId: "educacion", categories: "School,College,University" },
  { catId: "salud", categories: "Hospital,Medical Clinic,Doctor,Pharmacy" },
  { catId: "gastronomia", categories: "Restaurant,Coffee Shop,Bar or Pub,Bakery" },
  { catId: "recreacion", categories: "Park,Cinema,Plaza" },
  { catId: "deporte", categories: "Fitness Center,Sports Complex,Yoga Studio,Gym" },
  { catId: "movilidad", categories: "Bus Station,Metro Station,Train Station,Public Transit" },
  { catId: "servicios", categories: "Bank,ATM,Post Office,Police Station" }
];

async function fetchFromArcGIS(lat, lng, radiusMeters) {
  const latDelta = radiusMeters / 111320;
  const lngDelta = radiusMeters / (111320 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  const searchExtent = `${(lng - lngDelta).toFixed(5)},${(lat - latDelta).toFixed(5)},${(lng + lngDelta).toFixed(5)},${(lat + latDelta).toFixed(5)}`;

  const settled = [];
  const batchSize = 4;

  for (let i = 0; i < ARCGIS_CATEGORY_GROUPS.length; i += batchSize) {
    const batch = ARCGIS_CATEGORY_GROUPS.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (group) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const url =
            `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates` +
            `?f=json&category=${encodeURIComponent(group.categories)}` +
            `&location=${lng},${lat}&searchExtent=${encodeURIComponent(searchExtent)}` +
            `&maxLocations=15&outFields=PlaceName,Place_addr,Type`;
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timer);
          if (!res.ok) return [];
          const data = await res.json();
          return (data.candidates || []).map((c) => ({ catId: group.catId, candidate: c }));
        } catch {
          clearTimeout(timer);
          return [];
        }
      })
    );
    settled.push(...batchResults);
  }

  const seen = new Set();
  const places = [];

  for (const { catId, candidate } of settled.flat()) {
    const attrs = candidate.attributes || {};
    const name = (attrs.PlaceName || candidate.address || "").trim();
    const pLat = Number(candidate.location?.y);
    const pLng = Number(candidate.location?.x);
    if (!name || !Number.isFinite(pLat) || !Number.isFinite(pLng)) continue;

    const distance = haversineDistance(lat, lng, pLat, pLng);
    if (distance > radiusMeters) continue;

    const dedupKey = `${catId}_${name.toLowerCase()}_${pLat.toFixed(4)}_${pLng.toFixed(4)}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    places.push({
      id: `poi-${catId}-${places.length}-${Math.round(pLat * 1e5)}`,
      name,
      category: catId,
      lat: pLat,
      lng: pLng,
      distance,
      address: attrs.Place_addr || null,
      rating: null,
      userRatingsTotal: null,
      reviews: [],
      photoUrl: null,
      source: "arcgis"
    });
  }

  places.sort((a, b) => a.distance - b.distance);
  return {
    provider: "arcgis",
    places,
    fetchedAt: new Date().toISOString()
  };
}

async function fetchFromOverpass(lat, lng, radiusMeters) {
  const arcgisResult = await fetchFromArcGIS(lat, lng, radiusMeters);
  if (arcgisResult.places.length > 0) {
    return arcgisResult;
  }

  const query = buildOverpassQuery(lat, lng, radiusMeters);
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      const seen = new Set();
      const places = [];

      for (const el of json.elements || []) {
        const tags = el.tags || {};
        const name = (tags.name || tags.brand || tags.operator || "").trim();
        if (!name) continue;

        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon ?? el.center?.lon;
        if (!Number.isFinite(elLat) || !Number.isFinite(elLng)) continue;

        const category = classifyOsmElement(tags);
        if (!category) continue;

        const dedupKey = `${category}_${name.toLowerCase()}_${elLat.toFixed(4)}_${elLng.toFixed(4)}`;
        if (seen.has(dedupKey)) continue;
        seen.add(dedupKey);

        places.push({
          id: `osm-${el.type}-${el.id}`,
          name,
          category,
          lat: elLat,
          lng: elLng,
          distance: haversineDistance(lat, lng, elLat, elLng),
          address: formatOsmAddress(tags),
          rating: null,
          userRatingsTotal: null,
          reviews: [],
          photoUrl: null,
          source: "osm"
        });
      }

      if (places.length > 0) {
        places.sort((a, b) => a.distance - b.distance);
        return {
          provider: "osm",
          places,
          fetchedAt: new Date().toISOString()
        };
      }
    } catch {
      // Continuar al siguiente endpoint
    }
  }

  return arcgisResult;
}

async function fetchFromGooglePlaces(lat, lng, radiusMeters, apiKey) {
  const maps = await loadGoogleMapsScript(apiKey);
  const dummyDiv = document.createElement("div");
  const service = new maps.places.PlacesService(dummyDiv);
  const center = new maps.LatLng(lat, lng);

  const searchCategory = (cat) =>
    new Promise((resolve) => {
      service.nearbySearch(
        {
          location: center,
          radius: radiusMeters,
          type: cat.googleTypes[0]
        },
        (results, status) => {
          if (status !== maps.places.PlacesServiceStatus.OK || !Array.isArray(results)) {
            resolve([]);
            return;
          }
          resolve(
            results.map((r) => {
              const pLat = r.geometry.location.lat();
              const pLng = r.geometry.location.lng();
              return {
                id: r.place_id,
                placeId: r.place_id,
                name: r.name,
                category: cat.id,
                lat: pLat,
                lng: pLng,
                distance: haversineDistance(lat, lng, pLat, pLng),
                address: r.vicinity || null,
                rating: typeof r.rating === "number" ? r.rating : null,
                userRatingsTotal: typeof r.user_ratings_total === "number" ? r.user_ratings_total : null,
                reviews: [],
                photoUrl: r.photos?.[0] ? r.photos[0].getUrl({ maxWidth: 640 }) : null,
                source: "google"
              };
            })
          );
        }
      );
    });

  const chunks = await Promise.all(ZONE_CATEGORIES.map((cat) => searchCategory(cat)));
  const seen = new Set();
  const places = [];
  for (const item of chunks.flat()) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    places.push(item);
  }
  places.sort((a, b) => a.distance - b.distance);

  return {
    provider: "google",
    places,
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Obtiene las amenidades cercanas para una propiedad con caché y deduplicación.
 */
export async function fetchZoneAmenities(prop, radiusMeters = 1500) {
  if (!hasValidCoordinates(prop?.location)) {
    throw new Error("INVALID_COORDINATES");
  }

  const lat = Number(prop.location.lat);
  const lng = Number(prop.location.lng);
  const cacheKey = `${prop.id}_${lat.toFixed(5)}_${lng.toFixed(5)}_${radiusMeters}`;

  const cached = readCache(cacheKey);
  if (cached) return cached;

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const apiKey = getGoogleMapsApiKey();
  const requestPromise = (async () => {
    try {
      const result = apiKey
        ? await fetchFromGooglePlaces(lat, lng, radiusMeters, apiKey)
        : await fetchFromOverpass(lat, lng, radiusMeters);
      if (result.places.length > 0) {
        writeCache(cacheKey, result);
      }
      return result;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

async function queryOsrmRoute(profile, origin, dest) {
  const url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;
    return {
      durationSec: route.duration,
      distanceMeters: route.distance,
      coordinates: route.geometry?.coordinates || null
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Consulta detalles adicionales (si Google está activo) y tiempos/rutas reales desde la propiedad.
 */
export async function fetchPlaceDetailsAndRoutes(origin, place) {
  const key = `${origin.lat.toFixed(5)},${origin.lng.toFixed(5)}->${place.id}`;
  if (routeCache.has(key)) return routeCache.get(key);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${place.lat},${place.lng}`;

  if (place.source === "google" && window.google?.maps) {
    const maps = window.google.maps;
    const dummyDiv = document.createElement("div");
    const placesService = new maps.places.PlacesService(dummyDiv);
    const matrixService = new maps.DistanceMatrixService();
    const originLatLng = new maps.LatLng(origin.lat, origin.lng);
    const destLatLng = new maps.LatLng(place.lat, place.lng);

    const detailsPromise = new Promise((resolve) => {
      placesService.getDetails(
        {
          placeId: place.placeId,
          fields: ["formatted_address", "rating", "user_ratings_total", "reviews", "photos"]
        },
        (detail, status) => {
          if (status !== maps.places.PlacesServiceStatus.OK || !detail) {
            resolve({});
            return;
          }
          resolve({
            address: detail.formatted_address || place.address,
            rating: typeof detail.rating === "number" ? detail.rating : place.rating,
            userRatingsTotal:
              typeof detail.user_ratings_total === "number"
                ? detail.user_ratings_total
                : place.userRatingsTotal,
            reviews: Array.isArray(detail.reviews)
              ? detail.reviews.slice(0, 2).map((rv) => ({
                  author: rv.author_name,
                  rating: rv.rating,
                  text: rv.text,
                  time: rv.relative_time_description
                }))
              : [],
            photoUrl: detail.photos?.[0]
              ? detail.photos[0].getUrl({ maxWidth: 640 })
              : place.photoUrl
          });
        }
      );
    });

    const queryMode = (travelMode) =>
      new Promise((resolve) => {
        matrixService.getDistanceMatrix(
          {
            origins: [originLatLng],
            destinations: [destLatLng],
            travelMode
          },
          (resp, status) => {
            const el = resp?.rows?.[0]?.elements?.[0];
            if (status === "OK" && el?.status === "OK") {
              resolve({
                durationText: el.duration.text,
                distanceText: el.distance.text
              });
            } else {
              resolve(null);
            }
          }
        );
      });

    const [details, walking, driving, transit] = await Promise.all([
      detailsPromise,
      queryMode(maps.TravelMode.WALKING),
      queryMode(maps.TravelMode.DRIVING),
      queryMode(maps.TravelMode.TRANSIT)
    ]);

    const result = {
      details,
      routes: {
        walking,
        driving,
        transit,
        geometry: null
      },
      directionsUrl
    };
    routeCache.set(key, result);
    return result;
  }

  // Modo abierto real: OSRM para caminata y automóvil
  const [footRoute, carRoute] = await Promise.all([
    queryOsrmRoute("foot", origin, place),
    queryOsrmRoute("driving", origin, place)
  ]);

  const result = {
    details: {},
    routes: {
      walking: footRoute
        ? {
            durationText: formatDuration(footRoute.durationSec),
            distanceText: formatDistance(footRoute.distanceMeters)
          }
        : null,
      driving: carRoute
        ? {
            durationText: formatDuration(carRoute.durationSec),
            distanceText: formatDistance(carRoute.distanceMeters)
          }
        : null,
      transit: null,
      geometry: footRoute?.coordinates || carRoute?.coordinates || null
    },
    directionsUrl
  };

  routeCache.set(key, result);
  return result;
}

