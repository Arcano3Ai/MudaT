import { L, tCategory, formatCurrency, getLang } from "../services/i18n.js";

export async function renderAdminPanel(state) {
  const html = `
    <div class="section-container fade-in">
      
      <div class="admin-header">
        <div>
          <h2>${L("Consola de Administración SaaS", "SaaS Admin Console")}</h2>
          <p>${L(
            "Configuraciones globales, control multi-agente, facturación de suscripciones y moderación de anuncios de MudaT México.",
            "Global settings, multi-agent control, subscription billing, and listing moderation for MudaT Mexico."
          )}</p>
        </div>
        <div class="admin-badge-super">
          ${L("Modo: Super Admin", "Mode: Super Admin")}
        </div>
      </div>

      <!-- Métricas Globales de Operación -->
      <div class="metrics-row admin-metrics-margin">
        <div class="metric-card">
          <span class="font-sm text-secondary font-semibold">${L("Total Inmobiliarias SaaS", "Total SaaS Agencies")}</span>
          <span class="metric-value">42</span>
        </div>
        <div class="metric-card">
          <span class="font-sm text-secondary font-semibold">${L("Asesores Suscritos", "Subscribed Advisors")}</span>
          <span class="metric-value">185</span>
        </div>
        <div class="metric-card">
          <span class="font-sm text-secondary font-semibold">${L("Inmuebles en Catálogo", "Properties in Catalog")}</span>
          <span class="metric-value" id="admin-listings-count">${state.properties.length}</span>
        </div>
        <div class="metric-card">
          <span class="font-sm text-secondary font-semibold">${L("Suscripciones Facturadas", "Billed Subscriptions")}</span>
          <span class="metric-value color-success">${formatCurrency(128400, "MXN")} MXN</span>
        </div>
      </div>

      <!-- Tablas de Gestión (Split Layout) -->
      <div class="admin-split-grid">
        
        <!-- Moderación de Propiedades -->
        <div class="admin-panel-card">
          <h3>
            <i data-lucide="shield-alert" class="color-warning"></i>
            ${L("Moderación de Anuncios Pendientes", "Pending Listing Moderation")}
          </h3>
          
          <div class="comparator-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>${L("Inmueble", "Property")}</th>
                  <th>${L("Ubicación", "Location")}</th>
                  <th>${L("Precio", "Price")}</th>
                  <th>${L("Publicador", "Publisher")}</th>
                  <th>${L("Acción", "Action")}</th>
                </tr>
              </thead>
              <tbody id="admin-moderation-tbody">
                <!-- Se inyecta dinámicamente -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Panel de Suscripciones y Tickets -->
        <div class="pub-stack gap-lg">
          
          <!-- Monetización y Planes -->
          <div class="admin-panel-card-half glass-premium">
            <h3>
              <i data-lucide="badge-percent" class="color-brand"></i>
              ${L("Monetización y Planes Activos", "Monetization & Active Plans")}
            </h3>
            <ul class="admin-list-plans">
              <div class="admin-list-plans-item">
                <span>${L("Plan Asesor Mensual (Premium)", "Monthly Advisor Plan (Premium)")}</span>
                <strong>${formatCurrency(899, "MXN")} MXN / ${L("mes", "mo")}</strong>
              </div>
              <div class="admin-list-plans-item">
                <span>${L("Plan Inmobiliaria SaaS (Multiagente)", "SaaS Agency Plan (Multi-agent)")}</span>
                <strong>${formatCurrency(4500, "MXN")} MXN / ${L("mes", "mo")}</strong>
              </div>
              <div class="admin-list-plans-item">
                <span>${L("Destacar Propiedad (Destacada)", "Feature Property (Highlighted)")}</span>
                <strong>${formatCurrency(499, "MXN")} MXN / ${L("15 días", "15 days")}</strong>
              </div>
            </ul>
          </div>

          <!-- Logs del Sistema -->
          <div class="admin-panel-card-half glass-premium">
            <h3>
              <i data-lucide="terminal" class="text-secondary"></i>
              ${L("SaaS System Logs (En Vivo)", "SaaS System Logs (Live)")}
            </h3>
            <pre class="admin-system-logs">
[2026-06-12 01:04:30] LOG: ${L("Inicialización de sesión multi-agente.", "Multi-agent session initialized.")}
[2026-06-12 01:04:45] LOG: ${L("Carga de base de datos mockProperties.js exitosa.", "Database mockProperties.js loaded successfully.")}
[2026-06-12 01:05:00] LOG: ${L("Escaneo antivirus en carga de INE Sergio Developer completada: OK.", "Antivirus scan on Sergio Developer ID upload completed: OK.")}
[2026-06-12 01:05:10] LOG: ${L('Generación de copy por IA para "Penthouse Polanco": Exitoso.', 'AI copy generation for "Penthouse Polanco": Success.')}
[2026-06-12 01:05:15] LOG: ${L("Transacción de plan comercial procesada con Stripe: ID ch_3M2h...", "Commercial plan transaction processed via Stripe: ID ch_3M2h...")}
            </pre>
          </div>

        </div>

      </div>

    </div>
  `;

  function init(appState) {
    const tbody = document.getElementById("admin-moderation-tbody");
    const countEl = document.getElementById("admin-listings-count");
    const approvedIds = new Set();

    function renderModerationTable() {
      const pendingProps = appState.properties.filter(p => !approvedIds.has(p.id));
      if (countEl) {
        countEl.textContent = pendingProps.length;
      }

      if (pendingProps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">${L("No hay propiedades por moderar.", "No properties pending moderation.")}</td></tr>`;
        return;
      }

      tbody.innerHTML = pendingProps.map(prop => {
        const formattedPrice = formatCurrency(prop.price, prop.currency || "MXN");

        return `
          <tr id="row-${prop.id}">
            <td class="title">${prop.title}</td>
            <td class="meta">${prop.location?.city || ""}</td>
            <td class="price">${formattedPrice}</td>
            <td class="meta">${prop.advisor?.name || "MudaT"}</td>
            <td>
              <div class="actions">
                <button class="btn btn-success approve-btn" data-id="${prop.id}">${L("Aprobar", "Approve")}</button>
                <button class="btn btn-secondary reject-btn color-danger" data-id="${prop.id}">${L("Rechazar", "Reject")}</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Enlazar clics
      document.querySelectorAll(".approve-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          approvedIds.add(id);
          alert(L(
            "El inmueble ha sido validado, certificado con sello verde de MudaT y aprobado para distribución nacional.",
            "The property has been validated, certified with MudaT's green seal, and approved for national distribution."
          ));
          renderModerationTable();
        });
      });

      document.querySelectorAll(".reject-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          if (confirm(L(
            "¿Estás seguro de que deseas dar de baja y rechazar este anuncio?",
            "Are you sure you want to remove and reject this listing?"
          ))) {
            appState.properties = appState.properties.filter(p => p.id !== id);
            renderModerationTable();
          }
        });
      });
    }

    renderModerationTable();
  }

  return { html, init };
}
