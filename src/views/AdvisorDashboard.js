import { updateUserProfile, createClientProfile, getAdvisorCreatedProfiles } from "../services/auth.js";
import { L, tCategory, formatCurrency, getLang } from "../services/i18n.js";

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

const CRM_STAGES = ["Lead", "Contacto", "Interesado", "Visita", "Oferta", "Negociación", "Escrituración", "Venta", "Postventa"];

const formatCurrencyMXN = (amount) => formatCurrency(amount || 0, "MXN");

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

  const user = state.currentUser || {
    name: L("Asesor MudaT", "MudaT Advisor"),
    agency: L("MudaT Bienes Raíces • Asesora Principal", "MudaT Real Estate • Lead Advisor"),
    rating: 5.0
  };

  const html = `
    <div class="section-container fade-in">
      <div class="dashboard-grid">
        
        <!-- Sidebar de Navegación del Asesor -->
        <aside class="dashboard-nav glass-premium">
          <div class="advisor-aside-header">
            <img src="${user.avatar || './assets/images/asesora-yesenia-cuevas.jpg'}" alt="${user.name}" class="advisor-aside-avatar">
            <h3 class="advisor-aside-name">${user.name}</h3>
            <p class="advisor-aside-meta">${user.agency || L('MudaT Bienes Raíces • Asesora Principal', 'MudaT Real Estate • Lead Advisor')}</p>
            <span class="advisor-rating-pill">★ ${(user.rating || 5.0).toFixed(1)} ${L("Certificada", "Certified")}</span>
          </div>
          <ul class="dashboard-menu-list">
            <li class="dashboard-menu-item active" data-tab="advisor-overview"><i data-lucide="layout-dashboard"></i> ${L("Dashboard", "Dashboard")}</li>
            <li class="dashboard-menu-item" data-tab="advisor-crm"><i data-lucide="kanban"></i> ${L("Embudo CRM", "CRM Pipeline")}</li>
            <li class="dashboard-menu-item" data-tab="advisor-listings"><i data-lucide="home"></i> ${L("Mis Propiedades", "My Properties")}</li>
            <li class="dashboard-menu-item" data-tab="advisor-commissions"><i data-lucide="badge-dollar-sign"></i> ${L("Comisiones", "Commissions")}</li>
            <li class="dashboard-menu-item" data-tab="advisor-profile"><i data-lucide="user-cog"></i> ${L("Mi Perfil", "My Profile")}</li>
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
        <h3 class="login-modal-title">${L("Registrar Nuevo Prospecto", "Register New Lead")}</h3>
        <p class="login-modal-subtitle">${L("Agrega un lead al embudo CRM y asígnale una propiedad de tu cartera.", "Add a lead to the CRM pipeline and assign a property from your portfolio.")}</p>
        <form id="crm-new-lead-form" class="pub-form" style="border:none; padding:0; background:transparent;">
          <div class="filter-group">
            <label>${L("Nombre Completo", "Full Name")}</label>
            <input type="text" class="filter-input" id="crm-lead-name" placeholder="${L("Ej. Mariana Vázquez", "e.g. Mariana Vázquez")}" required>
          </div>
          <div class="advisor-modal-row">
            <div class="filter-group">
              <label>${L("Teléfono / WhatsApp", "Phone / WhatsApp")}</label>
              <input type="tel" class="filter-input" id="crm-lead-phone" placeholder="+52 55 1234 5678" required>
            </div>
            <div class="filter-group">
              <label>${L("Correo Electrónico", "Email Address")}</label>
              <input type="email" class="filter-input" id="crm-lead-email" placeholder="${L("cliente@correo.com", "client@email.com")}">
            </div>
          </div>
          <div class="filter-group">
            <label>${L("Propiedad de Interés", "Property of Interest")}</label>
            <select class="filter-select" id="crm-lead-property"></select>
          </div>
          <div class="advisor-modal-row">
            <div class="filter-group">
              <label>${L("Etapa Inicial", "Initial Stage")}</label>
              <select class="filter-select" id="crm-lead-stage">
                ${CRM_STAGES.map(stage => `<option value="${stage}">${tCategory(stage)}</option>`).join("")}
              </select>
            </div>
            <div class="filter-group">
              <label>${L("Fecha de Seguimiento / Cita", "Follow-up / Visit Date")}</label>
              <input type="date" class="filter-input" id="crm-lead-date">
            </div>
          </div>
          <div class="filter-group">
            <label>${L("Notas del Cliente", "Client Notes")}</label>
            <input type="text" class="filter-input" id="crm-lead-notes" placeholder="${L("Ej. Presupuesto 2.5M - 3M, busca crédito bancario", "e.g. Budget 2.5M - 3M, looking for bank mortgage")}">
          </div>
          <button type="submit" class="btn btn-primary btn-full-width" style="margin-top:1.25rem;">${L("Guardar en Embudo CRM", "Save to CRM Pipeline")}</button>
        </form>
      </div>
    </div>
  `;

  function init(appState) {
    const menuItems = document.querySelectorAll(".dashboard-menu-item");
    const mountPoint = document.getElementById("advisor-content-mount");
    const stages = CRM_STAGES;
    const getActiveUser = () => appState.currentUser || {
      id: "",
      name: L("Asesor MudaT", "MudaT Advisor"),
      email: "",
      phone: "",
      agency: L("MudaT Bienes Raíces", "MudaT Real Estate"),
      commissionRate: 4.5
    };
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
      const notes = document.getElementById("crm-lead-notes").value.trim() || L("Prospecto registrado desde Portal del Asesor.", "Lead registered from Advisor Portal.");
      const selectedProp = appState.properties.find(p => p.id === propId);

      const leads = getLeads();
      leads.unshift({
        id: `lead-${Date.now()}`,
        clientName: name,
        clientEmail: email,
        phone,
        propertyName: selectedProp ? selectedProp.title : L("Propiedad MudaT", "MudaT Property"),
        propertyId: propId,
        stage,
        date,
        time: "11:00 AM",
        notes
      });
      saveLeads(leads);
      appendCrmLog(
        L("Nuevo Lead", "New Lead"),
        L(`${name} agregado en etapa ${stage} (${selectedProp?.title || "MudaT"}).`, `${name} added at stage ${tCategory(stage)} (${selectedProp?.title || "MudaT"}).`),
        "color-brand"
      );
      newLeadForm.reset();
      crmModal.classList.add("display-none");

      const activeTab = document.querySelector(".dashboard-menu-item.active")?.getAttribute("data-tab") || "advisor-crm";
      switchTab(activeTab);
    });

    // 1. Sub-vista: Dashboard Overview
    function renderOverview() {
      const activeUser = getActiveUser();
      const leads = getLeads();
      const logs = JSON.parse(localStorage.getItem("mudat_crm_logs")) || DEFAULT_CRM_LOGS;
      const rate = (activeUser.commissionRate || 4.5) / 100;
      const activeListings = activeUser.id
        ? appState.properties.filter(p => p.advisor?.id === activeUser.id)
        : [];
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
            <h2 class="client-dashboard-tab-title">${L(`Panel Ejecutivo de ${activeUser.name}`, `${activeUser.name}'s Executive Panel`)}</h2>
            <p class="font-sm text-secondary">${L("Resumen comercial de cartera, citas programadas y proyecciones de cierre.", "Commercial summary of portfolio, scheduled visits, and closing projections.")}</p>
          </div>
          <div class="display-flex gap-sm">
            <button class="btn btn-outline btn-sm" id="overview-new-visit-btn"><i data-lucide="calendar-plus"></i> ${L("Agendar Visita", "Schedule Visit")}</button>
            <a href="#publicar" class="btn btn-primary btn-sm"><i data-lucide="plus"></i> ${L("Publicar Inmueble", "Publish Property")}</a>
          </div>
        </div>
        
        <div class="metrics-row advisor-metrics-row">
          <div class="metric-card metric-card-purple">
            <span class="font-sm text-secondary font-semibold">${L("Cartera Asignada", "Assigned Portfolio")}</span>
            <span class="metric-value">${activeListings.length}</span>
            <span class="font-xs text-muted">${formatCurrencyMXN(portfolioValue)} ${L("en inventario", "in inventory")}</span>
          </div>
          <div class="metric-card metric-card-cyan">
            <span class="font-sm text-secondary font-semibold">${L("Prospectos Activos", "Active Leads")}</span>
            <span class="metric-value">${leads.length}</span>
            <span class="font-xs text-muted">${visits.length} ${L("citas próximas", "upcoming visits")}</span>
          </div>
          <div class="metric-card metric-card-emerald">
            <span class="font-sm text-secondary font-semibold">${L("Comisión en Pipeline", "Pipeline Commission")}</span>
            <span class="metric-value color-success">${formatCurrencyMXN(projectedCommission)}</span>
            <span class="font-xs text-muted">${L("Tasa pactada:", "Agreed rate:")} ${activeUser.commissionRate || 4.5}%</span>
          </div>
        </div>

        <div class="advisor-overview-grid">
          <div>
            <h3 class="client-dashboard-overview-section-title">
              <i data-lucide="calendar" class="icon-inline color-brand"></i>
              ${L("Agenda y Visitas Programadas", "Schedule & Planned Visits")}
            </h3>
            <div class="client-dashboard-card-container">
              ${visits.map(l => {
                const cleanPhone = (l.phone || "").replace(/\D/g, "");
                const waMsg = encodeURIComponent(L(
                  `Hola ${l.clientName}, te saluda ${activeUser.name} de MudaT Bienes Raíces para confirmar nuestra cita sobre ${l.propertyName}.`,
                  `Hi ${l.clientName}, this is ${activeUser.name} from MudaT Real Estate confirming our appointment for ${l.propertyName}.`
                ));
                return `
                  <div class="advisor-agenda-card">
                    <div>
                      <p class="font-bold font-sm">${l.clientName} <span class="advisor-stage-pill">${tCategory(l.stage)}</span></p>
                      <p class="advisor-agenda-meta">${l.propertyName}</p>
                      <p class="advisor-agenda-time"><i data-lucide="clock" class="icon-inline icon-sm"></i> ${l.date} • ${l.time || '12:00 PM'}</p>
                    </div>
                    <div class="display-flex gap-sm">
                      <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" rel="noopener" class="btn btn-success btn-sm" title="${L("Enviar WhatsApp", "Send WhatsApp")}">
                        <i data-lucide="message-circle"></i> WhatsApp
                      </a>
                      <button class="btn btn-outline btn-sm launch-chat-btn" data-email="${l.clientEmail}">
                        <i data-lucide="sparkles"></i> ${L("IA", "AI")}
                      </button>
                    </div>
                  </div>
                `;
              }).join("") || `<p class="text-muted">${L("No tienes citas programadas próximamente.", "You have no upcoming scheduled visits.")}</p>`}
            </div>
          </div>

          <div class="advisor-activity-log-card">
            <h3 class="font-bold"><i data-lucide="activity" class="icon-inline color-brand"></i> ${L("Bitácora Reciente", "Recent Activity Log")}</h3>
            <ul class="advisor-activity-log-list">
              ${logs.map(log => `
                <li><span class="${log.colorClass} font-bold">[${tCategory(log.tag) || log.tag}]</span> ${log.text}</li>
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
          chatbotWindow?.classList.add("active");
          const chatBody = document.getElementById("ai-chat-body");
          if (chatBody) {
            const msgDiv = document.createElement("div");
            msgDiv.className = "chat-message bot";
            msgDiv.innerHTML = L(
              `🤖 <strong>MudaT AI</strong>: Canal asistente listo para redactar seguimiento a <strong>${email}</strong>.`,
              `🤖 <strong>MudaT AI</strong>: Assistant channel ready to draft follow-up for <strong>${email}</strong>.`
            );
            chatBody.appendChild(msgDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
          }
        });
      });
    }

    // 2. Sub-vista: Embudo CRM Kanban
    function renderCRM() {
      const activeUser = getActiveUser();
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
            <h2 class="client-dashboard-tab-title">${L("Embudo de Ventas Inmobiliario", "Real Estate Sales Pipeline")}</h2>
            <p class="font-sm text-secondary">${L("Gestiona tus prospectos por etapa, contáctalos por WhatsApp o genera seguimientos con IA.", "Manage your leads by stage, contact them via WhatsApp, or generate AI follow-ups.")}</p>
          </div>
          <div class="advisor-kanban-controls">
            <input type="text" class="filter-input advisor-crm-search" id="crm-search-input" placeholder="${L("Buscar cliente o inmueble...", "Search client or property...")}" value="${crmSearchQuery}">
            <button class="btn btn-primary" id="add-crm-lead-btn"><i data-lucide="plus"></i> ${L("Nuevo Lead", "New Lead")}</button>
          </div>
        </div>

        <div class="crm-pipeline-container" id="crm-kanban-board">
          ${stages.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage);
            return `
              <div class="crm-column" data-stage="${stage}">
                <div class="crm-column-header">
                  <span class="crm-column-title">${tCategory(stage)}</span>
                  <span class="crm-column-count">${stageLeads.length}</span>
                </div>
                <div class="crm-cards-wrapper">
                  ${stageLeads.map(lead => {
                    const cleanPhone = (lead.phone || "").replace(/\D/g, "");
                    const waText = encodeURIComponent(L(
                      `Hola ${lead.clientName}, te saluda ${activeUser.name} de MudaT Bienes Raíces sobre ${lead.propertyName}.`,
                      `Hi ${lead.clientName}, this is ${activeUser.name} from MudaT Real Estate regarding ${lead.propertyName}.`
                    ));
                    return `
                      <div class="crm-card" data-lead-id="${lead.id}">
                        <div class="crm-card-top">
                          <h4 class="crm-card-title">${lead.clientName}</h4>
                          <button class="crm-delete-btn" data-id="${lead.id}" title="${L("Eliminar lead", "Delete lead")}">&times;</button>
                        </div>
                        <p class="crm-card-client">${lead.propertyName}</p>
                        <p class="advisor-kanban-lead-meta">${lead.phone} • ${lead.date || ''}</p>
                        ${lead.notes ? `<p class="crm-card-notes">${lead.notes}</p>` : ""}
                        
                        <div class="advisor-kanban-card-actions">
                          <button class="btn-icon shift-left-btn btn-kanban-shift" data-id="${lead.id}" title="${L("Etapa anterior", "Previous stage")}"><i data-lucide="chevron-left" class="icon-inline icon-sm"></i></button>
                          <a href="https://wa.me/${cleanPhone}?text=${waText}" target="_blank" rel="noopener" class="btn btn-success btn-xs" title="WhatsApp"><i data-lucide="message-circle" class="icon-inline icon-sm"></i> WA</a>
                          <button class="btn btn-outline ia-follow-btn btn-xs" data-id="${lead.id}" title="${L("Generar mensaje con IA", "Generate message with AI")}"><i data-lucide="sparkles" class="icon-inline icon-sm"></i> ${L("IA", "AI")}</button>
                          <button class="btn-icon shift-right-btn btn-kanban-shift" data-id="${lead.id}" title="${L("Siguiente etapa", "Next stage")}"><i data-lucide="chevron-right" class="icon-inline icon-sm"></i></button>
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
        appendCrmLog(
          "CRM",
          L(`${lead.clientName} avanzó a etapa ${lead.stage}.`, `${lead.clientName} moved to stage ${tCategory(lead.stage)}.`),
          lead.stage === "Venta" ? "color-success" : "color-brand"
        );
        renderCRM();
        if (window.lucide) window.lucide.createIcons();
      }
    }

    function triggerIAFollowUpGenerator(lead) {
      const activeUser = getActiveUser();
      const whatsappTemplate = L(
        `Hola ${lead.clientName}, te saluda ${activeUser.name} de MudaT Bienes Raíces. Te escribo para dar seguimiento a tu interés en *${lead.propertyName}* (etapa: ${lead.stage}). ¿Te gustaría revisar opciones de financiamiento o agendar una visita esta semana?`,
        `Hi ${lead.clientName}, this is ${activeUser.name} from MudaT Real Estate. I'm following up on your interest in *${lead.propertyName}* (stage: ${tCategory(lead.stage)}). Would you like to review financing options or schedule a visit this week?`
      );
      const chatbotWindow = document.getElementById("ai-chatbot-window");
      chatbotWindow?.classList.add("active");

      const chatBody = document.getElementById("ai-chat-body");
      if (!chatBody) return;

      const msgDiv = document.createElement("div");
      msgDiv.className = "chat-message bot";
      msgDiv.innerHTML = `
        🤖 <strong>${L("Redactor Inteligente MudaT AI", "MudaT AI Smart Copywriter")}</strong>:<br>
        ${L("Seguimiento sugerido para", "Suggested follow-up for")} <strong>${lead.clientName}</strong> (${tCategory(lead.stage)}):<br><br>
        <pre class="ia-log-preview">${whatsappTemplate}</pre><br>
        <button class="btn btn-success btn-sm btn-full-width send-mock-followup-btn" data-id="${lead.id}">${L("Registrar en Bitácora CRM", "Log in CRM Activity")}</button>
      `;
      chatBody.appendChild(msgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;

      const followBtn = msgDiv.querySelector(".send-mock-followup-btn");
      followBtn?.addEventListener("click", () => {
        appendCrmLog(
          L("IA Follow-up", "AI Follow-up"),
          L(`Seguimiento enviado a ${lead.clientName} (${lead.propertyName}).`, `Follow-up sent to ${lead.clientName} (${lead.propertyName}).`),
          "color-success"
        );
        followBtn.textContent = L("✓ Registrado en Bitácora", "✓ Logged in Activity");
        followBtn.disabled = true;
      });
    }

    // 3. Sub-vista: Mis Propiedades
    function renderListings() {
      const activeUser = getActiveUser();
      const leads = getLeads();
      const myListings = activeUser.id
        ? appState.properties.filter(p => p.advisor?.id === activeUser.id)
        : [];

      mountPoint.innerHTML = `
        <div class="advisor-header-bar">
          <div>
            <h2 class="client-dashboard-tab-title">${L(`Mi Cartera de Propiedades (${myListings.length})`, `My Property Portfolio (${myListings.length})`)}</h2>
            <p class="font-sm text-secondary">${L(`Inmuebles asignados a ${activeUser.name} con métricas de demanda.`, `Properties assigned to ${activeUser.name} with demand metrics.`)}</p>
          </div>
          <a href="#publicar" class="btn btn-primary btn-sm"><i data-lucide="plus"></i> ${L("Publicar Nueva", "Publish New")}</a>
        </div>
        
        <div class="client-dashboard-card-container">
          ${myListings.map(prop => {
            const propLeadsCount = leads.filter(l => l.propertyId === prop.id).length;
            const shareText = encodeURIComponent(L(
              `Te comparto esta propiedad exclusiva de MudaT Bienes Raíces: ${prop.title} en ${prop.location.neighborhood}, ${prop.location.city} (${formatCurrencyMXN(prop.price)}). Asesora: ${activeUser.name}. https://arcano3ai.github.io/MudaT/#propiedad/${prop.id}`,
              `Sharing this exclusive MudaT Real Estate property: ${prop.title} in ${prop.location.neighborhood}, ${prop.location.city} (${formatCurrencyMXN(prop.price)}). Advisor: ${activeUser.name}. https://arcano3ai.github.io/MudaT/#propiedad/${prop.id}`
            ));
            return `
              <div class="client-dashboard-card advisor-listing-row">
                <img src="${prop.images[0]}" alt="${prop.title}" class="advisor-listing-thumb">
                <div class="flex-1">
                  <div class="display-flex gap-sm" style="align-items:center; flex-wrap:wrap;">
                    <span class="advisor-stage-pill">${tCategory(prop.category)}</span>
                    <span class="font-xs text-muted">${propLeadsCount} ${L("prospectos interesados", "interested leads")}</span>
                  </div>
                  <h4 class="font-bold" style="margin-top:0.35rem;"><a href="#propiedad/${prop.id}">${prop.title}</a></h4>
                  <p class="font-xs text-muted">${prop.location.neighborhood}, ${prop.location.city} • ${prop.construction || prop.land} m²</p>
                  <p class="font-bold color-brand font-lg margin-top-xs">${formatCurrencyMXN(prop.price)}</p>
                </div>
                <div class="advisor-listing-actions">
                  <a href="#propiedad/${prop.id}" class="btn btn-outline btn-sm"><i data-lucide="eye"></i> ${L("Ficha", "Details")}</a>
                  <a href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener" class="btn btn-success btn-sm"><i data-lucide="share-2"></i> WhatsApp</a>
                  <button class="btn btn-outline btn-sm color-danger delete-listing-btn" data-id="${prop.id}" title="${L("Retirar propiedad", "Remove property")}"><i data-lucide="trash-2"></i></button>
                </div>
              </div>
            `;
          }).join("") || `<p class="text-muted">${L("No tienes propiedades asignadas actualmente.", "You currently have no assigned properties.")}</p>`}
        </div>
      `;

      document.querySelectorAll(".delete-listing-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          if (confirm(L("¿Deseas retirar esta propiedad de tu cartera activa?", "Do you want to remove this property from your active portfolio?"))) {
            appState.properties = appState.properties.filter(p => p.id !== id);
            appendCrmLog(
              L("Inventario", "Inventory"),
              L(`Propiedad ${id} retirada de cartera.`, `Property ${id} removed from portfolio.`),
              "color-brand"
            );
            renderListings();
            if (window.lucide) window.lucide.createIcons();
          }
        });
      });
    }

    // 4. Sub-vista: Comisiones Dinámicas
    function renderCommissions() {
      const activeUser = getActiveUser();
      const leads = getLeads();
      const rate = parseFloat(activeUser.commissionRate) || 4.5;

      const closedLeads = leads.filter(l => l.stage === "Venta");
      const pipelineLeads = leads.filter(l => ["Oferta", "Negociación", "Escrituración"].includes(l.stage));

      const sumCommission = (list) => list.reduce((acc, l) => {
        const prop = appState.properties.find(p => p.id === l.propertyId) || { price: 2800000 };
        return acc + (prop.price * (rate / 100));
      }, 0);

      const earnedTotal = sumCommission(closedLeads);
      const projectedTotal = sumCommission(pipelineLeads);

      mountPoint.innerHTML = `
        <h2 class="client-dashboard-tab-title">${L("Comisiones e Indicadores Financieros", "Commissions & Financial Metrics")}</h2>
        <p class="font-sm text-secondary margin-bottom-lg">${L("Cálculo dinámico sobre operaciones cerradas y en proceso de escrituración.", "Dynamic calculation on closed deals and deals in closing.")}</p>
        
        <div class="advisor-commission-config-card">
          <div>
            <h3 class="font-bold">${L("Esquema de Comisión Pactado", "Agreed Commission Scheme")}</h3>
            <p class="font-sm text-secondary">${L("Agencia:", "Agency:")} <strong>${activeUser.agency || L('MudaT Bienes Raíces', 'MudaT Real Estate')}</strong></p>
          </div>
          <div class="advisor-rate-control">
            <label for="advisor-rate-input" class="font-xs text-muted">${L("Tasa (%):", "Rate (%):")}</label>
            <input type="number" id="advisor-rate-input" class="filter-input" value="${rate}" min="1" max="10" step="0.5" style="width:90px;">
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-card metric-card-emerald">
            <span class="font-sm text-secondary font-semibold">${L(`Comisiones Ganadas (${closedLeads.length} cierre)`, `Earned Commissions (${closedLeads.length} closed)`)}</span>
            <span class="metric-value color-success">${formatCurrencyMXN(earnedTotal)}</span>
            <p class="font-xs text-muted margin-top-xs">${L("Operaciones en etapa Venta", "Deals in Sold stage")}</p>
          </div>
          <div class="metric-card metric-card-purple">
            <span class="font-sm text-secondary font-semibold">${L(`En Escrituración / Negociación (${pipelineLeads.length})`, `In Closing / Negotiation (${pipelineLeads.length})`)}</span>
            <span class="metric-value color-brand">${formatCurrencyMXN(projectedTotal)}</span>
            <p class="font-xs text-muted margin-top-xs">${L(`Proyección al ${rate}%`, `Projected at ${rate}%`)}</p>
          </div>
        </div>

        <h3 class="client-dashboard-overview-section-title" style="margin-top:1.5rem;">${L("Desglose por Operación", "Breakdown by Deal")}</h3>
        <div class="client-dashboard-card-container">
          ${[...closedLeads, ...pipelineLeads].map(l => {
            const prop = appState.properties.find(p => p.id === l.propertyId) || { price: 2800000, title: l.propertyName };
            const comm = prop.price * (rate / 100);
            return `
              <div class="advisor-agenda-card">
                <div>
                  <p class="font-bold font-sm">${l.clientName} <span class="advisor-stage-pill">${tCategory(l.stage)}</span></p>
                  <p class="advisor-agenda-meta">${prop.title} • ${L("Valor:", "Value:")} ${formatCurrencyMXN(prop.price)}</p>
                </div>
                <span class="font-bold color-success">${formatCurrencyMXN(comm)}</span>
              </div>
            `;
          }).join("") || `<p class="text-muted">${L("Aún no hay operaciones en etapas de cierre.", "There are no deals in closing stages yet.")}</p>`}
        </div>
      `;

      document.getElementById("advisor-rate-input")?.addEventListener("change", (e) => {
        const newRate = parseFloat(e.target.value) || 4.5;
        if (appState.currentUser) {
          appState.currentUser.commissionRate = newRate;
          updateUserProfile(appState.currentUser);
        }
        renderCommissions();
      });
    }

    // 5. Sub-vista: Perfil Comercial del Asesor
    function renderProfile() {
      const u = getActiveUser();
      mountPoint.innerHTML = `
        <h2 class="client-dashboard-tab-title">${L("Mi Perfil Comercial", "My Commercial Profile")}</h2>
        <p class="font-sm text-secondary margin-bottom-lg">${L("Administra tu información de contacto y datos de asesora en MudaT.", "Manage your contact details and advisor profile on MudaT.")}</p>

        <form id="advisor-profile-form" class="pub-form" style="max-width:600px;">
          <div class="filter-group">
            <label>${L("Nombre Completo", "Full Name")}</label>
            <input type="text" class="filter-input" id="adv-prof-name" value="${u.name || ''}" required>
          </div>
          <div class="filter-group" style="margin-top:1rem;">
            <label>${L("Correo Corporativo", "Corporate Email")}</label>
            <input type="email" class="filter-input" id="adv-prof-email" value="${u.email || ''}" required>
          </div>
          <div class="filter-group" style="margin-top:1rem;">
            <label>${L("Teléfono / WhatsApp Directo", "Direct Phone / WhatsApp")}</label>
            <input type="tel" class="filter-input" id="adv-prof-phone" value="${u.phone || ''}">
          </div>
          <div class="filter-group" style="margin-top:1rem;">
            <label>${L("Oficina / Agencia", "Office / Agency")}</label>
            <input type="text" class="filter-input" id="adv-prof-agency" value="${u.agency || L('MudaT Bienes Raíces', 'MudaT Real Estate')}">
          </div>
          <p id="adv-prof-saved" class="display-none color-success font-sm font-bold" style="margin-top:0.85rem;">${L("✓ Perfil comercial actualizado correctamente.", "✓ Commercial profile updated successfully.")}</p>
          <button type="submit" class="btn btn-primary" style="margin-top:1.25rem;">${L("Guardar Cambios", "Save Changes")}</button>
        </form>

        <div style="margin-top:2.5rem; padding-top:2rem; border-top:1px solid var(--border-color); max-width:600px;">
          <h3 class="client-dashboard-tab-title" style="font-size:1.2rem;">${L("Crear Perfil de Acceso para Cliente", "Create Client Access Profile")}</h3>
          <p class="font-sm text-secondary margin-bottom-md">${L("Genera las credenciales de acceso para que tus clientes ingresen a su portal MudaT.", "Generate access credentials so your clients can sign in to their MudaT portal.")}</p>

          <form id="advisor-create-client-form" class="pub-form">
            <div class="filter-group">
              <label>${L("Nombre del Cliente", "Client Name")}</label>
              <input type="text" class="filter-input" id="adv-new-client-name" placeholder="${L('Ej. Carlos Mendoza', 'e.g. Carlos Mendoza')}" required>
            </div>
            <div class="filter-group" style="margin-top:0.85rem;">
              <label>${L("Correo Electrónico", "Email Address")}</label>
              <input type="email" class="filter-input" id="adv-new-client-email" placeholder="cliente@correo.com" required>
            </div>
            <div class="filter-group" style="margin-top:0.85rem;">
              <label>${L("Teléfono / WhatsApp", "Phone / WhatsApp")}</label>
              <input type="tel" class="filter-input" id="adv-new-client-phone" placeholder="+52 55 0000 0000">
            </div>
            <div class="filter-group" style="margin-top:0.85rem;">
              <label>${L("Contraseña Temporal", "Temporary Password")}</label>
              <input type="text" class="filter-input" id="adv-new-client-pass" value="Mudat2026" required>
            </div>
            <p id="adv-client-created-msg" class="display-none color-success font-sm font-bold" style="margin-top:0.85rem;"></p>
            <button type="submit" class="btn btn-success" style="margin-top:1rem;">${L("Crear Perfil de Cliente", "Create Client Profile")}</button>
          </form>

          <div id="adv-created-clients-list" style="margin-top:1.25rem; display:flex; flex-direction:column; gap:0.5rem;">
            ${getAdvisorCreatedProfiles().map(cp => `
              <div class="advisor-agenda-card">
                <div>
                  <p class="font-bold font-sm">${cp.name}</p>
                  <p class="advisor-agenda-meta">${cp.email} ${cp.phone ? '• ' + cp.phone : ''}</p>
                </div>
                <span class="advisor-stage-pill">${L("Activo", "Active")}</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;

      document.getElementById("advisor-create-client-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("adv-new-client-name").value;
        const email = document.getElementById("adv-new-client-email").value;
        const phone = document.getElementById("adv-new-client-phone").value;
        const password = document.getElementById("adv-new-client-pass").value;
        const created = createClientProfile({ name, email, phone, password, createdBy: u.name });
        renderProfile();
        const msgEl = document.getElementById("adv-client-created-msg");
        if (msgEl) {
          msgEl.textContent = L(
            `✓ Perfil creado para ${created.name} (${created.email}).`,
            `✓ Profile created for ${created.name} (${created.email}).`
          );
          msgEl.classList.remove("display-none");
        }
      });

      document.getElementById("advisor-profile-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!appState.currentUser) {
          alert(L("Inicia sesión para guardar cambios en tu perfil.", "Sign in to save changes to your profile."));
          return;
        }
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
