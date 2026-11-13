import {
  ZONE_CATEGORIES,
  hasValidCoordinates,
  getGoogleMapsApiKey,
  loadGoogleMapsScript,
  loadLeafletAssets,
  fetchZoneAmenities,
  fetchPlaceDetailsAndRoutes,
  formatDistance
} from "../services/zoneService.js";
import { calculateConvenienceIndex } from "../services/convenienceScore.js";
import { L } from "../services/i18n.js";

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderConoceLaZonaShell() {
  return `
    <section class="conoce-zona-section" id="conoce-la-zona" aria-label="${L("Conoce la zona", "Explore the area")}">
      <div class="conoce-zona-header">
        <div class="conoce-zona-title-wrap">
          <span class="conoce-zona-eyebrow">${L("Entorno y servicios", "Surroundings & Services")}</span>
          <h2 class="conoce-zona-title">${L("CONOCE LA ZONA", "EXPLORE THE AREA")}</h2>
          <p class="conoce-zona-subtitle">${L("Descubre todo lo que tienes cerca", "Discover everything nearby")}</p>
        </div>
        <div class="conoce-zona-radius-wrap" id="cz-radius-controls">
          <span class="cz-radius-label">${L("Radio de exploración:", "Search radius:")}</span>
          <div class="cz-radius-pills" role="group" aria-label="${L("Radio de exploración", "Search radius")}">
            <button type="button" class="cz-radius-btn" data-radius="500">500 m</button>
            <button type="button" class="cz-radius-btn" data-radius="1000">1 km</button>
            <button type="button" class="cz-radius-btn active" data-radius="1500">1.5 km</button>
            <button type="button" class="cz-radius-btn" data-radius="2000">2 km</button>
          </div>
        </div>
      </div>

      <div id="cz-dynamic-root">
        <div class="cz-loading-state">
          <div class="cz-spinner"></div>
          <p>${L("Explorando comercios, escuelas, salud y servicios cercanos...", "Exploring nearby shops, schools, healthcare, and services...")}</p>
        </div>
      </div>
    </section>
  `;
}

export async function initConoceLaZona(prop) {
  const root = document.getElementById("cz-dynamic-root");
  const radiusControls = document.getElementById("cz-radius-controls");
  if (!root) return;

  if (!hasValidCoordinates(prop?.location)) {
    if (radiusControls) radiusControls.style.display = "none";
    root.innerHTML = `
      <div class="cz-unavailable-card">
        <div class="cz-unavailable-icon">📍</div>
        <h3>${L("Ubicación en proceso de verificación", "Location under verification")}</h3>
        <p>${L("La ubicación geográfica de esta propiedad todavía no está disponible.", "The geographic location of this property is not yet available.")}</p>
      </div>
    `;
    return;
  }

  const origin = {
    lat: Number(prop.location.lat),
    lng: Number(prop.location.lng)
  };

  let currentRadius = 1500;
  let allPlaces = [];
  let activeCategories = new Set(ZONE_CATEGORIES.map((c) => c.id));
  let selectedPlace = null;
  let mapAdapter = null;
  let providerName = "osm";

  function renderMainLayout() {
    root.innerHTML = `
      <div class="cz-filters-bar" id="cz-filters-bar" role="group" aria-label="${L("Filtros por categoría", "Category filters")}"></div>

      <div class="cz-workspace-grid">
        <div class="cz-map-column">
          <div class="cz-map-card">
            <div id="cz-map-canvas" class="cz-map-canvas" aria-label="${L("Mapa interactivo de la zona", "Interactive area map")}"></div>
            <button type="button" class="cz-recenter-btn" id="cz-recenter-btn" title="${L("Centrar en la propiedad", "Center on property")}">
              ⌖ ${L("Centrar propiedad", "Center property")}
            </button>
            <div class="cz-map-attribution" id="cz-map-attribution"></div>
          </div>

          <div id="cz-place-detail-host"></div>
        </div>

        <aside class="cz-sidebar-panel" aria-label="${L("Amenidades cercanas", "Nearby amenities")}">
          <div class="cz-sidebar-header">
            <div>
              <h3>${L("Amenidades cercanas", "Nearby amenities")}</h3>
              <p id="cz-sidebar-subtitle" class="cz-sidebar-subtitle">${L("Ordenadas por proximidad", "Sorted by proximity")}</p>
            </div>
            <span class="cz-total-badge" id="cz-total-badge">0</span>
          </div>

          <div class="cz-category-summary" id="cz-category-summary"></div>
          <div class="cz-places-list" id="cz-places-list"></div>
        </aside>
      </div>

      <div class="cz-convenience-card" id="cz-convenience-card"></div>
    `;

    const recenterBtn = document.getElementById("cz-recenter-btn");
    if (recenterBtn) {
      recenterBtn.addEventListener("click", () => {
        mapAdapter?.recenter();
      });
    }
  }

  async function initMapEngine() {
    const canvas = document.getElementById("cz-map-canvas");
    const attrEl = document.getElementById("cz-map-attribution");
    if (!canvas) return null;

    const apiKey = getGoogleMapsApiKey();

    if (apiKey) {
      try {
        const maps = await loadGoogleMapsScript(apiKey);
        const map = new maps.Map(canvas, {
          center: origin,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });

        const propMarker = new maps.Marker({
          position: origin,
          map,
          title: prop.title || L("Propiedad", "Property"),
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 11,
            fillColor: "#c5a059",
            fillOpacity: 1,
            strokeColor: "#111827",
            strokeWeight: 3
          },
          zIndex: 999
        });

        let circle = new maps.Circle({
          map,
          center: origin,
          radius: currentRadius,
          fillColor: "#c5a059",
          fillOpacity: 0.08,
          strokeColor: "#c5a059",
          strokeOpacity: 0.45,
          strokeWeight: 1.5
        });

        let poiMarkers = [];
        let routeLine = null;

        if (attrEl) attrEl.textContent = L("Datos cartográficos vía Google Maps Platform", "Map data via Google Maps Platform");

        return {
          recenter() {
            map.panTo(origin);
            map.setZoom(15);
          },
          setRadius(r) {
            circle.setRadius(r);
            const bounds = circle.getBounds();
            if (bounds) map.fitBounds(bounds);
          },
          focusPlace(place) {
            map.panTo({ lat: place.lat, lng: place.lng });
            if (map.getZoom() < 16) map.setZoom(16);
          },
          drawRoute(coords) {
            if (routeLine) {
              routeLine.setMap(null);
              routeLine = null;
            }
            if (!Array.isArray(coords) || coords.length === 0) return;
            routeLine = new maps.Polyline({
              path: coords.map(([lng, lat]) => ({ lat, lng })),
              geodesic: true,
              strokeColor: "#c5a059",
              strokeOpacity: 0.9,
              strokeWeight: 4,
              map
            });
          },
          clearRoute() {
            if (routeLine) {
              routeLine.setMap(null);
              routeLine = null;
            }
          },
          updateMarkers(places, onSelect) {
            poiMarkers.forEach((m) => m.setMap(null));
            poiMarkers = [];
            for (const p of places) {
              const cat = ZONE_CATEGORIES.find((c) => c.id === p.category);
              const marker = new maps.Marker({
                position: { lat: p.lat, lng: p.lng },
                map,
                title: p.name,
                icon: {
                  path: maps.SymbolPath.CIRCLE,
                  scale: selectedPlace?.id === p.id ? 9 : 7,
                  fillColor: cat?.color || "#c5a059",
                  fillOpacity: 0.95,
                  strokeColor: "#ffffff",
                  strokeWeight: 2
                }
              });
              marker.addListener("click", () => onSelect(p));
              poiMarkers.push(marker);
            }
          },
          destroy() {
            propMarker.setMap(null);
            circle.setMap(null);
            poiMarkers.forEach((m) => m.setMap(null));
          }
        };
      } catch {
        // Fallback a Leaflet si falla Google Maps
      }
    }

    // Motor cartográfico abierto Leaflet + OpenStreetMap
    const Leaflet = await loadLeafletAssets();
    const map = Leaflet.map(canvas, {
      center: [origin.lat, origin.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false
    });

    Leaflet.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);

    const propIcon = Leaflet.divIcon({
      className: "cz-leaflet-prop-icon",
      html: `<div class="cz-prop-pin"><span>🏠</span></div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    Leaflet.marker([origin.lat, origin.lng], { icon: propIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindTooltip(escapeHtml(prop.title || L("Propiedad seleccionada", "Selected property")), { direction: "top" });

    const circle = Leaflet.circle([origin.lat, origin.lng], {
      radius: currentRadius,
      color: "#c5a059",
      weight: 1.5,
      opacity: 0.65,
      fillColor: "#c5a059",
      fillOpacity: 0.08
    }).addTo(map);

    const markersLayer = Leaflet.layerGroup().addTo(map);
    let routeLayer = null;

    if (attrEl) attrEl.textContent = L("Mapa interactivo con datos geográficos reales", "Interactive map with real geographic data");

    setTimeout(() => map.invalidateSize(), 150);

    return {
      recenter() {
        map.setView([origin.lat, origin.lng], 15, { animate: true });
      },
      setRadius(r) {
        circle.setRadius(r);
        map.fitBounds(circle.getBounds(), { padding: [20, 20] });
      },
      focusPlace(place) {
        map.setView([place.lat, place.lng], Math.max(map.getZoom(), 16), { animate: true });
      },
      drawRoute(coords) {
        if (routeLayer) {
          map.removeLayer(routeLayer);
          routeLayer = null;
        }
        if (!Array.isArray(coords) || coords.length === 0) return;
        const latLngs = coords.map(([lng, lat]) => [lat, lng]);
        routeLayer = Leaflet.polyline(latLngs, {
          color: "#c5a059",
          weight: 4,
          opacity: 0.9,
          dashArray: "6, 6"
        }).addTo(map);
      },
      clearRoute() {
        if (routeLayer) {
          map.removeLayer(routeLayer);
          routeLayer = null;
        }
      },
      updateMarkers(places, onSelect) {
        markersLayer.clearLayers();
        for (const p of places) {
          const cat = ZONE_CATEGORIES.find((c) => c.id === p.category);
          const isSelected = selectedPlace?.id === p.id;
          const icon = Leaflet.divIcon({
            className: "cz-leaflet-poi-icon",
            html: `<div class="cz-poi-pin ${isSelected ? "selected" : ""}" style="--cat-color:${cat?.color || "#c5a059"}"><span>${cat?.icon || "📍"}</span></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });
          const marker = Leaflet.marker([p.lat, p.lng], { icon });
          marker.bindTooltip(`${escapeHtml(p.name)} (${formatDistance(p.distance)})`, { direction: "top" });
          marker.on("click", () => onSelect(p));
          marker.addTo(markersLayer);
        }
      },
      destroy() {
        map.remove();
      }
    };
  }

  function getFilteredPlaces() {
    return allPlaces.filter((p) => activeCategories.has(p.category));
  }

  function renderFilters() {
    const bar = document.getElementById("cz-filters-bar");
    if (!bar) return;

    const counts = {};
    for (const cat of ZONE_CATEGORIES) counts[cat.id] = 0;
    for (const p of allPlaces) counts[p.category] = (counts[p.category] || 0) + 1;

    const allActive = activeCategories.size === ZONE_CATEGORIES.length;

    bar.innerHTML = `
      <button type="button" class="cz-filter-pill ${allActive ? "active" : ""}" data-cat="all">
        <span>✨</span>
        <span>${L("Todas", "All")}</span>
        <span class="cz-pill-count">${allPlaces.length}</span>
      </button>
      ${ZONE_CATEGORIES.map((cat) => {
        const isOn = activeCategories.has(cat.id);
        return `
          <button
            type="button"
            class="cz-filter-pill ${isOn ? "active" : ""}"
            data-cat="${cat.id}"
            style="--cat-color: ${cat.color}"
          >
            <span>${cat.icon}</span>
            <span>${cat.label}</span>
            <span class="cz-pill-count">${counts[cat.id] || 0}</span>
          </button>
        `;
      }).join("")}
    `;

    bar.querySelectorAll(".cz-filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const catId = btn.dataset.cat;
        if (catId === "all") {
          if (activeCategories.size === ZONE_CATEGORIES.length) {
            activeCategories.clear();
          } else {
            activeCategories = new Set(ZONE_CATEGORIES.map((c) => c.id));
          }
        } else {
          if (activeCategories.has(catId)) {
            activeCategories.delete(catId);
          } else {
            activeCategories.add(catId);
          }
        }
        if (selectedPlace && !activeCategories.has(selectedPlace.category)) {
          selectedPlace = null;
          mapAdapter?.clearRoute();
          renderPlaceDetail(null);
        }
        updateUI();
      });
    });
  }

  function renderSidebar() {
    const summaryEl = document.getElementById("cz-category-summary");
    const listEl = document.getElementById("cz-places-list");
    const badgeEl = document.getElementById("cz-total-badge");
    if (!summaryEl || !listEl || !badgeEl) return;

    const filtered = getFilteredPlaces();
    badgeEl.textContent = String(filtered.length);

    const counts = {};
    for (const cat of ZONE_CATEGORIES) counts[cat.id] = 0;
    for (const p of allPlaces) counts[p.category] = (counts[p.category] || 0) + 1;

    summaryEl.innerHTML = ZONE_CATEGORIES.filter((c) => counts[c.id] > 0)
      .map(
        (c) => `
          <div class="cz-summary-chip" data-cat="${c.id}">
            <span>${c.icon}</span>
            <span><strong>${c.label}:</strong> ${counts[c.id]} ${c.unitLabel}</span>
          </div>
        `
      )
      .join("");

    summaryEl.querySelectorAll(".cz-summary-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const catId = chip.dataset.cat;
        activeCategories = new Set([catId]);
        updateUI();
      });
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="cz-empty-list">
          <p>${L("No hay establecimientos visibles con los filtros actuales o dentro de este radio.", "No places visible with the current filters or within this radius.")}</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered
      .slice(0, 60)
      .map((place) => {
        const cat = ZONE_CATEGORIES.find((c) => c.id === place.category);
        const isSelected = selectedPlace?.id === place.id;
        return `
          <button
            type="button"
            class="cz-place-item ${isSelected ? "selected" : ""}"
            data-place-id="${escapeHtml(place.id)}"
          >
            <div class="cz-place-icon" style="background: ${cat?.color || "#c5a059"}20; color: ${cat?.color || "#c5a059"}">
              ${cat?.icon || "📍"}
            </div>
            <div class="cz-place-info">
              <div class="cz-place-name">${escapeHtml(place.name)}</div>
              <div class="cz-place-meta">
                <span>${escapeHtml(cat?.label || "")}</span>
                ${place.rating ? `<span>• ⭐ ${place.rating.toFixed(1)}</span>` : ""}
              </div>
            </div>
            <div class="cz-place-dist">${formatDistance(place.distance)}</div>
          </button>
        `;
      })
      .join("");

    listEl.querySelectorAll(".cz-place-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.placeId;
        const found = allPlaces.find((p) => p.id === id);
        if (found) selectPlace(found);
      });
    });
  }

  async function renderPlaceDetail(place, loading = false, enriched = null) {
    const host = document.getElementById("cz-place-detail-host");
    if (!host) return;
    if (!place) {
      host.innerHTML = "";
      return;
    }

    const cat = ZONE_CATEGORIES.find((c) => c.id === place.category);
    const merged = {
      ...place,
      ...(enriched?.details || {})
    };
    const routes = enriched?.routes || {};
    const directionsUrl =
      enriched?.directionsUrl ||
      `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${place.lat},${place.lng}`;

    host.innerHTML = `
      <div class="cz-detail-card">
        <div class="cz-detail-top">
          <div class="cz-detail-heading">
            <span class="cz-detail-cat-badge" style="border-color: ${cat?.color || "#c5a059"}55; color: ${cat?.color || "#c5a059"}">
              ${cat?.icon || "📍"} ${escapeHtml(cat?.label || L("Lugar", "Place"))}
            </span>
            <h3 class="cz-detail-title">${escapeHtml(merged.name)}</h3>
            <p class="cz-detail-distance">${L(`A ${formatDistance(merged.distance)} de la propiedad`, `${formatDistance(merged.distance)} from the property`)}</p>
          </div>
          <button type="button" class="cz-detail-close" id="cz-detail-close" aria-label="${L("Cerrar tarjeta", "Close card")}">✕</button>
        </div>

        ${
          merged.photoUrl
            ? `<div class="cz-detail-photo"><img src="${escapeHtml(merged.photoUrl)}" alt="${escapeHtml(merged.name)}" loading="lazy" /></div>`
            : ""
        }

        <div class="cz-detail-meta-grid">
          ${
            merged.address
              ? `<div class="cz-meta-row"><strong>${L("Dirección:", "Address:")}</strong> <span>${escapeHtml(merged.address)}</span></div>`
              : ""
          }
          ${
            typeof merged.rating === "number"
              ? `<div class="cz-meta-row"><strong>${L("Calificación:", "Rating:")}</strong> <span>⭐ ${merged.rating.toFixed(1)}${merged.userRatingsTotal ? ` (${merged.userRatingsTotal} ${L("reseñas", "reviews")})` : ""}</span></div>`
              : ""
          }
        </div>

        <div class="cz-travel-times">
          <div class="cz-travel-title">${L("Tiempos estimados de traslado", "Estimated travel times")}</div>
          ${
            loading
              ? `<p class="cz-travel-loading">${L("Calculando rutas reales...", "Calculating real routes...")}</p>`
              : `
                <div class="cz-travel-grid">
                  <div class="cz-travel-box">
                    <span class="cz-travel-icon">🚶</span>
                    <span class="cz-travel-mode">${L("Caminando", "Walking")}</span>
                    <strong>${routes.walking?.durationText || L("No disponible", "Unavailable")}</strong>
                    ${routes.walking?.distanceText ? `<small>${routes.walking.distanceText}</small>` : ""}
                  </div>
                  <div class="cz-travel-box">
                    <span class="cz-travel-icon">🚗</span>
                    <span class="cz-travel-mode">${L("Automóvil", "Driving")}</span>
                    <strong>${routes.driving?.durationText || L("No disponible", "Unavailable")}</strong>
                    ${routes.driving?.distanceText ? `<small>${routes.driving.distanceText}</small>` : ""}
                  </div>
                  ${
                    routes.transit?.durationText
                      ? `
                        <div class="cz-travel-box">
                          <span class="cz-travel-icon">🚌</span>
                          <span class="cz-travel-mode">${L("Transporte público", "Public transit")}</span>
                          <strong>${routes.transit.durationText}</strong>
                          ${routes.transit.distanceText ? `<small>${routes.transit.distanceText}</small>` : ""}
                        </div>
                      `
                      : ""
                  }
                </div>
              `
          }
        </div>

        ${
          Array.isArray(merged.reviews) && merged.reviews.length > 0
            ? `
              <div class="cz-detail-reviews">
                <div class="cz-travel-title">${L("Reseñas destacadas", "Featured reviews")}</div>
                ${merged.reviews
                  .map(
                    (rv) => `
                      <blockquote class="cz-review-item">
                        <div class="cz-review-head">
                          <strong>${escapeHtml(rv.author || L("Usuario", "User"))}</strong>
                          <span>⭐ ${rv.rating ?? ""} ${rv.time ? `• ${escapeHtml(rv.time)}` : ""}</span>
                        </div>
                        <p>${escapeHtml(rv.text || "")}</p>
                      </blockquote>
                    `
                  )
                  .join("")}
              </div>
            `
            : ""
        }

        <div class="cz-detail-actions">
          <a href="${escapeHtml(directionsUrl)}" target="_blank" rel="noopener noreferrer" class="cz-directions-btn">
            🧭 ${L("Obtener indicaciones", "Get directions")}
          </a>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById("cz-detail-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        selectedPlace = null;
        mapAdapter?.clearRoute();
        mapAdapter?.updateMarkers(getFilteredPlaces(), selectPlace);
        renderSidebar();
        renderPlaceDetail(null);
      });
    }
  }

  async function selectPlace(place) {
    selectedPlace = place;
    mapAdapter?.focusPlace(place);
    mapAdapter?.updateMarkers(getFilteredPlaces(), selectPlace);
    renderSidebar();
    await renderPlaceDetail(place, true, null);

    try {
      const enriched = await fetchPlaceDetailsAndRoutes(origin, place);
      if (selectedPlace?.id !== place.id) return;
      if (enriched.routes?.geometry) {
        mapAdapter?.drawRoute(enriched.routes.geometry);
      } else {
        mapAdapter?.clearRoute();
      }
      await renderPlaceDetail(place, false, enriched);
    } catch {
      if (selectedPlace?.id === place.id) {
        await renderPlaceDetail(place, false, null);
      }
    }
  }

  function renderConvenienceCard() {
    const el = document.getElementById("cz-convenience-card");
    if (!el) return;

    const scoreData = calculateConvenienceIndex(allPlaces, currentRadius);

    el.innerHTML = `
      <div class="cz-conv-header">
        <div class="cz-conv-score-ring" style="--score-pct: ${scoreData.overall}%">
          <div class="cz-conv-score-inner">
            <span class="cz-conv-number">${scoreData.overall}</span>
            <span class="cz-conv-max">/100</span>
          </div>
        </div>
        <div class="cz-conv-intro">
          <div class="cz-conv-title-row">
            <h3>${L("Índice de Conveniencia de la Ubicación", "Location Convenience Index")}</h3>
            <span class="cz-conv-tier">${escapeHtml(scoreData.tierLabel)}</span>
          </div>
          <p class="cz-conv-desc">
            ${L(
              `Evaluación propia de MudaT calculada con <strong>${scoreData.totalPlaces}</strong> lugares reales encontrados en un radio de ${formatDistance(currentRadius)} (${scoreData.coveredCategories} de ${scoreData.totalCategories} categorías cubiertas).`,
              `MudaT's proprietary score calculated from <strong>${scoreData.totalPlaces}</strong> real places found within a ${formatDistance(currentRadius)} radius (${scoreData.coveredCategories} of ${scoreData.totalCategories} categories covered).`
            )}
          </p>
          ${
            scoreData.isLimited
              ? `<div class="cz-limited-alert">⚠️ ${L("Evaluación limitada: se detectaron pocos registros cartográficos en este radio; prueba ampliar el radio de exploración.", "Limited evaluation: few map records were detected within this radius; try expanding the search radius.")}</div>`
              : ""
          }
        </div>
      </div>

      <div class="cz-conv-bars">
        ${Object.values(scoreData.categories || {})
          .map(
            (c) => `
              <div class="cz-conv-bar-item">
                <div class="cz-conv-bar-label">
                  <span>${escapeHtml(c.label)}</span>
                  <span>${c.score}/100 <small>(${c.count})</small></span>
                </div>
                <div class="cz-conv-track">
                  <div class="cz-conv-fill" style="width: ${c.score}%"></div>
                </div>
              </div>
            `
          )
          .join("")}
      </div>

      <details class="cz-conv-methodology">
        <summary>${L("¿Cómo se obtiene esta puntuación?", "How is this score calculated?")}</summary>
        <p>
          ${L(
            "El índice combina tres criterios objetivos: <strong>Disponibilidad (40%)</strong> según la cantidad de servicios cercanos por categoría, <strong>Proximidad (35%)</strong> según la cercanía real del establecimiento más próximo de cada rubro, y <strong>Diversidad (25%)</strong> según cuántas categorías distintas existen en el radio seleccionado.",
            "The index combines three objective criteria: <strong>Availability (40%)</strong> based on the number of nearby services per category, <strong>Proximity (35%)</strong> based on the actual distance to the nearest place in each category, and <strong>Diversity (25%)</strong> based on how many distinct categories exist within the selected radius."
          )}
        </p>
        <p class="cz-conv-disclaimer">
          ${L(
            "Nota: Este indicador es una referencia informativa propia de MudaT basada en datos geográficos abiertos y no constituye una calificación oficial de Google ni una certificación inmobiliaria oficial.",
            "Note: This indicator is MudaT's own informational reference based on open geographic data and does not constitute an official Google rating or an official real estate certification."
          )}
        </p>
      </details>
    `;
  }

  function updateUI() {
    renderFilters();
    renderSidebar();
    mapAdapter?.updateMarkers(getFilteredPlaces(), selectPlace);
  }

  async function loadZoneData() {
    try {
      const result = await fetchZoneAmenities(prop, currentRadius);
      providerName = result.provider;
      allPlaces = result.places || [];
      updateUI();
      renderConvenienceCard();
    } catch {
      const listEl = document.getElementById("cz-places-list");
      if (listEl) {
        listEl.innerHTML = `
          <div class="cz-empty-list">
            <p>${L("No fue posible obtener los establecimientos cercanos en este momento. Intenta nuevamente en unos segundos.", "Could not load nearby places right now. Please try again in a few seconds.")}</p>
          </div>
        `;
      }
      renderConvenienceCard();
    }
  }

  renderMainLayout();
  mapAdapter = await initMapEngine();
  await loadZoneData();

  if (radiusControls) {
    radiusControls.querySelectorAll(".cz-radius-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const nextRadius = Number(btn.dataset.radius);
        if (!nextRadius || nextRadius === currentRadius) return;
        currentRadius = nextRadius;

        radiusControls.querySelectorAll(".cz-radius-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        selectedPlace = null;
        mapAdapter?.clearRoute();
        renderPlaceDetail(null);
        mapAdapter?.setRadius(currentRadius);
        await loadZoneData();
      });
    });
  }
}

