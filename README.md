# MudaT - Tu próximo hogar comienza aquí 🏡✨

**MudaT** es una plataforma inmobiliaria moderna y modular diseñada para el mercado hispanohablante (México), combinando una experiencia de usuario ultra-premium (estilo *Inmuebles24 / Zillow*), inteligencia artificial contextual, simulación multi-rol SaaS y herramientas de cálculo financiero en tiempo real.

---

## 🌟 Características Principales

- **Arquitectura SPA Modular y Ligera:**
  - Enrutamiento dinámico por Hash (`#inicio`, `#comprar`, `#rentar`, `#propiedad/:id`, `#calculadora`, `#mi-portal`, `#asesores`, `#admin`).
  - Módulos ES6 nativos con lazy-loading de vistas.
- **Catálogo y Filtros Avanzados:**
  - Búsqueda en tiempo real por categoría (*Comprar, Rentar, Preventa, etc.*), ciudad, presupuesto y recámaras.
  - Amenidades y proximidad a servicios (escuelas, hospitales, transporte).
  - Algoritmo de cálculo de **Score de IA y Plusvalía Proyectada**.
- **Herramientas Financieras Integradas:**
  - Calculadora hipotecaria interactiva con simulación de enganche, plazo y tasa de interés.
- **Portales Multi-Rol (Simulación SaaS):**
  - **Portal del Cliente:** Seguimiento de propiedades favoritas, comparación lado a lado, visitas agendadas y trámites de crédito.
  - **CRM para Asesores Inmobiliarios:** Gestión de leads, pipeline de ventas y propiedades asignadas.
  - **Consola de Administración:** Métricas globales, analíticas de conversión y auditoría de inventario.
- **Asistente Inteligente con IA:**
  - Chatbot flotante contextual con preguntas frecuentes preconfiguradas, cálculo de ROI y asesoría de zonas con alta plusvalía.
- **Diseño Premium y Accesible:**
  - Conmutador interactivo de Tema Claro / Oscuro con persistencia en `localStorage`.
  - Iconografía moderna vía Lucide Icons.

---

## 🚀 Cómo ejecutar el proyecto localmente

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Arcano3Ai/MudaT.git
   cd MudaT
   ```

2. Levanta un servidor estático local (requerido para el soporte de ES Modules):
   - Con **Python**:
     ```bash
     python -m http.server 3000
     ```
   - O con **Node.js**:
     ```bash
     npx serve -l 3000 .
     ```

3. Abre en tu navegador preferido:
   ```
   http://localhost:3000
   ```

---

## 🧪 Pruebas Automatizadas de UI

El proyecto incluye una suite de pruebas automatizadas con **Playwright** que valida la navegación, los componentes interactivos, el chatbot y la consola del navegador:

```bash
python test_browser_ui.py
```

---

## 🏢 Desarrollado por
**Arcano Solutions**
