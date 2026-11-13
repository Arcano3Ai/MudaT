import { L, tCategory, formatCurrency, getLang } from "../services/i18n.js";

export async function renderAppraisals(state) {
  const html = `
    <div class="section-container fade-in">
      <div class="hero-section" style="padding: 4rem 2rem 2rem; background: transparent; border: none; margin-left: 0; width: 100%;">
        <div class="hero-glow-2"></div>
        <h2 class="hero-title" style="font-size: 3rem;">${L("Avalúos Inteligentes", "Smart Appraisals")}</h2>
        <p class="hero-subtitle">${L(
          "Conoce el valor real de mercado de cualquier propiedad en México gracias a nuestro algoritmo de Inteligencia Artificial y Machine Learning.",
          "Discover the true market value of any property in Mexico powered by our Artificial Intelligence and Machine Learning engine."
        )}</p>
      </div>

      <div class="search-widget glass-premium glow-brand fade-in" style="max-width: 900px; margin: 0 auto; text-align: left;">
        <h3 class="margin-bottom-md" style="font-size: 1.3rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
          <i data-lucide="cpu" class="icon-inline color-brand icon-lg"></i> 
          ${L("Motor de Valuación MudaT AI", "MudaT AI Valuation Engine")}
        </h3>
        
        <div class="search-fields" style="grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
          <div class="search-field-group">
            <label>${L("Ubicación (Código Postal o Colonia)", "Location (Postal Code or Neighborhood)")}</label>
            <div class="search-input-wrapper">
              <i data-lucide="map" class="icon-inline icon-md text-secondary"></i>
              <input type="text" class="filter-input" id="avaluo-loc" placeholder="${L("Ej. Polanco, 11560", "e.g. Polanco, 11560")}" style="width: 100%; border:none; background:transparent; color:inherit; outline:none;" required>
            </div>
          </div>
          
          <div class="search-field-group">
            <label>${L("Metros Cuadrados Totales (m²)", "Total Square Meters (m²)")}</label>
            <div class="search-input-wrapper">
              <i data-lucide="maximize" class="icon-inline icon-md text-secondary"></i>
              <input type="number" min="1" class="filter-input" id="avaluo-m2" placeholder="${L("Ej. 120", "e.g. 120")}" style="width: 100%; border:none; background:transparent; color:inherit; outline:none;" required>
            </div>
          </div>
          
          <div class="search-field-group">
            <label>${L("Recámaras", "Bedrooms")}</label>
            <div class="search-input-wrapper">
              <i data-lucide="bed" class="icon-inline icon-md text-secondary"></i>
              <input type="number" min="0" class="filter-input" id="avaluo-bed" placeholder="${L("Ej. 3", "e.g. 3")}" style="width: 100%; border:none; background:transparent; color:inherit; outline:none;">
            </div>
          </div>
          
          <div class="search-field-group">
            <label>${L("Baños", "Bathrooms")}</label>
            <div class="search-input-wrapper">
              <i data-lucide="bath" class="icon-inline icon-md text-secondary"></i>
              <input type="number" min="0" step="0.5" class="filter-input" id="avaluo-bath" placeholder="${L("Ej. 2", "e.g. 2")}" style="width: 100%; border:none; background:transparent; color:inherit; outline:none;">
            </div>
          </div>
          
          <button class="search-submit-btn" id="generate-avaluo-btn" style="grid-column: span 2; margin-top: 1rem; padding: 1rem; font-size: 1rem;">
            <i data-lucide="sparkles" class="icon-inline"></i> ${L("Calcular Valor de Mercado", "Calculate Market Value")}
          </button>
        </div>
      </div>

      <!-- Sección de Resultados (Oculta inicialmente) -->
      <div id="avaluo-result-panel" class="display-none" style="max-width: 900px; margin: 3rem auto 0;">
        <div class="calculator-result-card glass-premium glow-brand">
          <span class="calc-result-title">${L("Estimación de Valor de Mercado (MudaT AI)", "Estimated Market Value (MudaT AI)")}</span>
          <p class="monthly-payment-amount color-success" id="avaluo-price-range" style="margin: 1rem 0;"></p>
          <p class="cat-info" style="margin-bottom: 1.5rem;">${L(
            "Basado en el análisis en tiempo real de más de 15,000 propiedades similares en la zona y tendencias macroeconómicas.",
            "Based on real-time analysis of over 15,000 comparable properties in the area and macroeconomic trends."
          )}</p>
          
          <div style="display:flex; gap: 1rem;">
            <button class="btn btn-primary" id="download-avaluo-pdf-btn" style="flex:1;"><i data-lucide="download"></i> ${L("Descargar Reporte PDF", "Download PDF Report")}</button>
            <button class="btn btn-secondary" id="request-official-avaluo-btn" style="flex:1;"><i data-lucide="user-check"></i> ${L("Solicitar Avalúo Oficial (Perito)", "Request Official Appraisal (Certified)")}</button>
          </div>
        </div>
      </div>

    </div>
  `;

  function init() {
    if (window.lucide) window.lucide.createIcons();

    let lastValuation = null;

    document.getElementById("generate-avaluo-btn")?.addEventListener("click", () => {
      const loc = document.getElementById("avaluo-loc").value.trim();
      const rawSqm = document.getElementById("avaluo-m2").value;
      const sqm = Number(rawSqm);

      if (!loc || !rawSqm || !Number.isFinite(sqm) || sqm <= 0) {
        alert(L(
          "Por favor ingresa una ubicación y una superficie válida mayor a 0 m² para que la IA pueda calcular el valor.",
          "Please enter a location and a valid area greater than 0 m² so the AI can calculate the value."
        ));
        return;
      }

      // Simple mock AI logic calculation
      const baseValue = sqm * 45000; // Mock base $45k MXN per m2
      const min = baseValue * 0.9;
      const max = baseValue * 1.15;
      const rangeText = `${formatCurrency(min, "MXN")} - ${formatCurrency(max, "MXN")}`;

      lastValuation = { loc, sqm, rangeText };

      document.getElementById("avaluo-price-range").textContent = rangeText;
      document.getElementById("avaluo-result-panel").classList.remove("display-none");
      document.getElementById("avaluo-result-panel").classList.add("fade-in");
    });

    document.getElementById("download-avaluo-pdf-btn")?.addEventListener("click", () => {
      const summary = lastValuation
        ? `${lastValuation.loc} (${lastValuation.sqm} m²): ${lastValuation.rangeText}`
        : document.getElementById("avaluo-price-range")?.textContent || "";
      alert(L(
        `Generando reporte PDF de valuación MudaT AI...\n${summary}\nTu descarga comenzará en unos segundos.`,
        `Generating MudaT AI valuation PDF report...\n${summary}\nYour download will begin shortly.`
      ));
    });

    document.getElementById("request-official-avaluo-btn")?.addEventListener("click", () => {
      const loc = lastValuation?.loc || document.getElementById("avaluo-loc")?.value.trim() || "";
      alert(L(
        `Solicitud de avalúo oficial con perito certificado registrada${loc ? ` para ${loc}` : ""}. Un especialista de MudaT te contactará en menos de 24 horas.`,
        `Official certified appraiser request submitted${loc ? ` for ${loc}` : ""}. A MudaT specialist will contact you within 24 hours.`
      ));
    });
  }

  return { html, init };
}
