export async function renderPublishProperty(state) {
  const html = `
    <div class="section-container fade-in">
      <div class="pub-container-max">
        
        <h2 class="pub-title">Publica tu Inmueble en MudaT</h2>
        
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
            <h3 class="pub-step-title">Paso 1: Información Básica</h3>
            
            <div class="pub-stack">
              <div class="filter-group">
                <label>Título del Anuncio</label>
                <input type="text" class="filter-input" id="pub-title" placeholder="Ej. Hermosa Residencia en San Pedro Garza García" required>
              </div>
              
              <div class="pub-grid-half">
                <div class="filter-group">
                  <label>Tipo de Operación</label>
                  <select class="filter-select" id="pub-type" required>
                    <option value="buy">Venta</option>
                    <option value="rent">Renta</option>
                    <option value="presale">Preventa</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>Categoría de Inmueble</label>
                  <select class="filter-select" id="pub-category" required>
                    <option value="Comprar">Residencial (Venta)</option>
                    <option value="Rentar">Residencial (Renta)</option>
                    <option value="Oficinas">Oficinas</option>
                    <option value="Terrenos">Terrenos</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
              </div>

              <div class="pub-grid-half">
                <div class="filter-group">
                  <label>Precio Solicitado (MXN)</label>
                  <input type="number" class="filter-input" id="pub-price" placeholder="Ej. 4500000" required>
                </div>
                <div class="filter-group">
                  <label>Antigüedad (Años)</label>
                  <input type="number" class="filter-input" id="pub-age" placeholder="0 = Preventa / Nueva" required>
                </div>
              </div>
            </div>
            
            <div class="pub-flex-end">
              <button type="button" class="btn btn-primary next-step-btn" data-next="2">Siguiente Paso</button>
            </div>
          </div>

          <!-- Paso 2: Amenidades y Especificaciones -->
          <div class="step-section display-none" id="step-section-2">
            <h3 class="pub-step-title">Paso 2: Características y Amenidades</h3>
            
            <div class="pub-stack">
              <div class="pub-grid-three">
                <div class="filter-group">
                  <label>Recámaras</label>
                  <input type="number" class="filter-input" id="pub-bedrooms" value="3" required>
                </div>
                <div class="filter-group">
                  <label>Baños</label>
                  <input type="number" class="filter-input" id="pub-bathrooms" value="2.5" step="0.5" required>
                </div>
                <div class="filter-group">
                  <label>Construcción (m²)</label>
                  <input type="number" class="filter-input" id="pub-construction" placeholder="Ej. 180" required>
                </div>
              </div>

              <div class="filter-group">
                <label>Ubicación</label>
                <div class="pub-grid-half">
                  <input type="text" class="filter-input" id="pub-neighborhood" placeholder="Colonia (Ej. Polanco)" required>
                  <select class="filter-select" id="pub-city" required>
                    <option value="CDMX">CDMX</option>
                    <option value="San Pedro">San Pedro (MTY)</option>
                    <option value="Guadalajara">Guadalajara</option>
                    <option value="Tulum">Tulum</option>
                    <option value="Querétaro">Querétaro</option>
                  </select>
                </div>
              </div>

              <label class="pub-amenities-title">Amenidades</label>
              <div class="checkbox-filters border-none padding-0">
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Alberca"> <span>Alberca 🏊‍♂️</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Seguridad 24/7"> <span>Seguridad 🛡️</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Mascotas permitidas"> <span>Mascotas 🐾</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Gimnasio"> <span>Gimnasio 🏋️‍♂️</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Roof Garden"> <span>Roof Garden 🌇</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Jardín"> <span>Jardín 🌳</span></label>
                <label class="checkbox-label"><input type="checkbox" class="pub-amenity" value="Elevador"> <span>Elevador 🛗</span></label>
              </div>
            </div>

            <div class="pub-flex-between">
              <button type="button" class="btn btn-secondary prev-step-btn" data-prev="1">Atrás</button>
              <button type="button" class="btn btn-primary next-step-btn" data-next="3">Siguiente Paso</button>
            </div>
          </div>

          <!-- Paso 3: Documentación y Firma Digital del Contrato -->
          <div class="step-section display-none" id="step-section-3">
            <h3 class="pub-step-title">Paso 3: Validación Legal y Firma</h3>
            
            <div class="pub-stack">
              <div class="pub-contract-notice">
                <h4>Contrato Digital de Exclusividad / Publicación</h4>
                <p>Al firmar de forma electrónica este documento, el propietario / asesor certifica tener la posesión legal o poder notarial del inmueble, y acepta los términos del servicio y las comisiones pactadas en MudaT.</p>
              </div>

              <div class="filter-group">
                <label>Firma Electrónica del Propietario (Dibuja abajo)</label>
                <div class="signature-canvas-wrapper">
                  <canvas class="signature-canvas" id="signature-canvas"></canvas>
                </div>
                <div class="pub-signature-clear-btn-row">
                  <button type="button" class="btn btn-secondary pub-signature-clear-btn" id="clear-signature-btn">Limpiar Firma</button>
                </div>
              </div>
            </div>

            <div class="pub-flex-between">
              <button type="button" class="btn btn-secondary prev-step-btn" data-prev="2">Atrás</button>
              <button type="button" class="btn btn-primary next-step-btn" data-next="4">Siguiente Paso</button>
            </div>
          </div>

          <!-- Paso 4: IA Generator y Selección de Plan -->
          <div class="step-section display-none" id="step-section-4">
            <h3 class="pub-step-title">Paso 4: Redacción con IA y Planes</h3>
            
            <div class="pub-stack">
              
              <!-- Redactor de Descripciones por IA -->
              <div class="ia-generator-widget">
                <h4>
                  <i data-lucide="sparkles"></i> Redactor de Anuncios MudaT AI
                </h4>
                <p>Genera títulos y descripciones de alta conversión optimizadas para Google y portales inmobiliarios.</p>
                <div class="ia-generator-widget-row">
                  <select class="filter-select ia-generator-style-select" id="ia-concept-style">
                    <option value="Lujo y Exclusividad">Estilo Lujo/Premium</option>
                    <option value="Familiar y Confortable">Estilo Familiar/Confort</option>
                    <option value="Moderno y Minimalista">Estilo Minimalista/Smart</option>
                  </select>
                  <button type="button" class="btn btn-outline" id="ia-generate-desc-btn"><i data-lucide="sparkles" class="icon-sm display-inline"></i> Redactar con IA</button>
                </div>
                <textarea class="filter-input ia-generator-textarea" id="pub-description" rows="5" placeholder="Redacta la descripción del inmueble o usa el botón superior de Inteligencia Artificial..." required></textarea>
              </div>

              <!-- Selector de Plan Comercial -->
              <label class="pub-plan-selection-title">Selecciona tu Plan de Publicación</label>
              <div class="pub-plan-grid">
                <div class="pub-plan-card-premium">
                  <span class="pub-plan-badge-recommended">RECOMENDADO</span>
                  <h5>Plan Premium Destacado</h5>
                  <p class="desc">Exposición máxima en buscadores y mapa, asistente IA y generación de leads directos.</p>
                  <p class="price">$1,499 MXN / mes</p>
                </div>
                <div class="pub-plan-card-basic">
                  <h5>Plan Básico Gratuito</h5>
                  <p class="desc">Publicación básica estándar. Vence en 30 días.</p>
                  <p class="price">$0 MXN</p>
                </div>
              </div>
            </div>

            <div class="pub-flex-between">
              <button type="button" class="btn btn-secondary prev-step-btn" data-prev="3">Atrás</button>
              <button type="submit" class="btn btn-success pub-submit-btn"><i data-lucide="check-circle"></i> Publicar Inmueble</button>
            </div>
          </div>

        </form>

      </div>
    </div>
  `;          </div>
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
        const nextStep = btn.getAttribute("data-next");
        // Validar inputs mínimos de este paso (simplificado para demo)
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
      const title = document.getElementById("pub-title").value || "Excelente Inmueble";
      const style = document.getElementById("ia-concept-style").value;
      const bedrooms = document.getElementById("pub-bedrooms").value;
      const bathrooms = document.getElementById("pub-bathrooms").value;
      const price = parseFloat(document.getElementById("pub-price").value) || 3000000;
      const neighborhood = document.getElementById("pub-neighborhood").value || "Polanco";
      const city = document.getElementById("pub-city").value;

      // Generar amenidades seleccionadas
      const selectedAm = Array.from(document.querySelectorAll(".pub-amenity:checked")).map(cb => cb.value);
      const amenitiesText = selectedAm.length > 0 
        ? `Adicionalmente, se destaca por ofrecer amenidades de primer nivel como ${selectedAm.join(', ')}.` 
        : '';

      const formattedPrice = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(price);

      const generatedText = `✨ [REDACTADO POR IA DE MUDAT] ✨
Presentamos esta magnífica propiedad ubicada en la prestigiosa colonia ${neighborhood}, en ${city}. 

Con un concepto diseñado bajo un estilo de ${style}, este inmueble destaca por su excelente distribución arquitectónica que maximiza la luz natural y el aprovechamiento de los espacios. Cuenta con ${bedrooms} recámaras de excelente tamaño y ${bathrooms} baños completos. 

Es una oportunidad única en el mercado ofrecida a ${formattedPrice} con alta plusvalía garantizada a corto plazo. ${amenitiesText}

Ideal tanto para vivir en una de las zonas más dinámicas y seguras como para inversión de alto rendimiento. Agenda una cita con nuestros asesores certificados de MudaT hoy mismo para coordinar una visita física o recorrido 3D.`;

      document.getElementById("pub-description").value = generatedText;
      alert("¡Descripción estructurada optimizada para buscadores (SEO) generada por la IA de MudaT!");
    });

    // Envío final del Formulario
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Create new property object
      const newId = `prop-${Date.now()}`;
      const title = document.getElementById("pub-title").value;
      const type = document.getElementById("pub-type").value;
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
        category: type === "rent" ? "Rentar" : "Comprar",
        price: price,
        currency: "MXN",
        location: {
          street: "Dirección registrada por validar",
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
        plusvalia: "8.5% anual (estimada)",
        age: parseInt(document.getElementById("pub-age").value) || 0,
        images: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
        ],
        virtualTour: "",
        videoUrl: "",
        advisor: {
          id: state.currentUser.id,
          name: state.currentUser.name,
          phone: state.currentUser.phone || "+52 55 1234 5678",
          email: state.currentUser.email,
          avatar: state.currentUser.avatar,
          rating: 4.8
        },
        roi: "7.0%",
        schoolsNearby: true,
        hospitalsNearby: true,
        mallsNearby: true,
        transportNearby: true
      };

      // Push to app state properties
      state.properties.push(newProperty);
      
      // Update advisor listings simulation immediately
      alert("¡Tu propiedad ha sido publicada exitosamente y se encuentra activa en el catálogo general de MudaT!");
      
      // Redirect to catalog
      window.location.hash = "#inicio";
    });
  }

  return { html, init };
}
