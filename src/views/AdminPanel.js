export async function renderAdminPanel(state) {
  const html = `
    <div class="section-container fade-in">
      
      <div class="admin-header">
        <div>
          <h2>Consola de Administración SaaS</h2>
          <p>Configuraciones globales, control multi-agente, facturación de suscripciones y moderación de anuncios de MudaT México.</p>
        </div>
        <div class="admin-badge-super">
          Modo: Super Admin
        </div>
      </div>

      <!-- Métricas Globales de Operación -->
      <div class="metrics-row admin-metrics-margin">
        <div class="metric-card">
          <span class="font-sm text-secondary font-semibold">Total Inmobiliarias SaaS</span>
          <span class="metric-value">42</span>
        </div>
        <div class="metric-card">
          <span class="font-sm text-secondary font-semibold">Asesores Suscritos</span>
          <span class="metric-value">185</span>
        </div>
        <div class="metric-card">
          <span class="font-sm text-secondary font-semibold">Inmuebles en Catálogo</span>
          <span class="metric-value" id="admin-listings-count">${state.properties.length}</span>
        </div>
        <div class="metric-card">
          <span class="font-sm text-secondary font-semibold">Suscripciones Facturadas</span>
          <span class="metric-value color-success">$128,400 MXN</span>
        </div>
      </div>

      <!-- Tablas de Gestión (Split Layout) -->
      <div class="admin-split-grid">
        
        <!-- Moderación de Propiedades -->
        <div class="admin-panel-card">
          <h3>
            <i data-lucide="shield-alert" class="color-warning"></i>
            Moderación de Anuncios Pendientes
          </h3>
          
          <div class="comparator-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Inmueble</th>
                  <th>Ubicación</th>
                  <th>Precio</th>
                  <th>Publicador</th>
                  <th>Acción</th>
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
              Monetización y Planes Activos
            </h3>
            <ul class="admin-list-plans">
              <div class="admin-list-plans-item">
                <span>Plan Asesor Mensual (Premium)</span>
                <strong>$899 MXN / mes</strong>
              </div>
              <div class="admin-list-plans-item">
                <span>Plan Inmobiliaria SaaS (Multiagente)</span>
                <strong>$4,500 MXN / mes</strong>
              </div>
              <div class="admin-list-plans-item">
                <span>Destacar Propiedad (Destacada)</span>
                <strong>$499 MXN / 15 días</strong>
              </div>
            </ul>
          </div>

          <!-- Logs del Sistema -->
          <div class="admin-panel-card-half glass-premium">
            <h3>
              <i data-lucide="terminal" class="text-secondary"></i>
              SaaS System Logs (En Vivo)
            </h3>
            <pre class="admin-system-logs">
[2026-06-12 01:04:30] LOG: Inicialización de sesión multi-agente.
[2026-06-12 01:04:45] LOG: Carga de base de datos mockProperties.js exitosa.
[2026-06-12 01:05:00] LOG: Escaneo antivirus en carga de INE Sergio Developer completada: OK.
[2026-06-12 01:05:10] LOG: Generación de copy por IA para "Penthouse Polanco": Exitoso.
[2026-06-12 01:05:15] LOG: Transacción de plan comercial procesada con Stripe: ID ch_3M2h...
            </pre>
          </div>

        </div>

      </div>

    </div>
  `;

  function init(appState) {
    const tbody = document.getElementById("admin-moderation-tbody");
    const countEl = document.getElementById("admin-listings-count");

    function renderModerationTable() {
      if (appState.properties.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay propiedades por moderar.</td></tr>`;
        return;
      }

      tbody.innerHTML = appState.properties.map(prop => {
        const formattedPrice = new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: prop.currency,
          maximumFractionDigits: 0
        }).format(prop.price);

        return `
          <tr id="row-${prop.id}">
            <td class="title">${prop.title}</td>
            <td class="meta">${prop.location.city}</td>
            <td class="price">${formattedPrice}</td>
            <td class="meta">${prop.advisor.name}</td>
            <td>
              <div class="actions">
                <button class="btn btn-success approve-btn" data-id="${prop.id}">Aprobar</button>
                <button class="btn btn-secondary reject-btn color-danger" data-id="${prop.id}">Rechazar</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Enlazar clics
      document.querySelectorAll(".approve-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          alert("El inmueble ha sido validado, certificado con sello verde de MudaT y aprobado para distribución nacional.");
          document.getElementById(`row-${id}`).remove();
        });
      });

      document.querySelectorAll(".reject-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          if (confirm("¿Estás seguro de que deseas dar de baja y rechazar este anuncio?")) {
            appState.properties = appState.properties.filter(p => p.id !== id);
            countEl.textContent = appState.properties.length;
            renderModerationTable();
          }
        });
      });
    }

    renderModerationTable();
  }

  return { html, init };
}
