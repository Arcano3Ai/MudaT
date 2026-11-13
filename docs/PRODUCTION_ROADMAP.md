# Roadmap de Desarrollo Hacia Producción: MudaT SaaS

**Estado Actual:** Prototipo SPA (Single Page Application) de alta fidelidad en Vanilla JS, HTML5 y CSS3. Cuenta con UI/UX de nivel premium, enrutamiento en el cliente, persistencia de estado local (`localStorage`) y simulación completa de lógica de negocio (IA, CRM, Calculadora, Marketplace).

**Objetivo:** Evolucionar el prototipo a una arquitectura empresarial real, escalable, segura y desplegable en la nube (Google Cloud Platform) bajo estándares de grado de producción.

---

## Fase 1: Modernización del Entorno de Frontend (Semanas 1-2)
*Actualmente usamos ES6 Modules nativos. Para producción, necesitamos optimización, minificación y gestión de paquetes.*

*   **1.1 Migración a un Bundler (Vite):**
    *   Mover el proyecto a Vite para empaquetado ultra rápido.
    *   Configurar minificación de JS/CSS y *Tree Shaking* para reducir el tamaño final del bundle.
*   **1.2 Modularización Avanzada:**
    *   Separar la inyección de HTML de la lógica de negocio (migración progresiva a Web Components o a un framework ligero si se desea, aunque Vanilla con Vite es viable).
*   **1.3 Gestión de Activos (Assets):**
    *   Implementar carga diferida (Lazy Loading) para las imágenes de propiedades y los iconos.
    *   Optimizar fuentes locales y assets SVG del mapa para tiempos de carga < 1s (LCP).

## Fase 2: Backend y Base de Datos Reales (Semanas 3-5)
*Reemplazar `mockProperties.js` y el estado en memoria por una API robusta.*

*   **2.1 Selección de Stack Backend:**
    *   *Opción A (Serverless):* Firebase / Supabase (BaaS) para iteración rápida.
    *   *Opción B (Microservicios):* Node.js (Express/NestJS) o Python (FastAPI) desplegado en Cloud Run.
*   **2.2 Modelado de Base de Datos (PostgreSQL o Firestore):**
    *   Crear esquemas relacionales para: `Users`, `Properties`, `Leads` (CRM), `Contracts` (Legal), y `Appraisals`.
*   **2.3 Desarrollo de API REST / GraphQL:**
    *   Endpoints para CRUD de propiedades (con paginación y filtros reales de lado del servidor).
    *   Endpoints de ingesta de leads para el CRM.

## Fase 3: Autenticación, Seguridad y Privacidad (Semana 6)
*Sustituir el login simulado por seguridad real (Auth0, Firebase Auth o JWT personalizado).*

*   **3.1 Implementación de Auth Provider:**
    *   Registro y Login real con validación de correo y OAuth (Google, Apple).
*   **3.2 Roles y Permisos (RBAC):**
    *   Asegurar las rutas de frontend y los endpoints del backend según el rol (Cliente, Asesor, Admin).
*   **3.3 Seguridad en la Nube:**
    *   Sanitización de inputs (protección XSS/SQLi).
    *   Configuración estricta de políticas CORS.

## Fase 4: Integración de IA y Servicios de Terceros (Semanas 7-8)
*Conectar los módulos "simulados" de MudaT con motores reales.*

*   **4.1 Conexión LLM (Vertex AI / Gemini API):**
    *   Conectar el Chatbot IA de la página principal para usar RAG (Retrieval-Augmented Generation) sobre la base de datos de propiedades.
    *   Implementar el redactor de descripciones automáticas para publicaciones.
*   **4.2 Algoritmo de Avalúos (Machine Learning):**
    *   Entrenar o consumir una API de modelo de predicción de precios (regresión lineal basada en datos de mercado reales de México).
*   **4.3 Pasarela de Pagos (Stripe):**
    *   Integrar Stripe Billing para el cobro de suscripciones del SaaS de asesores y el Marketplace Legal.

## Fase 5: Infraestructura Cloud y CI/CD (Semana 9)
*Automatizar y desplegar la aplicación a Internet.*

*   **5.1 Contenedorización:**
    *   Escribir `Dockerfile` para el frontend (Nginx) y el backend.
*   **5.2 Pipelines CI/CD (GitHub Actions):**
    *   Configurar pipeline para Linting, Pruebas Automatizadas y Build automático en cada Push a la rama `main`.
*   **5.3 Despliegue en Google Cloud Platform (GCP):**
    *   Desplegar Backend en **Google Cloud Run** (auto-escalable).
    *   Desplegar Frontend en **Firebase Hosting** o **Cloud CDN** para distribución global rápida.
    *   Configurar dominios personalizados (`mudat.mx`) y certificados SSL.

## Fase 6: Optimización SEO y Lanzamiento (Semana 10)
*Preparación final para salida al mercado.*

*   **6.1 SEO Técnico:**
    *   Generación de `sitemap.xml`, `robots.txt` y meta-tags dinámicos OpenGraph para compartir propiedades en redes sociales.
    *   Si se requiere indexación profunda, considerar SSR (Server Side Rendering).
*   **6.2 Monitoreo y Analytics:**
    *   Instalar Google Analytics 4, Tag Manager y Sentry para reporte de errores en tiempo real.
*   **6.3 Soft Launch:**
    *   Lanzamiento en versión Beta cerrada para asesores (Friends & Family) para pulir detalles finales.