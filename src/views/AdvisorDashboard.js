const DEFAULT_CRM_LEADS = [
  { id: "lead-1", clientName: "Sergio Developer", clientEmail: "sergio@desarrollador.com", phone: "+52 55 5555 1234", propertyName: "Penthouse Exclusivo Polanco", propertyId: "prop-1", stage: "Interesado", date: "2026-06-10", notes: "Busca enganche del 30%. Interesado en escrituración rápida." },
  { id: "lead-2", clientName: "Alejandra Ruiz", clientEmail: "alejandra.r@gmail.com", phone: "+52 55 8888 9999", propertyName: "Loft Amsterdam Condesa", propertyId: "prop-2", stage: "Lead", date: "2026-06-12", notes: "Llegó vía campaña de Instagram. Primera renta corporativa." },
  { id: "lead-3", clientName: "Sofía Martínez", clientEmail: "sofia.m@outlook.com", phone: "+52 81 9999 8888", propertyName: "Residencia Chipinque", propertyId: "prop-3", stage: "Negociación", date: "2026-06-08", notes: "Oferta presentada de 42 MDP. En revisión por parte del propietario." },
  { id: "lead-4", clientName: "Roberto Gómez", clientEmail: "roberto.g@gmail.com", phone: "+52 33 2222 1111", propertyName: "Departamento Smart Preventa", propertyId: "prop-4", stage: "Visita", date: "2026-06-15", notes: "Cita presencial agendada a las 11:00 AM." }
];

export async function renderAdvisorDashboard(state) {
  // Initialize CRM Leads if not in localStorage
  if (!localStorage.getItem("mudat_crm_leads")) {
    localStorage.setItem("mudat_crm_leads", JSON.stringify(DEFAULT_CRM_LEADS));
  }

  const html = `
    <div class="section-container fade-in">
      <div class="dashboard-grid">
        
          <!-- Entradas del CRM y Navegación -->
          <aside class="dashboard-nav glass-premium">
          <div class="advisor-aside-header">
            <img src="${state.currentUser.avatar}" alt="${state.currentUser.name}" class="advisor-aside-avatar">
            <h3 class="advisor-aside-name">${state.currentUser.name}</h3>
            <p class="advisor-aside-meta">${state.currentUser.agency || 'Asesor Premium'}</p>
          </div>
          <ul class="dashboard-menu-list">
            <li class="dashboard-menu-item active" data-tab="advisor-overview"><i data-lucide="layout-dashboard"></i> Dashboard</li>
            <li class="dashboard-menu-item" data-tab="advisor-crm"><i data-lucide="kanban"></i> Embudo CRM</li>
            <li class="dashboard-menu-item" data-tab="advisor-listings"><i data-lucide="home"></i> Mis Propiedades</li>
            <li class="dashboard-menu-item" data-tab="advisor-commissions"><i data-lucide="badge-dollar-sign"></i> Comisiones</li>
          </ul>
        </aside>

        <!-- Contenido Central Dinámico -->
        <div class="dashboard-content-panel" id="advisor-content-mount">
          <!-- Las sub-vistas se montan dinámicamente -->
        </div>

      </div>
    </div>
  `;

  function init(appState) {
    const menuItems = document.querySelectorAll(".dashboard-menu-item");
    const mountPoint = document.getElementById("advisor-content-mount");
    
    // Lista de etapas del Embudo Kanban
    const stages = ["Lead", "Contacto", "Interesado", "Visita", "Oferta", "Negociación", "Escrituración", "Venta", "Postventa"];

    function switchTab(tabId) {
      menuItems.forEach(item => item.classList.remove("active"));
      const activeItem = Array.from(menuItems).find(item => item.getAttribute("data-tab") === tabId);
      if (activeItem) activeItem.classList.add("active");

      if (tabId === "advisor-overview") {
        renderOverview();
      } else if (tabId === "advisor-crm") {
        renderCRM();
      } else if (tabId === "advisor-listings") {
        renderListings();
      } else if (tabId === "advisor-commissions") {
        renderCommissions();
      }

      if (window.lucide) window.lucide.createIcons();
    }

    // Cambiar pestañas al hacer click
    menuItems.forEach(item => {
      item.addEventListener("click", () => {
        switchTab(item.getAttribute("data-tab"));
      });
    });

    // Sub-vista 1: Resumen (Dashboard)
    function renderOverview() {
      const leads = JSON.parse(localStorage.getItem("mudat_crm_leads")) || [];
      const totalCommission = leads
        .filter(l => l.stage === "Venta")
        .reduce((acc, curr) => {
          // Buscamos el precio de la propiedad asignada
          const prop = appState.properties.find(p => p.id === curr.propertyId) || { price: 3000000 };
          const comm = prop.price * ((appState.currentUser.commissionRate || 4.5) / 100);
          return acc + comm;
        }, 0);

      const activeListings = appState.properties.filter(p => p.advisor.id === appState.currentUser.id);

      mountPoint.innerHTML = `
        <h2 class="client-dashboard-tab-title">Panel del Asesor</h2>
        
        <div class="metrics-row advisor-metrics-row">
          <div class="metric-card metric-card-purple">
            <span class="font-sm text-secondary font-semibold">Propiedades Activas</span>
            <span class="metric-value">${activeListings.length}</span>
          </div>
          <div class="metric-card metric-card-cyan">
            <span class="font-sm text-secondary font-semibold">Prospectos Activos</span>
            <span class="metric-value">${leads.length}</span>
          </div>
          <div class="metric-card metric-card-emerald">
            <span class="font-sm text-secondary font-semibold">Comisiones Ganadas</span>
            <span class="metric-value color-success">${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(totalCommission)}</span>
          </div>
        </div>

        <div class="advisor-overview-grid">
          
          <!-- Agenda / Citas -->
          <div>
            <h3 class="client-dashboard-overview-section-title">
              <i data-lucide="calendar" class="icon-inline color-brand"></i>
              Agenda y Visitas Programadas
            </h3>
            <div class="client-dashboard-card-container">
              ${leads.filter(l => l.stage === "Visita").map(l => `
                <div class="advisor-agenda-card">
                  <div>
                    <p class="font-bold font-sm">${l.clientName}</p>
                    <p class="advisor-agenda-meta">${l.propertyName}</p>
                    <p class="advisor-agenda-time"><i data-lucide="clock" class="icon-inline icon-sm"></i> Fecha: ${l.date} a las ${l.time || '12:00 PM'}</p>
                  </div>
                  <button class="btn btn-outline launch-chat-btn" data-email="${l.clientEmail}"><i data-lucide="message-square"></i> Chat</button>
                </div>
              `).join('') || '<p class="text-muted">No tienes citas programadas para hoy.</p>'}
            </div>
          </div>

          <!-- Actividad Reciente -->
          <div class="advisor-activity-log-card">
            <h3 class="font-bold">Actividad Reciente (Logs)</h3>
            <ul class="advisor-activity-log-list">
              <li><span class="color-brand font-bold">[IA Tracking]</span> Correo de seguimiento enviado a Alejandro Ruiz.</li>
              <li><span class="color-success font-bold">[Visita]</span> Sergio Developer programó cita en Penthouse Campos Elíseos.</li>
              <li><span class="color-brand font-bold">[Oferta]</span> Oferta cargada por Sofía Martínez para Residencia Chipinque.</li>
            </ul>
          </div>

        </div>
      `;

      // Bind chats
      document.querySelectorAll(".launch-chat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const email = btn.getAttribute("data-email");
          const chatbotWindow = document.getElementById("ai-chatbot-window");
          chatbotWindow.classList.add("active");
          const chatBody = document.getElementById("ai-chat-body");
          const msgDiv = document.createElement("div");
          msgDiv.className = "chat-message bot";
          msgDiv.innerHTML = `🤖 **MudaT AI**: Canal abierto de chat con el cliente **${email}**. Puedes escribir tu mensaje en la caja de abajo.`;
          chatBody.appendChild(msgDiv);
          chatBody.scrollTop = chatBody.scrollHeight;
        });
      });
    }

    // Sub-vista 2: Embudo CRM Kanban
    function renderCRM() {
      const leads = JSON.parse(localStorage.getItem("mudat_crm_leads")) || [];

      // Render board container
      mountPoint.innerHTML = `
        <div class="advisor-kanban-header">
          <div>
            <h2 class="client-dashboard-tab-title">Embudo de Ventas Inmobiliario</h2>
            <p class="font-sm text-secondary">Mueve los prospectos a lo largo de las fases de venta. Usa el botón de IA para redactar seguimientos automáticos.</p>
          </div>
          <button class="btn btn-primary" id="add-crm-lead-btn"><i data-lucide="plus"></i> Nuevo Lead</button>
        </div>

        <div class="crm-pipeline-container" id="crm-kanban-board">
          ${stages.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage);
            return `
              <div class="crm-column" data-stage="${stage}">
                <div class="crm-column-header">
                  <span class="crm-column-title">${stage}</span>
                  <span class="crm-column-count">${stageLeads.length}</span>
                </div>
                <div class="crm-cards-wrapper">
                  ${stageLeads.map(lead => `
                    <div class="crm-card" data-lead-id="${lead.id}">
                      <h4 class="crm-card-title">${lead.clientName}</h4>
                      <p class="crm-card-client">${lead.propertyName}</p>
                      <p class="advisor-kanban-lead-meta">${lead.phone}</p>
                      
                      <!-- Controles de movimiento rápido en Kanban -->
                      <div class="advisor-kanban-card-actions">
                        <button class="btn-icon shift-left-btn btn-kanban-shift" data-id="${lead.id}"><i data-lucide="chevron-left" class="icon-inline icon-sm"></i></button>
                        <button class="btn btn-outline ia-follow-btn btn-xs" data-id="${lead.id}"><i data-lucide="sparkles" class="icon-inline icon-sm"></i> IA Follow</button>
                        <button class="btn-icon shift-right-btn btn-kanban-shift" data-id="${lead.id}"><i data-lucide="chevron-right" class="icon-inline icon-sm"></i></button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Event listener for Shift Left/Right (Kanban simulation)
      document.querySelectorAll(".shift-left-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          shiftLeadStage(id, -1);
        });
      });

      document.querySelectorAll(".shift-right-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          shiftLeadStage(id, 1);
        });
      });

      // Event listener for AI Follow up message builder
      document.querySelectorAll(".ia-follow-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const currentLeads = JSON.parse(localStorage.getItem("mudat_crm_leads"));
          const lead = currentLeads.find(l => l.id === id);
          if (lead) {
            triggerIAFollowUpGenerator(lead);
          }
        });
      });

      // Add new lead manually
      document.getElementById("add-crm-lead-btn").addEventListener("click", () => {
        const name = prompt("Nombre del Cliente:");
        if (!name) return;
        const propTitle = prompt("Propiedad de Interés:", "Loft Amsterdam Condesa");
        const phone = prompt("Teléfono:");
        
        const currentLeads = JSON.parse(localStorage.getItem("mudat_crm_leads")) || [];
        currentLeads.push({
          id: `lead-${Date.now()}`,
          clientName: name,
          clientEmail: `${name.toLowerCase().replace(/\s/g, '')}@example.com`,
          phone: phone || "+52 55 5555 5555",
          propertyName: propTitle,
          propertyId: "prop-2",
          stage: "Lead",
          date: new Date().toISOString().split('T')[0],
          notes: "Creado desde consola CRM."
        });
        localStorage.setItem("mudat_crm_leads", JSON.stringify(currentLeads));
        renderCRM();
        if (window.lucide) window.lucide.createIcons();
      });
    }

    function shiftLeadStage(leadId, direction) {
      const currentLeads = JSON.parse(localStorage.getItem("mudat_crm_leads")) || [];
      const leadIdx = currentLeads.findIndex(l => l.id === leadId);
      if (leadIdx !== -1) {
        const lead = currentLeads[leadIdx];
        const currentStageIdx = stages.indexOf(lead.stage);
        const newStageIdx = currentStageIdx + direction;
        
        if (newStageIdx >= 0 && newStageIdx < stages.length) {
          lead.stage = stages[newStageIdx];
          localStorage.setItem("mudat_crm_leads", JSON.stringify(currentLeads));
          renderCRM();
          if (window.lucide) window.lucide.createIcons();
        }
      }
    }

    // Modal / Chat simulator for AI Follow-up templates
    function triggerIAFollowUpGenerator(lead) {
      const emailTemplate = `Asunto: Seguimiento de tu interés en ${lead.propertyName} - MudaT

Hola ${lead.clientName},

Espero que te encuentres muy bien. Te contacto en relación al inmueble "${lead.propertyName}" del cual solicitaste información en MudaT. 

Veo que actualmente nos encontramos en la etapa de "${lead.stage}" en nuestro proceso. Me encantaría ponerme a tu disposición para resolver dudas sobre el enganche mínimo, la simulación de crédito bancario o coordinar una visita física para que conozcas los acabados.

¿Te vendría bien tener una breve llamada hoy o prefieres que agendemos directamente en tu portal?

Quedo a tus órdenes.

Atentamente,
${state.currentUser.name}
MudaT Inmobiliaria Premium`;

      const whatsappTemplate = `*MudaT AI Follow-up* 🤖
Hola ${lead.clientName}, te saluda ${state.currentUser.name} de MudaT. Te escribo para dar seguimiento a tu consulta sobre la propiedad *${lead.propertyName}*. ¿Te gustaría que te envíe los planos de distribución y la tabla de plusvalía del desarrollo? Quedo a tus órdenes.`;

      // Display in a mock pop-up/alert or in the AI chatbot
      const chatbotWindow = document.getElementById("ai-chatbot-window");
      chatbotWindow.classList.add("active");
      
      const chatBody = document.getElementById("ai-chat-body");
      const msgDiv = document.createElement("div");
      msgDiv.className = "chat-message bot";
      msgDiv.innerHTML = `
        🤖 **Redactor Inteligente MudaT AI**:<br>
        He generado respuestas automáticas personalizadas para el prospecto **${lead.clientName}** en etapa **${lead.stage}**:<br><br>
        
        📧 **Plantilla de Correo:**<br>
        <pre class="ia-log-preview">${emailTemplate}</pre><br>
        
        💬 **Mensaje de WhatsApp:**<br>
        <pre class="ia-log-preview">${whatsappTemplate}</pre>
        <br>
        <button class="btn btn-success btn-sm btn-full-width" id="send-mock-followup-btn">Registrar Seguimiento en Bitácora</button>
      `;
      chatBody.appendChild(msgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;

      document.getElementById("send-mock-followup-btn").addEventListener("click", () => {
        alert("Seguimiento enviado exitosamente al correo de " + lead.clientName + " y registrado en la bitácora del CRM.");
      });
    }

    // Sub-vista 3: Mis Propiedades
    function renderListings() {
      // Find properties assigned to Sofia Altamirano (adv-1)
      const myListings = appState.properties.filter(p => p.advisor.id === appState.currentUser.id);
      
      mountPoint.innerHTML = `
        <div class="flex-between margin-bottom-md">
          <h2 class="client-dashboard-tab-title">Mis Propiedades en Cartera</h2>
          <a href="#publicar" class="btn btn-primary"><i data-lucide="plus"></i> Publicar Nueva</a>
        </div>
        
        <div class="client-dashboard-card-container">
          ${myListings.map(prop => {
            const formattedPrice = new Intl.NumberFormat('es-MX', { style: 'currency', currency: prop.currency, maximumFractionDigits: 0 }).format(prop.price);
            return `
              <div class="client-dashboard-card">
                <img src="${prop.images[0]}" alt="${prop.title}" class="advisor-listing-thumb">
                <div class="flex-1">
                  <h4 class="font-bold"><a href="#propiedad/${prop.id}">${prop.title}</a></h4>
                  <p class="font-xs text-muted">${prop.location.neighborhood}, ${prop.location.city}</p>
                  <p class="font-bold color-brand font-lg margin-top-xs">${formattedPrice}</p>
                </div>
                <div class="display-flex gap-sm">
                  <button class="btn btn-outline btn-sm color-danger delete-listing-btn" data-id="${prop.id}"><i data-lucide="trash-2"></i> Eliminar</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      document.querySelectorAll(".delete-listing-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          if (confirm("¿Estás seguro de que deseas retirar este anuncio de la plataforma?")) {
            appState.properties = appState.properties.filter(p => p.id !== id);
            renderListings();
            if (window.lucide) window.lucide.createIcons();
          }
        });
      });
    }

    // Sub-vista 4: Comisiones e Indicadores Financieros
    function renderCommissions() {
      const rate = appState.currentUser.commissionRate || 4.5;
      
      mountPoint.innerHTML = `
        <h2 class="client-dashboard-tab-title">Reporte de Comisiones</h2>
        <p class="font-sm text-secondary margin-bottom-lg">Detalle de transacciones cerradas, en trámite de notaría y comisiones brutas del periodo actual.</p>
        
        <div class="advisor-commission-config-card">
          <h3 class="font-bold">Configuración de Tasas</h3>
          <p class="font-sm text-secondary">Tasa de Comisión Promedio Pactada: <strong>${rate}%</strong> sobre el valor de venta final.</p>
          <p class="font-sm text-secondary">Agencia Inmobiliaria: <strong>${appState.currentUser.agency || 'MudaT Premium'}</strong></p>
        </div>

        <div class="metrics-row">
          <div class="metric-card metric-card-emerald">
            <span class="font-sm text-secondary font-semibold">Ganancias Totales (Venta Cerrada)</span>
            <span class="metric-value color-success">$2,025,000 MXN</span>
            <p class="font-xs text-muted margin-top-xs">Cálculo sobre el Penthouse Polanco</p>
          </div>
          <div class="metric-card metric-card-purple">
            <span class="font-sm text-secondary font-semibold">Comisión Proyectada (En Escrituración)</span>
            <span class="metric-value color-brand">$1,890,000 MXN</span>
            <p class="font-xs text-muted margin-top-xs">Cálculo sobre Residencia Chipinque</p>
          </div>
        </div>
      `;
    }

    // Default mount tab
    switchTab("advisor-overview");
  }

  return { html, init };
}
