import { updateUserProfile } from "../services/auth.js?v=20261120";
import { renderPropertyCard } from "../components/PropertyCard.js";
import { L, tCategory } from "../services/i18n.js";

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
      <span class="hero-eyebrow">${L("Portfolio Inmobiliario Exclusivo • México", "Exclusive Real Estate Portfolio • Mexico")}</span>
      <h2 class="hero-title">${L("Encuentra tu próximo hogar", "Find your next home")}</h2>
      <p class="hero-subtitle">${L("Propiedades residenciales y de inversión curadas con inteligencia artificial, plusvalía verificada y asesoría patrimonial integral.", "Residential and investment properties curated with artificial intelligence, verified appreciation, and comprehensive wealth advisory.")}</p>

      <!-- Buscador Unificado Estilo Inmuebles24 -->
      <div class="search-widget glass-premium glow-brand fade-in">
        <div class="search-tabs">
          <button class="search-tab-btn active" data-category="Comprar">${tCategory("Comprar")}</button>
          <button class="search-tab-btn" data-category="Rentar">${L("Alquilar", "Rent")}</button>
          <button class="search-tab-btn" data-category="Preventa">${tCategory("Desarrollos")}</button>
          <button class="search-tab-btn" data-category="Terrenos">${tCategory("Terrenos")}</button>
        </div>
        
        <div class="search-fields">
          <div class="search-field-group">
            <label>${L("¿Dónde buscas?", "Where are you looking?")}</label>
            <div class="search-input-wrapper">
              <i data-lucide="map-pin" class="icon-inline icon-md text-secondary"></i>
              <select id="search-city-input">
                <option value="">${L("Ingresa ciudad o zona...", "Select city or area...")}</option>
                <option value="CDMX">CDMX</option>
                <option value="San Pedro">San Pedro (Mty)</option>
                <option value="Guadalajara">Guadalajara</option>
                <option value="Tulum">Tulum</option>
                <option value="Querétaro">Querétaro</option>
              </select>
            </div>
          </div>

          <div class="search-field-group">
            <label>${L("Estado", "State")}</label>
            <div class="search-input-wrapper">
              <i data-lucide="globe" class="icon-inline icon-md text-secondary"></i>
              <select id="search-state-input">
                <option value="">${L("Cualquier Estado", "Any State")}</option>
                <option value="CDMX">CDMX</option>
                <option value="Nuevo León">Nuevo León</option>
                <option value="Jalisco">Jalisco</option>
                <option value="Quintana Roo">Quintana Roo</option>
                <option value="Querétaro">Querétaro</option>
              </select>
            </div>
          </div>

          <div class="search-field-group">
            <label>${L("Precio Máximo", "Max Price")}</label>
            <div class="search-input-wrapper">
              <i data-lucide="dollar-sign" class="icon-inline icon-md text-secondary"></i>
              <select id="search-budget-input">
                <option value="">${L("Cualquier precio", "Any price")}</option>
                <option value="50000">${L("Hasta $50,000 / mes", "Up to $50,000 / mo")}</option>
                <option value="150000">${L("Hasta $150,000 / mes", "Up to $150,000 / mo")}</option>
                <option value="3000000">${L("Hasta $3,000,000 MXN", "Up to $3,000,000 MXN")}</option>
                <option value="5000000">${L("Hasta $5,000,000 MXN", "Up to $5,000,000 MXN")}</option>
                <option value="20000000">${L("Hasta $20,000,000 MXN", "Up to $20,000,000 MXN")}</option>
                <option value="50000000">${L("Hasta $50,000,000 MXN", "Up to $50,000,000 MXN")}</option>
              </select>
            </div>
          </div>

          <div class="search-field-group">
            <label>${L("Recámaras", "Bedrooms")}</label>
            <div class="search-input-wrapper">
              <i data-lucide="bed" class="icon-inline icon-md text-secondary"></i>
              <select id="search-rooms-input">
                <option value="">${L("Cualquiera", "Any")}</option>
                <option value="1">${L("1+ rec", "1+ bd")}</option>
                <option value="2">${L("2+ rec", "2+ bd")}</option>
                <option value="3">${L("3+ rec", "3+ bd")}</option>
                <option value="4">${L("4+ rec", "4+ bd")}</option>
              </select>
            </div>
          </div>

          <button class="search-submit-btn" id="search-submit-trigger">
            <i data-lucide="search" class="icon-inline icon-lg"></i>
            <span>${L("Buscar", "Search")}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Atajos de Categorías Estilo Inmuebles24 -->
    <section class="section-container categories-shortcuts-section">
      <p class="section-tagline text-center">${L("Exploración Rápida", "Quick Exploration")}</p>
      <h2 class="section-title text-center margin-bottom-lg">${L("Descubre tu próximo hogar", "Discover your next home")}</h2>
      
      <div class="categories-shortcuts-grid">
        <a href="#comprar" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-purple-glow">
            <i data-lucide="building-2"></i>
          </div>
          <h4>${L("Departamentos", "Apartments")}</h4>
          <p>${L("Ver opciones", "View options")}</p>
        </a>
        <a href="#comprar" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-gold-glow">
            <i data-lucide="home"></i>
          </div>
          <h4>${L("Casas", "Houses")}</h4>
          <p>${L("Ver opciones", "View options")}</p>
        </a>
        <a href="#desarrollos" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-emerald-glow">
            <i data-lucide="construction"></i>
          </div>
          <h4>${L("Desarrollos", "Developments")}</h4>
          <p>${L("Preventas exclusivas", "Exclusive presales")}</p>
        </a>
        <a href="#comprar" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-cyan-glow">
            <i data-lucide="briefcase"></i>
          </div>
          <h4>${L("Oficinas", "Offices")}</h4>
          <p>${L("Lotes y Comerciales", "Lots & Commercial")}</p>
        </a>
      </div>
    </section>

    <!-- Propiedades Destacadas -->
    <section class="section-container">
      <div class="section-header">
        <div>
          <p class="section-tagline">${L("Exclusividad Seleccionada", "Curated Exclusivity")}</p>
          <h2 class="section-title">${L("Recomendados para ti", "Recommended for you")}</h2>
        </div>
        <a href="#comprar" class="btn btn-secondary">${L("Ver todas las propiedades", "View all properties")}</a>
      </div>
      
      <div class="properties-grid">
        ${featuredHtml}
      </div>
    </section>

    <!-- Oportunidades Inteligentes ($2M - $3M MXN) -->
    <section class="section-container">
      <div class="section-header">
        <div>
          <p class="section-tagline">${L("Alta Demanda & Plusvalía", "High Demand & Appreciation")}</p>
          <h2 class="section-title">${L("Oportunidades de $2M a $3M MXN", "Opportunities from $2M to $3M MXN")}</h2>
        </div>
        <a href="#comprar" id="btn-explore-midrange" class="btn btn-outline">${L("Explorar rango $2M - $3M", "Explore $2M - $3M range")}</a>
      </div>
      
      <div class="properties-grid">
        ${midRangeHtml}
      </div>
    </section>

    <!-- Asesora Principal Destacada -->
    <section class="section-container">
      <div class="lead-advisor-banner glass-premium">
        <div class="lead-advisor-photo-wrap">
          <img src="./assets/images/asesora-yesenia-cuevas.jpg" alt="${L("Yesenia Cuevas - Asesora Principal MudaT", "Yesenia Cuevas - MudaT Lead Advisor")}" class="lead-advisor-photo">
          <span class="lead-advisor-badge">${L("Asesora Principal", "Lead Advisor")}</span>
        </div>
        <div class="lead-advisor-info">
          <p class="section-tagline">${L("Asesoría Patrimonial Personalizada", "Personalized Wealth Advisory")}</p>
          <h2 class="lead-advisor-name">Yesenia Cuevas</h2>
          <p class="lead-advisor-role">${L("Directora Comercial & Asesora Inmobiliaria Certificada • 5.0 ★", "Commercial Director & Certified Real Estate Advisor • 5.0 ★")}</p>
          <p class="lead-advisor-bio">
            ${L("Acompañamiento estratégico de principio a fin en la compra, venta e inversión de propiedades residenciales y comerciales en México. Especialista en análisis de plusvalía, negociación patrimonial y gestión integral de créditos hipotecarios.", "End-to-end strategic guidance for buying, selling, and investing in residential and commercial properties in Mexico. Specialist in appreciation analysis, wealth negotiation, and comprehensive mortgage management.")}
          </p>
          <div class="lead-advisor-actions">
            <a href="#comprar" class="btn btn-primary">${L("Ver Propiedades de Yesenia", "View Yesenia's Properties")}</a>
            <a href="#asesores" class="btn btn-outline">${L("Panel de Asesores (CRM)", "Advisors Panel (CRM)")}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Servicios del Ecosistema -->
    <section class="section-container">
      <p class="section-tagline text-center">${L("Servicios Integrados", "Integrated Services")}</p>
      <h2 class="section-title text-center margin-bottom-lg">${L("Todo en un solo ecosistema", "Everything in one ecosystem")}</h2>
      
      <div class="categories-shortcuts-grid">
        <a href="#legal" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-gold-glow">
            <i data-lucide="scale"></i>
          </div>
          <h4>${L("Marketplace Legal", "Legal Marketplace")}</h4>
          <p>${L("Contratos y Notarías", "Contracts & Notaries")}</p>
        </a>
        <a href="#avaluos" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-emerald-glow">
            <i data-lucide="bar-chart-3"></i>
          </div>
          <h4>${L("Avalúos Certificados", "Certified Appraisals")}</h4>
          <p>${L("Motor de valuación IA", "AI valuation engine")}</p>
        </a>
        <a href="#calculadora" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-cyan-glow">
            <i data-lucide="calculator"></i>
          </div>
          <h4>${L("Créditos Hipotecarios", "Mortgage Loans")}</h4>
          <p>${L("Simulador y Aprobación", "Simulator & Approval")}</p>
        </a>
        <a href="#asesores" class="shortcut-card glass-premium">
          <div class="shortcut-icon-circle bg-purple-glow">
            <i data-lucide="users"></i>
          </div>
          <h4>${L("Asesores Certificados", "Certified Advisors")}</h4>
          <p>${L("La mejor red nacional", "Top national network")}</p>
        </a>
      </div>
    </section>

    <!-- Sección de Métricas de Impacto -->
    <section class="section-container metrics-section fade-in">
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-number">+15K</span>
          <span class="metric-label">${L("Propiedades", "Properties")}</span>
          <span class="metric-desc">${L("En todo México", "Across Mexico")}</span>
        </div>
        <div class="metric-item">
          <span class="metric-number">98%</span>
          <span class="metric-label">${L("Satisfacción", "Satisfaction")}</span>
          <span class="metric-desc">${L("De nuestros clientes", "From our clients")}</span>
        </div>
        <div class="metric-item">
          <span class="metric-number">+500</span>
          <span class="metric-label">${L("Asesores", "Advisors")}</span>
          <span class="metric-desc">${L("Certificados activos", "Active certified")}</span>
        </div>
        <div class="metric-item">
          <span class="metric-number">12.5%</span>
          <span class="metric-label">${L("Plusvalía Promedio", "Average Appreciation")}</span>
          <span class="metric-desc">${L("Analizada con IA", "AI-analyzed")}</span>
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
          alert(L("Por favor inicia sesión o selecciona un perfil en el header para guardar favoritos.", "Please sign in or select a profile in the header to save favorites."));
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

