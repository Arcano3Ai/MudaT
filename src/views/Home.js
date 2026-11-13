import { updateUserProfile } from "../services/auth.js";
import { renderPropertyCard } from "../components/PropertyCard.js";

export async function renderHome(state) {
  // Get 6 featured properties (2 rows of 3 in desktop grid)
  const featured = state.properties.slice(0, 6);
  
  // Render cards HTML using the reusable PropertyCard component
  const featuredHtml = featured.map(prop => {
    const isFav = state.currentUser?.favorites?.includes(prop.id);
    return renderPropertyCard(prop, isFav, false);
  }).join('');

  // Get curated properties in the 2M - 3M MXN range
  const midRangeProps = state.properties
    .filter(p => p.price >= 2000000 && p.price <= 3000000)
    .slice(0, 3);

  const midRangeHtml = midRangeProps.map(prop => {
    const isFav = state.currentUser?.favorites?.includes(prop.id);
    return renderPropertyCard(prop, isFav, false);
  }).join('');

  const html = `
    <!-- Hero Principal Editorial de Lujo -->
    <section class="hero-section">
      <div class="hero-glow-1"></div>
      <div class="hero-glow-2"></div>
      <span class="hero-eyebrow">Portfolio Inmobiliario Exclusivo • México</span>
      <h2 class="hero-title">Encuentra tu próximo hogar</h2>
      <p class="hero-subtitle">Propiedades residenciales y de inversión curadas con inteligencia artificial, plusvalía verificada y asesoría patrimonial integral.</p>

      <!-- Buscador Unificado Estilo Inmuebles24 -->
      <div class="search-widget glass-premium glow-brand fade-in">
        <div class="search-tabs">
          <button class="search-tab-btn active" data-category="Comprar">Comprar</button>
          <button class="search-tab-btn" data-category="Rentar">Alquilar</button>
          <button class="search-tab-btn" data-category="Preventa">Desarrollos</button>
          <button class="search-tab-btn" data-category="Terrenos">Terrenos</button>
        </div>
        
        <div class="search-fields">
          <div class="search-field-group">
            <label>¿Dónde buscas?</label>
            <div class="search-input-wrapper">
              <i data-lucide="map-pin" class="icon-inline icon-md text-secondary"></i>
              <select id="search-city-input">
                <option value="">Ingresa ciudad o zona...</option>
                <option value="CDMX">CDMX</option>
                <option value="San Pedro">San Pedro (Mty)</option>
                <option value="Guadalajara">Guadalajara</option>
                <option value="Tulum">Tulum</option>
                <option value="Querétaro">Querétaro</option>
              </select>
            </div>
          </div>

          <div class="search-field-group">
            <label>Estado</label>
            <div class="search-input-wrapper">
              <i data-lucide="globe" class="icon-inline icon-md text-secondary"></i>
              <select id="search-state-input">
                <option value="">Cualquier Estado</option>
                <option value="CDMX">CDMX</option>
                <option value="Nuevo León">Nuevo León</option>
                <option value="Jalisco">Jalisco</option>
                <option value="Quintana Roo">Quintana Roo</option>
                <option value="Querétaro">Querétaro</option>
              </select>
            </div>
          </div>

          <div class="search-field-group">
            <label>Precio Máximo</label>
            <div class="search-input-wrapper">
              <i data-lucide="dollar-sign" class="icon-inline icon-md text-secondary"></i>
              <select id="search-budget-input">
                <option value="">Cualquier precio</option>
                <option value="50000">Hasta $50,000 / mes</option>
                <option value="150000">Hasta $150,000 / mes</option>
                <option value="3000000">Hasta $3,000,000 MXN</option>
                <option value="5000000">Hasta $5,000,000 MXN</option>
                <option value="20000000">Hasta $20,000,000 MXN</option>
                <option value="50000000">Hasta $50,000,000 MXN</option>
              </select>
            </div>
          </div>

          <div class="search-field-group">
            <label>Recámaras</label>
            <div class="search-input-wrapper">
              <i data-lucide="bed" class="icon-inline icon-md text-secondary"></i>
              <select id="search-rooms-input">
                <option value="">Cualquiera</option>
                <option value="1">1+ rec</option>
                <option value="2">2+ rec</option>
                <option value="3">3+ rec</option>
                <option value="4">4+ rec</option>
              </select>
            </div>
          </div>

          <button class="search-submit-btn" id="search-submit-trigger">
            <i data-lucide="search" class="icon-inline icon-lg"></i>
            <span>Buscar</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Atajos de Categorías Estilo Inmuebles24 -->
    <section class="section-container categories-shortcuts-section">
      <p class="section-tagline text-center">Exploración Rápida</p>
      <h2 class="section-title text-center margin-bottom-lg">Descubre tu próximo hogar</h2>
      
      <div class="categories-shortcuts-grid">
        <a href="#comprar" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-purple-glow">
            <i data-lucide="building-2"></i>
          </div>
          <h4>Departamentos</h4>
          <p>Ver opciones</p>
        </a>
        <a href="#comprar" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-gold-glow">
            <i data-lucide="home"></i>
          </div>
          <h4>Casas</h4>
          <p>Ver opciones</p>
        </a>
        <a href="#desarrollos" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-emerald-glow">
            <i data-lucide="construction"></i>
          </div>
          <h4>Desarrollos</h4>
          <p>Preventas exclusivas</p>
        </a>
        <a href="#comprar" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-cyan-glow">
            <i data-lucide="briefcase"></i>
          </div>
          <h4>Oficinas</h4>
          <p>Lotes y Comerciales</p>
        </a>
      </div>
    </section>

    <!-- Propiedades Destacadas -->
    <section class="section-container">
      <div class="section-header">
        <div>
          <p class="section-tagline">Exclusividad Seleccionada</p>
          <h2 class="section-title">Recomendados para ti</h2>
        </div>
        <a href="#comprar" class="btn btn-secondary">Ver todas las propiedades</a>
      </div>
      
      <div class="properties-grid">
        ${featuredHtml}
      </div>
    </section>

    <!-- Oportunidades Inteligentes ($2M - $3M MXN) -->
    <section class="section-container">
      <div class="section-header">
        <div>
          <p class="section-tagline">Alta Demanda & Plusvalía</p>
          <h2 class="section-title">Oportunidades de $2M a $3M MXN</h2>
        </div>
        <a href="#comprar" id="btn-explore-midrange" class="btn btn-outline">Explorar rango $2M - $3M</a>
      </div>
      
      <div class="properties-grid">
        ${midRangeHtml}
      </div>
    </section>

    <!-- Servicios del Ecosistema -->
    <section class="section-container">
      <p class="section-tagline text-center">Servicios Integrados</p>
      <h2 class="section-title text-center margin-bottom-lg">Todo en un solo ecosistema</h2>
      
      <div class="categories-shortcuts-grid">
        <a href="#legal" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-gold-glow">
            <i data-lucide="scale"></i>
          </div>
          <h4>Marketplace Legal</h4>
          <p>Contratos y Notarías</p>
        </a>
        <a href="#avaluos" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-emerald-glow">
            <i data-lucide="bar-chart-3"></i>
          </div>
          <h4>Avalúos Certificados</h4>
          <p>Motor de valuación IA</p>
        </a>
        <a href="#calculadora" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-cyan-glow">
            <i data-lucide="calculator"></i>
          </div>
          <h4>Créditos Hipotecarios</h4>
          <p>Simulador y Aprobación</p>
        </a>
        <a href="#asesores" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-purple-glow">
            <i data-lucide="users"></i>
          </div>
          <h4>Asesores Certificados</h4>
          <p>La mejor red nacional</p>
        </a>
      </div>
    </section>

    <!-- Sección de Métricas de Impacto -->
    <section class="section-container metrics-section fade-in">
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-number">+15K</span>
          <span class="metric-label">Propiedades</span>
          <span class="metric-desc">En todo México</span>
        </div>
        <div class="metric-item">
          <span class="metric-number">98%</span>
          <span class="metric-label">Satisfacción</span>
          <span class="metric-desc">De nuestros clientes</span>
        </div>
        <div class="metric-item">
          <span class="metric-number">+500</span>
          <span class="metric-label">Asesores</span>
          <span class="metric-desc">Certificados activos</span>
        </div>
        <div class="metric-item">
          <span class="metric-number">12.5%</span>
          <span class="metric-label">Plusvalía Promedio</span>
          <span class="metric-desc">Analizada con IA</span>
        </div>
      </div>
    </section>
  `;

  function init(appState) {
    // Manejar clics de pestañas del Buscador
    const tabs = document.querySelectorAll(".search-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        appState.searchFilters.category = tab.getAttribute("data-category");
      });
    });

    // Manejar envío del Buscador
    const searchTrigger = document.getElementById("search-submit-trigger");
    searchTrigger.addEventListener("click", () => {
      appState.searchFilters.city = document.getElementById("search-city-input").value;
      appState.searchFilters.state = document.getElementById("search-state-input").value;
      appState.searchFilters.budget = document.getElementById("search-budget-input").value;
      appState.searchFilters.rooms = document.getElementById("search-rooms-input").value;
      
      // Navigate to search list
      if (appState.searchFilters.category === "Rentar") {
        window.location.hash = "#rentar";
      } else if (appState.searchFilters.category === "Preventa") {
        window.location.hash = "#desarrollos";
      } else {
        window.location.hash = "#comprar";
      }
    });

    // Explorar rango $2M - $3M directamente
    document.getElementById("btn-explore-midrange")?.addEventListener("click", (e) => {
      e.preventDefault();
      appState.searchFilters.category = "Comprar";
      appState.searchFilters.city = "";
      appState.searchFilters.state = "";
      appState.searchFilters.budget = "3000000";
      appState.searchFilters.rooms = "";
      window.location.hash = "#comprar";
    });

    // Manejar botón de Favorito en tarjetas
    const favButtons = document.querySelectorAll(".property-favorite-btn");
    favButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!appState.currentUser) {
          alert("Por favor inicia sesión o selecciona un perfil en el header para guardar favoritos.");
          return;
        }

        const propId = btn.getAttribute("data-id");
        let favorites = appState.currentUser.favorites || [];
        
        if (favorites.includes(propId)) {
          favorites = favorites.filter(id => id !== propId);
          btn.classList.remove("active");
        } else {
          favorites.push(propId);
          btn.classList.add("active");
        }

        appState.currentUser.favorites = favorites;
        updateUserProfile(appState.currentUser);
      });
    });
  }

  return { html, init };
}

