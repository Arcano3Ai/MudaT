const DEFAULT_USERS = {
  client: {
    id: "user-client-1",
    name: "Sergio Developer",
    email: "sergio@desarrollador.com",
    role: "client",
    phone: "+52 55 5555 1234",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    favorites: ["prop-1", "prop-3"],
    savedSearches: [
      { id: "s-1", name: "Departamentos en Polanco", query: { city: "CDMX", neighborhood: "Polanco" } }
    ],
    documents: [
      { id: "doc-1", name: "Identificación Oficial (INE)", status: "Aprobado", uploadDate: "2026-05-10" },
      { id: "doc-2", name: "Comprobante de Ingresos", status: "Pendiente", uploadDate: "2026-06-01" },
      { id: "doc-3", name: "Estado de Cuenta Bancario", status: "Pendiente", uploadDate: "2026-06-25" }
    ],
    credits: [
      { id: "cred-1", bank: "MudaT Pre-Aprobado (Simulación Completa)", amount: 15000000, status: "Aprobado", monthlyPayment: 142000 }
    ],
    visits: [
      { id: "vis-1", propertyId: "prop-1", date: "2026-06-28", time: "11:00 AM", status: "Confirmada" }
    ]
  },
  advisor: {
    id: "adv-1",
    name: "Yesenia Cuevas",
    email: "yesenia.cuevas@mudat.mx",
    role: "advisor",
    phone: "+52 55 1234 5678",
    avatar: "./assets/images/asesora-yesenia-cuevas.jpg",
    rating: 5.0,
    commissionRate: 4.5,
    agency: "MudaT Bienes Raíces — Asesora Principal"
  },
  admin: {
    id: "admin-1",
    name: "Administrador General",
    email: "admin@mudat.mx",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
  }
};

export function initializeAuth() {
  if (!localStorage.getItem("mudat_users")) {
    localStorage.setItem("mudat_users", JSON.stringify(DEFAULT_USERS));
  } else {
    // Sync updated default advisor (Yesenia Cuevas) if stale data exists
    const storedUsers = JSON.parse(localStorage.getItem("mudat_users"));
    if (storedUsers?.advisor?.name !== DEFAULT_USERS.advisor.name) {
      storedUsers.advisor = DEFAULT_USERS.advisor;
      localStorage.setItem("mudat_users", JSON.stringify(storedUsers));
    }
  }
  // Setup initial active session as client by default to start on the homepage
  if (!localStorage.getItem("mudat_current_user")) {
    localStorage.setItem("mudat_current_user", JSON.stringify(DEFAULT_USERS.client));
  }
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("mudat_current_user"));
}

export function authenticateCredentials(usernameOrEmail, password, expectedRole = "any") {
  initializeAuth();
  const users = JSON.parse(localStorage.getItem("mudat_users"));
  const identifier = (usernameOrEmail || "").trim().toLowerCase();

  // Validación específica para Asesora Principal: Yesenia Cuevas
  if (
    identifier === "yesenia cuevas" ||
    identifier === "yesenia.cuevas@mudat.mx" ||
    identifier === "yesenia"
  ) {
    if (password !== "Yeseniatupuedes") {
      return { ok: false, error: "Contraseña incorrecta para Yesenia Cuevas." };
    }
    const advisorUser = users.advisor || DEFAULT_USERS.advisor;
    localStorage.setItem("mudat_current_user", JSON.stringify(advisorUser));
    window.dispatchEvent(new Event("mudat_auth_change"));
    return { ok: true, user: advisorUser };
  }

  if (expectedRole === "advisor") {
    return { ok: false, error: "Credenciales de asesor no reconocidas." };
  }

  // Validar contra perfiles de clientes creados por el asesor
  const clientProfiles = getAdvisorCreatedProfiles();
  const matchedProfile = clientProfiles.find(
    (p) =>
      p.email?.toLowerCase() === identifier ||
      p.name?.toLowerCase() === identifier
  );
  if (matchedProfile) {
    if (matchedProfile.password && matchedProfile.password !== password) {
      return { ok: false, error: "Contraseña incorrecta para este perfil." };
    }
    const safeUser = { ...matchedProfile };
    delete safeUser.password;
    localStorage.setItem("mudat_current_user", JSON.stringify(safeUser));
    window.dispatchEvent(new Event("mudat_auth_change"));
    return { ok: true, user: safeUser };
  }

  // Fallback para otros usuarios / clientes
  const user = login(usernameOrEmail, "client");
  return { ok: true, user };
}

export function getAdvisorCreatedProfiles() {
  try {
    return JSON.parse(localStorage.getItem("mudat_client_profiles") || "[]");
  } catch {
    return [];
  }
}

export function createClientProfile({ name, email, phone, password, createdBy = "Yesenia Cuevas" }) {
  const list = getAdvisorCreatedProfiles();
  const profile = {
    id: `client-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    phone: (phone || "").trim(),
    password: password || "Mudat2026",
    role: "client",
    createdBy,
    createdAt: new Date().toISOString().slice(0, 10),
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    favorites: [],
    savedSearches: [],
    alerts: [],
    documents: [],
    credits: [],
    visits: []
  };
  list.unshift(profile);
  localStorage.setItem("mudat_client_profiles", JSON.stringify(list));
  return profile;
}

export function login(email, role = "client") {
  initializeAuth();
  const users = JSON.parse(localStorage.getItem("mudat_users"));
  let user = null;

  if (role === "client" && email === DEFAULT_USERS.client.email) {
    user = users.client;
  } else if (role === "advisor" && email === DEFAULT_USERS.advisor.email) {
    user = users.advisor;
  } else if (role === "admin" && email === DEFAULT_USERS.admin.email) {
    user = users.admin;
  } else {
    // Dynamic user fallback
    user = {
      id: `user-${Date.now()}`,
      name: email.split("@")[0],
      email: email,
      role: role,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      favorites: [],
      savedSearches: [],
      alerts: [],
      documents: [],
      credits: [],
      visits: []
    };
  }

  localStorage.setItem("mudat_current_user", JSON.stringify(user));
  // Trigger custom event for state changes
  window.dispatchEvent(new Event("mudat_auth_change"));
  return user;
}

export function switchUserRole(role) {
  initializeAuth();
  const users = JSON.parse(localStorage.getItem("mudat_users"));
  let user = users[role] || users.client;
  localStorage.setItem("mudat_current_user", JSON.stringify(user));
  window.dispatchEvent(new Event("mudat_auth_change"));
  return user;
}

export function logout() {
  localStorage.removeItem("mudat_current_user");
  window.dispatchEvent(new Event("mudat_auth_change"));
}

export function updateUserProfile(updatedUser) {
  localStorage.setItem("mudat_current_user", JSON.stringify(updatedUser));
  // If it's one of the primary roles, sync it back to users object
  const users = JSON.parse(localStorage.getItem("mudat_users"));
  if (updatedUser.role === "client") {
    users.client = updatedUser;
  } else if (updatedUser.role === "advisor") {
    users.advisor = updatedUser;
  } else if (updatedUser.role === "admin") {
    users.admin = updatedUser;
  }
  localStorage.setItem("mudat_users", JSON.stringify(users));
  window.dispatchEvent(new Event("mudat_auth_change"));
}
