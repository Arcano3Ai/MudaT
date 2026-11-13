import { updateUserProfile } from "../services/auth.js?v=20261120";
import { renderPropertyCard } from "../components/PropertyCard.js";
import { L, tCategory, formatCurrency } from "../services/i18n.js";

export async function renderSearch(state) {
  const html = `
    <div class="search-split-container">
      
      <!-- Panel Izquierdo: Filtros y Lista de Propiedades -->
      <div class="search-results-panel">
        
        <!-- Barra de Filtros Avanzados -->
        <div class="advanced-filters-bar glass-premium glow-brand fade-in">
          <h3 class="filters-bar-title">
            <i data-lucide="sliders-horizontal" class="icon-inline icon-lg color-brand"></i>
            ${L("Filtros Avanzados", "Advanced Filters")}
          </h3>
          
          <div class="filters-row">
            <div class="filter-group">
              <label>${L("Categoría", "Category")}</label>
              <select class="filter-select" id="filter-category">
                <option value="Comprar" ${state.searchFilters.category === "Comprar" ? "selected" : ""}>${tCategory("Comprar")}</option>
                <option value="Rentar" ${state.searchFilters.category === "Rentar" ? "selected" : ""}>${tCategory("Rentar")}</option>
                <option value="Preventa" ${state.searchFilters.category === "Preventa" ? "selected" : ""}>${tCategory("Preventa")}</option>
                <option value="Terrenos" ${state.searchFilters.category === "Terrenos" ? "selected" : ""}>${tCategory("Terrenos")}</option>
                <option value="Oficinas" ${state.searchFilters.category === "Oficinas" ? "selected" : ""}>${tCategory("Oficinas")}</option>
                <option value="Locales" ${state.searchFilters.category === "Locales" ? "selected" : ""}>${tCategory("Locales")}</option>
                <option value="Bodegas" ${state.searchFilters.category === "Bodegas" ? "selected" : ""}>${tCategory("Bodegas")}</option>
                <option value="Industrial" ${state.searchFilters.category === "Industrial" ? "selected" : ""}>${tCategory("Industrial")}</option>
              </select>
            </div>

            <div class="filter-group">
              <label>${L("Ciudad", "City")}</label>
              <select class="filter-select" id="filter-city">
                <option value="">${L("Todas", "All")}</option>
                <option value="CDMX" ${state.searchFilters.city === "CDMX" ? "selected" : ""}>CDMX</option>
                <option value="San Pedro" ${state.searchFilters.city === "San Pedro" ? "selected" : ""}>San Pedro (MTY)</option>
                <option value="Guadalajara" ${state.searchFilters.city === "Guadalajara" ? "selected" : ""}>Guadalajara</option>
                <option value="Tulum" ${state.searchFilters.city === "Tulum" ? "selected" : ""}>Tulum</option>
                <option value="Querétaro" ${state.searchFilters.city === "Querétaro" ? "selected" : ""}>Querétaro</option>
              </select>
            </div>

            <div class="filter-group">
              <label>${L("Precio Máximo", "Max Price")}</label>
              <input type="number" class="filter-input" id="filter-price-max" placeholder="${L("Ej. 10,000,000", "e.g. 10,000,000")}" value="${state.searchFilters.budget || ''}">
            </div>

            <div class="filter-group">
              <label>${L("Recámaras", "Bedrooms")}</label>
              <select class="filter-select" id="filter-bedrooms">
                <option value="">${L("Cualquiera", "Any")}</option>
                <option value="1" ${state.searchFilters.rooms === "1" ? "selected" : ""}>1+</option>
                <option value="2" ${state.searchFilters.rooms === "2" ? "selected" : ""}>2+</option>
                <option value="3" ${state.searchFilters.rooms === "3" ? "selected" : ""}>3+</option>
                <option value="4" ${state.searchFilters.rooms === "4" ? "selected" : ""}>4+</option>
              </select>
            </div>

            <div class="filter-group">
              <label>${L("Baños", "Bathrooms")}</label>
              <select class="filter-select" id="filter-bathrooms">
                <option value="">${L("Cualquiera", "Any")}</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          <!-- Filtros de Amenidades y Cercanías (Checkboxes) -->
          <div class="checkbox-filters">
            <label class="checkbox-label"><input type="checkbox" class="amenity-cb" value="Alberca"> <span>${L("Alberca", "Pool")} 🏊‍♂️</span></label>
            <label class="checkbox-label"><input type="checkbox" class="amenity-cb" value="Seguridad 24/7"> <span>${L("Seguridad", "Security")} 🛡️</span></label>
            <label class="checkbox-label"><input type="checkbox" class="amenity-cb" value="Mascotas permitidas"> <span>${L("Mascotas", "Pets Allowed")} 🐾</span></label>
            <label class="checkbox-label"><input type="checkbox" class="amenity-cb" value="Gimnasio"> <span>${L("Gimnasio", "Gym")} 🏋️‍♂️</span></label>
            <label class="checkbox-label"><input type="checkbox" id="filter-schools"> <span>${L("Escuelas", "Schools")} 🎓</span></label>
            <label class="checkbox-label"><input type="checkbox" id="filter-hospitals"> <span>${L("Hospitales", "Hospitals")} 🏥</span></label>
            <label class="checkbox-label"><input type="checkbox" id="filter-malls"> <span>${L("Plazas", "Shopping")} 🛍️</span></label>
            <label class="checkbox-label"><input type="checkbox" id="filter-transport"> <span>${L("Transporte", "Transit")} 🚍</span></label>
          </div>
        </div>

        <!-- Encabezado de Resultados -->
        <div class="filters-header-row">
          <h2 id="results-count-title">${L("Buscando propiedades...", "Searching properties...")}</h2>
          <button class="btn btn-outline btn-sm" id="save-search-btn">
            <i data-lucide="bell" class="icon-inline icon-sm"></i> ${L("Guardar Búsqueda", "Save Search")}
          </button>
        </div>

        <!-- Grid de Resultados -->
        <div class="properties-grid results-grid-container" id="search-grid-mount">
          <!-- Las tarjetas de propiedades se insertan dinámicamente -->
        </div>

      </div>

      <!-- Panel Derecho: Mapa Interactivo -->
      <div class="search-map-panel">
        <div class="map-canvas-wrapper" id="map-wrapper">
          <!-- El mapa SVG vector se renderiza aquí -->
        </div>
        
        <!-- Info Window Flotante -->
        <div class="info-window" id="map-info-window">
          <!-- Se llena dinámicamente al hacer click en un pin -->
        </div>
      </div>

    </div>
  `;

  function init(appState) {
    // Referencias DOM
    const gridMount = document.getElementById("search-grid-mount");
    const mapMount = document.getElementById("map-wrapper");
    const resultsCountTitle = document.getElementById("results-count-title");
    const infoWindow = document.getElementById("map-info-window");
    const saveSearchBtn = document.getElementById("save-search-btn");

    // Inputs de filtro
    const filterCategory = document.getElementById("filter-category");
    const filterCity = document.getElementById("filter-city");
    const filterPriceMax = document.getElementById("filter-price-max");
    const filterBedrooms = document.getElementById("filter-bedrooms");
    const filterBathrooms = document.getElementById("filter-bathrooms");
    
    // Checkboxes
    const amenityCbs = document.querySelectorAll(".amenity-cb");
    const cbSchools = document.getElementById("filter-schools");
    const cbHospitals = document.getElementById("filter-hospitals");
    const cbMalls = document.getElementById("filter-malls");
    const cbTransport = document.getElementById("filter-transport");

    // Función principal para aplicar los filtros
    function applyFilters() {
      const category = filterCategory.value;
      const city = filterCity.value;
      const priceMax = filterPriceMax.value ? parseFloat(filterPriceMax.value) : Infinity;
      const minBedrooms = filterBedrooms.value ? parseInt(filterBedrooms.value) : 0;
      const minBathrooms = filterBathrooms.value ? parseInt(filterBathrooms.value) : 0;
      
      // Amenidades activas
      const selectedAmenities = Array.from(amenityCbs)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      // Cercanías
      const reqSchools = cbSchools.checked;
      const reqHospitals = cbHospitals.checked;
      const reqMalls = cbMalls.checked;
      const reqTransport = cbTransport.checked;

      // Filtrar la lista
      const filtered = appState.properties.filter(prop => {
        if (prop.category !== category) return false;
        if (city && prop.location.city !== city) return false;
        if (prop.price > priceMax) return false;
        if (prop.bedrooms < minBedrooms) return false;
        if (prop.bathrooms < minBathrooms) return false;
        
        // Validar todas las amenidades seleccionadas
        for (const am of selectedAmenities) {
          if (!prop.amenities?.includes(am)) return false;
        }

        // Validar cercanías
        if (reqSchools && !prop.schoolsNearby) return false;
        if (reqHospitals && !prop.hospitalsNearby) return false;
        if (reqMalls && !prop.mallsNearby) return false;
        if (reqTransport && !prop.transportNearby) return false;

        return true;
      });

      // Actualizar título
      resultsCountTitle.textContent = `${filtered.length} ${L("Inmuebles Encontrados", "Properties Found")}`;

      // Renderizar Lista de Tarjetas
      renderCardsList(filtered);

      // Renderizar Mapa SVG e Interactive Pins
      renderVectorMap(filtered);
    }

    // Attach listeners
    filterCategory.addEventListener("change", applyFilters);
    filterCity.addEventListener("change", applyFilters);
    filterPriceMax.addEventListener("input", applyFilters);
    filterBedrooms.addEventListener("change", applyFilters);
    filterBathrooms.addEventListener("change", applyFilters);
    amenityCbs.forEach(cb => cb.addEventListener("change", applyFilters));
    cbSchools.addEventListener("change", applyFilters);
    cbHospitals.addEventListener("change", applyFilters);
    cbMalls.addEventListener("change", applyFilters);
    cbTransport.addEventListener("change", applyFilters);

    // Initial render
    applyFilters();

    // Renderizar las tarjetas de propiedades
    function renderCardsList(propertiesList) {
      if (propertiesList.length === 0) {
        gridMount.innerHTML = `
          <div class="no-results-card">
            <i data-lucide="search-code" class="no-results-icon"></i>
            <h3>${L("No encontramos propiedades", "No properties found")}</h3>
            <p>${L("Intenta flexibilizar los filtros de precio o amenidades.", "Try adjusting your price or amenity filters.")}</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      gridMount.innerHTML = propertiesList.map(prop => {
        const isFav = appState.currentUser?.favorites?.includes(prop.id);
        return renderPropertyCard(prop, isFav, true); // Compact card format
      }).join('');

      if (window.lucide) window.lucide.createIcons();

      // Enlazar hover de tarjeta para resaltar Pines
      document.querySelectorAll(".property-card").forEach(card => {
        const id = card.getAttribute("data-prop-id");
        card.addEventListener("mouseenter", () => {
          const pin = document.getElementById(`pin-${id}`);
          if (pin) pin.classList.add("active");
        });
        card.addEventListener("mouseleave", () => {
          const pin = document.getElementById(`pin-${id}`);
          if (pin) pin.classList.remove("active");
        });
      });

      // Enlazar clics de favorito
      document.querySelectorAll(".property-favorite-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!appState.currentUser) {
            alert(L("Inicia sesión para guardar favoritos.", "Sign in to save favorites."));
            return;
          }
          const id = btn.getAttribute("data-id");
          let favorites = appState.currentUser.favorites || [];
          if (favorites.includes(id)) {
            favorites = favorites.filter(fId => fId !== id);
            btn.classList.remove("active");
          } else {
            favorites.push(id);
            btn.classList.add("active");
          }
          appState.currentUser.favorites = favorites;
          updateUserProfile(appState.currentUser);
        });
      });
    }

    // Renderizar el mapa de vectores SVG con pins
    function renderVectorMap(propertiesList) {
      // Identificar de forma dinámica la ciudad predominante para rotular el mapa GPS
      const isSanPedro = propertiesList.some(p => p.location.city === "San Pedro" || p.location.city === "San Pedro Garza García");
      const isTulum = propertiesList.some(p => p.location.city === "Tulum");
      
      let districtLabel = L("ZONA POLANCO / REFORMA", "POLANCO / REFORMA AREA");
      let street1 = "AV. PASEO DE LA REFORMA";
      let street2 = "AV. CAMPOS ELÍSEOS";
      let landmarkLabel = L("BOSQUE DE CHAPULTEPEC", "CHAPULTEPEC PARK");
      let bgMapWater = "rgba(197, 160, 89, 0.1)";

      if (isSanPedro) {
        districtLabel = "SAN PEDRO GARZA GARCÍA";
        street1 = "AV. JOSÉ VASCONCELOS";
        street2 = "AV. ALFONSO REYES";
        landmarkLabel = L("PARQUE CHIPINQUE (RESERVA)", "CHIPINQUE PARK (RESERVE)");
      } else if (isTulum) {
        districtLabel = L("ZONA ECO-CHIC ALDEA ZAMA", "ECO-CHIC ALDEA ZAMA AREA");
        street1 = L("AV. COBA (ACCESO PLAYA)", "COBA AVE. (BEACH ACCESS)");
        street2 = "AV. BOCA PAILA";
        landmarkLabel = L("PARQUE NACIONAL TULUM", "TULUM NATIONAL PARK");
        bgMapWater = "rgba(6, 182, 212, 0.15)"; /* Turquesa del Caribe */
      }

      // SVG base representation of a premium styled urban grid (light/dark adaptive)
      let svgContent = `
        <svg width="100%" height="100%" viewBox="0 0 500 500" class="vector-map-svg" xmlns="http://www.w3.org/2000/svg" style="background-color: var(--bg-primary);">
          <defs>
            <linearGradient id="mapWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${bgMapWater}" stop-opacity="1" />
              <stop offset="100%" stop-color="transparent" stop-opacity="0.1" />
            </linearGradient>
            <linearGradient id="mapParkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="var(--color-success)" stop-opacity="0.15" />
              <stop offset="100%" stop-color="var(--color-success)" stop-opacity="0.03" />
            </linearGradient>
          </defs>

          <!-- Parks and green spaces -->
          <rect x="30" y="30" width="160" height="120" rx="14" fill="url(#mapParkGrad)" stroke="var(--color-success)" stroke-opacity="0.15" stroke-width="1" />
          <rect x="300" y="320" width="170" height="150" rx="14" fill="url(#mapParkGrad)" stroke="var(--color-success)" stroke-opacity="0.15" stroke-width="1" />
          
          <!-- Water bodies / Rivers / Sea -->
          <path d="M 0,250 Q 150,210 280,260 T 500,240 L 500,270 Q 380,290 280,260 T 0,280 Z" fill="url(#mapWaterGrad)" />
          
          <!-- Urban Grids / Streets (Avenidas principales con doble carril) -->
          <line x1="120" y1="0" x2="120" y2="500" stroke="var(--border-color)" stroke-width="12" stroke-linecap="round" />
          <line x1="120" y1="0" x2="120" y2="500" stroke="var(--bg-primary)" stroke-width="2" stroke-dasharray="8,6" />
          
          <line x1="340" y1="0" x2="340" y2="500" stroke="var(--border-color)" stroke-width="16" stroke-linecap="round" />
          <line x1="340" y1="0" x2="340" y2="500" stroke="var(--bg-primary)" stroke-width="2" stroke-dasharray="10,6" />
          
          <line x1="0" y1="190" x2="500" y2="190" stroke="var(--border-color)" stroke-width="14" stroke-linecap="round" />
          <line x1="0" y1="190" x2="500" y2="190" stroke="var(--bg-primary)" stroke-width="2" stroke-dasharray="8,6" />
          
          <line x1="0" y1="410" x2="500" y2="410" stroke="var(--border-color)" stroke-width="12" stroke-linecap="round" />
          <line x1="0" y1="410" x2="500" y2="410" stroke="var(--bg-primary)" stroke-width="2" stroke-dasharray="6,6" />
          
          <!-- Calles secundarias -->
          <line x1="50" y1="0" x2="50" y2="500" stroke="var(--border-color)" stroke-width="3" stroke-opacity="0.4" />
          <line x1="210" y1="0" x2="210" y2="500" stroke="var(--border-color)" stroke-width="3" stroke-opacity="0.4" />
          <line x1="420" y1="0" x2="420" y2="500" stroke="var(--border-color)" stroke-width="3" stroke-opacity="0.4" />
          <line x1="0" y1="90" x2="500" y2="90" stroke="var(--border-color)" stroke-width="3" stroke-opacity="0.4" />
          <line x1="0" y1="300" x2="500" y2="300" stroke="var(--border-color)" stroke-width="3" stroke-opacity="0.4" />
          
          <!-- Rotulación Dinámica Premium (Outfit Font) -->
          <rect x="35" y="10" width="130" height="18" rx="4" fill="rgba(10,11,13,0.6)" backdrop-filter="blur(2px)" />
          <text x="40" y="22" font-family="Outfit, sans-serif" font-size="8" fill="var(--color-success)" font-weight="800" letter-spacing="0.05em">${landmarkLabel}</text>
          
          <text x="350" y="455" font-family="Outfit, sans-serif" font-size="10" fill="var(--color-brand)" font-weight="800" letter-spacing="0.08em">${districtLabel}</text>
          
          <g transform="rotate(-90, 130, 120)">
            <text x="130" y="120" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="var(--text-muted)" font-weight="600" letter-spacing="0.05em">${street2}</text>
          </g>
          
          <g transform="rotate(-90, 352, 220)">
            <text x="352" y="220" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="var(--text-muted)" font-weight="600" letter-spacing="0.05em">${L("AV. CIRCUNVALACIÓN", "CIRCUNVALACIÓN AVE.")}</text>
          </g>
          
          <text x="10" y="184" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="var(--text-muted)" font-weight="600" letter-spacing="0.05em">${street1}</text>
          <text x="10" y="404" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="var(--text-muted)" font-weight="600" letter-spacing="0.05em">${L("ANILLO PERIFÉRICO", "PERIFÉRICO RING ROAD")}</text>
        </svg>
      `;

      // Render pins layer
      let pinsHtml = propertiesList.map((prop, idx) => {
        // Calculate deterministic coordinates in the range of 50 to 450 (within 500px viewBox)
        // using the coordinates or fallback to index-based distribution if no lat/lng exists.
        let leftPct = 10 + (idx * 27) % 80; // 10% to 90%
        let topPct = 15 + (idx * 31) % 70;  // 15% to 85%

        // If location has coordinates, let's map them
        if (prop.location.lat && prop.location.lng) {
          // Normalización muy básica para la demo
          const lat = prop.location.lat;
          const lng = prop.location.lng;
          
          // Mapeamos de forma local dependiendo de la ciudad
          if (prop.location.city === "CDMX") {
            // Lat: 19.4100 a 19.4350 -> Y: 90% a 10%
            // Lng: -99.2000 a -99.1600 -> X: 10% a 90%
            leftPct = 10 + ((lng - (-99.2000)) / (0.0400)) * 80;
            topPct = 90 - ((lat - 19.4100) / (0.0250)) * 80;
          } else if (prop.location.city === "San Pedro" || prop.location.city === "San Pedro Garza García") {
            // Lat: 25.6200 a 25.6500
            // Lng: -100.4100 a -100.3200
            leftPct = 10 + ((lng - (-100.4100)) / (0.0900)) * 80;
            topPct = 90 - ((lat - 25.6200) / (0.0300)) * 80;
          }
        }

        // Clamp values just in case
        leftPct = Math.max(10, Math.min(leftPct, 90));
        topPct = Math.max(10, Math.min(topPct, 90));

        const shortPrice = prop.price >= 1000000 
          ? `$${(prop.price / 1000000).toFixed(1)}M` 
          : `$${(prop.price / 1000).toFixed(0)}k`;

        return `
          <div class="map-pin" id="pin-${prop.id}" style="left: ${leftPct}%; top: ${topPct}%;" data-id="${prop.id}">
            <i data-lucide="home" class="icon-inline icon-sm"></i>
            <span>${shortPrice}</span>
          </div>
        `;
      }).join('');

      mapMount.innerHTML = `
        ${svgContent}
        <div class="map-pins-layer">
          ${pinsHtml}
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Enlazar clic de los pines para mostrar Info Window
      document.querySelectorAll(".map-pin").forEach(pin => {
        pin.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = pin.getAttribute("data-id");
          const prop = propertiesList.find(p => p.id === id);
          if (prop) {
            showInfoWindow(prop);
            // Activar clase activa en este pin y desactivar en los demás
            document.querySelectorAll(".map-pin").forEach(p => p.classList.remove("active"));
            pin.classList.add("active");
          }
        });
      });
    }

    // Mostrar modal informativo en el mapa
    function showInfoWindow(prop) {
      const formattedPrice = formatCurrency(prop.price, prop.currency || "MXN");

      infoWindow.innerHTML = `
        <button id="close-info-window" class="info-window-close-btn">
          <i data-lucide="x" class="icon-inline icon-md"></i>
        </button>
        <img src="${prop.images?.[0] || ""}" alt="${prop.title}" class="info-window-img">
        <h4 class="info-window-title">${prop.title}</h4>
        <p class="info-window-meta">${[prop.location?.neighborhood, prop.location?.city].filter(Boolean).join(", ")}</p>
        <div class="info-window-footer">
          <span class="info-window-price">${formattedPrice}</span>
          <a href="#propiedad/${prop.id}" class="btn btn-primary info-window-btn">${L("Ver Detalles", "View Details")}</a>
        </div>
      `;
      infoWindow.classList.add("active");
      if (window.lucide) window.lucide.createIcons();

      document.getElementById("close-info-window").addEventListener("click", (e) => {
        e.stopPropagation();
        infoWindow.classList.remove("active");
        document.querySelectorAll(".map-pin").forEach(p => p.classList.remove("active"));
      });
    }

    // Guardar búsqueda activa
    saveSearchBtn.addEventListener("click", () => {
      if (!appState.currentUser) {
        alert(L("Debes iniciar sesión para guardar búsquedas.", "You must sign in to save searches."));
        return;
      }
      const category = filterCategory.value;
      const city = filterCity.value || L("México", "Mexico");
      const savedSearches = appState.currentUser.savedSearches || [];
      
      const newSearch = {
        id: `s-${Date.now()}`,
        name: `${tCategory(category)} ${L("en", "in")} ${city} (${filterPriceMax.value ? L("Hasta", "Up to") + " $" + filterPriceMax.value : L("Cualquier precio", "Any price")})`,
        query: {
          category,
          city,
          priceMax: filterPriceMax.value
        }
      };

      savedSearches.push(newSearch);
      appState.currentUser.savedSearches = savedSearches;
      updateUserProfile(appState.currentUser);
      alert(L("¡Búsqueda guardada exitosamente! Recibirás alertas automatizadas en tu perfil.", "Search saved successfully! You will receive automated alerts in your profile."));
    });
  }

  return { html, init };
}
