import { updateUserProfile } from "../services/auth.js";

export async function renderClientDashboard(state) {
  const user = state.currentUser;
  
  // Get favorited properties
  const favProps = state.properties.filter(p => user.favorites?.includes(p.id)) || [];

  // Favorites list HTML
  const favsHtml = favProps.length > 0 ? favProps.map(prop => {
    const formattedPrice = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: prop.currency,
      maximumFractionDigits: 0
    }).format(prop.price);

    return `
      <div class="client-dashboard-card">
        <img src="${prop.images[0]}" alt="${prop.title}" class="client-dashboard-card-img">
        <div class="client-dashboard-card-info">
          <h4><a href="#propiedad/${prop.id}">${prop.title}</a></h4>
          <p class="meta">${prop.location.neighborhood}, ${prop.location.city}</p>
          <p class="price">${formattedPrice}</p>
        </div>
        <div class="client-dashboard-card-actions">
          <button class="btn btn-outline compare-add-btn" data-id="${prop.id}"><i data-lucide="columns" class="icon-inline icon-sm"></i> Comparar</button>
          <button class="btn btn-secondary remove-fav-btn" data-id="${prop.id}"><i data-lucide="trash-2" class="icon-inline icon-sm color-danger"></i></button>
        </div>
      </div>
    `;
  }).join('') : `<p class="text-muted text-center padding-lg">Aún no tienes propiedades favoritas guardadas.</p>`;

  // Documents list HTML
  const docsHtml = user.documents?.map(doc => `
    <div class="client-dashboard-doc-row">
      <div class="client-dashboard-doc-info">
        <p>${doc.name}</p>
        <p class="meta">Subido el: ${doc.uploadDate}</p>
      </div>
      <span class="status-indicator status-${doc.status === 'Aprobado' ? 'active' : 'pending'}">${doc.status}</span>
    </div>
  `).join('') || '';

  // Credit requests HTML
  const creditsHtml = user.credits?.map(cred => `
    <div class="client-dashboard-credit-card">
      <div class="client-dashboard-credit-info">
        <p>${cred.bank}</p>
        <p class="meta">Monto solicitado: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cred.amount)}</p>
        <p class="meta">Mensualidad: ~${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cred.monthlyPayment)}/mes</p>
      </div>
      <span class="status-indicator status-pending font-sm">${cred.status}</span>
    </div>
  `).join('') || '<p class="text-muted">No has solicitado créditos hipotecarios aún.</p>';

  // Visits schedule HTML
  const visitsHtml = user.visits?.map(vis => {
    const property = state.properties.find(p => p.id === vis.propertyId);
    return `
      <div class="client-dashboard-credit-card">
        <div>
          <p class="font-bold">${property ? property.title : 'Propiedad'}</p>
          <p class="font-sm text-secondary"><i data-lucide="calendar" class="icon-inline icon-sm"></i> Fecha: ${vis.date} | Hora: ${vis.time}</p>
        </div>
        <span class="status-indicator status-${vis.status === 'Confirmada' ? 'active' : 'pending'}">${vis.status}</span>
      </div>
    `;
  }).join('') || '<p class="text-muted">No tienes visitas programadas.</p>';

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
            <li class="dashboard-menu-item active" data-tab="dashboard-overview"><i data-lucide="layout-dashboard"></i> Resumen</li>
            <li class="dashboard-menu-item" data-tab="dashboard-favorites"><i data-lucide="heart"></i> Favoritos</li>
            <li class="dashboard-menu-item" data-tab="dashboard-compare"><i data-lucide="columns"></i> Comparador</li>
            <li class="dashboard-menu-item" data-tab="dashboard-documents"><i data-lucide="file-text"></i> Documentos</li>
            <li class="dashboard-menu-item" data-tab="dashboard-credits"><i data-lucide="credit-card"></i> Mi Crédito</li>
            <li class="dashboard-menu-item" data-tab="dashboard-profile"><i data-lucide="settings"></i> Configuración</li>
          </ul>
        </aside>

        <!-- Contenido Dinámico del Dashboard -->
        <div class="dashboard-content-panel" id="dashboard-content-mount">
          
          <!-- Tab 1: Resumen (Por Defecto) -->
          <div class="tab-content fade-in" id="dashboard-overview">
            <h2 class="client-dashboard-tab-title">¡Hola, ${user.name.split(' ')[0]}!</h2>
            
            <div class="metrics-row client-dashboard-overview-metrics-row">
              <div class="metric-card metric-card-purple">
                <span class="font-sm text-secondary font-semibold">Favoritos</span>
                <span class="metric-value">${favProps.length}</span>
              </div>
              <div class="metric-card metric-card-cyan">
                <span class="font-sm text-secondary font-semibold">Visitas Programadas</span>
                <span class="metric-value">${user.visits?.length || 0}</span>
              </div>
              <div class="metric-card metric-card-emerald">
                <span class="font-sm text-secondary font-semibold">Créditos en Trámite</span>
                <span class="metric-value">${user.credits?.length || 0}</span>
              </div>
            </div>

            <div class="client-dashboard-overview-grid">
              <div>
                <h3 class="client-dashboard-overview-section-title"><i data-lucide="calendar" class="icon-inline color-brand"></i> Próxima Visita</h3>
                ${visitsHtml}
              </div>
              <div>
                <h3 class="client-dashboard-overview-section-title"><i data-lucide="bell" class="icon-inline color-brand"></i> Búsquedas Guardadas</h3>
                <div class="client-dashboard-saved-searches-box">
                  ${user.savedSearches?.map(s => `
                    <div class="client-dashboard-search-card">
                      <span class="name">${s.name}</span>
                      <a href="#comprar" class="btn btn-outline">Buscar</a>
                    </div>
                  `).join('') || '<p class="text-muted">No tienes búsquedas guardadas.</p>'}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  function init(appState) {
    const menuItems = document.querySelectorAll(".dashboard-menu-item");
    const mountPoint = document.getElementById("dashboard-content-mount");
    const initialOverviewHtml = mountPoint ? mountPoint.innerHTML : "";
    
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
      if (mountPoint) {
        mountPoint.innerHTML = initialOverviewHtml;
      }
    }

    function renderFavoritesTab() {
      const currentFavs = appState.currentUser.favorites || [];
      const currentFavProps = appState.properties.filter(p => currentFavs.includes(p.id));
      
      const contentHtml = `
        <h2 class="client-dashboard-tab-title">Mis Propiedades Favoritas</h2>
        <p class="client-dashboard-tab-subtitle">Guarda tus propiedades preferidas aquí y agrégalas al comparador técnico.</p>
        <div class="client-dashboard-card-container">
          ${currentFavProps.length > 0 ? currentFavProps.map(prop => {
            const formattedPrice = new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: prop.currency,
              maximumFractionDigits: 0
            }).format(prop.price);
            
            return `
              <div class="client-dashboard-card">
                <img src="${prop.images[0]}" alt="${prop.title}" class="client-dashboard-card-img">
                <div class="client-dashboard-card-info">
                  <h4><a href="#propiedad/${prop.id}">${prop.title}</a></h4>
                  <p class="meta">${prop.location.neighborhood}, ${prop.location.city}</p>
                  <p class="price">${formattedPrice}</p>
                </div>
                <div class="client-dashboard-card-actions">
                  <button class="btn btn-outline compare-add-btn" data-id="${prop.id}"><i data-lucide="columns" class="icon-inline icon-sm"></i> Comparar</button>
                  <button class="btn btn-secondary remove-fav-btn" data-id="${prop.id}"><i data-lucide="trash-2" class="icon-inline icon-sm color-danger"></i></button>
                </div>
              </div>
            `;
          }).join('') : `<p class="text-muted text-center padding-lg">Aún no tienes propiedades favoritas.</p>`}
        </div>
      `;
      mountPoint.innerHTML = contentHtml;
      
      // Bind delete favorites
      document.querySelectorAll(".remove-fav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          appState.currentUser.favorites = appState.currentUser.favorites.filter(fId => fId !== id);
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
            alert("Este inmueble ya está en la lista del comparador.");
            return;
          }
          if (comparisonList.length >= 2) {
            comparisonList.shift(); // Remove first to keep max 2
          }
          comparisonList.push(id);
          alert("¡Inmueble agregado al comparador! Redirigiendo...");
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
        <h2 class="client-dashboard-tab-title">Comparador de Inmuebles</h2>
        <p class="client-dashboard-tab-subtitle">Inspecciona detalladamente las fichas técnicas lado a lado para tomar la decisión ideal.</p>
      `;

      if (propsToCompare.length < 2) {
        contentHtml += `
          <div class="client-dashboard-centered-msg-box">
            <i data-lucide="columns" class="client-dashboard-centered-msg-icon"></i>
            <h3>Necesitas seleccionar al menos 2 propiedades</h3>
            <p class="client-dashboard-centered-msg-p">Navega a la pestaña de "Favoritos" y haz click en "Comparar" en tus inmuebles guardados.</p>
            <button class="btn btn-primary" id="go-favs-compare-btn">Ir a Favoritos</button>
          </div>
        `;
        mountPoint.innerHTML = contentHtml;
        document.getElementById("go-favs-compare-btn").addEventListener("click", () => switchTab("dashboard-favorites"));
      } else {
        const p1 = propsToCompare[0];
        const p2 = propsToCompare[1];

        const fPrice1 = new Intl.NumberFormat('es-MX', { style: 'currency', currency: p1.currency, maximumFractionDigits: 0 }).format(p1.price);
        const fPrice2 = new Intl.NumberFormat('es-MX', { style: 'currency', currency: p2.currency, maximumFractionDigits: 0 }).format(p2.price);

        contentHtml += `
          <div class="comparator-table-wrapper">
            <table class="comparator-table">
              <thead>
                <tr>
                  <th class="feature-title">Ficha Técnica</th>
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
                  <td class="feature-title">Precio</td>
                  <td class="font-bold color-brand">${fPrice1}</td>
                  <td class="font-bold color-brand">${fPrice2}</td>
                </tr>
                <tr>
                  <td class="feature-title">Ubicación</td>
                  <td>${p1.location.neighborhood}, ${p1.location.city}</td>
                  <td>${p2.location.neighborhood}, ${p2.location.city}</td>
                </tr>
                <tr>
                  <td class="feature-title">Recámaras</td>
                  <td>${p1.bedrooms}</td>
                  <td>${p2.bedrooms}</td>
                </tr>
                <tr>
                  <td class="feature-title">Baños</td>
                  <td>${p1.bathrooms}</td>
                  <td>${p2.bathrooms}</td>
                </tr>
                <tr>
                  <td class="feature-title">Construcción</td>
                  <td>${p1.construction || p1.land} m²</td>
                  <td>${p2.construction || p2.land} m²</td>
                </tr>
                <tr>
                  <td class="feature-title">Plusvalía Estimada</td>
                  <td class="color-success font-semibold">${p1.plusvalia}</td>
                  <td class="color-success font-semibold">${p2.plusvalia}</td>
                </tr>
                <tr>
                  <td class="feature-title">Retorno de Inversión (ROI)</td>
                  <td class="font-semibold">${p1.roi || 'N/A'}</td>
                  <td class="font-semibold">${p2.roi || 'N/A'}</td>
                </tr>
                <tr>
                  <td class="feature-title">Amenidades</td>
                  <td class="font-xs text-left">${p1.amenities.join(', ')}</td>
                  <td class="font-xs text-left">${p2.amenities.join(', ')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
        mountPoint.innerHTML = contentHtml;
      }
    }

    function renderDocumentsTab() {
      const contentHtml = `
        <h2 class="client-dashboard-tab-title">Documentación de Acreditación (KYC)</h2>
        <p class="client-dashboard-tab-subtitle">Sube y gestiona tus documentos de validación oficial para acelerar tus trámites notariales y de créditos hipotecarios.</p>
        
        <div class="client-dashboard-docs-box">
          <h3 class="client-dashboard-docs-title">Mis Documentos</h3>
          <div class="client-dashboard-docs-list">
            ${docsHtml}
          </div>
        </div>

        <div class="client-dashboard-upload-box">
          <i data-lucide="upload-cloud" class="client-dashboard-upload-icon"></i>
          <h4 class="client-dashboard-upload-title">Subir Nuevo Documento</h4>
          <p class="client-dashboard-upload-p">Formatos aceptados: PDF, JPG, PNG (Max. 10MB)</p>
          <div class="client-dashboard-upload-row">
            <select class="filter-select client-dashboard-upload-select" id="doc-type-select">
              <option value="Comprobante de Domicilio">Comprobante de Domicilio</option>
              <option value="Estados de Cuenta Bancarios">Estados de Cuenta</option>
              <option value="Cédula Fiscal (RFC)">Cédula Fiscal (RFC)</option>
            </select>
            <button class="btn btn-primary" id="mock-upload-btn">Cargar Documento</button>
          </div>
          
          <!-- Barra de Progreso de Subida (SaaS Premium) -->
          <div class="upload-progress-container client-dashboard-progress-wrapper" id="doc-progress-container">
            <div class="upload-progress-bar" id="doc-progress-bar"></div>
            <p class="client-dashboard-progress-p" id="doc-progress-status">Preparando carga...</p>
          </div>
        </div>
      `;
      mountPoint.innerHTML = contentHtml;

      const uploadBtn = document.getElementById("mock-upload-btn");
      const progressContainer = document.getElementById("doc-progress-container");
      const progressBar = document.getElementById("doc-progress-bar");
      const progressStatus = document.getElementById("doc-progress-status");

      uploadBtn.addEventListener("click", () => {
        const docName = document.getElementById("doc-type-select").value;
        const uploadDate = new Date().toISOString().split('T')[0];
        
        // Bloquear interfaz y mostrar cargador
        uploadBtn.disabled = true;
        progressContainer.style.display = "block";
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          progressBar.style.width = `${progress}%`;
          
          if (progress < 40) {
            progressStatus.textContent = `Subiendo archivo... ${progress}%`;
          } else if (progress < 80) {
            progressStatus.textContent = `Validando integridad y firmas... ${progress}%`;
          } else {
            progressStatus.textContent = `Analizando con OCR e IA de MudaT... ${progress}%`;
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
            
            alert(`¡Documento "${docName}" validado y aprobado exitosamente por la Inteligencia Artificial!`);
            
            // Re-render
            renderDocumentsTab();
            if (window.lucide) window.lucide.createIcons();
          }
        }, 80);
      });
    }

    function renderCreditsTab() {
      const contentHtml = `
        <h2 class="client-dashboard-tab-title">Mis Créditos y Trámites Bancarios</h2>
        <p class="client-dashboard-tab-subtitle">Consulta y monitorea las solicitudes de créditos hipotecarios enviadas a nuestros bancos afiliados.</p>
        <div class="client-dashboard-card-container">
          ${creditsHtml}
        </div>
      `;
      mountPoint.innerHTML = contentHtml;
    }

    function renderProfileTab() {
      const contentHtml = `
        <h2 class="client-dashboard-tab-title">Configuración de Perfil</h2>
        <p class="client-dashboard-tab-subtitle">Edita tu información personal de contacto y preferencias de búsqueda.</p>
        
        <form class="contact-form client-dashboard-form" id="profile-edit-form">
          <div class="filter-group">
            <label>Nombre Completo</label>
            <input type="text" class="filter-input" id="profile-name" value="${user.name}" required>
          </div>
          <div class="filter-group">
            <label>Correo Electrónico</label>
            <input type="email" class="filter-input" id="profile-email" value="${user.email}" required>
          </div>
          <div class="filter-group">
            <label>Teléfono de Contacto</label>
            <input type="tel" class="filter-input" id="profile-phone" value="${user.phone || ''}">
          </div>
          <button type="submit" class="btn btn-primary client-dashboard-form-btn">Guardar Cambios</button>
        </form>
      `;
      mountPoint.innerHTML = contentHtml;

      document.getElementById("profile-edit-form").addEventListener("submit", (e) => {
        e.preventDefault();
        appState.currentUser.name = document.getElementById("profile-name").value;
        appState.currentUser.email = document.getElementById("profile-email").value;
        appState.currentUser.phone = document.getElementById("profile-phone").value;
        
        updateUserProfile(appState.currentUser);
        alert("¡Perfil actualizado con éxito!");
        
        // Update header UI names immediately
        const headerName = document.getElementById("user-menu-name");
        if (headerName) headerName.textContent = appState.currentUser.name;
      });
    }

    // Default mount tab
    switchTab("dashboard-overview");
  }

  return { html, init };
}

