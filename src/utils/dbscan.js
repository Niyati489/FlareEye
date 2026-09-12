function distance(a, b) {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;

  return Math.sqrt(dx * dx + dy * dy) * 111;
}

function regionQuery(points, index, eps) {
  const neighbours = [];

  for (let i = 0; i < points.length; i++) {
    if (distance(points[index], points[i]) <= eps) {
      neighbours.push(i);
    }
  }

  return neighbours;
}

export function dbscan(points, eps = 2.5, minPts = 3) {
  const labels = new Array(points.length).fill(undefined);

  const NOISE = -1;
  let clusterId = 0;

  for (let i = 0; i < points.length; i++) {
    if (labels[i] !== undefined) continue;

    const neighbours = regionQuery(points, i, eps);

    if (neighbours.length < minPts) {
      labels[i] = NOISE;
      continue;
    }

    labels[i] = clusterId;

    const queue = [...neighbours];

    while (queue.length) {
      const current = queue.shift();

      if (labels[current] === NOISE) {
        labels[current] = clusterId;
      }

      if (labels[current] !== undefined) continue;

      labels[current] = clusterId;

      const currentNeighbours =
        regionQuery(points, current, eps);

      if (currentNeighbours.length >= minPts) {
        queue.push(...currentNeighbours);
      }
    }

    clusterId++;
  }

  return labels;
}