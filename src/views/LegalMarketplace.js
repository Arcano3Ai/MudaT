export async function renderLegalMarketplace(state) {
  const html = `
    <div class="section-container fade-in">
      <div class="hero-section" style="padding: 4rem 2rem; background: transparent; border: none; margin-left: 0; width: 100%;">
        <div class="hero-glow-1"></div>
        <h2 class="hero-title" style="font-size: 3rem;">Marketplace Legal</h2>
        <p class="hero-subtitle">Contratos inteligentes, revisión notarial y protección Escrow integrados en un solo clic para asegurar tu patrimonio.</p>
      </div>

      <div class="categories-shortcuts-grid" style="margin-top: 0;">
        <!-- Contratos Inteligentes -->
        <div class="shortcut-card glass-premium glow-brand">
          <div class="shortcut-icon-circle bg-gold-glow">
            <i data-lucide="file-signature"></i>
          </div>
          <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem;">Contratos Inteligentes</h4>
          <p style="margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.5;">Generación automática de contratos de compraventa y arrendamiento validados por la NOM-247 y firmados digitalmente bajo la NOM-151.</p>
          <button class="btn btn-outline btn-full-width" id="legal-contract-btn">Solicitar por $990 MXN</button>
        </div>
        
        <!-- Revisión Notarial -->
        <div class="shortcut-card glass-premium glow-brand">
          <div class="shortcut-icon-circle bg-purple-glow">
            <i data-lucide="scale"></i>
          </div>
          <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem;">Red de Notarías</h4>
          <p style="margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.5;">Trámites de escrituración rápidos con nuestra red de notarías premium asociadas a nivel nacional. Cotización transparente.</p>
          <button class="btn btn-outline btn-full-width" id="legal-notary-btn">Cotizar Honorarios</button>
        </div>

        <!-- Protección Escrow -->
        <div class="shortcut-card glass-premium glow-brand">
          <div class="shortcut-icon-circle bg-emerald-glow">
            <i data-lucide="shield-check"></i>
          </div>
          <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem;">Protección Escrow</h4>
          <p style="margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.5;">Retención de fondos segura durante el proceso de transacción para proteger tanto a compradores como a vendedores.</p>
          <button class="btn btn-outline btn-full-width" id="legal-escrow-btn">Ver Tarifas de Escrow</button>
        </div>
      </div>
    </div>
  `;

  function init() {
    if (window.lucide) window.lucide.createIcons();

    document.getElementById("legal-contract-btn")?.addEventListener("click", () => {
      alert("Iniciando generación de contrato inteligente basado en Blockchain...");
    });
    
    document.getElementById("legal-notary-btn")?.addEventListener("click", () => {
      alert("Buscando notarías disponibles en tu zona con tarifas preferenciales MudaT...");
    });

    document.getElementById("legal-escrow-btn")?.addEventListener("click", () => {
      alert("El servicio Escrow de MudaT retiene los fondos de forma segura por una comisión del 0.5% sobre la transacción. Redirigiendo a apertura de cuenta...");
    });
  }

  return { html, init };
}
