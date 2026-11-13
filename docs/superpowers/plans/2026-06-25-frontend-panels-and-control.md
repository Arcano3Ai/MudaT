# Plan de Implementación: Paneles de Control y Gestión de Usuarios MudaT

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Desarrollar e integrar de forma definitiva los tres paneles de control del ecosistema (Portal del Cliente, CRM del Asesor y Consola del Super Administrador SaaS), asegurando sincronización de datos en tiempo real mediante el estado global `state` de la SPA y una interfaz responsiva premium unificada ("Quiet Luxury").

**Architecture:** Módulos de vistas desacoplados de ES6 (`ClientDashboard.js`, `AdvisorDashboard.js`, `AdminPanel.js`) que se inicializan dinámicamente mediante el ruteador de `app.js`. La persistencia de datos y el estado de la sesión se gestionan de forma centralizada en el `state` local y se sincronizan asíncronamente con `localStorage` como puente.

**Tech Stack:** Vanilla JS (ES6), HTML5, CSS3 (Borders de luz, Glassmorphism, Multi-layer Shadows), Lucide Icons, LocalStorage.

---

### Mapeo de Archivos y Componentes

Antes de iniciar con el desarrollo paso a paso, se detalla la estructura y responsabilidad de cada archivo:

```
src/
├── app.js                          # Ruteador central y gestor del estado global 'state'
├── components/
│   └── Header.js                   # Header dinámico con badge premium de sesión activa
├── services/
│   └── auth.js                     # Controlador de perfiles y sincronización de sesiones
└── views/
    ├── ClientDashboard.js          # Portal de Clientes (Favoritos, Crédito, Citas, Bóveda de Docs)
    ├── AdvisorDashboard.js         # CRM del Asesor (Dashboard, Kanban Leads, Cartera, Comisiones)
    └── AdminPanel.js               # Panel del Super Admin (Moderación, Suscripciones, Métricas, Logs)
```

---

### Task 1: Refinamiento de la Estructura de Datos en LocalStorage

**Files:**
- Modify: `src/services/auth.js:1-120` (Expandir datos demo de perfiles para que contengan listas de favoritos, documentos, visitas y transacciones reales)

- [ ] **Step 1: Enriquecer los perfiles predeterminados en `auth.js`**

Actualizar `DEFAULT_USERS` para incluir un flujo de datos realista sobre el cual operarán los paneles de control.

```javascript
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
      { id: "cred-1", bank: "MudaT Pre-Aprobado", amount: 15000000, status: "Aprobado", monthlyPayment: 142000 }
    ],
    visits: [
      { id: "vis-1", propertyId: "prop-1", date: "2026-06-28", time: "11:00 AM", status: "Confirmada" }
    ]
  },
  advisor: {
    id: "adv-1",
    name: "Sofía Altamirano",
    email: "sofia.a@mudat.mx",
    role: "advisor",
    phone: "+52 55 1234 5678",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    rating: 4.9,
    commissionRate: 4.5,
    agency: "MudaT Premium CDMX"
  },
  admin: {
    id: "admin-1",
    name: "Administrador General",
    email: "admin@mudat.mx",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
  }
};
```

---

### Task 2: Desarrollo del Portal del Cliente Premium (`ClientDashboard.js`)

**Files:**
- Modify: `src/views/ClientDashboard.js` (Estructura de pestañas, comparador de propiedades y subida simulada de archivos)

- [ ] **Step 1: Implementar la Bóveda de Documentos con carga simulada en tiempo real**

Añadir interactividad al panel de "Documentos" para permitir la "subida" (simulación con barra de progreso) de nuevos archivos PDF que se inserten en la sesión del usuario.

```javascript
// Dentro de renderClientDashboard.js - Tab Documentos:
// Generar un input type="file" estilizado.
// Al seleccionar archivo, simular una carga de 2 segundos mediante una barra de progreso CSS:
const progressInterval = setInterval(() => { ... }, 100);
// Al finalizar, añadir el objeto al array user.documents en LocalStorage y re-renderizar la tabla.
```

- [ ] **Step 2: Implementar el Comparador de Propiedades Lado a Lado**

Permitir que el usuario compare hasta dos propiedades favoritas analizando diferencias de precio, recámaras, m² y amenidades de forma tabular.

```javascript
// Renderizar tabla comparativa:
// Columnas: Propiedad A vs Propiedad B
// Filas: Precio, m², Recámaras, Baños, Plusvalía, Amenidades.
```

---

### Task 3: Desarrollo del CRM del Asesor (`AdvisorDashboard.js`)

**Files:**
- Modify: `src/views/AdvisorDashboard.js` (Embudo Kanban interactivo para Leads, calculador de comisiones, y generador de seguimientos IA)

- [ ] **Step 1: Implementar el Tablero Kanban Interactivo**

El CRM debe contar con un embudo Kanban real dividido en columnas ("Lead", "Contacto", "Interesado", "Visita", "Negociación", "Vendido"). Cada tarjeta de Lead tendrá botones de flecha (izquierda/derecha) para moverlos de etapa, actualizando el estado de forma asíncrona.

```javascript
// HTML del Kanban:
// Generar un grid de columnas según las etapas.
// Renderizar dentro de cada columna los leads filtrados por su propiedad 'stage'.
// Cada tarjeta cuenta con controles interactivos para desplazarla en el flujo:
const currentStageIdx = stages.indexOf(lead.stage);
```

- [ ] **Step 2: Calculadora Dinámica de Comisiones**

El tab "Comisiones" debe leer todas las propiedades vendidas (leads en etapa "Venta" o "Escrituración") y multiplicar su precio por el `commissionRate` del asesor, desglosando impuestos, retenciones de MudaT (0.5%), y el neto final para el agente.

---

### Task 4: Desarrollo de la Consola de Administración General (`AdminPanel.js`)

**Files:**
- Modify: `src/views/AdminPanel.js` (Bucle de aprobación/rechazo de anuncios conectado al estado de propiedades, logs de auditoría interactivos)

- [ ] **Step 1: Integrar Moderación Dinámica**

La tabla de moderación debe listar todos los anuncios activos del catálogo (`state.properties`). Al hacer clic en "Aprobar", la propiedad recibe un flag `isApproved: true` y se elimina visualmente de la cola. Al dar clic en "Rechazar", se elimina por completo de la base de datos `state.properties`.

```javascript
document.querySelectorAll(".approve-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-id");
    const prop = appState.properties.find(p => p.id === id);
    if(prop) prop.isApproved = true;
    alert("Anuncio Certificado y publicado en la red.");
    renderModerationTable();
  });
});
```

- [ ] **Step 2: Filtro de Logs de Auditoría**

Añadir una barra de entrada para que el administrador pueda filtrar las líneas de registros (Logs) del sistema en vivo según palabras clave (ej. "Stripe", "IA", "Firma", "Sergio").
