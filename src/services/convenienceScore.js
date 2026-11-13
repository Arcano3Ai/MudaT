/**
 * Índice de Conveniencia de la Ubicación (MudaT)
 * Calcula una puntuación transparente de 0 a 100 basada en:
 * - Proximidad (35%): qué tan cerca está el establecimiento más próximo por categoría.
 * - Disponibilidad (40%): cantidad de opciones reales en el radio explorado.
 * - Diversidad (25%): variedad de categorías cubiertas en el entorno.
 *
 * NOTA: Indicador propio de MudaT con fines informativos; no constituye una
 * calificación oficial de Google ni un indicador inmobiliario certificado.
 */

import { L } from "./i18n.js";

const SCORE_CATEGORIES = [
  { key: "compras", get label() { return L("Compras", "Shopping"); } },
  { key: "educacion", get label() { return L("Educación", "Education"); } },
  { key: "salud", get label() { return L("Salud", "Healthcare"); } },
  { key: "gastronomia", get label() { return L("Gastronomía", "Dining"); } },
  { key: "recreacion", get label() { return L("Recreación", "Recreation"); } },
  { key: "deporte", get label() { return L("Deporte y bienestar", "Sports & Wellness"); } },
  { key: "movilidad", get label() { return L("Movilidad", "Transit"); } }
];

export function calculateConvenienceIndex(places, radiusMeters = 1500) {
  const totalPlaces = places.length;
  const isLimited = totalPlaces < 5;

  const categoryScores = {};
  let coveredCategories = 0;
  let availabilitySum = 0;
  let proximitySum = 0;

  for (const cat of SCORE_CATEGORIES) {
    const items = places
      .filter(p => p.category === cat.key)
      .map(p => ({ ...p, _dist: Number.isFinite(p.distanceMeters) ? p.distanceMeters : (p.distance ?? 0) }))
      .sort((a, b) => a._dist - b._dist);

    if (items.length === 0) {
      categoryScores[cat.key] = { label: cat.label, score: 0, count: 0, nearestMeters: null };
      continue;
    }

    coveredCategories += 1;
    const nearest = items[0]._dist;

    // Disponibilidad por categoría (tope en 6 establecimientos = 100%)
    const catAvailability = Math.min(items.length / 6, 1) * 100;
    // Proximidad del más cercano respecto al radio de exploración
    const catProximity = Math.max(0, 1 - nearest / Math.max(radiusMeters, 500)) * 100;

    const catScore = Math.round(catAvailability * 0.55 + catProximity * 0.45);
    categoryScores[cat.key] = {
      label: cat.label,
      score: Math.min(100, Math.max(10, catScore)),
      count: items.length,
      nearestMeters: Math.round(nearest)
    };

    availabilitySum += catAvailability;
    proximitySum += catProximity;
  }

  const avgAvailability = availabilitySum / SCORE_CATEGORIES.length;
  const avgProximity = proximitySum / SCORE_CATEGORIES.length;
  const diversityScore = (coveredCategories / SCORE_CATEGORIES.length) * 100;

  const overall = Math.round(
    avgAvailability * 0.40 +
    avgProximity * 0.35 +
    diversityScore * 0.25
  );

  let tierLabel = L("Entorno Básico", "Basic Surroundings");
  if (isLimited) tierLabel = L("Evaluación limitada", "Limited evaluation");
  else if (overall >= 80) tierLabel = L("Ubicación Excepcional", "Exceptional Location");
  else if (overall >= 60) tierLabel = L("Muy Buena Conectividad", "Very Good Connectivity");
  else if (overall >= 40) tierLabel = L("Conveniencia Moderada", "Moderate Convenience");

  return {
    overall: totalPlaces === 0 ? 0 : overall,
    tierLabel,
    isLimited,
    totalPlaces,
    coveredCategories,
    totalCategories: SCORE_CATEGORIES.length,
    categories: categoryScores,
    breakdown: {
      availability: Math.round(avgAvailability),
      proximity: Math.round(avgProximity),
      diversity: Math.round(diversityScore)
    }
  };
}

