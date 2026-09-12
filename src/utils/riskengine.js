export function calculateRisk(event, classification) {
  const persistenceScore = event.persistence;

  const frpScore =
    event.avgFrp >= 100
      ? 100
      : event.avgFrp >= 70
      ? 80
      : event.avgFrp >= 40
      ? 60
      : 35;

  const facilityScore =
    event.facilityDistance < 1
      ? 100
      : event.facilityDistance < 3
      ? 80
      : event.facilityDistance < 10
      ? 45
      : 20;

  const abnormalityScore = event.abnormality;

  const environmentalScore =
    event.landCover === "Vegetation"
      ? 70
      : event.landCover === "Cropland"
      ? 65
      : event.landCover === "Built-up"
      ? 75
      : 55;

  let risk =
    persistenceScore * 0.25 +
    frpScore * 0.25 +
    facilityScore * 0.20 +
    abnormalityScore * 0.20 +
    environmentalScore * 0.10;

  if (classification === "Industrial Fire") {
    risk += 8;
  }

  risk = Math.round(Math.min(100, risk));

  let level = "LOW";

  if (risk >= 75) {
    level = "CRITICAL";
  } else if (risk >= 60) {
    level = "HIGH";
  } else if (risk >= 45) {
    level = "MEDIUM";
  }

  return {
    score: risk,
    level,
  };
}