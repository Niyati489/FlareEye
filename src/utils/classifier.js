export function classifyEvent(event, detections = []) {
  const frp =
    detections.length > 0
      ? detections.reduce((sum, d) => sum + d.frp, 0) /
        detections.length
      : 50;

  const avgTemp =
    detections.length > 0
      ? detections.reduce((sum, d) => sum + d.temp, 0) /
        detections.length
      : 350;

  const scores = {
    "Industrial Fire": 10,
    "Gas Flare": 10,
    "Wildfire": 10,
    "Agricultural Burning": 10,
    "Industrial Heat": 10,
  };

  // Industrial context
  if (event.facility !== "None") {
    scores["Industrial Fire"] += 28;
    scores["Gas Flare"] += 22;
    scores["Industrial Heat"] += 25;
  }

  // High FRP + long persistence
  if (frp > 90) {
    scores["Gas Flare"] += 30;
    scores["Industrial Fire"] += 18;
  }

  if (event.persistence > 70) {
    scores["Industrial Heat"] += 24;
    scores["Gas Flare"] += 18;
  }

  // Vegetation / cropland context
  if (event.landCover === "Vegetation") {
    scores["Wildfire"] += 45;
  }

  if (event.landCover === "Cropland") {
    scores["Agricultural Burning"] += 48;
  }

  // Temperature
  if (avgTemp > 420) {
    scores["Industrial Fire"] += 15;
    scores["Gas Flare"] += 15;
  }

  // Facility proximity
  if (event.facilityDistance < 2) {
    scores["Industrial Fire"] += 12;
    scores["Gas Flare"] += 12;
    scores["Industrial Heat"] += 12;
  }

  const total = Object.values(scores).reduce(
    (a, b) => a + b,
    0
  );

  const probabilities = {};

  Object.entries(scores).forEach(([key, value]) => {
    probabilities[key] = Math.round((value / total) * 100);
  });

  const classification = Object.entries(probabilities)
    .sort((a, b) => b[1] - a[1])[0];

  const confidence = Math.min(
    97,
    Math.max(68, classification[1] + 8)
  );

  return {
    label: classification[0],
    probability: classification[1],
    confidence,
    probabilities,
  };
}