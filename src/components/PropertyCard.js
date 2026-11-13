/**
 * Componente Reutilizable: Tarjeta de Propiedad
 * Unifica el marcado visual de las propiedades en la Home, Catálogo y Detalles.
 */
export function renderPropertyCard(prop, isFav, isCompact = false) {
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: prop.currency,
    maximumFractionDigits: 0
  }).format(prop.price);

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

  const iaScoreText = prop.plusvalia 
    ? (parseFloat(prop.plusvalia) + 1.2).toFixed(1) + " IA Score" 
    : "9.2 IA Score";

  const priceSuffix = prop.type === "rent" ? ` <span class="property-price-period">/ mes</span>` : "";
  const bedroomsLabel = prop.bedrooms > 0 ? `${prop.bedrooms} Rec.` : "Uso Comercial";

  return `
    <div class="${cardClass}" data-prop-id="${prop.id}">
      <div class="property-badges-row">
        <span class="property-type-tag">${prop.category}</span>
        <span class="property-ia-badge">
          <span class="ia-dot"></span>${iaScoreText}
        </span>
      </div>
      <button class="property-favorite-btn ${favClass}" data-id="${prop.id}" title="Guardar en favoritos">
        <i data-lucide="heart" class="property-card-icon-heart icon-md"></i>
      </button>
      <a href="#propiedad/${prop.id}" class="${imgWrapperClass}">
        <img src="${prop.images[0]}" alt="${prop.title}" class="property-img">
      </a>
      <div class="${infoBodyClass}">
        <div class="property-location">
          <i data-lucide="map-pin" class="icon-inline icon-sm"></i>
          <span>${prop.location.neighborhood}, ${prop.location.city}</span>
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
            <span>${prop.bathrooms} Baños</span>
          </div>
          <div class="property-spec-item">
            <i data-lucide="maximize" class="icon-inline icon-md"></i>
            <span>${prop.construction || prop.land} m²</span>
          </div>
        </div>
        <div class="property-price-row">
          <span class="property-price">${formattedPrice}${priceSuffix}</span>
          <a href="#propiedad/${prop.id}" class="btn btn-outline btn-sm property-cta-btn">Ver Ficha <i data-lucide="arrow-up-right" class="icon-inline icon-sm"></i></a>
        </div>
      </div>
    </div>
  `;
}

