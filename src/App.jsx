
import { useMemo, useState } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
  detections,
  facilities,
  eventSeeds,
} from "./data/demoData";

import { dbscan } from "./utils/dbscan";
import { classifyEvent } from "./utils/classifier";
import { calculateRisk } from "./utils/riskEngine";

import "./App.css";

const facilityIcon = new L.DivIcon({
  className: "facility-icon",
  html: "🏭",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FlyToEvent({ event }) {
  const map = useMap();

  if (event) {
    map.flyTo([event.lat, event.lng], 11, {
      duration: 1,
    });
  }

  return null;
}

function App() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetections, setShowDetections] = useState(false);
  const [running, setRunning] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [showFacilities, setShowFacilities] = useState(true);

  const processedEvents = useMemo(() => {
    return eventSeeds.map((seed, index) => {
      const eventDetections = detections.filter((d) => {
        const dist =
          Math.sqrt(
            Math.pow(d.lat - seed.lat, 2) +
              Math.pow(d.lng - seed.lng, 2)
          ) * 111;

        return dist < 2.5;
      });

      const avgFrp =
        eventDetections.length > 0
          ? Math.round(
              eventDetections.reduce(
                (sum, d) => sum + d.frp,
                0
              ) / eventDetections.length
            )
          : 40;

      const event = {
        ...seed,
        avgFrp,
        detections: eventDetections.length,
      };

      const classification = classifyEvent(
        event,
        eventDetections
      );

      const risk = calculateRisk(
        event,
        classification.label
      );

      return {
        ...event,
        id: seed.id,
        classification: classification.label,
        confidence: classification.confidence,
        probability: classification.probability,
        probabilities: classification.probabilities,
        risk: risk.score,
        riskLevel: risk.level,
        color:
          risk.level === "CRITICAL"
            ? "#ff3b30"
            : risk.level === "HIGH"
            ? "#ff7a00"
            : risk.level === "MEDIUM"
            ? "#ffc107"
            : "#36d399",
        trend:
          index === 0
            ? "Increasing"
            : index === 1
            ? "Persistent"
            : index === 2
            ? "Decreasing"
            : "Stable",
      };
    });
  }, []);

  const filteredEvents = processedEvents.filter((event) => {
    const matchesSearch =
      event.id
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      event.classification
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      event.landCover
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesRisk =
      riskFilter === "ALL" ||
      event.riskLevel === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const runAnalysis = () => {
    setRunning(true);
    setSelectedEvent(null);

    setTimeout(() => {
      const labels = dbscan(detections, 2.5, 3);

      console.log("DBSCAN result:", labels);

      setRunning(false);
      setAnalysisDone(true);
      setShowDetections(true);
    }, 1400);
  };

  const resetAnalysis = () => {
    setAnalysisDone(false);
    setShowDetections(false);
    setSelectedEvent(null);
  };

  const totalPersistent = processedEvents.filter(
    (e) => e.persistence >= 70
  ).length;

  const highRisk = processedEvents.filter(
    (e) =>
      e.riskLevel === "HIGH" ||
      e.riskLevel === "CRITICAL"
  ).length;

  const distribution = processedEvents.reduce(
    (acc, event) => {
      acc[event.classification] =
        (acc[event.classification] || 0) + 1;

      return acc;
    },
    {}
  );

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">🔥</div>

          <div>
            <h2>FlareEye</h2>
            <span>Thermal Intelligence</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="section-label">MONITORING</p>

          {[
            "Overview",
            "Thermal Events",
            "Risk Priority",
            "Data Sources",
          ].map((item) => (
            <button
              key={item}
              className={
                activeNav === item
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActiveNav(item)}
            >
              <span>
                {item === "Overview" && "◉"}
                {item === "Thermal Events" && "◌"}
                {item === "Risk Priority" && "⚠"}
                {item === "Data Sources" && "◈"}
              </span>

              {item}
            </button>
          ))}
        </div>

        <div className="system-card">
          <div className="system-title">
            <span className="live-dot"></span>
            SYSTEM ONLINE
          </div>

          <p>Prototype monitoring engine</p>

          <div className="system-row">
            <span>Thermal Feed</span>
            <b>READY</b>
          </div>

          <div className="system-row">
            <span>Context Engine</span>
            <b>READY</b>
          </div>

          <div className="system-row">
            <span>Risk Engine</span>
            <b>READY</b>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">DISASTER MANAGEMENT / SIH26162</p>
            <h1>{activeNav}</h1>
          </div>

          <div className="top-actions">
            <span className="demo-badge">
              DEMO DATA
            </span>

            <button
              className="reset-btn"
              onClick={resetAnalysis}
            >
              Reset
            </button>

            <button
              className="run-btn"
              onClick={runAnalysis}
              disabled={running}
            >
              {running
                ? "Analyzing..."
                : "▶ Run Full Analysis"}
            </button>
          </div>
        </header>

        {/* OVERVIEW */}
        {activeNav === "Overview" && (
          <>
            <section className="stats">
              <div className="stat-card">
                <div className="stat-icon fire">🔥</div>
                <div>
                  <span>Thermal Detections</span>
                  <strong>{detections.length}</strong>
                  <small>Prototype feed</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue">◉</div>
                <div>
                  <span>Detected Events</span>
                  <strong>{processedEvents.length}</strong>
                  <small>After clustering</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">◷</div>
                <div>
                  <span>Persistent Sources</span>
                  <strong>{totalPersistent}</strong>
                  <small>Persistence ≥ 70%</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon red">⚠</div>
                <div>
                  <span>High Priority</span>
                  <strong>{highRisk}</strong>
                  <small>Requires attention</small>
                </div>
              </div>
            </section>

            {/* CONTROLS */}
            <section className="control-bar">
              <div className="search-box">
                🔎
                <input
                  placeholder="Search event, class or land cover..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>

              <select
                value={riskFilter}
                onChange={(e) =>
                  setRiskFilter(e.target.value)
                }
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <button
                className={
                  showFacilities
                    ? "toggle active"
                    : "toggle"
                }
                onClick={() =>
                  setShowFacilities(!showFacilities)
                }
              >
                🏭 Facilities
              </button>
            </section>

            {/* MAP + EVENTS */}
            <section className="dashboard-grid">
              <div className="panel map-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">
                      GIS DECISION SUPPORT
                    </p>
                    <h2>Thermal Event Intelligence Map</h2>
                  </div>

                  <div className="map-status">
                    <span className="live-dot"></span>
                    ANALYSIS REGION: INDIA
                  </div>
                </div>

                <div className="map-wrapper">
                  <MapContainer
                    center={[22.5, 80]}
                    zoom={5}
                    scrollWheelZoom={true}
                    className="map"
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {selectedEvent && (
                      <FlyToEvent event={selectedEvent} />
                    )}

                    {/* THERMAL DETECTIONS */}
                   {showDetections &&
  detections.map((d) => (
    <CircleMarker
      key={d.id}
      center={[d.lat, d.lng]}
      radius={6}
      pathOptions={{
        color: "red",
        fillColor: "red",
        fillOpacity: 0.8,
      }}
    >
      <Popup>
        <div style={{ minWidth: "180px" }}>
          <h3 style={{ margin: "0 0 8px 0" }}>
            Thermal Detection {d.id}
          </h3>

          <p>
            <strong>Latitude:</strong> {d.lat}
          </p>

          <p>
            <strong>Longitude:</strong> {d.lng}
          </p>

          <p>
            <strong>FRP:</strong> {d.frp} MW
          </p>

          <p>
            <strong>Temperature:</strong> {d.temp} K
          </p>

          <p>
            <strong>Confidence:</strong> {d.confidence}%
          </p>

          <p style={{ marginBottom: 0 }}>
            <strong>Status:</strong> Thermal Anomaly
          </p>
        </div>
      </Popup>
    </CircleMarker>
  ))}

                    {/* EVENTS */}
                    {processedEvents.map((event) => (
                      <CircleMarker
                        key={event.id}
                        center={[
                          event.lat,
                          event.lng,
                        ]}
                        radius={
                          selectedEvent?.id === event.id
                            ? 15
                            : 10
                        }
                        pathOptions={{
                          color: event.color,
                          fillColor: event.color,
                          fillOpacity: 0.35,
                          weight: 3,
                        }}
                        eventHandlers={{
                          click: () =>
                            setSelectedEvent(event),
                        }}
                      >
                        <Popup>
                          <b>{event.id}</b>
                          <br />
                          {event.classification}
                          <br />
                          Risk: {event.risk}
                        </Popup>
                      </CircleMarker>
                    ))}

                    {/* FACILITIES */}
                    {showFacilities &&
                      facilities.map((facility) => (
                        <Marker
                          key={facility.id}
                          position={[
                            facility.lat,
                            facility.lng,
                          ]}
                          icon={facilityIcon}
                        >
                          <Popup>
                            <b>{facility.name}</b>
                            <br />
                            {facility.type}
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>

                  <div className="map-legend">
                    <span>
                      <i className="legend-dot thermal"></i>
                      Thermal Detection
                    </span>
                    <span>
                      <i className="legend-dot event"></i>
                      Classified Event
                    </span>
                    <span>
                      <i className="legend-dot facility"></i>
                      Facility
                    </span>
                  </div>

                  {!showDetections && (
                    <div className="map-overlay">
                      <div>
                        <span>◉</span>
                        <h3>Thermal layer ready</h3>
                        <p>
                          Run Full Analysis to process
                          thermal detections.
                        </p>

                        <button
                          onClick={runAnalysis}
                          disabled={running}
                        >
                          {running
                            ? "Processing..."
                            : "Run Detection"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* EVENT PANEL */}
              <div className="panel event-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">
                      PRIORITY QUEUE
                    </p>
                    <h2>Detected Events</h2>
                  </div>

                  <span className="count-badge">
                    {filteredEvents.length}
                  </span>
                </div>

                <div className="event-list">
                  {filteredEvents.map((event) => (
                    <button
                      className={
                        selectedEvent?.id === event.id
                          ? "event-row selected"
                          : "event-row"
                      }
                      key={event.id}
                      onClick={() =>
                        setSelectedEvent(event)
                      }
                    >
                      <div
                        className="event-marker"
                        style={{
                          background: event.color,
                        }}
                      ></div>

                      <div className="event-main">
                        <div className="event-title">
                          <b>{event.id}</b>

                          <span
                            className={`risk-tag ${event.riskLevel.toLowerCase()}`}
                          >
                            {event.riskLevel}
                          </span>
                        </div>

                        <span className="event-class">
                          {event.classification}
                        </span>

                        <small>
                          {event.detections} detections
                          {" • "}
                          {event.persistence}% persistence
                        </small>
                      </div>

                      <div className="event-score">
                        <strong>{event.risk}</strong>
                        <small>RISK</small>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* INVESTIGATION */}
            {selectedEvent && (
              <section className="panel investigation">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">
                      EVENT INVESTIGATION
                    </p>
                    <h2>
                      {selectedEvent.id} —{" "}
                      {selectedEvent.classification}
                    </h2>
                  </div>

                  <button
                    className="close-btn"
                    onClick={() =>
                      setSelectedEvent(null)
                    }
                  >
                    ×
                  </button>
                </div>

                <div className="investigation-grid">
                  <div className="classification-card">
                    <span>AI CLASSIFICATION</span>

                    <h3>
                      {selectedEvent.classification}
                    </h3>

                    <div className="confidence">
                      <div>
                        <span>Confidence</span>
                        <b>
                          {selectedEvent.confidence}%
                        </b>
                      </div>

                      <div className="progress">
                        <div
                          style={{
                            width: `${selectedEvent.confidence}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <p>
                      Most likely source based on thermal
                      intensity, persistence, land cover,
                      industrial proximity and contextual
                      evidence.
                    </p>
                  </div>

                  <div className="metric-box">
                    <span>RISK SCORE</span>
                    <strong>
                      {selectedEvent.risk}
                    </strong>
                    <small>
                      {selectedEvent.riskLevel}
                    </small>
                  </div>

                  <div className="metric-box">
                    <span>PERSISTENCE</span>
                    <strong>
                      {selectedEvent.persistence}%
                    </strong>
                    <small>
                      {selectedEvent.trend}
                    </small>
                  </div>

                  <div className="metric-box">
                    <span>AVG FRP</span>
                    <strong>
                      {selectedEvent.avgFrp}
                    </strong>
                    <small>MW</small>
                  </div>
                </div>

                <div className="evidence-grid">
                  <div>
                    <span>Nearest Facility</span>
                    <b>
                      {selectedEvent.facility}
                    </b>
                  </div>

                  <div>
                    <span>Distance</span>
                    <b>
                      {selectedEvent.facilityDistance} km
                    </b>
                  </div>

                  <div>
                    <span>Land Cover</span>
                    <b>
                      {selectedEvent.landCover}
                    </b>
                  </div>

                  <div>
                    <span>Wind</span>
                    <b>
                      {selectedEvent.wind} km/h
                    </b>
                  </div>

                  <div>
                    <span>Duration</span>
                    <b>
                      {selectedEvent.duration} hrs
                    </b>
                  </div>

                  <div>
                    <span>Optical Evidence</span>
                    <b>
                      {selectedEvent.optical}%
                    </b>
                  </div>
                </div>

                <div className="why-box">
                  <div className="why-icon">✦</div>

                  <div>
                    <b>Why this classification?</b>

                    <p>
                      {selectedEvent.facility !== "None"
                        ? `The event is located ${selectedEvent.facilityDistance} km from an industrial facility and shows ${selectedEvent.persistence}% temporal persistence. `
                        : "The event has limited industrial proximity. "}

                      The system combines thermal behaviour,
                      contextual land cover, infrastructure
                      proximity and environmental signals
                      before assigning the class and risk
                      priority.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* LOWER */}
            <section className="lower-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">
                      CLASSIFICATION
                    </p>
                    <h2>Event Distribution</h2>
                  </div>
                </div>

                <div className="distribution">
                  {Object.entries(distribution).map(
                    ([name, count]) => (
                      <div
                        className="distribution-row"
                        key={name}
                      >
                        <div className="dist-label">
                          <span>{name}</span>
                          <b>{count}</b>
                        </div>

                        <div className="dist-bar">
                          <div
                            style={{
                              width: `${
                                (count /
                                  processedEvents.length) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">
                      PROCESSING PIPELINE
                    </p>
                    <h2>FlareEye Intelligence</h2>
                  </div>
                </div>

                <div className="pipeline">
                  {[
                    ["01", "DETECT", "Thermal anomalies"],
                    ["02", "CONTEXT", "OSM + land cover"],
                    ["03", "CLUSTER", "DBSCAN events"],
                    ["04", "CLASSIFY", "5 source classes"],
                    ["05", "PRIORITISE", "Risk score"],
                  ].map(
                    ([num, title, desc], index) => (
                      <div
                        className="pipeline-step"
                        key={title}
                      >
                        <div className="pipeline-number">
                          {num}
                        </div>

                        <div>
                          <b>{title}</b>
                          <span>{desc}</span>
                        </div>

                        {index !== 4 && (
                          <i>→</i>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* DBSCAN RESULT */}
            {analysisDone && (
              <section className="analysis-result">
                <div>
                  <span>✓</span>

                  <div>
                    <b>Analysis completed successfully</b>
                    <p>
                      Thermal anomalies were quality
                      screened, clustered into events,
                      contextualised and prioritised.
                    </p>
                  </div>
                </div>

                <div className="result-flow">
                  <strong>24</strong>
                  <span>detections</span>
                  →
                  <strong>5</strong>
                  <span>events</span>
                  →
                  <strong>
                    {totalPersistent}
                  </strong>
                  <span>persistent</span>
                  →
                  <strong>{highRisk}</strong>
                  <span>priority</span>
                </div>
              </section>
            )}
          </>
        )}

        {/* THERMAL EVENTS */}
        {activeNav === "Thermal Events" && (
          <section className="full-panel panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">
                  EVENT HISTORY
                </p>
                <h2>Thermal Event History</h2>
              </div>
            </div>

            <div className="history-table">
              <div className="table-head">
                <span>EVENT</span>
                <span>CLASSIFICATION</span>
                <span>CONFIDENCE</span>
                <span>PERSISTENCE</span>
                <span>RISK</span>
              </div>

              {processedEvents.map((event) => (
                <div
                  className="table-row"
                  key={event.id}
                  onClick={() =>
                    setSelectedEvent(event)
                  }
                >
                  <b>{event.id}</b>
                  <span>{event.classification}</span>
                  <span>{event.confidence}%</span>
                  <span>{event.persistence}%</span>
                  <strong>{event.risk}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RISK */}
        {activeNav === "Risk Priority" && (
          <section className="risk-page">
            <div className="risk-hero">
              <p className="eyebrow">
                AUTOMATED PRIORITISATION
              </p>

              <h2>
                Events ranked by potential impact
              </h2>

              <p>
                Risk combines persistence, thermal
                severity, industrial proximity,
                abnormality and environmental context.
              </p>
            </div>

            <div className="risk-cards">
              {[...processedEvents]
                .sort((a, b) => b.risk - a.risk)
                .map((event, index) => (
                  <button
                    className="risk-card"
                    key={event.id}
                    onClick={() =>
                      setSelectedEvent(event)
                    }
                  >
                    <span className="rank">
                      #{index + 1}
                    </span>

                    <div>
                      <b>{event.id}</b>
                      <p>{event.classification}</p>
                    </div>

                    <strong>{event.risk}</strong>

                    <span
                      className={`risk-tag ${event.riskLevel.toLowerCase()}`}
                    >
                      {event.riskLevel}
                    </span>
                  </button>
                ))}
            </div>
          </section>
        )}

        {/* DATA SOURCES */}
        {activeNav === "Data Sources" && (
          <section className="sources-page">
            <div className="source-intro">
              <p className="eyebrow">
                MULTI-SOURCE FUSION
              </p>

              <h2>Data Sources</h2>

              <p>
                FlareEye is designed around multiple
                geospatial and environmental data layers.
              </p>
            </div>

            <div className="source-grid">
              {[
                [
                  "🔥",
                  "NASA FIRMS / VIIRS",
                  "Thermal anomalies, active fire detections, FRP and brightness temperature.",
                ],
                [
                  "🛰️",
                  "Sentinel-2 / Landsat",
                  "Optical and SWIR evidence for contextual verification.",
                ],
                [
                  "🗺️",
                  "OpenStreetMap",
                  "Infrastructure, roads, settlements and facility context.",
                ],
                [
                  "🏭",
                  "Industrial Database",
                  "Refineries, power plants, chemical and other industrial facilities.",
                ],
                [
                  "🌱",
                  "ESA WorldCover",
                  "Land-cover context including vegetation, cropland and built-up areas.",
                ],
                [
                  "💨",
                  "Weather",
                  "Wind and environmental conditions for risk interpretation.",
                ],
              ].map(([icon, name, desc]) => (
                <div className="source-card" key={name}>
                  <div>{icon}</div>
                  <h3>{name}</h3>
                  <p>{desc}</p>
                  <span>● Prototype Connected</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer>
          <span>
            FLAREEYE • CODERUSH26 • SIH 2026
          </span>

          <span>
            Context-aware thermal intelligence
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;