import { L, tCategory, formatCurrency, getLang } from "../services/i18n.js";

export async function renderLegalMarketplace(state) {
  const html = `
    <div class="section-container fade-in">
      <div class="hero-section" style="padding: 4rem 2rem; background: transparent; border: none; margin-left: 0; width: 100%;">
        <div class="hero-glow-1"></div>
        <h2 class="hero-title" style="font-size: 3rem;">${L("Marketplace Legal", "Legal Marketplace")}</h2>
        <p class="hero-subtitle">${L(
          "Contratos inteligentes, revisión notarial y protección Escrow integrados en un solo clic para asegurar tu patrimonio.",
          "Smart contracts, notary review, and Escrow protection integrated in one click to safeguard your assets."
        )}</p>
      </div>

      <div class="categories-shortcuts-grid" style="margin-top: 0;">
        <!-- Contratos Inteligentes -->
        <div class="shortcut-card glass-premium glow-brand">
          <div class="shortcut-icon-circle bg-gold-glow">
            <i data-lucide="file-signature"></i>
          </div>
          <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem;">${L("Contratos Inteligentes", "Smart Contracts")}</h4>
          <p style="margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.5;">${L(
            "Generación automática de contratos de compraventa y arrendamiento validados por la NOM-247 y firmados digitalmente bajo la NOM-151.",
            "Automated generation of purchase and lease contracts compliant with NOM-247 and digitally signed under NOM-151."
          )}</p>
          <button class="btn btn-outline btn-full-width" id="legal-contract-btn">${L(`Solicitar por ${formatCurrency(990, "MXN")} MXN`, `Request for ${formatCurrency(990, "MXN")} MXN`)}</button>
        </div>
        
        <!-- Revisión Notarial -->
        <div class="shortcut-card glass-premium glow-brand">
          <div class="shortcut-icon-circle bg-purple-glow">
            <i data-lucide="scale"></i>
          </div>
          <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem;">${L("Red de Notarías", "Notary Network")}</h4>
          <p style="margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.5;">${L(
            "Trámites de escrituración rápidos con nuestra red de notarías premium asociadas a nivel nacional. Cotización transparente.",
            "Fast deed and closing procedures with our nationwide network of partner premium notaries. Transparent quotes."
          )}</p>
          <button class="btn btn-outline btn-full-width" id="legal-notary-btn">${L("Cotizar Honorarios", "Request Fee Quote")}</button>
        </div>

        <!-- Protección Escrow -->
        <div class="shortcut-card glass-premium glow-brand">
          <div class="shortcut-icon-circle bg-emerald-glow">
            <i data-lucide="shield-check"></i>
          </div>
          <h4 style="margin-bottom: 0.5rem; font-size: 1.2rem;">${L("Protección Escrow", "Escrow Protection")}</h4>
          <p style="margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.5;">${L(
            "Retención de fondos segura durante el proceso de transacción para proteger tanto a compradores como a vendedores.",
            "Secure funds holding throughout the transaction process to protect both buyers and sellers."
          )}</p>
          <button class="btn btn-outline btn-full-width" id="legal-escrow-btn">${L("Ver Tarifas de Escrow", "View Escrow Rates")}</button>
        </div>
      </div>
    </div>
  `;

  function init() {
    if (window.lucide) window.lucide.createIcons();

    document.getElementById("legal-contract-btn")?.addEventListener("click", () => {
      alert(L(
        "Iniciando generación de contrato inteligente basado en Blockchain...",
        "Starting Blockchain-backed smart contract generation..."
      ));
    });
    
    document.getElementById("legal-notary-btn")?.addEventListener("click", () => {
      alert(L(
        "Buscando notarías disponibles en tu zona con tarifas preferenciales MudaT...",
        "Searching for available partner notaries in your area with MudaT preferential rates..."
      ));
    });

    document.getElementById("legal-escrow-btn")?.addEventListener("click", () => {
      alert(L(
        "El servicio Escrow de MudaT retiene los fondos de forma segura por una comisión del 0.5% sobre la transacción. Redirigiendo a apertura de cuenta...",
        "MudaT Escrow securely holds funds for a 0.5% transaction fee. Redirecting to account onboarding..."
      ));
    });
  }

  return { html, init };
}
