import { L, tCategory, formatCurrency, getLang } from "../services/i18n.js";

export async function renderPublishProperty(state) {
  const html = `
    <div class="section-container fade-in">
      <div class="pub-container-max">
        
        <h2 class="pub-title">${L("Publica tu Inmueble en MudaT", "Publish your Property on MudaT")}</h2>
        
        <!-- Indicador de Pasos -->
        <div class="form-step-indicator">
          <div class="step-node active" id="step-node-1">1</div>
          <div class="step-node" id="step-node-2">2</div>
          <div class="step-node" id="step-node-3">3</div>
          <div class="step-node" id="step-node-4">4</div>
        </div>

        <form id="publish-property-form" class="pub-form glass-premium glow-brand">
          
          <!-- Paso 1: Detalles Generales -->
          <div class="step-section" id="step-section-1">
            <h3 class="pub-step-title">${L("Paso 1: Información Básica", "Step 1: Basic Information")}</h3>
            
            <div class="pub-stack">
              <div class="filter-group">
                <label>${L("Título del Anuncio", "Listing Title")}</label>
                <input type="text" class="filter-input" id="pub-title" placeholder="${L("Ej. Hermosa Residencia en San Pedro Garza García", "e.g. Beautiful Residence in San Pedro Garza García")}" required>
              </div>
              
              <div class="pub-grid-half">
                <div class="filter-group">
                  <label>${L("Tipo de Operación", "Operation Type")}</label>
                  <select class="filter-select" id="pub-type" required>
                    <option value="buy">${tCategory("Venta") === "Sold" ? L("Venta", "Sale") : L("Venta", "Sale")}</option>
                    <option value="rent">${tCategory("Rentar")}</option>
                    <option value="presale">${tCategory("Preventa")}</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>${L("Categoría de Inmueble", "Property Category")}</label>
                  <select class="filter-select" id="pub-category" required>
                    <option value="Comprar">${L("Residencial (Venta)", "Residential (Sale)")}</option>
                    <option value="Rentar">${L("Residencial (Renta)", "Residential (Rent)")}</option>
                    <option value="Oficinas">${tCategory("Oficinas")}</option>
                    <option value="Terrenos">${tCategory("Terrenos")}</option>
                    <option value="Industrial">${tCategory("Industrial")}</option>
                  </select>
                </div>
              </div>

              <div class="pub-grid-half">
                <div class="filter-group">
                  <label>${L("Precio Solicitado (MXN)", "Asking Price (MXN)")}</label>
                  <input type="number" min="1" class="filter-input" id="pub-price" placeholder="${L("Ej. 4500000", "e.g. 4500000")}" required>
                </div>
                <div class="filter-group">
                  <label>${L("Antigüedad (Años)", "Property Age (Years)")}</label>
                  <input type="number" min="0" class="filter-input" id="pub-age" placeholder="${L("0 = Preventa / Nueva", "0 = Presale / New")}" required>
                </div>
              </div>
            </div>
            
            <div class="pub-flex-end">
              <button type="button" class="btn btn-primary next-step-btn" data-next="2">${L("Siguiente Paso", "Next Step")}</button>
            </div>
          </div>

          <!-- Paso 2: Amenidades y Especificaciones -->
          <div class="step-section display-none" id="step-section-2">
            <h3 class="pub-step-title">${L("Paso 2: Características y Amenidades", "Step 2: Features & Amenities")}</h3>
            
            <div class="pub-stack">
              <div class="pub-grid-three">
                <div class="filter-group">
                  <label>${L("Recámaras", "Bedrooms")}</label>
                  <input type="number" min="0" class="filter-input" id="pub-bedrooms" value="3" required>
                </div>
                <div class="filter-group">
                  <label>${L("Baños", "Bathrooms")}</label>
                  <input type="number" min="0" class="filter-input" id="pub-bathrooms" value="2.5" step="0.5" required>
                </div>
                <div class="filter-group">
                  <label>${L("Construcción (m²)", "Built Area (m²)")}</label>
                  <input type="number" min="1" class="filter-input" id="pub-construction" placeholder="${L("Ej. 180", "e.g. 180")}" required>
                </div>
              </div>

              <div class="filter-group">
                <label>${L("Ubicación", "Location")}</label>
                <div class="pub-grid-half">
                  <input type="text" class="filter-input" id="pub-neighborhood" placeholder="${L("Colonia (Ej. Polanco)", "Neighborhood (e.g. Polanco)")}" required>
                  <select class="filter-select" id="pub-city" required>
                    <option value="CDMX">CDMX</option>
                    <option value="San Pedro">San Pedro (MTY)</option>
                    <option value="Guadalajara">Guadalajara</option>
                    <option value="Tulum">Tulum</option>
                    <option value="Querétaro">Querétaro</option>
                  </select>
                </div>
              </div>

              <label class="pub-amenities-title">${L("Amenidades", "Amenities")}</label>
              <div class="checkbox-filters border-none padding-0">
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Alberca"> <span>${L("Alberca 🏊‍♂️", "Pool 🏊‍♂️")}</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Seguridad 24/7"> <span>${L("Seguridad 🛡️", "24/7 Security 🛡️")}</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Mascotas permitidas"> <span>${L("Mascotas 🐾", "Pet Friendly 🐾")}</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Gimnasio"> <span>${L("Gimnasio 🏋️‍♂️", "Gym 🏋️‍♂️")}</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Roof Garden"> <span>Roof Garden 🌇</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Jardín"> <span>${L("Jardín 🌳", "Garden 🌳")}</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Elevador"> <span>${L("Elevador 🛗", "Elevator 🛗")}</span></label>
              </div>
            </div>

            <div class="pub-flex-between">
              <button type="button" class="btn btn-secondary prev-step-btn" data-prev="1">${L("Atrás", "Back")}</button>
              <button type="button" class="btn btn-primary next-step-btn" data-next="3">${L("Siguiente Paso", "Next Step")}</button>
            </div>
          </div>

          <!-- Paso 3: Documentación y Firma Digital del Contrato -->
          <div class="step-section display-none" id="step-section-3">
            <h3 class="pub-step-title">${L("Paso 3: Validación Legal y Firma", "Step 3: Legal Validation & Signature")}</h3>
            
            <div class="pub-stack">
              <div class="pub-contract-notice">
                <h4>${L("Contrato Digital de Exclusividad / Publicación", "Digital Exclusivity / Listing Agreement")}</h4>
                <p>${L(
                  "Al firmar de forma electrónica este documento, el propietario / asesor certifica tener la posesión legal o poder notarial del inmueble, y acepta los términos del servicio y las comisiones pactadas en MudaT.",
                  "By electronically signing this document, the owner / advisor certifies legal possession or power of attorney for the property, and accepts the terms of service and agreed commissions on MudaT."
                )}</p>
              </div>

              <div class="filter-group">
                <label>${L("Firma Electrónica del Propietario (Dibuja abajo)", "Owner Electronic Signature (Draw below)")}</label>
                <div class="signature-canvas-wrapper">
                  <canvas class="signature-canvas" id="signature-canvas"></canvas>
                </div>
                <div class="pub-signature-clear-btn-row">
                  <button type="button" class="btn btn-secondary pub-signature-clear-btn" id="clear-signature-btn">${L("Limpiar Firma", "Clear Signature")}</button>
                </div>
              </div>
            </div>

            <div class="pub-flex-between">
              <button type="button" class="btn btn-secondary prev-step-btn" data-prev="2">${L("Atrás", "Back")}</button>
              <button type="button" class="btn btn-primary next-step-btn" data-next="4">${L("Siguiente Paso", "Next Step")}</button>
            </div>
          </div>

          <!-- Paso 4: IA Generator y Selección de Plan -->
          <div class="step-section display-none" id="step-section-4">
            <h3 class="pub-step-title">${L("Paso 4: Redacción con IA y Planes", "Step 4: AI Copywriting & Plans")}</h3>
            
            <div class="pub-stack">
              
              <!-- Redactor de Descripciones por IA -->
              <div class="ia-generator-widget">
                <h4>
                  <i data-lucide="sparkles"></i> ${L("Redactor de Anuncios MudaT AI", "MudaT AI Listing Copywriter")}
                </h4>
                <p>${L(
                  "Genera títulos y descripciones de alta conversión optimizadas para Google y portales inmobiliarios.",
                  "Generate high-converting titles and descriptions optimized for Google and real estate portals."
                )}</p>
                <div class="ia-generator-widget-row">
                  <select class="filter-select ia-generator-style-select" id="ia-concept-style">
                    <option value="Lujo y Exclusividad">${L("Estilo Lujo/Premium", "Luxury/Premium Style")}</option>
                    <option value="Familiar y Confortable">${L("Estilo Familiar/Confort", "Family/Comfort Style")}</option>
                    <option value="Moderno y Minimalista">${L("Estilo Minimalista/Smart", "Minimalist/Smart Style")}</option>
                  </select>
                  <button type="button" class="btn btn-outline" id="ia-generate-desc-btn"><i data-lucide="sparkles" class="icon-sm display-inline"></i> ${L("Redactar con IA", "Write with AI")}</button>
                </div>
                <textarea class="filter-input ia-generator-textarea" id="pub-description" rows="5" placeholder="${L("Redacta la descripción del inmueble o usa el botón superior de Inteligencia Artificial...", "Write the property description or use the AI button above...")}" required></textarea>
              </div>

              <!-- Selector de Plan Comercial -->
              <label class="pub-plan-selection-title">${L("Selecciona tu Plan de Publicación", "Select your Listing Plan")}</label>
              <div class="pub-plan-grid">
                <div class="pub-plan-card-premium">
                  <span class="pub-plan-badge-recommended">${L("RECOMENDADO", "RECOMMENDED")}</span>
                  <h5>${L("Plan Premium Destacado", "Featured Premium Plan")}</h5>
                  <p class="desc">${L(
                    "Exposición máxima en buscadores y mapa, asistente IA y generación de leads directos.",
                    "Maximum exposure in search and map, AI assistant, and direct lead generation."
                  )}</p>
                  <p class="price">${formatCurrency(1499, "MXN")} MXN / ${L("mes", "mo")}</p>
                </div>
                <div class="pub-plan-card-basic">
                  <h5>${L("Plan Básico Gratuito", "Free Basic Plan")}</h5>
                  <p class="desc">${L("Publicación básica estándar. Vence en 30 días.", "Standard basic listing. Expires in 30 days.")}</p>
                  <p class="price">${formatCurrency(0, "MXN")} MXN</p>
                </div>
              </div>
            </div>

            <div class="pub-flex-between">
              <button type="button" class="btn btn-secondary prev-step-btn" data-prev="3">${L("Atrás", "Back")}</button>
              <button type="submit" class="btn btn-success pub-submit-btn"><i data-lucide="check-circle"></i> ${L("Publicar Inmueble", "Publish Property")}</button>
            </div>
          </div>

        </form>

      </div>
    </div>
  `;

  function init(appState) {
    const nextBtns = document.querySelectorAll(".next-step-btn");
    const prevBtns = document.querySelectorAll(".prev-step-btn");
    const form = document.getElementById("publish-property-form");

    // Navegación de pasos
    nextBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const currentSection = btn.closest(".step-section");
        if (currentSection) {
          const requiredFields = currentSection.querySelectorAll("[required]");
          for (const field of requiredFields) {
            if (!field.checkValidity()) {
              field.reportValidity();
              return;
            }
          }
        }
        const nextStep = btn.getAttribute("data-next");
        switchStep(nextStep);
      });
    });

    prevBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const prevStep = btn.getAttribute("data-prev");
        switchStep(prevStep);
      });
    });

    function switchStep(stepNum) {
      document.querySelectorAll(".step-section").forEach(sec => sec.classList.add("display-none"));
      document.getElementById(`step-section-${stepNum}`).classList.remove("display-none");

      // Actualizar nodos
      document.querySelectorAll(".step-node").forEach((node, idx) => {
        const nodeNum = idx + 1;
        node.classList.remove("active", "completed");
        if (nodeNum < stepNum) {
          node.classList.add("completed");
        } else if (nodeNum == stepNum) {
          node.classList.add("active");
        }
      });

      // Si es paso 3, inicializar el canvas de firmas
      if (stepNum == 3) {
        initSignatureCanvas();
      }
    }

    // Lógica del Canvas para Dibujar Firma
    let canvas, ctx, drawing = false;

    function initSignatureCanvas() {
      canvas = document.getElementById("signature-canvas");
      if (!canvas) return;
      
      // Adapt size to container
      const rect = canvas.parentNode.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      ctx = canvas.getContext("2d");
      ctx.strokeStyle = "var(--text-primary)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      // Mouse Events
      canvas.addEventListener("mousedown", startDrawing);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", stopDrawing);
      canvas.addEventListener("mouseout", stopDrawing);

      // Touch Events for Mobile
      canvas.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        startDrawing(touch);
      }, { passive: true });

      canvas.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        draw(touch);
      }, { passive: true });

      canvas.addEventListener("touchend", stopDrawing);
    }

    function startDrawing(e) {
      drawing = true;
      ctx.beginPath();
      // Calculate coordinates relative to canvas
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.pageX) - rect.left;
      const y = (e.clientY || e.pageY) - rect.top;
      ctx.moveTo(x, y);
    }

    function draw(e) {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.pageX) - rect.left;
      const y = (e.clientY || e.pageY) - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    function stopDrawing() {
      drawing = false;
    }

    // Botón para limpiar canvas
    document.getElementById("clear-signature-btn")?.addEventListener("click", () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    // Lógica de IA para redactar descripciones
    document.getElementById("ia-generate-desc-btn").addEventListener("click", () => {
      const title = document.getElementById("pub-title").value || L("Excelente Inmueble", "Excellent Property");
      const style = document.getElementById("ia-concept-style").value;
      const bedrooms = document.getElementById("pub-bedrooms").value;
      const bathrooms = document.getElementById("pub-bathrooms").value;
      const price = parseFloat(document.getElementById("pub-price").value) || 3000000;
      const neighborhood = document.getElementById("pub-neighborhood").value || "Polanco";
      const city = document.getElementById("pub-city").value;

      // Generar amenidades seleccionadas
      const selectedAm = Array.from(document.querySelectorAll(".pub-amenity:checked")).map(cb => cb.value);
      const amenitiesText = selectedAm.length > 0 
        ? L(
            `Adicionalmente, se destaca por ofrecer amenidades de primer nivel como ${selectedAm.join(', ')}.`,
            `Additionally, it stands out for offering top-tier amenities such as ${selectedAm.join(', ')}.`
          )
        : '';

      const formattedPrice = formatCurrency(price, "MXN");

      const generatedText = L(
        `✨ [REDACTADO POR IA DE MUDAT] ✨
Presentamos "${title}", magnífica propiedad ubicada en la prestigiosa colonia ${neighborhood}, en ${city}. 

Con un concepto diseñado bajo un estilo de ${style}, este inmueble destaca por su excelente distribución arquitectónica que maximiza la luz natural y el aprovechamiento de los espacios. Cuenta con ${bedrooms} recámaras de excelente tamaño y ${bathrooms} baños completos. 

Es una oportunidad única en el mercado ofrecida a ${formattedPrice} con alta plusvalía garantizada a corto plazo. ${amenitiesText}

Ideal tanto para vivir en una de las zonas más dinámicas y seguras como para inversión de alto rendimiento. Agenda una cita con nuestros asesores certificados de MudaT hoy mismo para coordinar una visita física o recorrido 3D.`,
        `✨ [WRITTEN BY MUDAT AI] ✨
Introducing "${title}", a magnificent property located in the prestigious neighborhood of ${neighborhood}, in ${city}. 

Designed under a ${style} concept, this property stands out for its outstanding architectural layout that maximizes natural light and space efficiency. It features ${bedrooms} spacious bedrooms and ${bathrooms} full bathrooms. 

A unique market opportunity offered at ${formattedPrice} with strong short-term appreciation. ${amenitiesText}

Ideal both for living in one of the most dynamic and secure areas and for high-yield investment. Schedule an appointment with our certified MudaT advisors today for an in-person visit or 3D tour.`
      );

      document.getElementById("pub-description").value = generatedText;
      alert(L(
        "¡Descripción estructurada optimizada para buscadores (SEO) generada por la IA de MudaT!",
        "SEO-optimized structured description generated by MudaT AI!"
      ));
    });

    // Envío final del Formulario
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const currentUser = appState?.currentUser || state?.currentUser;
      if (!currentUser) {
        alert(L(
          "Debes iniciar sesión para publicar una propiedad en MudaT.",
          "You must sign in to publish a property on MudaT."
        ));
        document.getElementById("login-modal")?.classList.remove("display-none");
        return;
      }

      // Create new property object
      const newId = `prop-${Date.now()}`;
      const title = document.getElementById("pub-title").value;
      const type = document.getElementById("pub-type").value;
      const category = document.getElementById("pub-category").value;
      const price = parseFloat(document.getElementById("pub-price").value);
      const bedrooms = parseInt(document.getElementById("pub-bedrooms").value);
      const bathrooms = parseFloat(document.getElementById("pub-bathrooms").value);
      const construction = parseFloat(document.getElementById("pub-construction").value);
      const neighborhood = document.getElementById("pub-neighborhood").value;
      const city = document.getElementById("pub-city").value;
      const description = document.getElementById("pub-description").value;

      const selectedAm = Array.from(document.querySelectorAll(".pub-amenity:checked")).map(cb => cb.value);

      const newProperty = {
        id: newId,
        title: title,
        description: description,
        type: type,
        category: category || (type === "rent" ? "Rentar" : type === "presale" ? "Preventa" : "Comprar"),
        price: price,
        currency: "MXN",
        location: {
          street: L("Dirección registrada por validar", "Registered address pending verification"),
          neighborhood: neighborhood,
          city: city,
          state: city === "CDMX" ? "CDMX" : city === "San Pedro" ? "Nuevo León" : "Jalisco",
          lat: 19.4200,
          lng: -99.1700
        },
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        construction: construction,
        land: construction,
        amenities: selectedAm,
        plusvalia: L("8.5% anual (estimada)", "8.5% annual (estimated)"),
        age: parseInt(document.getElementById("pub-age").value) || 0,
        images: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
        ],
        virtualTour: "",
        videoUrl: "",
        advisor: {
          id: currentUser.id,
          name: currentUser.name,
          phone: currentUser.phone || "+52 55 1234 5678",
          email: currentUser.email,
          avatar: currentUser.avatar,
          rating: 4.8
        },
        roi: "7.0%",
        schoolsNearby: true,
        hospitalsNearby: true,
        mallsNearby: true,
        transportNearby: true
      };

      // Push to app state properties
      appState.properties.push(newProperty);
      
      // Update advisor listings simulation immediately
      alert(L(
        "¡Tu propiedad ha sido publicada exitosamente y se encuentra activa en el catálogo general de MudaT!",
        "Your property has been published successfully and is now active in the MudaT catalog!"
      ));
      
      // Redirect to catalog
      window.location.hash = "#inicio";
    });
  }

  return { html, init };
}
