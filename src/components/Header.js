import { getCurrentUser, switchUserRole, login, logout } from "../services/auth.js";

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

  // --- MENÚ MÓVIL ---
  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      const isActive = navMenu.classList.contains("active");
      mobileMenuToggle.innerHTML = isActive 
        ? `<i data-lucide="x"></i>` 
        : `<i data-lucide="menu"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });

    navMenu.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", () => {
        navMenu.classList.remove("active");
        mobileMenuToggle.innerHTML = `<i data-lucide="menu"></i>`;
        if (window.lucide) window.lucide.createIcons();
      });
    });
  }

  // --- CONTROLADOR DEL MODAL DE AUTENTICACIÓN ---
  const modal = document.getElementById("login-modal");
  const closeBtn = document.getElementById("close-login-btn");
  const loginForm = document.getElementById("login-form");

  // Función para abrir el modal
  const openModal = () => {
    modal?.classList.remove("display-none");
    modal?.classList.add("fade-in");
  };

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
      if (confirm("¿Deseas cerrar tu sesión premium en MudaT?")) {
        logout();
        state.currentUser = null;
        alert("Sesión finalizada. Has vuelto al modo público.");
      }
    } else {
      openModal();
    }
  });

  // Formulario Submit (Simulado con Credenciales)
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const user = login(email, "client"); // Login como cliente por defecto con sus credenciales
    state.currentUser = user;
    closeModal();
    alert(`¡Bienvenido de vuelta, ${user.name}! Sesión premium iniciada de forma segura.`);
  });

  // Clics en Perfiles Demo de Acceso Rápido
  document.querySelectorAll(".demo-profile-badge").forEach(badge => {
    badge.addEventListener("click", () => {
      const role = badge.getAttribute("data-demo-role");
      const user = switchUserRole(role);
      state.currentUser = user;
      closeModal();
      alert(`Entrando en modo de demostración comercial como: ${user.name} (${user.role.toUpperCase()})`);
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

  if (user) {
    // Si el usuario ha iniciado sesión, mostramos su avatar y nombre en un badge premium
    loginBtn.className = "header-user-badge";
    loginBtn.innerHTML = `
      <img src="${user.avatar}" alt="${user.name}">
      <span>${user.name.split(' ')[0]}</span>
      <i data-lucide="log-out" style="width:14px; height:14px; margin-left: 0.5rem; opacity:0.7;" title="Cerrar Sesión"></i>
    `;
  } else {
    // Si no ha iniciado sesión, mostramos el botón estático de login
    loginBtn.className = "btn-login-premium";
    loginBtn.innerHTML = `
      <i data-lucide="user" class="icon-inline"></i>
      <span>Iniciar sesión</span>
    `;
  }

  if (window.lucide) window.lucide.createIcons();
}
