export async function renderAppraisals(state) {
  const html = `
    <div class="section-container fade-in">
      <div class="hero-section" style="padding: 4rem 2rem 2rem; background: transparent; border: none; margin-left: 0; width: 100%;">
        <div class="hero-glow-2"></div>
        <h2 class="hero-title" style="font-size: 3rem;">Avalúos Inteligentes</h2>
        <p class="hero-subtitle">Conoce el valor real de mercado de cualquier propiedad en México gracias a nuestro algoritmo de Inteligencia Artificial y Machine Learning.</p>
      </div>

      <div class="search-widget glass-premium glow-brand fade-in" style="max-width: 900px; margin: 0 auto; text-align: left;">
        <h3 class="margin-bottom-md" style="font-size: 1.3rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
          <i data-lucide="cpu" class="icon-inline color-brand icon-lg"></i> 
          Motor de Valuación MudaT AI
        </h3>
        
        <div class="search-fields" style="grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
          <div class="search-field-group">
            <label>Ubicación (Código Postal o Colonia)</label>
            <div class="search-input-wrapper">
              <i data-lucide="map" class="icon-inline icon-md text-secondary"></i>
              <input type="text" class="filter-input" id="avaluo-loc" placeholder="Ej. Polanco, 11560" style="width: 100%; border:none; background:transparent; color:inherit; outline:none;" required>
            </div>
          </div>
          
          <div class="search-field-group">
            <label>Metros Cuadrados Totales (m²)</label>
            <div class="search-input-wrapper">
              <i data-lucide="maximize" class="icon-inline icon-md text-secondary"></i>
              <input type="number" class="filter-input" id="avaluo-m2" placeholder="Ej. 120" style="width: 100%; border:none; background:transparent; color:inherit; outline:none;" required>
            </div>
          </div>
          
          <div class="search-field-group">
            <label>Recámaras</label>
            <div class="search-input-wrapper">
              <i data-lucide="bed" class="icon-inline icon-md text-secondary"></i>
              <input type="number" class="filter-input" id="avaluo-bed" placeholder="Ej. 3" style="width: 100%; border:none; background:transparent; color:inherit; outline:none;">
            </div>
          </div>
          
          <div class="search-field-group">
            <label>Baños</label>
            <div class="search-input-wrapper">
              <i data-lucide="bath" class="icon-inline icon-md text-secondary"></i>
              <input type="number" class="filter-input" id="avaluo-bath" placeholder="Ej. 2" style="width: 100%; border:none; background:transparent; color:inherit; outline:none;">
            </div>
          </div>
          
          <button class="search-submit-btn" id="generate-avaluo-btn" style="grid-column: span 2; margin-top: 1rem; padding: 1rem; font-size: 1rem;">
            <i data-lucide="sparkles" class="icon-inline"></i> Calcular Valor de Mercado
          </button>
        </div>
      </div>

      <!-- Sección de Resultados (Oculta inicialmente) -->
      <div id="avaluo-result-panel" class="display-none" style="max-width: 900px; margin: 3rem auto 0;">
        <div class="calculator-result-card glass-premium glow-brand">
          <span class="calc-result-title">Estimación de Valor de Mercado (MudaT AI)</span>
          <p class="monthly-payment-amount color-success" id="avaluo-price-range" style="margin: 1rem 0;"></p>
          <p class="cat-info" style="margin-bottom: 1.5rem;">Basado en el análisis en tiempo real de más de 15,000 propiedades similares en la zona y tendencias macroeconómicas.</p>
          
          <div style="display:flex; gap: 1rem;">
            <button class="btn btn-primary" style="flex:1;"><i data-lucide="download"></i> Descargar Reporte PDF</button>
            <button class="btn btn-secondary" style="flex:1;"><i data-lucide="user-check"></i> Solicitar Avalúo Oficial (Perito)</button>
          </div>
        </div>
      </div>

    </div>
  `;

  function init() {
    if (window.lucide) window.lucide.createIcons();

    document.getElementById("generate-avaluo-btn")?.addEventListener("click", () => {
      const loc = document.getElementById("avaluo-loc").value;
      const m2 = document.getElementById("avaluo-m2").value;
      
      if(!loc || !m2) {
        alert("Por favor ingresa la ubicación y los metros cuadrados para que la IA pueda calcular el valor.");
        return;
      }

      // Simple mock AI logic calculation
      const baseValue = parseInt(m2) * 45000; // Mock base $45k mxn per m2
      const min = baseValue * 0.9;
      const max = baseValue * 1.15;

      const formatMXN = (num) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num);

      document.getElementById("avaluo-price-range").textContent = `${formatMXN(min)} - ${formatMXN(max)}`;
      document.getElementById("avaluo-result-panel").classList.remove("display-none");
      document.getElementById("avaluo-result-panel").classList.add("fade-in");
    });
  }

  return { html, init };
}
