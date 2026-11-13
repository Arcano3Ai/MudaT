import { getCurrentUser, switchUserRole, authenticateCredentials, logout } from "../services/auth.js?v=20261122";
import { getLang, setLang, applyStaticTranslations, L } from "../services/i18n.js?v=20261122";

/**
 * Inicializa los eventos y comportamientos del Header:
 * - Modo Claro/Oscuro conmutador segmentado.
 * - Menú hamburguesa móvil.
 * - Modal interactivo de inicio de sesión premium y perfiles de demostración.
 */
export function initHeader(state, onAuthChangeCallback) {
  const themeSwitcher = document.getElementById("theme-switcher");
  const btnDark = document.getElementById("theme-btn-dark");
  const btnLight = document.getElementById("theme-btn-light");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const navMenu = document.querySelector("header nav");

  // --- LÓGICA DE TEMAS ---
  const setTheme = (themeName) => {
    const body = document.body;
    state.theme = themeName;
    
    if (themeName === "dark") {
      body.classList.add("dark-theme");
      btnDark?.classList.add("active");
      btnLight?.classList.remove("active");
    } else {
      body.classList.remove("dark-theme");
      btnLight?.classList.add("active");
      btnDark?.classList.remove("active");
    }
    
    localStorage.setItem("mudat_theme", themeName);
  };

  btnDark?.addEventListener("click", (e) => {
    e.stopPropagation();
    setTheme("dark");
  });

  btnLight?.addEventListener("click", (e) => {
    e.stopPropagation();
    setTheme("light");
  });

  themeSwitcher?.addEventListener("click", () => {
    const nextTheme = state.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });

  // Inicializar tema al cargar
  const savedTheme = localStorage.getItem("mudat_theme") || "dark";
  setTheme(savedTheme);

  // --- SELECTOR DE IDIOMA ES / EN ---
  const langEsBtn = document.getElementById("lang-btn-es");
  const langEnBtn = document.getElementById("lang-btn-en");
  langEsBtn?.addEventListener("click", () => setLang("es"));
  langEnBtn?.addEventListener("click", () => setLang("en"));
  applyStaticTranslations(getLang());

  // --- MENÚ MÓVIL ---
  if (mobileMenuToggle && navMenu) {
    const closeMobileMenu = () => {
      navMenu.classList.remove("active");
      mobileMenuToggle.innerHTML = `<i data-lucide="menu"></i>`;
      if (window.lucide) window.lucide.createIcons();
    };

    mobileMenuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navMenu.classList.toggle("active");
      const isActive = navMenu.classList.contains("active");
      mobileMenuToggle.innerHTML = isActive
        ? `<i data-lucide="x"></i>`
        : `<i data-lucide="menu"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });

    navMenu.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("click", (e) => {
      if (navMenu.classList.contains("active") && !navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("active")) {
        closeMobileMenu();
      }
    });
  }

  // --- CONTROLADOR DEL MODAL DE AUTENTICACIÓN ---
  const modal = document.getElementById("login-modal");
  const closeBtn = document.getElementById("close-login-btn");
  const loginForm = document.getElementById("login-form");
  const roleClientBtn = document.getElementById("login-role-client");
  const roleAdvisorBtn = document.getElementById("login-role-advisor");
  const loginEmailInput = document.getElementById("login-email");
  let selectedLoginRole = "client";

  const setLoginRole = (role) => {
    selectedLoginRole = role === "advisor" ? "advisor" : "client";
    roleClientBtn?.classList.toggle("active", selectedLoginRole === "client");
    roleAdvisorBtn?.classList.toggle("active", selectedLoginRole === "advisor");
    roleClientBtn?.setAttribute("aria-selected", String(selectedLoginRole === "client"));
    roleAdvisorBtn?.setAttribute("aria-selected", String(selectedLoginRole === "advisor"));
    const errorEl = document.getElementById("login-error-msg");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.add("display-none");
    }
    if (loginEmailInput) {
      loginEmailInput.placeholder =
        selectedLoginRole === "advisor"
          ? "Yesenia Cuevas"
          : L("cliente@correo.com", "client@email.com");
    }
  };

  roleClientBtn?.addEventListener("click", () => setLoginRole("client"));
  roleAdvisorBtn?.addEventListener("click", () => setLoginRole("advisor"));

  // Función para abrir el modal
  const openModal = (preferredRole = "client") => {
    setLoginRole(preferredRole);
    const errorEl = document.getElementById("login-error-msg");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.add("display-none");
    }
    modal?.classList.remove("display-none");
    modal?.classList.add("fade-in");
  };

  window.addEventListener("mudat_open_login", (e) => {
    openModal(e?.detail?.role || "client");
  });

  // Función para cerrar el modal
  const closeModal = () => {
    modal?.classList.add("display-none");
  };

  closeBtn?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Enlazar el click del botón de Iniciar Sesión para abrir el modal
  const loginBtn = document.getElementById("login-btn");
  loginBtn?.addEventListener("click", () => {
    // Si ya está logueado, al hacer clic podemos desloguear (Logout)
    if (state.currentUser) {
      if (confirm(L("¿Deseas cerrar tu sesión premium en MudaT?", "Do you want to sign out of your MudaT premium session?"))) {
        logout();
        state.currentUser = null;
        alert(L("Sesión finalizada. Has vuelto al modo público.", "Signed out. You are back in public mode."));
      }
    } else {
      openModal();
    }
  });

  // Formulario Submit (Validación de Credenciales)
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const identifier = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error-msg");

    const result = authenticateCredentials(identifier, password, selectedLoginRole);
    if (!result.ok) {
      if (errorEl) {
        errorEl.textContent = result.error;
        errorEl.classList.remove("display-none");
      } else {
        alert(result.error);
      }
      return;
    }

    state.currentUser = result.user;
    closeModal();
    alert(L(
      `¡Bienvenida de vuelta, ${result.user.name}! Sesión iniciada de forma segura.`,
      `Welcome back, ${result.user.name}! Signed in securely.`
    ));
    if (result.user.role === "advisor") {
      window.location.hash = "#asesores";
    } else if (result.user.role === "client") {
      window.location.hash = "#mi-portal";
    }
  });

  // Clics en Perfiles Demo de Acceso Rápido
  document.querySelectorAll(".demo-profile-badge").forEach(badge => {
    badge.addEventListener("click", () => {
      const role = badge.getAttribute("data-demo-role");
      const user = switchUserRole(role);
      state.currentUser = user;
      closeModal();
      alert(L(
        `Entrando en modo de demostración comercial como: ${user.name} (${user.role.toUpperCase()})`,
        `Entering commercial demo mode as: ${user.name} (${user.role.toUpperCase()})`
      ));
    });
  });

  // Inicializar la interfaz del Header según el estado inicial
  updateHeaderUI(state);
}

/**
 * Actualiza el DOM estático del Header dinámicamente según el estado del usuario.
 */
export function updateHeaderUI(state) {
  const loginBtn = document.getElementById("login-btn");
  if (!loginBtn) return;

  const user = getCurrentUser();
  state.currentUser = user;

  const portalItem = document.getElementById("nav-portal-item");
  const portalLink = document.getElementById("nav-portal-link");

  if (user) {
    loginBtn.dataset.loggedIn = "1";
    loginBtn.className = "header-user-badge";
    loginBtn.innerHTML = `
      <img src="${user.avatar}" alt="${user.name}">
      <span>${user.name.split(' ')[0]}</span>
      <i data-lucide="log-out" style="width:14px; height:14px; margin-left: 0.5rem; opacity:0.7;" title="${L('Cerrar Sesión', 'Sign Out')}"></i>
    `;
    if (portalItem && portalLink) {
      portalItem.classList.remove("display-none");
      if (user.role === "advisor") {
        portalLink.href = "#asesores";
        portalLink.textContent = L("Panel CRM", "CRM Portal");
      } else if (user.role === "admin") {
        portalLink.href = "#admin";
        portalLink.textContent = "Admin SaaS";
      } else {
        portalLink.href = "#mi-portal";
        portalLink.textContent = L("Mi Portal", "My Portal");
      }
    }
  } else {
    delete loginBtn.dataset.loggedIn;
    loginBtn.className = "btn-login-premium";
    loginBtn.innerHTML = `
      <i data-lucide="user" class="icon-inline"></i>
      <span>${L("Iniciar sesión", "Sign in")}</span>
    `;
    portalItem?.classList.add("display-none");
  }

  if (window.lucide) window.lucide.createIcons();
}
