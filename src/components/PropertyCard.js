import { L, tCategory, formatCurrency } from "../services/i18n.js";

/**
 * Componente Reutilizable: Tarjeta de Propiedad
 * Unifica el marcado visual de las propiedades en la Home, Catálogo y Detalles.
 */
export function renderPropertyCard(prop, isFav, isCompact = false) {
  const formattedPrice = formatCurrency(prop.price, prop.currency || "MXN");

  const favClass = isFav ? "active" : "";
  
  // Clases CSS condicionales para visualización compacta
  const cardClass = isCompact 
    ? "property-card prop-similar-wrapper-card fade-in" 
    : "property-card fade-in";
    
  const imgWrapperClass = isCompact 
    ? "property-img-wrapper prop-similar-img-box" 
    : "property-img-wrapper";
    
  const infoBodyClass = isCompact 
    ? "property-content prop-similar-info-body" 
    : "property-content";
    
  const titleClass = isCompact 
    ? "property-title prop-similar-title-text" 
    : "property-title";

  const plusvaliaVal = parseFloat(prop.plusvalia);
  const iaScoreText = Number.isFinite(plusvaliaVal)
    ? (plusvaliaVal + 1.2).toFixed(1) + L(" IA Score", " AI Score")
    : L("9.2 IA Score", "9.2 AI Score");

  const priceSuffix = prop.type === "rent" ? ` <span class="property-price-period">${L("/ mes", "/ mo")}</span>` : "";
  const bedroomsLabel = prop.bedrooms > 0 ? `${prop.bedrooms} ${L("Rec.", "Beds")}` : L("Uso Comercial", "Commercial");
  const locationText = [prop.location?.neighborhood || "", prop.location?.city || ""].filter(Boolean).join(", ");
  const imageSrc = prop.images?.[0] || "";

  return `
    <div class="${cardClass}" data-prop-id="${prop.id}">
      <div class="property-badges-row">
        <span class="property-type-tag">${tCategory(prop.category)}</span>
        <span class="property-ia-badge">
          <span class="ia-dot"></span>${iaScoreText}
        </span>
      </div>
      <button class="property-favorite-btn ${favClass}" data-id="${prop.id}" title="${L("Guardar en favoritos", "Save to favorites")}">
        <i data-lucide="heart" class="property-card-icon-heart icon-md"></i>
      </button>
      <a href="#propiedad/${prop.id}" class="${imgWrapperClass}">
        <img src="${imageSrc}" alt="${prop.title}" class="property-img">
      </a>
      <div class="${infoBodyClass}">
        <div class="property-location">
          <i data-lucide="map-pin" class="icon-inline icon-sm"></i>
          <span>${locationText}</span>
        </div>
        <a href="#propiedad/${prop.id}">
          <h3 class="${titleClass}">${prop.title}</h3>
        </a>
        <div class="property-specs">
          <div class="property-spec-item">
            <i data-lucide="bed" class="icon-inline icon-md"></i>
            <span>${bedroomsLabel}</span>
          </div>
          <div class="property-spec-item">
            <i data-lucide="bath" class="icon-inline icon-md"></i>
            <span>${prop.bathrooms} ${L("Baños", "Baths")}</span>
          </div>
          <div class="property-spec-item">
            <i data-lucide="maximize" class="icon-inline icon-md"></i>
            <span>${prop.construction || prop.land} m²</span>
          </div>
        </div>
        <div class="property-price-row">
          <span class="property-price">${formattedPrice}${priceSuffix}</span>
          <a href="#propiedad/${prop.id}" class="btn btn-outline btn-sm property-cta-btn">${L("Ver Ficha", "View Details")} <i data-lucide="arrow-up-right" class="icon-inline icon-sm"></i></a>
        </div>
      </div>
    </div>
  `;
}

