import { updateUserProfile } from "../services/auth.js?v=20261120";
import { L, tCategory, formatCurrency, getLang } from "../services/i18n.js";

export async function renderClientDashboard(state) {
  if (!state.currentUser) {
    const html = `
      <div class="section-container fade-in">
        <div class="client-dashboard-centered-msg-box glass-premium glow-brand" style="max-width: 560px; margin: 3rem auto; padding: 2.5rem;">
          <i data-lucide="lock" class="client-dashboard-centered-msg-icon"></i>
          <h2>${L("Inicia sesión para ver tu Panel", "Sign in to view your Dashboard")}</h2>
          <p class="client-dashboard-centered-msg-p">${L(
            "Accede a tus propiedades favoritas, comparador técnico, documentos KYC y seguimiento de créditos hipotecarios.",
            "Access your favorite properties, property comparator, KYC documents, and mortgage tracking."
          )}</p>
          <button class="btn btn-primary" id="client-signin-prompt-btn">
            <i data-lucide="log-in"></i> ${L("Iniciar Sesión", "Sign In")}
          </button>
        </div>
      </div>
    `;

    function init() {
      if (window.lucide) window.lucide.createIcons();
      document.getElementById("client-signin-prompt-btn")?.addEventListener("click", () => {
        document.getElementById("login-modal")?.classList.remove("display-none");
      });
    }

    return { html, init };
  }

  const user = state.currentUser;

  const html = `
    <div class="section-container fade-in">
      <div class="dashboard-grid">
        
        <!-- Navegación Lateral -->
        <aside class="dashboard-nav glass-premium">
          <div class="client-dashboard-aside-header">
            <img src="${user.avatar}" alt="${user.name}" class="client-dashboard-aside-avatar">
            <h3 class="client-dashboard-aside-name">${user.name}</h3>
            <p class="client-dashboard-aside-email">${user.email}</p>
          </div>
          <ul class="dashboard-menu-list">
            <li class="dashboard-menu-item active" data-tab="dashboard-overview"><i data-lucide="layout-dashboard"></i> ${L("Resumen", "Overview")}</li>
            <li class="dashboard-menu-item" data-tab="dashboard-favorites"><i data-lucide="heart"></i> ${L("Favoritos", "Favorites")}</li>
            <li class="dashboard-menu-item" data-tab="dashboard-compare"><i data-lucide="columns"></i> ${L("Comparador", "Comparator")}</li>
            <li class="dashboard-menu-item" data-tab="dashboard-documents"><i data-lucide="file-text"></i> ${L("Documentos", "Documents")}</li>
            <li class="dashboard-menu-item" data-tab="dashboard-credits"><i data-lucide="credit-card"></i> ${L("Mi Crédito", "My Mortgage")}</li>
            <li class="dashboard-menu-item" data-tab="dashboard-profile"><i data-lucide="settings"></i> ${L("Configuración", "Settings")}</li>
          </ul>
        </aside>

        <!-- Contenido Dinámico del Dashboard -->
        <div class="dashboard-content-panel" id="dashboard-content-mount"></div>

      </div>
    </div>
  `;

  function init(appState) {
    const menuItems = document.querySelectorAll(".dashboard-menu-item");
    const mountPoint = document.getElementById("dashboard-content-mount");
    
    // Lista de ids de propiedades a comparar (máximo 2 para lado a lado)
    let comparisonList = [];

    function switchTab(tabId) {
      menuItems.forEach(item => item.classList.remove("active"));
      const activeItem = Array.from(menuItems).find(item => item.getAttribute("data-tab") === tabId);
      if (activeItem) activeItem.classList.add("active");

      if (tabId === "dashboard-overview") {
        renderOverviewTab();
      } else if (tabId === "dashboard-favorites") {
        renderFavoritesTab();
      } else if (tabId === "dashboard-compare") {
        renderCompareTab();
      } else if (tabId === "dashboard-documents") {
        renderDocumentsTab();
      } else if (tabId === "dashboard-credits") {
        renderCreditsTab();
      } else if (tabId === "dashboard-profile") {
        renderProfileTab();
      }
      
      if (window.lucide) window.lucide.createIcons();
    }

    // Registrar clics de navegación
    menuItems.forEach(item => {
      item.addEventListener("click", () => {
        const tabId = item.getAttribute("data-tab");
        switchTab(tabId);
      });
    });

    // Renderizadores de Pestañas
    function renderOverviewTab() {
      const currentUser = appState.currentUser;
      const favIds = currentUser.favorites || [];
      const favProps = appState.properties.filter(p => favIds.includes(p.id));
      const visits = currentUser.visits || [];
      const credits = currentUser.credits || [];
      const savedSearches = currentUser.savedSearches || [];

      const visitsHtml = visits.map(vis => {
        const property = appState.properties.find(p => p.id === vis.propertyId);
        const statusLabel = vis.status === "Confirmada"
          ? L("Confirmada", "Confirmed")
          : L(vis.status || "Pendiente", vis.status === "Pendiente" ? "Pending" : (vis.status || "Pending"));
        return `
          <div class="client-dashboard-credit-card">
            <div>
              <p class="font-bold">${property ? property.title : L("Propiedad", "Property")}</p>
              <p class="font-sm text-secondary"><i data-lucide="calendar" class="icon-inline icon-sm"></i> ${L("Fecha", "Date")}: ${vis.date} | ${L("Hora", "Time")}: ${vis.time}</p>
            </div>
            <span class="status-indicator status-${vis.status === 'Confirmada' ? 'active' : 'pending'}">${statusLabel}</span>
          </div>
        `;
      }).join('') || `<p class="text-muted">${L("No tienes visitas programadas.", "You have no scheduled visits.")}</p>`;

      mountPoint.innerHTML = `
        <div class="tab-content fade-in" id="dashboard-overview">
          <h2 class="client-dashboard-tab-title">${L(`¡Hola, ${currentUser.name.split(' ')[0]}!`, `Hello, ${currentUser.name.split(' ')[0]}!`)}</h2>
          
          <div class="metrics-row client-dashboard-overview-metrics-row">
            <div class="metric-card metric-card-purple">
              <span class="font-sm text-secondary font-semibold">${L("Favoritos", "Favorites")}</span>
              <span class="metric-value">${favProps.length}</span>
            </div>
            <div class="metric-card metric-card-cyan">
              <span class="font-sm text-secondary font-semibold">${L("Visitas Programadas", "Scheduled Visits")}</span>
              <span class="metric-value">${visits.length}</span>
            </div>
            <div class="metric-card metric-card-emerald">
              <span class="font-sm text-secondary font-semibold">${L("Créditos en Trámite", "Mortgages in Progress")}</span>
              <span class="metric-value">${credits.length}</span>
            </div>
          </div>

          <div class="client-dashboard-overview-grid">
            <div>
              <h3 class="client-dashboard-overview-section-title"><i data-lucide="calendar" class="icon-inline color-brand"></i> ${L("Próxima Visita", "Upcoming Visit")}</h3>
              ${visitsHtml}
            </div>
            <div>
              <h3 class="client-dashboard-overview-section-title"><i data-lucide="bell" class="icon-inline color-brand"></i> ${L("Búsquedas Guardadas", "Saved Searches")}</h3>
              <div class="client-dashboard-saved-searches-box">
                ${savedSearches.map(s => `
                  <div class="client-dashboard-search-card">
                    <span class="name">${s.name}</span>
                    <a href="#comprar" class="btn btn-outline">${L("Buscar", "Search")}</a>
                  </div>
                `).join('') || `<p class="text-muted">${L("No tienes búsquedas guardadas.", "You have no saved searches.")}</p>`}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function renderFavoritesTab() {
      const currentFavs = appState.currentUser.favorites || [];
      const currentFavProps = appState.properties.filter(p => currentFavs.includes(p.id));
      
      const contentHtml = `
        <h2 class="client-dashboard-tab-title">${L("Mis Propiedades Favoritas", "My Favorite Properties")}</h2>
        <p class="client-dashboard-tab-subtitle">${L(
          "Guarda tus propiedades preferidas aquí y agrégalas al comparador técnico.",
          "Save your preferred properties here and add them to the side-by-side comparator."
        )}</p>
        <div class="client-dashboard-card-container">
          ${currentFavProps.length > 0 ? currentFavProps.map(prop => {
            const formattedPrice = formatCurrency(prop.price, prop.currency || "MXN");
            
            return `
              <div class="client-dashboard-card">
                <img src="${prop.images[0]}" alt="${prop.title}" class="client-dashboard-card-img">
                <div class="client-dashboard-card-info">
                  <h4><a href="#propiedad/${prop.id}">${prop.title}</a></h4>
                  <p class="meta">${prop.location.neighborhood}, ${prop.location.city}</p>
                  <p class="price">${formattedPrice}</p>
                </div>
                <div class="client-dashboard-card-actions">
                  <button class="btn btn-outline compare-add-btn" data-id="${prop.id}"><i data-lucide="columns" class="icon-inline icon-sm"></i> ${L("Comparar", "Compare")}</button>
                  <button class="btn btn-secondary remove-fav-btn" data-id="${prop.id}" title="${L("Eliminar favorito", "Remove favorite")}"><i data-lucide="trash-2" class="icon-inline icon-sm color-danger"></i></button>
                </div>
              </div>
            `;
          }).join('') : `<p class="text-muted text-center padding-lg">${L("Aún no tienes propiedades favoritas.", "You don't have any favorite properties yet.")}</p>`}
        </div>
      `;
      mountPoint.innerHTML = contentHtml;
      
      // Bind delete favorites
      document.querySelectorAll(".remove-fav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          appState.currentUser.favorites = (appState.currentUser.favorites || []).filter(fId => fId !== id);
          updateUserProfile(appState.currentUser);
          renderFavoritesTab();
          if (window.lucide) window.lucide.createIcons();
        });
      });

      // Bind add to compare
      document.querySelectorAll(".compare-add-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          if (comparisonList.includes(id)) {
            alert(L("Este inmueble ya está en la lista del comparador.", "This property is already in the comparator list."));
            return;
          }
          if (comparisonList.length >= 2) {
            comparisonList.shift(); // Remove first to keep max 2
          }
          comparisonList.push(id);
          alert(L("¡Inmueble agregado al comparador! Redirigiendo...", "Property added to comparator! Redirecting..."));
          switchTab("dashboard-compare");
        });
      });
    }

    function renderCompareTab() {
      // Load properties in comparison list or use first 2 favorites as default
      let propsToCompare = appState.properties.filter(p => comparisonList.includes(p.id));
      if (propsToCompare.length === 0 && appState.currentUser.favorites?.length >= 2) {
        propsToCompare = appState.properties.filter(p => appState.currentUser.favorites.slice(0, 2).includes(p.id));
      }

      let contentHtml = `
        <h2 class="client-dashboard-tab-title">${L("Comparador de Inmuebles", "Property Comparator")}</h2>
        <p class="client-dashboard-tab-subtitle">${L(
          "Inspecciona detalladamente las fichas técnicas lado a lado para tomar la decisión ideal.",
          "Inspect technical specs side by side to make the ideal decision."
        )}</p>
      `;

      if (propsToCompare.length < 2) {
        contentHtml += `
          <div class="client-dashboard-centered-msg-box">
            <i data-lucide="columns" class="client-dashboard-centered-msg-icon"></i>
            <h3>${L("Necesitas seleccionar al menos 2 propiedades", "You need to select at least 2 properties")}</h3>
            <p class="client-dashboard-centered-msg-p">${L(
              'Navega a la pestaña de "Favoritos" y haz click en "Comparar" en tus inmuebles guardados.',
              'Go to the "Favorites" tab and click "Compare" on your saved properties.'
            )}</p>
            <button class="btn btn-primary" id="go-favs-compare-btn">${L("Ir a Favoritos", "Go to Favorites")}</button>
          </div>
        `;
        mountPoint.innerHTML = contentHtml;
        document.getElementById("go-favs-compare-btn").addEventListener("click", () => switchTab("dashboard-favorites"));
      } else {
        const p1 = propsToCompare[0];
        const p2 = propsToCompare[1];

        const fPrice1 = formatCurrency(p1.price, p1.currency || "MXN");
        const fPrice2 = formatCurrency(p2.price, p2.currency || "MXN");

        contentHtml += `
          <div class="comparator-table-wrapper">
            <table class="comparator-table">
              <thead>
                <tr>
                  <th class="feature-title">${L("Ficha Técnica", "Spec Sheet")}</th>
                  <th>
                    <img src="${p1.images[0]}" alt="${p1.title}" class="compare-img">
                    <a href="#propiedad/${p1.id}" class="compare-title">${p1.title}</a>
                  </th>
                  <th>
                    <img src="${p2.images[0]}" alt="${p2.title}" class="compare-img">
                    <a href="#propiedad/${p2.id}" class="compare-title">${p2.title}</a>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="feature-title">${L("Precio", "Price")}</td>
                  <td class="font-bold color-brand">${fPrice1}</td>
                  <td class="font-bold color-brand">${fPrice2}</td>
                </tr>
                <tr>
                  <td class="feature-title">${L("Ubicación", "Location")}</td>
                  <td>${p1.location.neighborhood}, ${p1.location.city}</td>
                  <td>${p2.location.neighborhood}, ${p2.location.city}</td>
                </tr>
                <tr>
                  <td class="feature-title">${L("Recámaras", "Bedrooms")}</td>
                  <td>${p1.bedrooms}</td>
                  <td>${p2.bedrooms}</td>
                </tr>
                <tr>
                  <td class="feature-title">${L("Baños", "Bathrooms")}</td>
                  <td>${p1.bathrooms}</td>
                  <td>${p2.bathrooms}</td>
                </tr>
                <tr>
                  <td class="feature-title">${L("Construcción", "Built Area")}</td>
                  <td>${p1.construction || p1.land} m²</td>
                  <td>${p2.construction || p2.land} m²</td>
                </tr>
                <tr>
                  <td class="feature-title">${L("Plusvalía Estimada", "Estimated Appreciation")}</td>
                  <td class="color-success font-semibold">${p1.plusvalia}</td>
                  <td class="color-success font-semibold">${p2.plusvalia}</td>
                </tr>
                <tr>
                  <td class="feature-title">${L("Retorno de Inversión (ROI)", "Return on Investment (ROI)")}</td>
                  <td class="font-semibold">${p1.roi || 'N/A'}</td>
                  <td class="font-semibold">${p2.roi || 'N/A'}</td>
                </tr>
                <tr>
                  <td class="feature-title">${L("Amenidades", "Amenities")}</td>
                  <td class="font-xs text-left">${p1.amenities?.join(', ') || '—'}</td>
                  <td class="font-xs text-left">${p2.amenities?.join(', ') || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
        mountPoint.innerHTML = contentHtml;
      }
    }

    function renderDocumentsTab() {
      const docsHtml = (appState.currentUser.documents || []).map(doc => {
        const isApproved = doc.status && doc.status.startsWith("Aprobado");
        const statusText = doc.status === "Aprobado"
          ? L("Aprobado", "Approved")
          : doc.status === "Aprobado (IA)"
            ? L("Aprobado (IA)", "Approved (AI)")
            : L(doc.status || "Pendiente", doc.status === "Pendiente" ? "Pending" : (doc.status || "Pending"));
        return `
          <div class="client-dashboard-doc-row">
            <div class="client-dashboard-doc-info">
              <p>${doc.name}</p>
              <p class="meta">${L("Subido el", "Uploaded on")}: ${doc.uploadDate}</p>
            </div>
            <span class="status-indicator status-${isApproved ? 'active' : 'pending'}">${statusText}</span>
          </div>
        `;
      }).join('') || `<p class="text-muted">${L("No has subido documentos aún.", "You haven't uploaded any documents yet.")}</p>`;

      const contentHtml = `
        <h2 class="client-dashboard-tab-title">${L("Documentación de Acreditación (KYC)", "KYC Accreditation Documents")}</h2>
        <p class="client-dashboard-tab-subtitle">${L(
          "Sube y gestiona tus documentos de validación oficial para acelerar tus trámites notariales y de créditos hipotecarios.",
          "Upload and manage your official verification documents to speed up notary and mortgage processes."
        )}</p>
        
        <div class="client-dashboard-docs-box">
          <h3 class="client-dashboard-docs-title">${L("Mis Documentos", "My Documents")}</h3>
          <div class="client-dashboard-docs-list">
            ${docsHtml}
          </div>
        </div>

        <div class="client-dashboard-upload-box">
          <i data-lucide="upload-cloud" class="client-dashboard-upload-icon"></i>
          <h4 class="client-dashboard-upload-title">${L("Subir Nuevo Documento", "Upload New Document")}</h4>
          <p class="client-dashboard-upload-p">${L("Formatos aceptados: PDF, JPG, PNG (Max. 10MB)", "Accepted formats: PDF, JPG, PNG (Max. 10MB)")}</p>
          <div class="client-dashboard-upload-row">
            <select class="filter-select client-dashboard-upload-select" id="doc-type-select">
              <option value="Comprobante de Domicilio">${L("Comprobante de Domicilio", "Proof of Address")}</option>
              <option value="Estados de Cuenta Bancarios">${L("Estados de Cuenta", "Bank Statements")}</option>
              <option value="Cédula Fiscal (RFC)">${L("Cédula Fiscal (RFC)", "Tax ID (RFC)")}</option>
            </select>
            <button class="btn btn-primary" id="mock-upload-btn">${L("Cargar Documento", "Upload Document")}</button>
          </div>
          
          <!-- Barra de Progreso de Subida (SaaS Premium) -->
          <div class="upload-progress-container client-dashboard-progress-wrapper" id="doc-progress-container">
            <div class="upload-progress-bar" id="doc-progress-bar"></div>
            <p class="client-dashboard-progress-p" id="doc-progress-status">${L("Preparando carga...", "Preparing upload...")}</p>
          </div>
        </div>
      `;
      mountPoint.innerHTML = contentHtml;

      const uploadBtn = document.getElementById("mock-upload-btn");
      const progressContainer = document.getElementById("doc-progress-container");
      const progressBar = document.getElementById("doc-progress-bar");
      const progressStatus = document.getElementById("doc-progress-status");

      uploadBtn.addEventListener("click", () => {
        const docSelect = document.getElementById("doc-type-select");
        const docName = docSelect.options[docSelect.selectedIndex]?.text || docSelect.value;
        const uploadDate = new Date().toISOString().split('T')[0];
        
        // Bloquear interfaz y mostrar cargador
        uploadBtn.disabled = true;
        progressContainer.style.display = "block";
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          progressBar.style.width = `${progress}%`;
          
          if (progress < 40) {
            progressStatus.textContent = L(`Subiendo archivo... ${progress}%`, `Uploading file... ${progress}%`);
          } else if (progress < 80) {
            progressStatus.textContent = L(`Validando integridad y firmas... ${progress}%`, `Validating integrity and signatures... ${progress}%`);
          } else {
            progressStatus.textContent = L(`Analizando con OCR e IA de MudaT... ${progress}%`, `Analyzing with MudaT OCR & AI... ${progress}%`);
          }

          if (progress >= 100) {
            clearInterval(interval);
            
            const currentDocs = appState.currentUser.documents || [];
            currentDocs.push({
              id: `doc-${Date.now()}`,
              name: docName,
              status: "Aprobado (IA)",
              uploadDate: uploadDate
            });

            appState.currentUser.documents = currentDocs;
            updateUserProfile(appState.currentUser);
            
            alert(L(
              `¡Documento "${docName}" validado y aprobado exitosamente por la Inteligencia Artificial!`,
              `Document "${docName}" validated and approved successfully by AI!`
            ));
            
            // Re-render
            renderDocumentsTab();
            if (window.lucide) window.lucide.createIcons();
          }
        }, 80);
      });
    }

    function renderCreditsTab() {
      const creditsHtml = (appState.currentUser.credits || []).map(cred => `
        <div class="client-dashboard-credit-card">
          <div class="client-dashboard-credit-info">
            <p>${cred.bank}</p>
            <p class="meta">${L("Monto solicitado", "Requested amount")}: ${formatCurrency(cred.amount, "MXN")}</p>
            <p class="meta">${L("Mensualidad", "Monthly payment")}: ~${formatCurrency(cred.monthlyPayment, "MXN")}/${L("mes", "mo")}</p>
          </div>
          <span class="status-indicator status-pending font-sm">${cred.status}</span>
        </div>
      `).join('') || `<p class="text-muted">${L("No has solicitado créditos hipotecarios aún.", "You haven't applied for any mortgages yet.")}</p>`;

      const contentHtml = `
        <h2 class="client-dashboard-tab-title">${L("Mis Créditos y Trámites Bancarios", "My Mortgages & Bank Applications")}</h2>
        <p class="client-dashboard-tab-subtitle">${L(
          "Consulta y monitorea las solicitudes de créditos hipotecarios enviadas a nuestros bancos afiliados.",
          "Check and track mortgage applications submitted to our partner banks."
        )}</p>
        <div class="client-dashboard-card-container">
          ${creditsHtml}
        </div>
      `;
      mountPoint.innerHTML = contentHtml;
    }

    function renderProfileTab() {
      const currentUser = appState.currentUser;
      const contentHtml = `
        <h2 class="client-dashboard-tab-title">${L("Configuración de Perfil", "Profile Settings")}</h2>
        <p class="client-dashboard-tab-subtitle">${L(
          "Edita tu información personal de contacto y preferencias de búsqueda.",
          "Edit your personal contact details and search preferences."
        )}</p>
        
        <form class="contact-form client-dashboard-form" id="profile-edit-form">
          <div class="filter-group">
            <label>${L("Nombre Completo", "Full Name")}</label>
            <input type="text" class="filter-input" id="profile-name" value="${currentUser.name}" required>
          </div>
          <div class="filter-group">
            <label>${L("Correo Electrónico", "Email Address")}</label>
            <input type="email" class="filter-input" id="profile-email" value="${currentUser.email}" required>
          </div>
          <div class="filter-group">
            <label>${L("Teléfono de Contacto", "Contact Phone")}</label>
            <input type="tel" class="filter-input" id="profile-phone" value="${currentUser.phone || ''}">
          </div>
          <button type="submit" class="btn btn-primary client-dashboard-form-btn">${L("Guardar Cambios", "Save Changes")}</button>
        </form>
      `;
      mountPoint.innerHTML = contentHtml;

      document.getElementById("profile-edit-form").addEventListener("submit", (e) => {
        e.preventDefault();
        appState.currentUser.name = document.getElementById("profile-name").value;
        appState.currentUser.email = document.getElementById("profile-email").value;
        appState.currentUser.phone = document.getElementById("profile-phone").value;
        
        updateUserProfile(appState.currentUser);
        alert(L("¡Perfil actualizado con éxito!", "Profile updated successfully!"));
        
        // Update sidebar & header UI names immediately
        const asideName = document.querySelector(".client-dashboard-aside-name");
        const asideEmail = document.querySelector(".client-dashboard-aside-email");
        if (asideName) asideName.textContent = appState.currentUser.name;
        if (asideEmail) asideEmail.textContent = appState.currentUser.email;
        const headerName = document.getElementById("user-menu-name");
        if (headerName) headerName.textContent = appState.currentUser.name;
      });
    }

    // Default mount tab
    switchTab("dashboard-overview");
  }

  return { html, init };
}

