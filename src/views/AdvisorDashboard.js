import { updateUserProfile } from "../services/auth.js";

const DEFAULT_CRM_LEADS = [
  { id: "lead-1", clientName: "Sergio Developer", clientEmail: "sergio@desarrollador.com", phone: "+525555551234", propertyName: "Penthouse Exclusivo con Vista Panorámica", propertyId: "prop-1", stage: "Interesado", date: "2026-11-15", time: "11:00 AM", notes: "Busca enganche del 30%. Interesado en escrituración rápida." },
  { id: "lead-2", clientName: "Alejandra Ruiz", clientEmail: "alejandra.r@gmail.com", phone: "+525588889999", propertyName: "Departamento Contemporáneo en Narvarte Poniente", propertyId: "prop-9", stage: "Visita", date: "2026-11-16", time: "04:30 PM", notes: "Preaprobación bancaria lista por $2.8M MXN." },
  { id: "lead-3", clientName: "Sofía Martínez", clientEmail: "sofia.m@outlook.com", phone: "+528199998888", propertyName: "Casa Residencial Minimalista en Zibatá", propertyId: "prop-10", stage: "Negociación", date: "2026-11-14", time: "10:00 AM", notes: "Oferta presentada de $2.8M MXN. En revisión por propietario." },
  { id: "lead-4", clientName: "Roberto Gómez", clientEmail: "roberto.g@gmail.com", phone: "+523322221111", propertyName: "Departamento Smart en Preventa - Distrito La Ribera", propertyId: "prop-4", stage: "Escrituración", date: "2026-11-18", time: "01:00 PM", notes: "Documentación notarial validada. Cita para firma de contrato." },
  { id: "lead-5", clientName: "Valeria Torres", clientEmail: "valeria.t@icloud.com", phone: "+525544332211", propertyName: "Townhouse Arquitectónico en Roma Norte", propertyId: "prop-14", stage: "Venta", date: "2026-11-10", time: "12:00 PM", notes: "Operación cerrada exitosamente. Comisión en proceso de dispersión." }
];

const DEFAULT_CRM_LOGS = [
  { id: "log-1", tag: "Venta", colorClass: "color-success", text: "Operación cerrada con Valeria Torres — Townhouse Roma Norte." },
  { id: "log-2", tag: "Visita", colorClass: "color-brand", text: "Cita confirmada con Alejandra Ruiz para Depto. Narvarte Poniente." },
  { id: "log-3", tag: "IA Tracking", colorClass: "color-brand", text: "Seguimiento automático enviado a Sofía Martínez (Zibatá)." }
];

const formatCurrencyMXN = (amount) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(amount || 0);

const appendCrmLog = (tag, text, colorClass = "color-brand") => {
  const logs = JSON.parse(localStorage.getItem("mudat_crm_logs")) || [...DEFAULT_CRM_LOGS];
  logs.unshift({ id: `log-${Date.now()}`, tag, colorClass, text });
  localStorage.setItem("mudat_crm_logs", JSON.stringify(logs.slice(0, 8)));
};

export async function renderAdvisorDashboard(state) {
  if (!localStorage.getItem("mudat_crm_leads")) {
    localStorage.setItem("mudat_crm_leads", JSON.stringify(DEFAULT_CRM_LEADS));
  }
  if (!localStorage.getItem("mudat_crm_logs")) {
    localStorage.setItem("mudat_crm_logs", JSON.stringify(DEFAULT_CRM_LOGS));
  }

  const user = state.currentUser || {};

  const html = `
    <div class="section-container fade-in">
      <div class="dashboard-grid">
        
        <!-- Sidebar de Navegación del Asesor -->
        <aside class="dashboard-nav glass-premium">
          <div class="advisor-aside-header">
            <img src="${user.avatar || './assets/images/asesora-yesenia-cuevas.jpg'}" alt="${user.name}" class="advisor-aside-avatar">
            <h3 class="advisor-aside-name">${user.name}</h3>
            <p class="advisor-aside-meta">${user.agency || 'MudaT Bienes Raíces • Asesora Principal'}</p>
            <span class="advisor-rating-pill">★ ${(user.rating || 5.0).toFixed(1)} Certificada</span>
          </div>
          <ul class="dashboard-menu-list">
            <li class="dashboard-menu-item active" data-tab="advisor-overview"><i data-lucide="layout-dashboard"></i> Dashboard</li>
            <li class="dashboard-menu-item" data-tab="advisor-crm"><i data-lucide="kanban"></i> Embudo CRM</li>
            <li class="dashboard-menu-item" data-tab="advisor-listings"><i data-lucide="home"></i> Mis Propiedades</li>
            <li class="dashboard-menu-item" data-tab="advisor-commissions"><i data-lucide="badge-dollar-sign"></i> Comisiones</li>
            <li class="dashboard-menu-item" data-tab="advisor-profile"><i data-lucide="user-cog"></i> Mi Perfil</li>
          </ul>
        </aside>

        <!-- Contenido Central Dinámico -->
        <div class="dashboard-content-panel" id="advisor-content-mount"></div>

      </div>
    </div>

    <!-- Modal Profesional para Nuevo Lead / Cita -->
    <div id="crm-lead-modal" class="login-modal-overlay display-none">
      <div class="login-modal-card glass-premium glow-brand">
        <button id="close-crm-modal-btn" class="login-modal-close-btn">&times;</button>
        <h3 class="login-modal-title">Registrar Nuevo Prospecto</h3>
        <p class="login-modal-subtitle">Agrega un lead al embudo CRM y asígnale una propiedad de tu cartera.</p>
        <form id="crm-new-lead-form" class="pub-form" style="border:none; padding:0; background:transparent;">
          <div class="filter-group">
            <label>Nombre Completo</label>
            <input type="text" class="filter-input" id="crm-lead-name" placeholder="Ej. Mariana Vázquez" required>
          </div>
          <div class="advisor-modal-row">
            <div class="filter-group">
              <label>Teléfono / WhatsApp</label>
              <input type="tel" class="filter-input" id="crm-lead-phone" placeholder="+52 55 1234 5678" required>
            </div>
            <div class="filter-group">
              <label>Correo Electrónico</label>
              <input type="email" class="filter-input" id="crm-lead-email" placeholder="cliente@correo.com">
            </div>
          </div>
          <div class="filter-group">
            <label>Propiedad de Interés</label>
            <select class="filter-select" id="crm-lead-property"></select>
          </div>
          <div class="advisor-modal-row">
            <div class="filter-group">
              <label>Etapa Inicial</label>
              <select class="filter-select" id="crm-lead-stage">
                <option value="Lead">Lead</option>
                <option value="Contacto">Contacto</option>
                <option value="Interesado">Interesado</option>
                <option value="Visita">Visita</option>
                <option value="Oferta">Oferta</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Fecha de Seguimiento / Cita</label>
              <input type="date" class="filter-input" id="crm-lead-date">
            </div>
          </div>
          <div class="filter-group">
            <label>Notas del Cliente</label>
            <input type="text" class="filter-input" id="crm-lead-notes" placeholder="Ej. Presupuesto 2.5M - 3M, busca crédito bancario">
          </div>
          <button type="submit" class="btn btn-primary btn-full-width" style="margin-top:1.25rem;">Guardar en Embudo CRM</button>
        </form>
      </div>
    </div>
  `;

  function init(appState) {
    const menuItems = document.querySelectorAll(".dashboard-menu-item");
    const mountPoint = document.getElementById("advisor-content-mount");
    const stages = ["Lead", "Contacto", "Interesado", "Visita", "Oferta", "Negociación", "Escrituración", "Venta", "Postventa"];
    let crmSearchQuery = "";

    const getLeads = () => JSON.parse(localStorage.getItem("mudat_crm_leads")) || [];
    const saveLeads = (leads) => localStorage.setItem("mudat_crm_leads", JSON.stringify(leads));

    function switchTab(tabId) {
      menuItems.forEach(item => item.classList.remove("active"));
      const activeItem = Array.from(menuItems).find(item => item.getAttribute("data-tab") === tabId);
      if (activeItem) activeItem.classList.add("active");

      if (tabId === "advisor-overview") renderOverview();
      else if (tabId === "advisor-crm") renderCRM();
      else if (tabId === "advisor-listings") renderListings();
      else if (tabId === "advisor-commissions") renderCommissions();
      else if (tabId === "advisor-profile") renderProfile();

      if (window.lucide) window.lucide.createIcons();
    }

    menuItems.forEach(item => {
      item.addEventListener("click", () => switchTab(item.getAttribute("data-tab")));
    });

    // Modal de Nuevo Lead
    const crmModal = document.getElementById("crm-lead-modal");
    const closeCrmModalBtn = document.getElementById("close-crm-modal-btn");
    const newLeadForm = document.getElementById("crm-new-lead-form");

    const openNewLeadModal = (defaultStage = "Lead") => {
      const propSelect = document.getElementById("crm-lead-property");
      propSelect.innerHTML = appState.properties.map(p =>
        `<option value="${p.id}">${p.title} (${formatCurrencyMXN(p.price)})</option>`
      ).join("");
      document.getElementById("crm-lead-stage").value = defaultStage;
      document.getElementById("crm-lead-date").value = new Date().toISOString().split("T")[0];
      crmModal.classList.remove("display-none");
    };

    closeCrmModalBtn?.addEventListener("click", () => crmModal.classList.add("display-none"));
    crmModal?.addEventListener("click", (e) => {
      if (e.target === crmModal) crmModal.classList.add("display-none");
    });

    newLeadForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("crm-lead-name").value.trim();
      const phone = document.getElementById("crm-lead-phone").value.trim();
      const email = document.getElementById("crm-lead-email").value.trim() || `${name.toLowerCase().replace(/\s+/g, ".")}@cliente.mx`;
      const propId = document.getElementById("crm-lead-property").value;
      const stage = document.getElementById("crm-lead-stage").value;
      const date = document.getElementById("crm-lead-date").value || new Date().toISOString().split("T")[0];
      const notes = document.getElementById("crm-lead-notes").value.trim() || "Prospecto registrado desde Portal del Asesor.";
      const selectedProp = appState.properties.find(p => p.id === propId);

      const leads = getLeads();
      leads.unshift({
        id: `lead-${Date.now()}`,
        clientName: name,
        clientEmail: email,
        phone,
        propertyName: selectedProp ? selectedProp.title : "Propiedad MudaT",
        propertyId: propId,
        stage,
        date,
        time: "11:00 AM",
        notes
      });
      saveLeads(leads);
      appendCrmLog("Nuevo Lead", `${name} agregado en etapa ${stage} (${selectedProp?.title || "MudaT"}).`, "color-brand");
      newLeadForm.reset();
      crmModal.classList.add("display-none");

      const activeTab = document.querySelector(".dashboard-menu-item.active")?.getAttribute("data-tab") || "advisor-crm";
      switchTab(activeTab);
    });

    // 1. Sub-vista: Dashboard Overview
    function renderOverview() {
      const leads = getLeads();
      const logs = JSON.parse(localStorage.getItem("mudat_crm_logs")) || DEFAULT_CRM_LOGS;
      const rate = (appState.currentUser.commissionRate || 4.5) / 100;
      const activeListings = appState.properties.filter(p => p.advisor.id === appState.currentUser.id);
      const portfolioValue = activeListings.reduce((sum, p) => sum + (p.price || 0), 0);

      const projectedCommission = leads
        .filter(l => ["Oferta", "Negociación", "Escrituración", "Venta"].includes(l.stage))
        .reduce((acc, curr) => {
          const prop = appState.properties.find(p => p.id === curr.propertyId) || { price: 2800000 };
          return acc + prop.price * rate;
        }, 0);

      const visits = leads.filter(l => l.stage === "Visita" || l.stage === "Escrituración");

      mountPoint.innerHTML = `
        <div class="advisor-header-bar">
          <div>
            <h2 class="client-dashboard-tab-title">Panel Ejecutivo de ${appState.currentUser.name}</h2>
            <p class="font-sm text-secondary">Resumen comercial de cartera, citas programadas y proyecciones de cierre.</p>
          </div>
          <div class="display-flex gap-sm">
            <button class="btn btn-outline btn-sm" id="overview-new-visit-btn"><i data-lucide="calendar-plus"></i> Agendar Visita</button>
            <a href="#publicar" class="btn btn-primary btn-sm"><i data-lucide="plus"></i> Publicar Inmueble</a>
          </div>
        </div>
        
        <div class="metrics-row advisor-metrics-row">
          <div class="metric-card metric-card-purple">
            <span class="font-sm text-secondary font-semibold">Cartera Asignada</span>
            <span class="metric-value">${activeListings.length}</span>
            <span class="font-xs text-muted">${formatCurrencyMXN(portfolioValue)} en inventario</span>
          </div>
          <div class="metric-card metric-card-cyan">
            <span class="font-sm text-secondary font-semibold">Prospectos Activos</span>
            <span class="metric-value">${leads.length}</span>
            <span class="font-xs text-muted">${visits.length} citas próximas</span>
          </div>
          <div class="metric-card metric-card-emerald">
            <span class="font-sm text-secondary font-semibold">Comisión en Pipeline</span>
            <span class="metric-value color-success">${formatCurrencyMXN(projectedCommission)}</span>
            <span class="font-xs text-muted">Tasa pactada: ${appState.currentUser.commissionRate || 4.5}%</span>
          </div>
        </div>

        <div class="advisor-overview-grid">
          <div>
            <h3 class="client-dashboard-overview-section-title">
              <i data-lucide="calendar" class="icon-inline color-brand"></i>
              Agenda y Visitas Programadas
            </h3>
            <div class="client-dashboard-card-container">
              ${visits.map(l => {
                const cleanPhone = (l.phone || "").replace(/\D/g, "");
                const waMsg = encodeURIComponent(`Hola ${l.clientName}, te saluda ${appState.currentUser.name} de MudaT Bienes Raíces para confirmar nuestra cita sobre ${l.propertyName}.`);
                return `
                  <div class="advisor-agenda-card">
                    <div>
                      <p class="font-bold font-sm">${l.clientName} <span class="advisor-stage-pill">${l.stage}</span></p>
                      <p class="advisor-agenda-meta">${l.propertyName}</p>
                      <p class="advisor-agenda-time"><i data-lucide="clock" class="icon-inline icon-sm"></i> ${l.date} • ${l.time || '12:00 PM'}</p>
                    </div>
                    <div class="display-flex gap-sm">
                      <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" rel="noopener" class="btn btn-success btn-sm" title="Enviar WhatsApp">
                        <i data-lucide="message-circle"></i> WhatsApp
                      </a>
                      <button class="btn btn-outline btn-sm launch-chat-btn" data-email="${l.clientEmail}">
                        <i data-lucide="sparkles"></i> IA
                      </button>
                    </div>
                  </div>
                `;
              }).join("") || '<p class="text-muted">No tienes citas programadas próximamente.</p>'}
            </div>
          </div>

          <div class="advisor-activity-log-card">
            <h3 class="font-bold"><i data-lucide="activity" class="icon-inline color-brand"></i> Bitácora Reciente</h3>
            <ul class="advisor-activity-log-list">
              ${logs.map(log => `
                <li><span class="${log.colorClass} font-bold">[${log.tag}]</span> ${log.text}</li>
              `).join("")}
            </ul>
          </div>
        </div>
      `;

      document.getElementById("overview-new-visit-btn")?.addEventListener("click", () => openNewLeadModal("Visita"));

      document.querySelectorAll(".launch-chat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const email = btn.getAttribute("data-email");
          const chatbotWindow = document.getElementById("ai-chatbot-window");
          chatbotWindow.classList.add("active");
          const chatBody = document.getElementById("ai-chat-body");
          const msgDiv = document.createElement("div");
          msgDiv.className = "chat-message bot";
          msgDiv.innerHTML = `🤖 <strong>MudaT AI</strong>: Canal asistente listo para redactar seguimiento a <strong>${email}</strong>.`;
          chatBody.appendChild(msgDiv);
          chatBody.scrollTop = chatBody.scrollHeight;
        });
      });
    }

    // 2. Sub-vista: Embudo CRM Kanban
    function renderCRM() {
      const allLeads = getLeads();
      const query = crmSearchQuery.trim().toLowerCase();
      const filteredLeads = query
        ? allLeads.filter(l =>
            l.clientName.toLowerCase().includes(query) ||
            l.propertyName.toLowerCase().includes(query) ||
            (l.phone || "").toLowerCase().includes(query)
          )
        : allLeads;

      mountPoint.innerHTML = `
        <div class="advisor-kanban-header">
          <div>
            <h2 class="client-dashboard-tab-title">Embudo de Ventas Inmobiliario</h2>
            <p class="font-sm text-secondary">Gestiona tus prospectos por etapa, contáctalos por WhatsApp o genera seguimientos con IA.</p>
          </div>
          <div class="advisor-kanban-controls">
            <input type="text" class="filter-input advisor-crm-search" id="crm-search-input" placeholder="Buscar cliente o inmueble..." value="${crmSearchQuery}">
            <button class="btn btn-primary" id="add-crm-lead-btn"><i data-lucide="plus"></i> Nuevo Lead</button>
          </div>
        </div>

        <div class="crm-pipeline-container" id="crm-kanban-board">
          ${stages.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage);
            return `
              <div class="crm-column" data-stage="${stage}">
                <div class="crm-column-header">
                  <span class="crm-column-title">${stage}</span>
                  <span class="crm-column-count">${stageLeads.length}</span>
                </div>
                <div class="crm-cards-wrapper">
                  ${stageLeads.map(lead => {
                    const cleanPhone = (lead.phone || "").replace(/\D/g, "");
                    const waText = encodeURIComponent(`Hola ${lead.clientName}, te saluda ${appState.currentUser.name} de MudaT Bienes Raíces sobre ${lead.propertyName}.`);
                    return `
                      <div class="crm-card" data-lead-id="${lead.id}">
                        <div class="crm-card-top">
                          <h4 class="crm-card-title">${lead.clientName}</h4>
                          <button class="crm-delete-btn" data-id="${lead.id}" title="Eliminar lead">&times;</button>
                        </div>
                        <p class="crm-card-client">${lead.propertyName}</p>
                        <p class="advisor-kanban-lead-meta">${lead.phone} • ${lead.date || ''}</p>
                        ${lead.notes ? `<p class="crm-card-notes">${lead.notes}</p>` : ""}
                        
                        <div class="advisor-kanban-card-actions">
                          <button class="btn-icon shift-left-btn btn-kanban-shift" data-id="${lead.id}" title="Etapa anterior"><i data-lucide="chevron-left" class="icon-inline icon-sm"></i></button>
                          <a href="https://wa.me/${cleanPhone}?text=${waText}" target="_blank" rel="noopener" class="btn btn-success btn-xs" title="WhatsApp"><i data-lucide="message-circle" class="icon-inline icon-sm"></i> WA</a>
                          <button class="btn btn-outline ia-follow-btn btn-xs" data-id="${lead.id}" title="Generar mensaje con IA"><i data-lucide="sparkles" class="icon-inline icon-sm"></i> IA</button>
                          <button class="btn-icon shift-right-btn btn-kanban-shift" data-id="${lead.id}" title="Siguiente etapa"><i data-lucide="chevron-right" class="icon-inline icon-sm"></i></button>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      const searchInput = document.getElementById("crm-search-input");
      searchInput?.addEventListener("input", (e) => {
        crmSearchQuery = e.target.value;
        renderCRM();
        const restored = document.getElementById("crm-search-input");
        if (restored) {
          restored.focus();
          restored.setSelectionRange(crmSearchQuery.length, crmSearchQuery.length);
        }
        if (window.lucide) window.lucide.createIcons();
      });

      document.getElementById("add-crm-lead-btn")?.addEventListener("click", () => openNewLeadModal("Lead"));

      document.querySelectorAll(".shift-left-btn").forEach(btn => {
        btn.addEventListener("click", () => shiftLeadStage(btn.getAttribute("data-id"), -1));
      });
      document.querySelectorAll(".shift-right-btn").forEach(btn => {
        btn.addEventListener("click", () => shiftLeadStage(btn.getAttribute("data-id"), 1));
      });
      document.querySelectorAll(".crm-delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const updated = getLeads().filter(l => l.id !== id);
          saveLeads(updated);
          renderCRM();
          if (window.lucide) window.lucide.createIcons();
        });
      });
      document.querySelectorAll(".ia-follow-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const lead = getLeads().find(l => l.id === id);
          if (lead) triggerIAFollowUpGenerator(lead);
        });
      });
    }

    function shiftLeadStage(leadId, direction) {
      const currentLeads = getLeads();
      const lead = currentLeads.find(l => l.id === leadId);
      if (!lead) return;
      const newStageIdx = stages.indexOf(lead.stage) + direction;
      if (newStageIdx >= 0 && newStageIdx < stages.length) {
        lead.stage = stages[newStageIdx];
        saveLeads(currentLeads);
        appendCrmLog("CRM", `${lead.clientName} avanzó a etapa ${lead.stage}.`, lead.stage === "Venta" ? "color-success" : "color-brand");
        renderCRM();
        if (window.lucide) window.lucide.createIcons();
      }
    }

    function triggerIAFollowUpGenerator(lead) {
      const whatsappTemplate = `Hola ${lead.clientName}, te saluda ${appState.currentUser.name} de MudaT Bienes Raíces. Te escribo para dar seguimiento a tu interés en *${lead.propertyName}* (etapa: ${lead.stage}). ¿Te gustaría revisar opciones de financiamiento o agendar una visita esta semana?`;
      const chatbotWindow = document.getElementById("ai-chatbot-window");
      chatbotWindow.classList.add("active");

      const chatBody = document.getElementById("ai-chat-body");
      const msgDiv = document.createElement("div");
      msgDiv.className = "chat-message bot";
      msgDiv.innerHTML = `
        🤖 <strong>Redactor Inteligente MudaT AI</strong>:<br>
        Seguimiento sugerido para <strong>${lead.clientName}</strong> (${lead.stage}):<br><br>
        <pre class="ia-log-preview">${whatsappTemplate}</pre><br>
        <button class="btn btn-success btn-sm btn-full-width" id="send-mock-followup-btn">Registrar en Bitácora CRM</button>
      `;
      chatBody.appendChild(msgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;

      document.getElementById("send-mock-followup-btn")?.addEventListener("click", () => {
        appendCrmLog("IA Follow-up", `Seguimiento enviado a ${lead.clientName} (${lead.propertyName}).`, "color-success");
        msgDiv.querySelector("#send-mock-followup-btn").textContent = "✓ Registrado en Bitácora";
      });
    }

    // 3. Sub-vista: Mis Propiedades
    function renderListings() {
      const leads = getLeads();
      const myListings = appState.properties.filter(p => p.advisor.id === appState.currentUser.id);

      mountPoint.innerHTML = `
        <div class="advisor-header-bar">
          <div>
            <h2 class="client-dashboard-tab-title">Mi Cartera de Propiedades (${myListings.length})</h2>
            <p class="font-sm text-secondary">Inmuebles asignados a ${appState.currentUser.name} con métricas de demanda.</p>
          </div>
          <a href="#publicar" class="btn btn-primary btn-sm"><i data-lucide="plus"></i> Publicar Nueva</a>
        </div>
        
        <div class="client-dashboard-card-container">
          ${myListings.map(prop => {
            const propLeadsCount = leads.filter(l => l.propertyId === prop.id).length;
            const shareText = encodeURIComponent(`Te comparto esta propiedad exclusiva de MudaT Bienes Raíces: ${prop.title} en ${prop.location.neighborhood}, ${prop.location.city} (${formatCurrencyMXN(prop.price)}). Asesora: ${appState.currentUser.name}. https://arcano3ai.github.io/MudaT/#propiedad/${prop.id}`);
            return `
              <div class="client-dashboard-card advisor-listing-row">
                <img src="${prop.images[0]}" alt="${prop.title}" class="advisor-listing-thumb">
                <div class="flex-1">
                  <div class="display-flex gap-sm" style="align-items:center; flex-wrap:wrap;">
                    <span class="advisor-stage-pill">${prop.category}</span>
                    <span class="font-xs text-muted">${propLeadsCount} prospectos interesados</span>
                  </div>
                  <h4 class="font-bold" style="margin-top:0.35rem;"><a href="#propiedad/${prop.id}">${prop.title}</a></h4>
                  <p class="font-xs text-muted">${prop.location.neighborhood}, ${prop.location.city} • ${prop.construction || prop.land} m²</p>
                  <p class="font-bold color-brand font-lg margin-top-xs">${formatCurrencyMXN(prop.price)}</p>
                </div>
                <div class="advisor-listing-actions">
                  <a href="#propiedad/${prop.id}" class="btn btn-outline btn-sm"><i data-lucide="eye"></i> Ficha</a>
                  <a href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener" class="btn btn-success btn-sm"><i data-lucide="share-2"></i> WhatsApp</a>
                  <button class="btn btn-outline btn-sm color-danger delete-listing-btn" data-id="${prop.id}"><i data-lucide="trash-2"></i></button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      document.querySelectorAll(".delete-listing-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          if (confirm("¿Deseas retirar esta propiedad de tu cartera activa?")) {
            appState.properties = appState.properties.filter(p => p.id !== id);
            appendCrmLog("Inventario", `Propiedad ${id} retirada de cartera.`, "color-brand");
            renderListings();
            if (window.lucide) window.lucide.createIcons();
          }
        });
      });
    }

    // 4. Sub-vista: Comisiones Dinámicas
    function renderCommissions() {
      const leads = getLeads();
      const rate = parseFloat(appState.currentUser.commissionRate) || 4.5;

      const closedLeads = leads.filter(l => l.stage === "Venta");
      const pipelineLeads = leads.filter(l => ["Oferta", "Negociación", "Escrituración"].includes(l.stage));

      const sumCommission = (list) => list.reduce((acc, l) => {
        const prop = appState.properties.find(p => p.id === l.propertyId) || { price: 2800000 };
        return acc + (prop.price * (rate / 100));
      }, 0);

      const earnedTotal = sumCommission(closedLeads);
      const projectedTotal = sumCommission(pipelineLeads);

      mountPoint.innerHTML = `
        <h2 class="client-dashboard-tab-title">Comisiones e Indicadores Financieros</h2>
        <p class="font-sm text-secondary margin-bottom-lg">Cálculo dinámico sobre operaciones cerradas y en proceso de escrituración.</p>
        
        <div class="advisor-commission-config-card">
          <div>
            <h3 class="font-bold">Esquema de Comisión Pactado</h3>
            <p class="font-sm text-secondary">Agencia: <strong>${appState.currentUser.agency || 'MudaT Bienes Raíces'}</strong></p>
          </div>
          <div class="advisor-rate-control">
            <label for="advisor-rate-input" class="font-xs text-muted">Tasa (%):</label>
            <input type="number" id="advisor-rate-input" class="filter-input" value="${rate}" min="1" max="10" step="0.5" style="width:90px;">
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-card metric-card-emerald">
            <span class="font-sm text-secondary font-semibold">Comisiones Ganadas (${closedLeads.length} cierre)</span>
            <span class="metric-value color-success">${formatCurrencyMXN(earnedTotal)}</span>
            <p class="font-xs text-muted margin-top-xs">Operaciones en etapa Venta</p>
          </div>
          <div class="metric-card metric-card-purple">
            <span class="font-sm text-secondary font-semibold">En Escrituración / Negociación (${pipelineLeads.length})</span>
            <span class="metric-value color-brand">${formatCurrencyMXN(projectedTotal)}</span>
            <p class="font-xs text-muted margin-top-xs">Proyección al ${rate}%</p>
          </div>
        </div>

        <h3 class="client-dashboard-overview-section-title" style="margin-top:1.5rem;">Desglose por Operación</h3>
        <div class="client-dashboard-card-container">
          ${[...closedLeads, ...pipelineLeads].map(l => {
            const prop = appState.properties.find(p => p.id === l.propertyId) || { price: 2800000, title: l.propertyName };
            const comm = prop.price * (rate / 100);
            return `
              <div class="advisor-agenda-card">
                <div>
                  <p class="font-bold font-sm">${l.clientName} <span class="advisor-stage-pill">${l.stage}</span></p>
                  <p class="advisor-agenda-meta">${prop.title} • Valor: ${formatCurrencyMXN(prop.price)}</p>
                </div>
                <span class="font-bold color-success">${formatCurrencyMXN(comm)}</span>
              </div>
            `;
          }).join("") || '<p class="text-muted">Aún no hay operaciones en etapas de cierre.</p>'}
        </div>
      `;

      document.getElementById("advisor-rate-input")?.addEventListener("change", (e) => {
        const newRate = parseFloat(e.target.value) || 4.5;
        appState.currentUser.commissionRate = newRate;
        updateUserProfile(appState.currentUser);
        renderCommissions();
      });
    }

    // 5. Sub-vista: Perfil Comercial del Asesor
    function renderProfile() {
      const u = appState.currentUser;
      mountPoint.innerHTML = `
        <h2 class="client-dashboard-tab-title">Mi Perfil Comercial</h2>
        <p class="font-sm text-secondary margin-bottom-lg">Administra tu información de contacto y datos de asesora en MudaT.</p>

        <form id="advisor-profile-form" class="pub-form" style="max-width:600px;">
          <div class="filter-group">
            <label>Nombre Completo</label>
            <input type="text" class="filter-input" id="adv-prof-name" value="${u.name || ''}" required>
          </div>
          <div class="filter-group" style="margin-top:1rem;">
            <label>Correo Corporativo</label>
            <input type="email" class="filter-input" id="adv-prof-email" value="${u.email || ''}" required>
          </div>
          <div class="filter-group" style="margin-top:1rem;">
            <label>Teléfono / WhatsApp Directo</label>
            <input type="tel" class="filter-input" id="adv-prof-phone" value="${u.phone || ''}">
          </div>
          <div class="filter-group" style="margin-top:1rem;">
            <label>Oficina / Agencia</label>
            <input type="text" class="filter-input" id="adv-prof-agency" value="${u.agency || 'MudaT Bienes Raíces'}">
          </div>
          <p id="adv-prof-saved" class="display-none color-success font-sm font-bold" style="margin-top:0.85rem;">✓ Perfil comercial actualizado correctamente.</p>
          <button type="submit" class="btn btn-primary" style="margin-top:1.25rem;">Guardar Cambios</button>
        </form>
      `;

      document.getElementById("advisor-profile-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        appState.currentUser.name = document.getElementById("adv-prof-name").value.trim();
        appState.currentUser.email = document.getElementById("adv-prof-email").value.trim();
        appState.currentUser.phone = document.getElementById("adv-prof-phone").value.trim();
        appState.currentUser.agency = document.getElementById("adv-prof-agency").value.trim();
        updateUserProfile(appState.currentUser);
        document.querySelector(".advisor-aside-name").textContent = appState.currentUser.name;
        document.querySelector(".advisor-aside-meta").textContent = appState.currentUser.agency;
        document.getElementById("adv-prof-saved")?.classList.remove("display-none");
      });
    }

    switchTab("advisor-overview");
  }

  return { html, init };
}
