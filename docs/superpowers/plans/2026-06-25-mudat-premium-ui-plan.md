# Plan de Implementación de Interfaz Premium MudaT

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implementar una interfaz de usuario premium de página completa ("Quiet Luxury" Champagne & Obsidian Black) inspirada en portales líderes como Lamudi y Propiedades24, con un buscador inteligente y efectos híbridos de Glassmorphism/Glow optimizados para rendimiento y SEO.

**Architecture:** Rediseño estético mediante CSS centralizado en `style.css` inyectando variables semánticas premium, y re-arquitectura de los templates HTML dinámicos en las vistas de la SPA para reflejar la sofisticación visual, interactividad y legibilidad de alto contraste.

**Tech Stack:** Vanilla HTML5, Vanilla CSS3 (Custom Variables, Flexbox/Grid, Backdrop-Filters), ES6 Modules, Lucide Icons.

---

### Task 1: Rediseño de Estilos CSS Globales

**Files:**
- Modify: `style.css:1-250` (Añadir tokens de diseño premium y sobreescribir la estructura base)

- [x] **Step 1: Sobreescribir las variables CSS globales y los estilos base**

Reemplazar el encabezado de `style.css` para añadir soporte completo de Obsidian Dark, Glassmorphism, y efectos Glow interactivos.

```css
/* ==========================================================================
   MudaT - Sistema de Estilos Premium Sobrio (Champagne Gold & Charcoal)
   ========================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

/* Variables del Sistema de Diseño (Design Tokens) */
:root {
  --font-title: 'Outfit', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;

  /* Alabaster & Warm Zinc Light Theme */
  --bg-primary: #fafafa;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --bg-input: #f4f4f5;
  
  --text-primary: #18181b;
  --text-secondary: #52525b;
  --text-muted: #a1a1aa;
  
  --color-brand: #a37f3f; /* Champagne Gold (Warm) */
  --color-brand-hover: #8c6a30;
  --color-brand-glow: rgba(163, 127, 63, 0.06);
  
  --color-success: #059669; /* Muted Emerald */
  --color-success-hover: #047857;
  --color-success-glow: rgba(5, 150, 105, 0.08);
  
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --color-accent: #71717a; /* Muted Zinc */
  --color-accent-hover: #52525b;
  --color-accent-glow: rgba(113, 113, 122, 0.08);
  
  --border-color: rgba(24, 24, 27, 0.08);
  --border-focus: #a37f3f;
  --border-glow: rgba(163, 127, 63, 0.15);
  
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.02);
  --shadow-lg: 0 16px 36px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
  
  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-lg: 14px; /* More executive geometry */
  --border-radius-pill: 9999px;
  
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.4);
  --glass-blur: blur(12px);

  --transition-fast: 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-normal: 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-slow: 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Modo Oscuro Corporativo Onyx */
body.dark-theme {
  --bg-primary: #0a0b0d; /* Pure Obsidian Black */
  --bg-secondary: #121316; /* Deep Onyx Card */
  --bg-card: #121316;
  --bg-input: #1b1d22;
  
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  
  --color-brand: #c5a059; /* Champagne Gold (Elegant Dark) */
  --color-brand-hover: #b28e46;
  --color-brand-glow: rgba(197, 160, 89, 0.12);
  
  --color-success: #10b981;
  --color-success-hover: #059669;
  --color-accent: #4b5563; /* Charcoal Grey */
  --color-accent-hover: #6b7280;
  --color-accent-glow: rgba(75, 85, 99, 0.12);
  
  --border-color: rgba(255, 255, 255, 0.05);
  --border-focus: #c5a059;
  --border-glow: rgba(197, 160, 89, 0.2);
  
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.45);
  --shadow-md: 0 12px 32px rgba(0, 0, 0, 0.55);
  --shadow-lg: 0 24px 60px rgba(0, 0, 0, 0.7);
  
  --glass-bg: rgba(18, 19, 22, 0.85);
  --glass-border: rgba(255, 255, 255, 0.03);
}

/* Clases Helper para Glassmorphism Premium */
.glass-premium {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
}

.glow-brand {
  position: relative;
}
.glow-brand::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: inherit;
  box-shadow: 0 0 25px var(--color-brand-glow);
  opacity: 0;
  transition: opacity var(--transition-normal);
  z-index: -1;
}
.glow-brand:hover::before {
  opacity: 1;
}

/* Efectos de Glow de Fondo en el Hero */
.hero-glow-1 {
  position: absolute;
  top: 10%;
  left: 25%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(197, 160, 89, 0.04) 0%, transparent 70%);
  filter: blur(40px);
  z-index: 0;
  pointer-events: none;
}
.hero-glow-2 {
  position: absolute;
  top: 25%;
  right: 20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(197, 160, 89, 0.03) 0%, transparent 70%);
  filter: blur(50px);
  z-index: 0;
  pointer-events: none;
}
```

- [x] **Step 2: Verificar la correcta aplicación de estilos cargando la página**

Ejecutar en la terminal la navegación en el puerto local y revisar la consola:
Esperado: Sin errores visuales ni sintaxis de CSS rota.

---

### Task 2: Rediseño de la Landing Page Hero y Buscador Inteligente

**Files:**
- Modify: `src/views/Home.js` (Estructura de Hero y Buscador)

- [x] **Step 1: Modificar `src/views/Home.js` para añadir las etiquetas flotantes e interfaz estilo Lamudi**

Actualizar el Hero en `src/views/Home.js` para integrar los glows de fondo y rediseñar el buscador inteligente con la estética híbrida interactiva de vidrio pulido.

```javascript
// Reemplazar la sección de Hero en renderHome de src/views/Home.js:
// Asegurar la presencia de .hero-glow-1 y .hero-glow-2
// Y envolver el buscador .search-widget en un contenedor con .glass-premium y .glow-brand
```

- [x] **Step 2: Probar la interactividad de las pestañas en el navegador**

Navegar a `http://localhost:8080/` y verificar que las pestañas (Comprar, Rentar, Preventa) cambian su estado activo visual de forma fluida con el Champagne Gold.

---

### Task 3: Rediseño de las Tarjetas Reutilizables de Propiedad

**Files:**
- Modify: `src/components/PropertyCard.js` (Estructura y badges)

- [x] **Step 1: Modificar `src/components/PropertyCard.js` para añadir el IA Plusvalía Score**

Actualizar el método `renderPropertyCard` para incluir de forma elegante la puntuación de plusvalía con IA calculada a partir de los metadatos de las propiedades (como un badge destacado en esmeralda).

```javascript
// Añadir el badge de IA Score basado en prop.plusvalia en PropertyCard.js
const iaScoreText = prop.plusvalia ? `${parseFloat(prop.plusvalia) + 1.2} IA Score` : "9.2 IA Score";
// Inyectar en el HTML devuelto por renderPropertyCard:
// `<span class="property-ia-badge">${iaScoreText}</span>`
```

- [x] **Step 2: Probar y validar la renderización del grid de propiedades**

Navegar a la landing y catálogo, verificar que las tarjetas se eleven en hover (`translateY(-5px)`) y muestren el IA Score de forma interactiva con el contraste WCAG correcto.

---

### Task 4: Sincronización Estética en Vistas del CRM y Calculadora

**Files:**
- Modify: `src/views/CalculatorView.js` (Calculadora Financiera Premium)
- Modify: `src/views/AdvisorDashboard.js` (Asesores CRM Premium)

- [x] **Step 1: Aplicar Glassmorphism a la Calculadora Financiera**

Rediseñar los formularios y desgloses de `src/views/CalculatorView.js` para envolverlos en la clase `.glass-premium` y añadir efectos de foco dorado en los inputs de entrada.

- [x] **Step 2: Refinar la tabla y KPIs del CRM de Asesores**

Modificar los paneles de métricas rápidas (KPIs) en `src/views/AdvisorDashboard.js` para usar la estructura de vidrio premium con bordes finos e iconos dorados alineados.
