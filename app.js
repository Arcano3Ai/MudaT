import { getCurrentUser, switchUserRole, initializeAuth } from "./src/services/auth.js";
import { mockProperties } from "./src/data/mockProperties.js";
import { initHeader, updateHeaderUI } from "./src/components/Header.js";

// Initialize Authentication
initializeAuth();

// Global App State
const state = {
  currentUser: getCurrentUser(),
  properties: [...mockProperties],
  currentView: "home",
  activePropertyId: null,
  theme: "dark", // default theme
  searchFilters: {
    category: "Comprar",
    city: "",
    state: "",
    budget: "",
    rooms: ""
  }
};

// Route mapping
const routes = {
  "home": async () => {
    const { renderHome } = await import("./src/views/Home.js");
    return renderHome(state);
  },
  "search": async () => {
    const { renderSearch } = await import("./src/views/Search.js");
    return renderSearch(state);
  },
  "property-detail": async () => {
    const { renderPropertyDetail } = await import("./src/views/PropertyDetail.js");
    return renderPropertyDetail(state);
  },
  "client-dashboard": async () => {
    const { renderClientDashboard } = await import("./src/views/ClientDashboard.js");
    return renderClientDashboard(state);
  },
  "crm": async () => {
    // If client, redirect to client-dashboard or show alert
    if (state.currentUser.role === "client") {
      alert("Accediendo a la sección de Asesores. Se cambiará el rol a Asesor para demostración.");
      state.currentUser = switchUserRole("advisor");
      updateHeaderUI(state);
    }
    const { renderAdvisorDashboard } = await import("./src/views/AdvisorDashboard.js");
    return renderAdvisorDashboard(state);
  },
  "publish": async () => {
    const { renderPublishProperty } = await import("./src/views/PublishProperty.js");
    return renderPublishProperty(state);
  },
  "calculator": async () => {
    const { renderCalculatorView } = await import("./src/views/CalculatorView.js");
    return renderCalculatorView(state);
  },
  "admin": async () => {
    if (state.currentUser.role !== "admin") {
      alert("Accediendo a la consola de Administración General. Cambiando rol a Administrador.");
      state.currentUser = switchUserRole("admin");
      updateHeaderUI(state);
    }
    const { renderAdminPanel } = await import("./src/views/AdminPanel.js");
    return renderAdminPanel(state);
  },
  "legal": async () => {
    const { renderLegalMarketplace } = await import("./src/views/LegalMarketplace.js");
    return renderLegalMarketplace(state);
  },
  "avaluos": async () => {
    const { renderAppraisals } = await import("./src/views/Appraisals.js");
    return renderAppraisals(state);
  }
};

// Enrutador Principal
async function router() {
  const hash = window.location.hash || "#inicio";
  const root = document.getElementById("app-root");
  
  // Clean active states in header navigation
  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  
  // Transition effect
  root.style.opacity = 0;
  
  try {
    let viewName = "home";
    let params = null;

    if (hash === "#inicio") {
      viewName = "home";
      document.querySelector('[data-view="home"]')?.classList.add("active");
    } else if (hash === "#comprar") {
      state.searchFilters.category = "Comprar";
      viewName = "search";
      document.querySelector('[data-view="comprar"]')?.classList.add("active");
    } else if (hash === "#rentar") {
      state.searchFilters.category = "Rentar";
      viewName = "search";
      document.querySelector('[data-view="rentar"]')?.classList.add("active");
    } else if (hash === "#desarrollos") {
      state.searchFilters.category = "Preventa";
      viewName = "search";
      document.querySelector('[data-view="preventa"]')?.classList.add("active");
    } else if (hash.startsWith("#propiedad/")) {
      viewName = "property-detail";
      state.activePropertyId = hash.split("/")[1];
    } else if (hash === "#mi-portal") {
      viewName = "client-dashboard";
    } else if (hash === "#asesores" || hash === "#crm") {
      viewName = "crm";
      document.querySelector('[data-view="crm"]')?.classList.add("active");
    } else if (hash === "#publicar") {
      viewName = "publish";
      document.querySelector('[data-view="publish"]')?.classList.add("active");
    } else if (hash === "#calculadora") {
      viewName = "calculator";
      document.querySelector('[data-view="calculator"]')?.classList.add("active");
    } else if (hash === "#admin") {
      viewName = "admin";
    } else {
      viewName = "home";
    }

    state.currentView = viewName;
    const viewModule = routes[viewName];
    if (viewModule) {
      const { html, init } = await viewModule();
      root.innerHTML = html;
      if (init) init(state);
    } else {
      root.innerHTML = `<div class="section-container"><h2>Error 404: Vista no encontrada</h2></div>`;
    }
  } catch (error) {
    console.error("Error cargando la vista:", error);
    root.innerHTML = `<div class="section-container"><h2>Error al cargar la página</h2><p>${error.message}</p></div>`;
  }

  // Fade-in animation & initialize icons
  setTimeout(() => {
    root.style.opacity = 1;
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, 50);
}

// Setup Event Listeners
function setupEvents() {
  // Hash Routing
  window.addEventListener("hashchange", router);
  
  // Ejecutar inmediatamente si el DOM ya está listo (los módulos cargan en modo diferido/deferred)
  if (document.readyState === "complete" || document.readyState === "interactive") {
    router();
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      router();
    });
  }
  
  // Escuchar cambios de autenticación
  window.addEventListener("mudat_auth_change", () => {
    updateHeaderUI(state);
    router();
  });

  // Inicializar controlador unificado del Header
  initHeader(state, (updatedUser) => {
    // Sincronizar UI de Header al cambiar de rol en el dropdown de simulación SaaS
    updateHeaderUI(state);
    router();
  });

  // AI Chatbot Toggle
  const chatbotToggle = document.getElementById("ai-chatbot-toggle");
  const chatbotClose = document.getElementById("ai-chatbot-close");
  const chatbotWindow = document.getElementById("ai-chatbot-window");

  chatbotToggle.addEventListener("click", () => {
    chatbotWindow.classList.toggle("active");
  });

  chatbotClose.addEventListener("click", () => {
    chatbotWindow.classList.remove("active");
  });

  // AI Chat Send Message
  const chatSendBtn = document.getElementById("ai-chat-send");
  const chatInput = document.getElementById("ai-chat-input");
  
  const sendMessage = () => {
    const text = chatInput.value.trim();
    if (!text) return;
    appendChatMessage("user", text);
    chatInput.value = "";
    
    // Mostrar indicador de escritura
    const typingId = showChatTypingIndicator();
    
    // Simular procesamiento de IA
    setTimeout(() => {
      removeChatTypingIndicator(typingId);
      const response = simulateAIResponse(text);
      appendChatMessage("bot", response);
    }, 1200);
  };

  chatSendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Quick Replies for AI Chat
  document.querySelectorAll(".quick-reply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const query = btn.getAttribute("data-query");
      appendChatMessage("user", query);
      
      const typingId = showChatTypingIndicator();
      setTimeout(() => {
        removeChatTypingIndicator(typingId);
        const response = simulateAIResponse(query);
        appendChatMessage("bot", response);
      }, 1200);
    });
  });
}

// Mostrar indicador de escritura animado
function showChatTypingIndicator() {
  const chatBody = document.getElementById("ai-chat-body");
  const typingDiv = document.createElement("div");
  const uniqueId = "typing-" + Date.now();
  typingDiv.className = "chat-message bot typing-indicator";
  typingDiv.id = uniqueId;
  typingDiv.innerHTML = `
    <span class="ai-pulse-dot"></span>
    <span class="ai-pulse-dot"></span>
    <span class="ai-pulse-dot"></span>
  `;
  chatBody.appendChild(typingDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
  return uniqueId;
}

// Remover indicador de escritura
function removeChatTypingIndicator(id) {
  const indicator = document.getElementById(id);
  if (indicator) indicator.remove();
}

// Append Chat Message Helper
function appendChatMessage(sender, text) {
  const chatBody = document.getElementById("ai-chat-body");
  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-message ${sender}`;
  msgDiv.innerHTML = text.replace(/\n/g, "<br>");
  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Simple Rule-based AI Simulator
function simulateAIResponse(query) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("plusvalía") || lowerQuery.includes("plusvalia") || lowerQuery.includes("zona")) {
    return "📈 **Análisis de Plusvalía MudaT AI**:\n- **CDMX (Polanco/Condesa)**: Mantiene un crecimiento constante del **8% al 9.5% anual** impulsado por renta de corta estancia.\n- **San Pedro Garza García (NL)**: Líder nacional con **11.5% anual** por alta demanda corporativa y residencial premium.\n- **Guadalajara (Providencia)**: **12.0% anual** debido al boom tecnológico y preventas inmobiliarias.\n- **Riviera Maya (Tulum)**: Registra un histórico **13.8% anual**, aunque con mayor volatilidad. Ideal para esquemas de ROI por renta vacacional.";
  }
  
  if (lowerQuery.includes("mensualidad") || lowerQuery.includes("crédito") || lowerQuery.includes("credito") || lowerQuery.includes("hipoteca")) {
    return "🧮 **Simulador Hipotecario MudaT AI**:\nPara un crédito promedio de **$3,500,000 MXN** con una tasa de interés del **10.2%** y plazo a **20 años**:\n- **Mensualidad Estimada**: ~$34,250 MXN.\n- **Enganche Recomendado**: 20% ($700,000 MXN) para mejores tasas.\n- **Ingreso Mínimo Sugerido**: ~$102,000 MXN mensuales comprobables.\n\n¿Quieres que simulemos un monto de propiedad diferente o solicitemos una pre-aprobación bancaria directa desde tu portal?";
  }

  if (lowerQuery.includes("retorno") || lowerQuery.includes("roi") || lowerQuery.includes("rendimiento")) {
    return "💰 **Retornos de Inversión (ROI) Estimados**:\n- **Tulum (Aldea Zama)**: **10% - 12% anual** operando en plataformas de renta vacacional.\n- **Condesa Loft (CDMX)**: **7.5% - 8.5% anual** para rentas corporativas y nómadas digitales.\n- **Polanco Penthouse**: **5.5% - 6.8% anual**, enfocado principalmente en ganancia patrimonial de largo plazo.\n- **Oficinas Valle Oriente (MTY)**: **7.0% anual** con contratos comerciales triple net (NNN).";
  }

  if (lowerQuery.includes("similares") || lowerQuery.includes("propiedades") || lowerQuery.includes("catalogo") || lowerQuery.includes("busco")) {
    const list = state.properties.slice(0, 3).map((p, i) => `${i+1}. *${p.title}* (${p.location.city}) - ${p.category}. ${p.plusvalia ? 'IA Score Alto' : 'Destacada'}`).join('\n');
    return "🏠 **Recomendaciones Inteligentes (Tiempo Real)**:\nBasado en nuestro inventario actual, te sugiero revisar:\n" + list + "\n\nPuedes navegar a la sección de **Comprar** o **Rentar** en el menú para ver la lista completa con mapa interactivo.";
  }

  if (lowerQuery.includes("costo") || lowerQuery.includes("cuesta") || lowerQuery.includes("precio")) {
    return "💵 **Estadística de Precios MudaT**:\n- CDMX Polanco: Promedio de **$85,000 MXN por m²**.\n- San Pedro NL: Promedio de **$95,000 MXN por m²**.\n- Guadalajara Providencia: Promedio de **$48,000 MXN por m²**.\n- Tulum Eco-chic: Promedio de **$3,200 USD por m²**.";
  }

  return "🤖 Entendido. Como asistente inmobiliario de MudaT, mi IA puede analizar nuestro catálogo de " + state.properties.length + " propiedades, simular créditos, buscar opciones similares y proyectar plusvalías. ¿Cómo deseas proceder?";
}

// Start everything
setupEvents();
