/**
 * Servicio centralizado de Internacionalización (i18n) para MudaT — Español (es) / Inglés (en).
 * Persiste preferencia en localStorage ("mudat_lang") y actualiza el DOM estático + vistas dinámicas.
 */

const STORAGE_KEY = "mudat_lang";

const CATEGORY_EN = {
  "Comprar": "Buy",
  "Rentar": "Rent",
  "Alquilar": "Rent",
  "Preventa": "Presale",
  "Desarrollos": "Developments",
  "Terrenos": "Land",
  "Oficinas": "Offices",
  "Locales": "Retail",
  "Bodegas": "Warehouses",
  "Industrial": "Industrial",
  "Lead": "Lead",
  "Contacto": "Contacted",
  "Interesado": "Interested",
  "Visita": "Visit",
  "Oferta": "Offer",
  "Negociación": "Negotiation",
  "Escrituración": "Closing",
  "Venta": "Sold",
  "Postventa": "After-Sales"
};

export function getLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

export function isEn() {
  return getLang() === "en";
}

export function setLang(lang) {
  const normalized = lang === "en" ? "en" : "es";
  try {
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    // Ignorar si localStorage no está disponible
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = normalized;
    applyStaticTranslations(normalized);
    window.dispatchEvent(new CustomEvent("mudat_lang_change", { detail: { lang: normalized } }));
  }
  return normalized;
}

/**
 * Devuelve la cadena en español o inglés según el idioma activo.
 */
export function L(es, en) {
  return getLang() === "en" ? en : es;
}

/**
 * Traduce categorías de propiedad o etapas de CRM al idioma activo.
 */
export function tCategory(value) {
  if (!value) return "";
  if (getLang() !== "en") return value;
  return CATEGORY_EN[value] || value;
}

/**
 * Formatea montos monetarios según el idioma activo.
 */
export function formatCurrency(amount, currency = "MXN") {
  const safeCurrency = currency || "MXN";
  const locale = getLang() === "en" ? "en-US" : "es-MX";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}

/**
 * Actualiza los elementos estáticos del shell en index.html (header, chat IA, footer, modal login).
 */
export function applyStaticTranslations(lang = getLang()) {
  if (typeof document === "undefined") return;
  const en = lang === "en";
  document.documentElement.lang = lang;
  document.title = en
    ? "MudaT - Your next home starts here"
    : "MudaT - Tu próximo hogar comienza aquí";

  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  };

  // Navegación
  setText('a[data-view="home"]', en ? "Home" : "Inicio");
  setText('a[data-view="comprar"]', en ? "Buy" : "Comprar");
  setText('a[data-view="rentar"]', en ? "Rent" : "Rentar");
  setText('a[data-view="preventa"]', en ? "Developments" : "Desarrollos");
  setText('a[data-view="crm"]', en ? "Advisors (CRM)" : "Asesores (CRM)");
  setText('a[data-view="calculator"]', en ? "Calculator" : "Calculadora");
  setText('a[data-view="publish"]', en ? "Publish" : "Publicar");

  // Selector de tema e idioma
  const themeBtnDark = document.getElementById("theme-btn-dark");
  const themeBtnLight = document.getElementById("theme-btn-light");
  if (themeBtnDark) themeBtnDark.innerHTML = `<i data-lucide="moon" class="icon-inline icon-sm"></i> ${en ? "Dark" : "Oscuro"}`;
  if (themeBtnLight) themeBtnLight.innerHTML = `<i data-lucide="sun" class="icon-inline icon-sm"></i> ${en ? "Light" : "Claro"}`;

  const langBtnEs = document.getElementById("lang-btn-es");
  const langBtnEn = document.getElementById("lang-btn-en");
  if (langBtnEs && langBtnEn) {
    langBtnEs.classList.toggle("active", !en);
    langBtnEn.classList.toggle("active", en);
  }

  // Botón login si no hay sesión
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn && !loginBtn.dataset.loggedIn) {
    loginBtn.innerHTML = `<i data-lucide="user" class="icon-inline icon-md"></i> ${en ? "Sign in" : "Iniciar sesión"}`;
  }

  // Chat IA
  setText(".chat-header h4", en ? "MudaT Smart Assistant" : "Asistente Inteligente MudaT");
  setText(".chat-header small", en ? "Online • Powered by AI" : "Online • Powered by IA");
  const chatInput = document.getElementById("chat-input");
  if (chatInput) chatInput.placeholder = en ? "Ask the AI..." : "Pregúntale a la IA...";

  const quickReplies = document.querySelectorAll(".quick-reply-btn");
  if (quickReplies.length >= 3) {
    quickReplies[0].textContent = en ? "Highest appreciation areas?" : "¿Zonas con mayor plusvalía?";
    quickReplies[1].textContent = en ? "How to calculate monthly payment?" : "¿Cómo calcular mensualidad?";
    quickReplies[2].textContent = en ? "Average ROI?" : "¿ROI promedio?";
  }

  const firstBotMsg = document.querySelector("#chat-messages .chat-msg.bot");
  if (firstBotMsg && !firstBotMsg.dataset.customized) {
    firstBotMsg.innerHTML = en
      ? `Hello! I am your MudaT smart assistant. How can I help you today?
         <br><br>You can ask me about:
         <br>• Property prices in an area.
         <br>• Mortgages and payment simulations.
         <br>• Return on investment (ROI).
         <br>• Neighborhood appreciation.`
      : `¡Hola! Soy tu asistente inteligente de MudaT. ¿En qué puedo ayudarte hoy?
         <br><br>Puedes preguntarme sobre:
         <br>• El costo de inmuebles en una zona.
         <br>• Créditos y simulaciones hipotecarias.
         <br>• Retornos de inversión (ROI).
         <br>• Plusvalías de colonias.`;
  }

  // Footer
  setText(".footer-brand > p", en
    ? "The leading PropTech SaaS platform in Mexico and Latin America connecting buyers, advisors, and brokerages through an AI-powered experience."
    : "La plataforma inmobiliaria SaaS líder en México y Latinoamérica que unifica a clientes, asesores e inmobiliarias en una experiencia basada en inteligencia artificial.");

  const footerCols = document.querySelectorAll(".footer-grid .footer-col");
  if (footerCols.length >= 3) {
    const c1 = footerCols[0];
    const c2 = footerCols[1];
    const c3 = footerCols[2];
    if (c1.querySelector("h4")) c1.querySelector("h4").textContent = en ? "Search Properties" : "Buscar Propiedades";
    const c1Links = c1.querySelectorAll("a");
    if (c1Links.length >= 4) {
      c1Links[0].textContent = en ? "Homes for Sale" : "Casas en Venta";
      c1Links[1].textContent = en ? "Apartments for Rent" : "Departamentos en Renta";
      c1Links[2].textContent = en ? "Exclusive Presales" : "Preventas Exclusivas";
      c1Links[3].textContent = en ? "Commercial Land" : "Terrenos Comerciales";
    }

    if (c2.querySelector("h4")) c2.querySelector("h4").textContent = en ? "Ecosystem Services" : "Servicios del Ecosistema";
    const c2Links = c2.querySelectorAll("a");
    if (c2Links.length >= 4) {
      c2Links[0].textContent = en ? "Mortgage Loans" : "Créditos Hipotecarios";
      c2Links[1].textContent = en ? "Certified Appraisals" : "Avalúos Certificados";
      c2Links[2].textContent = en ? "Legal Marketplace" : "Marketplace Legal";
      c2Links[3].textContent = en ? "Advisor Network" : "Red de Asesores";
    }

    if (c3.querySelector("h4")) c3.querySelector("h4").textContent = en ? "Contact & Support" : "Contacto y Soporte";
    const c3Links = c3.querySelectorAll("a");
    if (c3Links.length >= 4) {
      c3Links[1].textContent = en ? "WhatsApp Support" : "WhatsApp Soporte";
      c3Links[2].textContent = en ? "FAQ" : "Preguntas Frecuentes";
      c3Links[3].textContent = en ? "Privacy Policy" : "Políticas de Privacidad";
    }
  }

  setText(".footer-bottom p", en
    ? "© 2026 MudaT SAAS Platform. All rights reserved."
    : "© 2026 MudaT SAAS Platform. Todos los derechos reservados.");
  const bottomLinks = document.querySelectorAll(".footer-bottom-links a");
  if (bottomLinks.length >= 2) {
    bottomLinks[0].textContent = en ? "Terms of Service" : "Términos de Servicio";
    bottomLinks[1].textContent = en ? "Privacy" : "Privacidad";
  }

  // Modal Login
  setText(".login-title", en ? "MudaT Exclusive Access" : "Acceso Exclusivo MudaT");
  setText(".login-subtitle", en
    ? "Sign in to your PropTech account or jump right in by selecting a demo profile."
    : "Inicia sesión en tu cuenta PropTech o ingresa rápido seleccionando un perfil de demostración.");
  const loginLabels = document.querySelectorAll("#login-form label");
  if (loginLabels.length >= 2) {
    loginLabels[0].textContent = en ? "Username or Email" : "Usuario o Correo Electrónico";
    loginLabels[1].textContent = en ? "Password" : "Contraseña";
  }
  const loginSubmit = document.querySelector('#login-form button[type="submit"]');
  if (loginSubmit) loginSubmit.textContent = en ? "Sign In Securely" : "Ingresar Seguro";
  setText(".login-divider span", en ? "OR SIGN IN WITH DEMO PROFILE" : "O INGRESAR CON PERFIL DEMO");
  const demoSpans = document.querySelectorAll(".demo-profile-badge span");
  if (demoSpans.length >= 3) {
    demoSpans[0].textContent = en ? "Client" : "Cliente";
    demoSpans[1].textContent = en ? "CRM Advisor" : "Asesora CRM";
    demoSpans[2].textContent = "Admin SaaS";
  }

  if (window.lucide) window.lucide.createIcons();
}

