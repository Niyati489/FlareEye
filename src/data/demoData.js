export const facilities = [
  {
    id: "FAC-01",
    name: "Visakhapatnam Chemical Plant",
    type: "Chemical Plant",
    lat: 17.6868,
    lng: 83.2185,
  },
  {
    id: "FAC-02",
    name: "Odisha Refinery",
    type: "Refinery",
    lat: 20.2961,
    lng: 85.8245,
  },
  {
    id: "FAC-03",
    name: "Kolkata Industrial Zone",
    type: "Steel Plant",
    lat: 22.5726,
    lng: 88.3639,
  },
  {
    id: "FAC-04",
    name: "Delhi Power Facility",
    type: "Power Plant",
    lat: 28.6139,
    lng: 77.209,
  },
  {
    id: "FAC-05",
    name: "Bhopal Industrial Complex",
    type: "Industrial Facility",
    lat: 23.2599,
    lng: 77.4126,
  },
];

export const detections = [
  // Visakhapatnam
  { id: "T001", lat: 17.6868, lng: 83.2185, frp: 82, temp: 412, confidence: 94 },
  { id: "T002", lat: 17.6875, lng: 83.2192, frp: 76, temp: 398, confidence: 91 },
  { id: "T003", lat: 17.6859, lng: 83.2177, frp: 88, temp: 425, confidence: 96 },
  { id: "T004", lat: 17.6872, lng: 83.2179, frp: 71, temp: 390, confidence: 89 },
  { id: "T005", lat: 17.6861, lng: 83.2190, frp: 92, temp: 431, confidence: 97 },
  { id: "T006", lat: 17.6855, lng: 83.2182, frp: 68, temp: 386, confidence: 88 },

  // Odisha
  { id: "T007", lat: 20.2961, lng: 85.8245, frp: 112, temp: 461, confidence: 98 },
  { id: "T008", lat: 20.2967, lng: 85.8251, frp: 108, temp: 455, confidence: 97 },
  { id: "T009", lat: 20.2955, lng: 85.8238, frp: 119, temp: 472, confidence: 99 },
  { id: "T010", lat: 20.2965, lng: 85.8239, frp: 105, temp: 449, confidence: 96 },
  { id: "T011", lat: 20.2959, lng: 85.8253, frp: 115, temp: 468, confidence: 98 },
  { id: "T012", lat: 20.2970, lng: 85.8242, frp: 101, temp: 442, confidence: 95 },

  // Kolkata
  { id: "T013", lat: 22.5726, lng: 88.3639, frp: 46, temp: 344, confidence: 87 },
  { id: "T014", lat: 22.5731, lng: 88.3646, frp: 51, temp: 352, confidence: 89 },
  { id: "T015", lat: 22.5720, lng: 88.3632, frp: 42, temp: 337, confidence: 85 },
  { id: "T016", lat: 22.5735, lng: 88.3636, frp: 48, temp: 349, confidence: 88 },

  // Delhi
  { id: "T017", lat: 28.6139, lng: 77.2090, frp: 39, temp: 329, confidence: 84 },
  { id: "T018", lat: 28.6145, lng: 77.2084, frp: 44, temp: 335, confidence: 86 },
  { id: "T019", lat: 28.6134, lng: 77.2097, frp: 36, temp: 324, confidence: 82 },
  { id: "T020", lat: 28.6142, lng: 77.2101, frp: 41, temp: 331, confidence: 85 },

  // Bhopal
  { id: "T021", lat: 23.2599, lng: 77.4126, frp: 64, temp: 381, confidence: 90 },
  { id: "T022", lat: 23.2605, lng: 77.4132, frp: 61, temp: 375, confidence: 89 },
  { id: "T023", lat: 23.2592, lng: 77.4120, frp: 67, temp: 388, confidence: 91 },

  // Isolated detection
  { id: "T024", lat: 19.0760, lng: 72.8777, frp: 28, temp: 311, confidence: 72 },
];

export const eventSeeds = [
  {
    id: "FL-024",
    lat: 17.6868,
    lng: 83.2185,
    persistence: 82,
    duration: 4.8,
    landCover: "Built-up",
    wind: 12,
    facility: "Chemical Plant",
    facilityDistance: 1.2,
    optical: 86,
    abnormality: 91,
  },
  {
    id: "FL-018",
    lat: 20.2961,
    lng: 85.8245,
    persistence: 91,
    duration: 8.2,
    landCover: "Industrial",
    wind: 9,
    facility: "Refinery",
    facilityDistance: 0.7,
    optical: 94,
    abnormality: 76,
  },
  {
    id: "FL-031",
    lat: 22.5726,
    lng: 88.3639,
    persistence: 34,
    duration: 2.1,
    landCover: "Vegetation",
    wind: 18,
    facility: "None",
    facilityDistance: 18.4,
    optical: 78,
    abnormality: 28,
  },
  {
    id: "FL-042",
    lat: 28.6139,
    lng: 77.209,
    persistence: 48,
    duration: 3.2,
    landCover: "Cropland",
    wind: 14,
    facility: "None",
    facilityDistance: 12.1,
    optical: 73,
    abnormality: 42,
  },
  {
    id: "FL-051",
    lat: 23.2599,
    lng: 77.4126,
    persistence: 76,
    duration: 6.7,
    landCover: "Industrial",
    wind: 11,
    facility: "Power Plant",
    facilityDistance: 0.9,
    optical: 88,
    abnormality: 68,
  },
];