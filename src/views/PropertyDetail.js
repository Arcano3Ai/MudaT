import { updateUserProfile } from "../services/auth.js?v=20261120";
import { renderPropertyCard } from "../components/PropertyCard.js";
import { renderConoceLaZonaShell, initConoceLaZona } from "../components/ConoceLaZona.js";
import { L, tCategory, formatCurrency } from "../services/i18n.js";

export async function renderPropertyDetail(state) {
  const propId = state.activePropertyId;
  const prop = state.properties.find(p => p.id === propId) || state.properties[0];

  const formattedPrice = formatCurrency(prop.price, prop.currency || "MXN");
  const isInitiallyFav = Boolean(state.currentUser?.favorites?.includes(prop.id));
  const advisorPhone = String(prop.advisor?.phone || "525512345678").replace(/\D/g, "") || "525512345678";
  const waText = encodeURIComponent(
    L(`Hola, estoy interesado en el inmueble ${prop.title}`, `Hello, I am interested in the property ${prop.title}`)
  );

  // Similar properties calculation
  const similar = state.properties
    .filter(p => p.id !== prop.id && (p.location.city === prop.location.city || p.category === prop.category))
    .slice(0, 3);

  const similarHtml = similar.map(item => {
    const isFav = state.currentUser?.favorites?.includes(item.id);
    return renderPropertyCard(item, isFav, true); // Use reusable compact property card
  }).join('');

  const html = `
    <div class="section-container fade-in">
      
      <!-- Encabezado de la Propiedad -->
      <div class="prop-detail-header-row">
        <div>
          <div class="prop-detail-meta-box">
            <span class="property-type-tag">${tCategory(prop.category)}</span>
            <span class="prop-detail-age-text"><i data-lucide="calendar" class="icon-inline icon-sm"></i> ${L("Antigüedad:", "Age:")} ${prop.age === 0 ? L("Preventa / Nueva", "Presale / New") : `${prop.age} ${L("años", "years")}`}</span>
          </div>
          <h2 class="prop-detail-main-title">${prop.title}</h2>
          <p class="prop-detail-address">
            <i data-lucide="map-pin" class="icon-inline color-brand"></i>
            ${prop.location.street}, ${L("Col.", "")} ${prop.location.neighborhood}, ${prop.location.city}, ${prop.location.state}
          </p>
        </div>
        
        <div class="prop-detail-price-box">
          <p class="prop-detail-price-tagline">${L("Precio de Mercado", "Market Price")}</p>
          <p class="prop-detail-price-val">${formattedPrice}</p>
          <div class="prop-detail-header-actions">
            <button class="btn btn-secondary" id="detail-fav-btn">
              ${isInitiallyFav
                ? `<i data-lucide="heart" class="icon-inline icon-md color-danger display-inline"></i> ${L("Guardado", "Saved")}`
                : `<i data-lucide="heart" class="icon-inline icon-md"></i> ${L("Guardar", "Save")}`}
            </button>
            <button class="btn btn-secondary" id="detail-share-btn">
              <i data-lucide="share-2" class="icon-inline icon-md"></i> ${L("Compartir", "Share")}
            </button>
          </div>
        </div>
      </div>

      <!-- Layout Grid Principal -->
      <div class="detail-grid">
        
        <!-- Contenido de la Izquierda -->
        <div class="detail-main">
          
          <!-- Galería Multimedia con Selector de Pestañas -->
          <div class="gallery-section">
            <div class="multimedia-tabs">
              <button class="multimedia-tab-btn active" id="tab-photos"><i data-lucide="image"></i> ${L("Fotos", "Photos")} (${prop.images.length})</button>
              <button class="multimedia-tab-btn" id="tab-video" ${prop.videoUrl ? '' : 'disabled'}><i data-lucide="play-circle"></i> ${L("Video", "Video")}</button>
              <button class="multimedia-tab-btn" id="tab-tour" ${prop.virtualTour ? '' : 'disabled'}><i data-lucide="rotate-3d"></i> ${L("Recorrido 3D", "3D Tour")}</button>
            </div>
            
            <!-- Contenedor Principal Multimedia -->
            <div class="gallery-main-wrapper" id="media-viewport">
              <img src="${prop.images[0]}" alt="${prop.title}" class="gallery-main-img" id="main-gallery-image">
              <div class="gallery-nav-buttons" id="gallery-nav-controls">
                <button class="gallery-nav-btn" id="gallery-prev-btn"><i data-lucide="chevron-left"></i></button>
                <button class="gallery-nav-btn" id="gallery-next-btn"><i data-lucide="chevron-right"></i></button>
              </div>
            </div>

            <!-- Miniaturas -->
            <div class="gallery-thumbnails" id="gallery-thumbnails-row">
              ${prop.images.map((img, idx) => `
                <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                  <img src="${img}" alt="${L("Miniatura", "Thumbnail")} ${idx + 1}">
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Descripción y Detalles del Inmueble -->
          <div class="prop-detail-content-box">
            <h3 class="prop-detail-section-title">${L("Descripción del Inmueble", "Property Description")}</h3>
            <p class="prop-detail-desc-text">${prop.description}</p>
            
            <h3 class="prop-detail-divider-title">${L("Características Principales", "Key Features")}</h3>
            <div class="prop-detail-specs-grid">
              <div class="prop-detail-spec-item">
                <div class="prop-detail-spec-icon-wrapper"><i data-lucide="bed"></i></div>
                <div>
                  <p class="prop-detail-spec-label">${L("Recámaras", "Bedrooms")}</p>
                  <p class="prop-detail-spec-val">${prop.bedrooms}</p>
                </div>
              </div>
              <div class="prop-detail-spec-item">
                <div class="prop-detail-spec-icon-wrapper"><i data-lucide="bath"></i></div>
                <div>
                  <p class="prop-detail-spec-label">${L("Baños", "Bathrooms")}</p>
                  <p class="prop-detail-spec-val">${prop.bathrooms}</p>
                </div>
              </div>
              <div class="prop-detail-spec-item">
                <div class="prop-detail-spec-icon-wrapper"><i data-lucide="maximize"></i></div>
                <div>
                  <p class="prop-detail-spec-label">${L("Construcción", "Built Area")}</p>
                  <p class="prop-detail-spec-val">${prop.construction || prop.land} m²</p>
                </div>
              </div>
              <div class="prop-detail-spec-item">
                <div class="prop-detail-spec-icon-wrapper"><i data-lucide="bar-chart-3"></i></div>
                <div>
                  <p class="prop-detail-spec-label">${L("Plusvalía Zona", "Area Appreciation")}</p>
                  <p class="prop-detail-spec-val color-success">${prop.plusvalia}</p>
                </div>
              </div>
            </div>

            <h3 class="prop-detail-divider-title">${L("Amenidades", "Amenities")}</h3>
            <div class="prop-detail-amenities-grid">
              ${prop.amenities.map(am => `
                <div class="prop-detail-amenity-item">
                  <i data-lucide="check" class="icon-inline icon-md color-success"></i>
                  <span>${am}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Calculadora Hipotecaria Avanzada -->
          <div class="calculator-card glass-premium">
            <h3 class="calculator-card-title">
              <i data-lucide="calculator" class="icon-inline color-brand"></i>
              ${L("Calculadora Hipotecaria de Precisión", "Precision Mortgage Calculator")}
            </h3>
            <p class="calculator-card-subtitle">${L("Modifica el enganche, la tasa de interés y el plazo para ver tu pago mensual estimado en tiempo real.", "Adjust the down payment, interest rate, and term to see your estimated monthly payment in real time.")}</p>
            
            <div class="calc-inputs-grid">
              <div class="filter-group">
                <label>${L("Precio del Inmueble (MXN)", "Property Price (MXN)")}</label>
                <input type="number" class="filter-input" id="calc-price-input" value="${prop.price}">
              </div>
              <div class="filter-group">
                <label>${L("Enganche (%)", "Down Payment (%)")}</label>
                <input type="number" class="filter-input" id="calc-downpayment-pct" value="20" min="10" max="90">
              </div>
              <div class="filter-group">
                <label>${L("Tasa de Interés Anual (%)", "Annual Interest Rate (%)")}</label>
                <input type="number" class="filter-input" id="calc-interest-rate" value="10.5" step="0.1">
              </div>
              <div class="filter-group">
                <label>${L("Plazo del Crédito (Años)", "Loan Term (Years)")}</label>
                <select class="filter-select" id="calc-term-years">
                  <option value="5">5 ${L("Años", "Years")}</option>
                  <option value="10">10 ${L("Años", "Years")}</option>
                  <option value="15">15 ${L("Años", "Years")}</option>
                  <option value="20" selected>20 ${L("Años", "Years")}</option>
                  <option value="30">30 ${L("Años", "Years")}</option>
                </select>
              </div>
            </div>

            <div class="calc-result-display">
              <p class="calc-result-title">${L("Mensualidad Estimada", "Estimated Monthly Payment")}</p>
              <p class="monthly-payment-amount" id="calc-monthly-payment-output">$0.00</p>
              <p class="calc-disclaimer">${L("*Cálculo informativo. No incluye seguros, avalúo ni escrituración.", "*Informational estimate. Does not include insurance, appraisal, or closing costs.")}</p>
              <button class="btn btn-success calc-submit-btn" id="calc-preapprove-btn">${L("Solicitar Pre-Aprobación Directa", "Request Direct Pre-Approval")}</button>
            </div>
          </div>

        </div>

        <!-- Barra Lateral de Contacto y Agenda -->
        <div class="detail-sidebar">
          
          <div class="contact-widget-card glass-premium glow-brand">
            <span class="section-tagline advisor-tagline">${L("Asesor Asignado", "Assigned Advisor")}</span>
            <div class="advisor-info-row">
              <img src="${prop.advisor.avatar}" alt="${prop.advisor.name}" class="advisor-photo">
              <div class="advisor-details">
                <h4>${prop.advisor.name}</h4>
                <p class="advisor-email">${prop.advisor.email}</p>
                <span class="advisor-rating"><i data-lucide="star" class="icon-inline icon-sm advisor-star-icon"></i> ${prop.advisor.rating} / 5.0</span>
              </div>
            </div>
            
            <div class="contact-actions-wrapper">
              <a href="https://wa.me/${advisorPhone}?text=${waText}" target="_blank" class="btn btn-success btn-full-width">
                <i data-lucide="message-circle"></i> ${L("Contactar por WhatsApp", "Contact via WhatsApp")}
              </a>
              <button class="btn btn-primary btn-full-width" id="open-advisor-chat-btn">
                <i data-lucide="message-square"></i> ${L("Chat Directo MudaT", "MudaT Direct Chat")}
              </button>
            </div>

            <form class="contact-form" id="visit-schedule-form">
              <p class="schedule-form-title">${L("Agendar una Visita", "Schedule a Visit")}</p>
              <div class="filter-group">
                <label>${L("Seleccionar Fecha", "Select Date")}</label>
                <input type="date" class="filter-input" id="schedule-date" required>
              </div>
              <div class="filter-group">
                <label>${L("Seleccionar Horario", "Select Time")}</label>
                <select class="filter-select" id="schedule-time" required>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>
              <button type="submit" class="btn btn-outline btn-full-width margin-top-sm">${L("Agendar Cita Presencial", "Schedule In-Person Visit")}</button>
            </form>
          </div>

        </div>

      </div>

      ${renderConoceLaZonaShell()}

      <!-- Propiedades Similares -->
      <section class="prop-similar-footer-section">
        <h3 class="similar-section-title">${L("Propiedades Similares en la Zona", "Similar Properties in the Area")}</h3>
        <div class="properties-grid prop-similar-footer-grid">
          ${similarHtml || `<p class="text-muted">${L("No hay propiedades similares disponibles actualmente.", "No similar properties are currently available.")}</p>`}
        </div>
      </section>

    </div>
  `;

  function init(appState) {
    let currentImageIndex = 0;
    let currentMonthlyPayment = 0;
    const images = prop.images;
    
    // Referencias DOM
    const mediaViewport = document.getElementById("media-viewport");
    const thumbs = document.querySelectorAll(".gallery-thumb");

    // Calculadora Hipotecaria referencias
    const calcPriceInput = document.getElementById("calc-price-input");
    const calcDownpaymentPct = document.getElementById("calc-downpayment-pct");
    const calcInterestRate = document.getElementById("calc-interest-rate");
    const calcTermYears = document.getElementById("calc-term-years");
    const calcMonthlyOutput = document.getElementById("calc-monthly-payment-output");
    
    // Función de cálculo hipotecario
    function updateCalculations() {
      const price = parseFloat(calcPriceInput.value) || 0;
      const downpaymentPercent = parseFloat(calcDownpaymentPct.value) || 0;
      const downpayment = price * (downpaymentPercent / 100);
      const loanAmount = price - downpayment;
      
      const annualRate = parseFloat(calcInterestRate.value) || 0;
      const monthlyRate = (annualRate / 12) / 100;
      const years = parseInt(calcTermYears.value) || 20;
      const months = years * 12;

      let monthlyPayment = 0;
      if (loanAmount > 0) {
        if (monthlyRate > 0) {
          monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        } else {
          monthlyPayment = loanAmount / months;
        }
      }

      currentMonthlyPayment = Math.round(monthlyPayment);
      calcMonthlyOutput.textContent = formatCurrency(monthlyPayment, "MXN");
    }

    // Event listeners para calculadora
    calcPriceInput.addEventListener("input", updateCalculations);
    calcDownpaymentPct.addEventListener("input", updateCalculations);
    calcInterestRate.addEventListener("input", updateCalculations);
    calcTermYears.addEventListener("change", updateCalculations);
    
    // Ejecutar cálculo inicial
    updateCalculations();

    // Lógica de Galería de Fotos
    function updateGalleryState() {
      const mainGalleryImage = document.getElementById("main-gallery-image");
      if (mainGalleryImage) mainGalleryImage.src = images[currentImageIndex];
      thumbs.forEach(t => t.classList.remove("active"));
      document.querySelector(`[data-index="${currentImageIndex}"]`)?.classList.add("active");
    }

    const bindGalleryNav = () => {
      const prevBtn = document.getElementById("gallery-prev-btn");
      const nextBtn = document.getElementById("gallery-next-btn");
      if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
          currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
          updateGalleryState();
        });
        nextBtn.addEventListener("click", () => {
          currentImageIndex = (currentImageIndex + 1) % images.length;
          updateGalleryState();
        });
      }
    };

    bindGalleryNav();

    thumbs.forEach(thumb => {
      thumb.addEventListener("click", () => {
        currentImageIndex = parseInt(thumb.getAttribute("data-index"));
        updateGalleryState();
      });
    });

    // Pestañas Multimedia (Foto / Video / Tour)
    const tabPhotos = document.getElementById("tab-photos");
    const tabVideo = document.getElementById("tab-video");
    const tabTour = document.getElementById("tab-tour");

    tabPhotos.addEventListener("click", () => {
      tabPhotos.classList.add("active");
      tabVideo.classList.remove("active");
      tabTour.classList.remove("active");
      
      mediaViewport.innerHTML = `
        <img src="${images[currentImageIndex]}" alt="${prop.title}" class="gallery-main-img" id="main-gallery-image">
        <div class="gallery-nav-buttons" id="gallery-nav-controls">
          <button class="gallery-nav-btn" id="gallery-prev-btn"><i data-lucide="chevron-left"></i></button>
          <button class="gallery-nav-btn" id="gallery-next-btn"><i data-lucide="chevron-right"></i></button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      
      // Re-vincular controles de fotos
      bindGalleryNav();
    });

    if (prop.videoUrl) {
      tabVideo.addEventListener("click", () => {
        tabPhotos.classList.remove("active");
        tabVideo.classList.add("active");
        tabTour.classList.remove("active");
        
        mediaViewport.innerHTML = `
          <video controls autoplay class="gallery-main-img video-viewport">
            <source src="${prop.videoUrl}" type="video/mp4">
            ${L("Tu navegador no soporta reproducción de video.", "Your browser does not support video playback.")}
          </video>
        `;
      });
    }

    if (prop.virtualTour) {
      tabTour.addEventListener("click", () => {
        tabPhotos.classList.remove("active");
        tabVideo.classList.remove("active");
        tabTour.classList.add("active");
        
        // Simulación de Recorrido 3D interactivo
        mediaViewport.innerHTML = `
          <div class="tour-viewport">
            <div class="tour-circle-animation">
              <i data-lucide="rotate-3d" class="icon-xl tour-icon"></i>
            </div>
            <div>
              <h3>${L("Recorrido Virtual 360° Activo", "360° Virtual Tour Active")}</h3>
              <p class="tour-instructions">${L("Haz click y arrastra para rotar la visualización del Living Room", "Click and drag to rotate the Living Room view")}</p>
            </div>
            <div class="tour-actions">
              <button class="btn btn-secondary tour-btn">${L("Cocina", "Kitchen")}</button>
              <button class="btn btn-primary tour-btn">${L("Terraza Principal", "Main Terrace")}</button>
              <button class="btn btn-secondary tour-btn">${L("Habitación Master", "Master Bedroom")}</button>
            </div>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // Guardar favorita (Ficha)
    const detailFavBtn = document.getElementById("detail-fav-btn");
    detailFavBtn.addEventListener("click", () => {
      if (!appState.currentUser) {
        alert(L("Inicia sesión para guardar favoritos.", "Sign in to save favorites."));
        return;
      }
      let favorites = appState.currentUser.favorites || [];
      if (favorites.includes(prop.id)) {
        favorites = favorites.filter(id => id !== prop.id);
        detailFavBtn.innerHTML = `<i data-lucide="heart" class="icon-inline icon-md"></i> ${L("Guardar", "Save")}`;
      } else {
        favorites.push(prop.id);
        detailFavBtn.innerHTML = `<i data-lucide="heart" class="icon-inline icon-md color-danger display-inline"></i> ${L("Guardado", "Saved")}`;
      }
      appState.currentUser.favorites = favorites;
      updateUserProfile(appState.currentUser);
      if (window.lucide) window.lucide.createIcons();
    });

    // Favoritos en Propiedades Similares
    document.querySelectorAll(".prop-similar-footer-grid .property-favorite-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!appState.currentUser) {
          alert(L("Inicia sesión para guardar favoritos.", "Sign in to save favorites."));
          return;
        }
        const simId = btn.getAttribute("data-id");
        let favorites = appState.currentUser.favorites || [];
        if (favorites.includes(simId)) {
          favorites = favorites.filter(id => id !== simId);
          btn.classList.remove("active");
        } else {
          favorites.push(simId);
          btn.classList.add("active");
        }
        appState.currentUser.favorites = favorites;
        updateUserProfile(appState.currentUser);
      });
    });

    // Compartir Propiedad
    document.getElementById("detail-share-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(window.location.href);
      alert(L("¡Enlace de la propiedad copiado al portapapeles!", "Property link copied to clipboard!"));
    });

    // Chat directo con asesor
    document.getElementById("open-advisor-chat-btn").addEventListener("click", () => {
      const chatbotWindow = document.getElementById("ai-chatbot-window");
      chatbotWindow.classList.add("active");
      
      const chatBody = document.getElementById("ai-chat-body");
      const msgDiv = document.createElement("div");
      msgDiv.className = "chat-message bot";
      const clientName = appState.currentUser?.name || L("cliente", "there");
      msgDiv.innerHTML = L(
        `💼 **Mensaje de ${prop.advisor.name}**:\n"Hola ${clientName}, veo que estás revisando la propiedad *${prop.title}*. ¿Te gustaría que te mande la ficha técnica completa o agendemos una llamada?"`,
        `💼 **Message from ${prop.advisor.name}**:\n"Hi ${clientName}, I see you're checking out *${prop.title}*. Would you like me to send you the full spec sheet or schedule a call?"`
      );
      chatBody.appendChild(msgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    });

    // Agendar Visita (Formulario)
    const scheduleForm = document.getElementById("visit-schedule-form");
    scheduleForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!appState.currentUser) {
        alert(L("Por favor inicia sesión para agendar visitas.", "Please sign in to schedule visits."));
        return;
      }
      const dateVal = document.getElementById("schedule-date").value;
      const timeVal = document.getElementById("schedule-time").value;
      
      // Añadir visita al historial del cliente
      const visits = appState.currentUser.visits || [];
      visits.push({
        id: `vis-${Date.now()}`,
        propertyId: prop.id,
        date: dateVal,
        time: timeVal,
        status: L("Pendiente de Confirmación", "Pending Confirmation")
      });
      appState.currentUser.visits = visits;
      updateUserProfile(appState.currentUser);

      // Simulación en el CRM del Asesor: añadir como Lead
      const crmLeads = JSON.parse(localStorage.getItem("mudat_crm_leads")) || [];
      crmLeads.push({
        id: `lead-${Date.now()}`,
        clientName: appState.currentUser.name,
        clientEmail: appState.currentUser.email,
        phone: appState.currentUser.phone,
        propertyName: prop.title,
        propertyId: prop.id,
        stage: "Visita", // Comienza directamente en stage visita por agendar
        date: dateVal,
        time: timeVal,
        notes: L("Agenda enviada por portal de cliente.", "Visit scheduled from client portal.")
      });
      localStorage.setItem("mudat_crm_leads", JSON.stringify(crmLeads));

      alert(L(
        `¡Cita programada con éxito para el día ${dateVal} a las ${timeVal}! El asesor ${prop.advisor.name} te contactará a la brevedad.`,
        `Visit successfully scheduled for ${dateVal} at ${timeVal}! Advisor ${prop.advisor.name} will contact you shortly.`
      ));
    });
    
    // Solicitar preaprobación de crédito hipotecario
    document.getElementById("calc-preapprove-btn").addEventListener("click", () => {
      if (!appState.currentUser) {
        alert(L("Inicia sesión para solicitar un crédito hipotecario.", "Sign in to apply for a mortgage loan."));
        return;
      }
      const amount = parseFloat(calcPriceInput.value) * (1 - (parseFloat(calcDownpaymentPct.value)/100));
      const credits = appState.currentUser.credits || [];
      credits.push({
        id: `cred-${Date.now()}`,
        bank: L("MudaT Pre-Aprobado (Santander / Banorte)", "MudaT Pre-Approved (Santander / Banorte)"),
        amount: amount,
        status: L("En Evaluación", "Under Review"),
        monthlyPayment: currentMonthlyPayment
      });
      appState.currentUser.credits = credits;
      updateUserProfile(appState.currentUser);
      alert(L(
        "¡Solicitud enviada! Iniciando pre-aprobación digital con bancos asociados. Revisa el estado de tu trámite en tu portal.",
        "Request sent! Initiating digital pre-approval with partner banks. Check your application status in your portal."
      ));
    });

    // Inicializar módulo interactivo CONOCE LA ZONA
    initConoceLaZona(prop);
  }

  return { html, init };
}

