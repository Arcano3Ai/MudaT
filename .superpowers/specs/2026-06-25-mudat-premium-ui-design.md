# Especificación de Diseño: Ecosistema Inmobiliario Premium MudaT

**Fecha:** 2026-06-25  
**Autor:** Gemini CLI Agent  
**Estándar:** Senior Principal / Premium Híbrido  

---

## 1. Visión del Producto

MudaT es una plataforma PropTech SaaS de alta gama para México y Latinoamérica que unifica la búsqueda de propiedades premium, preventas exclusivas, análisis financiero avanzado (calculadora hipotecaria) y gestión comercial (CRM para asesores) en una experiencia fluida, rápida y estéticamente insuperable.

El rediseño visual se inspira en la escala y estructura de portales consolidados como **Lamudi** y **Propiedades24**, pero con un lenguaje visual minimalista de ultra-lujo (estilo "Quiet Luxury") potenciado por micro-interacciones interactivas y efectos Glassmorphic en puntos clave.

---

## 2. Sistema de Diseño (Design Tokens)

Se utilizará la combinación de colores autorizada de **Champagne Gold y Charcoal/Obsidian Black**, con fuentes premium optimizadas para legibilidad ejecutiva.

### Tipografía
- **Títulos (Hero, Secciones, Precios):** `'Outfit'`, sans-serif; (fuente elegante, geométrica, de gran peso visual).
- **Cuerpo y Controles:** `'Plus Jakarta Sans'`, sans-serif; (excelente legibilidad en pantallas pequeñas, limpia y moderna).

### Colores (Tema Oscuro por Defecto - Premium Obsidian)
- **Fondo Principal:** `#0a0b0d` (Pure Obsidian Black - Negro absoluto sobrio).
- **Fondo Secundario / Tarjetas:** `#121316` (Deep Onyx - Gris ultra oscuro con matiz azulado/cálido).
- **Entradas / Formularios:** `#1b1d22` (Charcoal Tint).
- **Color de Marca (Champagne Gold):** `#c5a059` (Modo Oscuro) / `#a37f3f` (Modo Claro).
- **Indicador de Éxito / Plusvalía (Esmeralda):** `#10b981`.
- **Bordes:** `rgba(255, 255, 255, 0.05)` (Fino, casi invisible, muy elegante).

### Estructura Visual y Efectos
- **Bordes Redondeados (Geometría Ejecutiva):** 
  - Pequeño (botones, inputs): `6px`
  - Mediano (tarjetas pequeñas): `10px`
  - Grande (paneles, contenedores de sección): `14px`
- **Profundidad (Sombra Multi-capa):** 
  - `shadow-lg`: `0 24px 60px rgba(0, 0, 0, 0.7)`
- **Efectos de Vidrio (Glassmorphism):**
  - `background: rgba(18, 19, 22, 0.85)`
  - `backdrop-filter: blur(12px)`
  - `border: 1px solid rgba(255, 255, 255, 0.03)`

---

## 3. Arquitectura de Vistas (SPA)

Todas las vistas de la aplicación se unificarán bajo la estructura SPA definida en `app.js` mediante la inyección dinámica de HTML y su posterior inicialización con la función `init(state)`.

### 1. Header & Navegación (`src/components/Header.js`)
- Diseño fijo (Sticky) con efecto Glassmorphic y desenfoque de fondo al hacer scroll.
- Menú de navegación unificado que resalta la sección activa.
- Selector de simulación de rol en tiempo real (Cliente premium, Asesor, Administrador) estilizado como menú desplegable ejecutivo.

### 2. Vista de Inicio / Landing (`src/views/Home.js`)
- **Buscador Inteligente Estilo Lamudi:** Pestañas superiores para Comprar, Rentar, Preventas y Terrenos. Selector de filtros con iconos SVG unificados y botón de búsqueda de alto impacto con hover de brillo dorado.
- **Sección de Propiedades Destacadas:** Un grid asimétrico con 3 propiedades exclusivas en tarjetas rediseñadas de alta fidelidad.
- **Ecosistema & Métricas:** Paneles informativos con iconos Lucide detallados para comunicar las capacidades de MudaT (Calculadora, Mudanzas, Contratos, IA).

### 3. Vista de Búsqueda y Filtros (`src/views/Search.js`)
- Panel lateral izquierdo para refinar filtros con controles deslizantes sofisticados de rango de precios y tipos de inmuebles.
- Panel principal derecho con listado de propiedades estilizadas. Cada tarjeta contará con badges translúcidos flotantes ("Exclusivo", "Preventa") y la puntuación de plusvalía con IA (IA Score).

### 4. Vista de Detalles de Propiedad (`src/views/PropertyDetail.js`)
- Galería asimétrica de imágenes con transiciones fluidas.
- Panel de contacto flotante estilo "sticky sidebar" con formulario integrado para agendar visitas o chatear directamente por WhatsApp/AI.
- Desglose de características detalladas de la propiedad organizadas por pestañas (Distribución, Acabados, Análisis de Zona).

### 5. Vista de Calculadora Hipotecaria (`src/views/CalculatorView.js`)
- Campos de simulación claros: Valor del inmueble, Enganche (%), Plazo (años) y Tasa de interés de referencia.
- Desglose financiero interactivo: Mensualidad promedio, ingresos mínimos requeridos, tabla de amortización con scroll suave y una recomendación de pre-aprobación inteligente.

### 6. Vista del CRM de Asesores (`src/views/AdvisorDashboard.js`)
- Dashboard analítico superior con KPIs ejecutivos: Propiedades Activas, Comisión Estimada, Leads Pendientes y Visitas de la Semana.
- Tabla interactiva de gestión de prospectos con estados dinámicos (Nuevo, Contactado, Visita Agendada, Negociación, Cerrado).

### 7. Vista del Portal de Clientes (`src/views/ClientDashboard.js`)
- Panel de bienvenida personalizado.
- Sección de propiedades favoritas guardadas y citas programadas con asesores reales.
- Recomendaciones de propiedades personalizadas basadas en IA.

### 8. Vista del Panel Administrativo (`src/views/AdminPanel.js`)
- Consola de configuración del SaaS multi-agente, monitoreo de transacciones y configuración global de tarifas.

### 9. Asistente Chatbot IA (`index.html` widget flotante)
- Widget flotante compacto estilizado con Glassmorphic y bordes dorados, respuestas rápidas interactivas y simulación de respuestas basadas en el contexto del proyecto.

---

## 4. Plan de Validación y Pruebas

- **Compilación e Integración:** Verificación de importaciones de módulos dinámicos ES6 para evitar fallos de rutas.
- **Verificación Visual:** Evaluación de legibilidad de contraste de texto en los temas oscuro y claro utilizando la especificación WCAG de mínimo 4.5:1.
- **Rendimiento:** Asegurar que los efectos de Glassmorphic no degraden la experiencia de renderizado, limitando su uso a contenedores principales flotantes e interactivos.
