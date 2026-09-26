import "./App.css";
import { useState, useEffect } from "react";

import {
  loginUser,
  getStoredUser,
  logoutUser,
  createExpedition,
  getExpeditions,
  getAvailablePersonnel,
  assignPersonToExpedition,
  getExpeditionAssignments,
  getCargo,
  createCargo,
  updateCargoStatus,
  getCargoById,
  getEmergencies,
  createEmergency,
  updateEmergencyStatus,
  getEmergencyResources,
  getNotifications,
  markNotificationAsRead,
} from "./services/api";

import Register from "./pages/register";
import Login from "./pages/Login";

import {
  Home,
  ClipboardList,
  Package,
  Boxes,
  Users,
  Map as MapIcon,
  TriangleAlert,
  Bell,
  Search,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Ship,
  Plane,
  Wrench,
  Activity,
  CheckCircle2,
  Clock3,
  CircleAlert,
  Navigation,
  ThermometerSnowflake,
  Database,
  Snowflake,
  Truck,
  Radio,
  ShieldAlert,
} from "lucide-react";

const NAV = [
  ["dashboard", "Command Center", Home],
  ["planning", "Expedition Planning", ClipboardList],
  ["cargo", "Cargo & Assets", Package],
  ["inventory", "Inventory", Boxes],
  ["personnel", "Personnel", Users],
  ["map", "Expedition Map", MapIcon],
  ["emergency", "Emergency", TriangleAlert],
  ["alerts", "Alerts", Bell],
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [authPage, setAuthPage] = useState("login");
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  const [notifications, setNotifications] = useState([]);
  const unreadNotificationCount = notifications.filter(
  (notification) => !notification.is_read
).length;
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  async function loadNotifications() {
    try {
      setLoadingNotifications(true);
      setNotificationError("");

      const data = await getNotifications();

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setNotificationError(
        error.message || "Failed to load notifications"
      );
    } finally {
      setLoadingNotifications(false);
    }
  }

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    loadNotifications();
  }, [currentUser]);

  if (!currentUser) {
    if (authPage === "register") {
      return (
        <Register
          onRegister={() => setAuthPage("login")}
          onBackToLogin={() => setAuthPage("login")}
        />
      );
    }

    return (
      <Login
        onLogin={setCurrentUser}
        onRegister={() => setAuthPage("register")}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar
  page={page}
  setPage={setPage}
  unreadNotificationCount={unreadNotificationCount}
/>

      <div className="content">
        <Topbar currentUser={currentUser} />

        {page === "dashboard" && (
  <Dashboard setPage={setPage} />
)}
        {page === "planning" && (
          <Planning currentUser={currentUser} />
        )}
        {page === "cargo" && <Cargo />}
        {page === "inventory" && <Inventory />}
        {page === "personnel" && <Personnel />}
        {page === "map" && <ExpeditionMap />}
        {page === "emergency" && <Emergency />}
        {page === "alerts" && (
  <Alerts
    notifications={notifications}
    setNotifications={setNotifications}
    loadingNotifications={loadingNotifications}
    notificationError={notificationError}
    markNotificationAsRead={markNotificationAsRead}
  />
)}
      </div>
    </div>
  );
}
/* ================= SIDEBAR ================= */

function Sidebar({
  page,
  setPage,
  unreadNotificationCount,
}) {
  return (
    <aside className="sidebar">
      <div className="logo-area">
        <div className="logo-circle">
          <Snowflake size={27} />
        </div>

        <div>
          <h2>POLAROPS</h2>
          <p>
            Integrated Polar Expedition
            <br />
            Logistics & Asset Management System
          </p>
        </div>
      </div>

      <nav className="nav">
        {NAV.map(([id, label, Icon]) => (
          <button
            key={id}
            className={`nav-btn ${page === id ? "active" : ""}`}
            onClick={() => setPage(id)}
          >
            <Icon size={18} />
            <span>{label}</span>

            {id === "alerts" &&
              unreadNotificationCount > 0 && (
                <span className="nav-count">
                  {unreadNotificationCount}
                </span>
              )}
          </button>
        ))}
      </nav>

      <div className="quote">
        <p>
          "To explore. To understand.
          <br />
          To protect."
        </p>
        <span>— Indian Antarctic Programme</span>
      </div>
    </aside>
  );
}

/* ================= TOPBAR ================= */

function Topbar({ currentUser }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="topbar">
      <div className="search">
        <Search size={17} />
        <input placeholder="Search cargo, personnel, assets, locations..." />
      </div>

      <div className="top-actions">
        <div className="date">
          <CalendarDays size={16} />

          <div>
            <strong>Live System</strong>
            <span>Awaiting connection</span>
          </div>
        </div>

        <div
          className="user"
          onClick={() => setShowMenu(!showMenu)}
          style={{
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div className="avatar">
            {currentUser?.full_name
              ? currentUser.full_name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "U"}
          </div>

          <div>
            <strong>{currentUser?.full_name || "User"}</strong>

            <span>
              {currentUser?.role
                ? currentUser.role
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())
                : "User"}
            </span>
          </div>

          <ChevronDown size={15} />

          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "48px",
                right: "0",
                background: "#0d1b2a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "8px",
                minWidth: "140px",
                zIndex: 1000,
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  logoutUser();
                  window.location.reload();
                }}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ================= COMMON ================= */

function Hero({
  eyebrow,
  title,
  subtitle,
  status = null,
}) {
  return (
    <section className="page-hero">
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <small>{eyebrow}</small>

          {status && (
            <Badge type="yellow">
              {status}
            </Badge>
          )}
        </div>

        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="hero-weather">
        <ThermometerSnowflake size={20} />

        <div>
          <small>Antarctica</small>
          <strong>—</strong>
          <span>Live weather unavailable</span>
        </div>
      </div>
    </section>
  );
}

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function SectionTitle({ title, right = "View All" }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      <button type="button">{right} →</button>
    </div>
  );
}

function Badge({ children, type = "blue" }) {
  return <span className={`badge ${type}`}>{children}</span>;
}

function Stat({
  icon,
  color = "blue",
  title,
  text,
  value = "—",
  development = false,
}) {
  return (
    <div className="stat">
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>

      <div className="stat-copy">
        <span>{title}</span>

        {development ? (
          <strong className="stat-development">
            IN DEVELOPMENT
          </strong>
        ) : (
          <strong>{value}</strong>
        )}

        <small>{text}</small>
      </div>

      <ChevronRight
        className="stat-arrow"
        size={17}
      />
    </div>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <b>{title}</b>
      <span>{text}</span>
    </div>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard({ setPage }) {
  const [expeditions, setExpeditions] = useState([]);
  const [loadingExpedition, setLoadingExpedition] = useState(true);

  const [personnelCount, setPersonnelCount] = useState(0);
  const [loadingPersonnel, setLoadingPersonnel] = useState(true);

  const [cargoCount, setCargoCount] = useState(0);
  const [loadingCargo, setLoadingCargo] = useState(true);
  const [notifications, setNotifications] = useState([]);
const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    loadDashboardExpedition();
  }, []);

  async function loadDashboardExpedition() {
    try {
      setLoadingExpedition(true);

      const data = await getExpeditions();

      setExpeditions(data || []);
    } catch (error) {
      console.error(
        "Failed to load dashboard expedition:",
        error
      );
    } finally {
      setLoadingExpedition(false);
    }
  }

  async function loadDashboardPersonnel(expeditionId) {
    try {
      setLoadingPersonnel(true);

      const data = await getExpeditionAssignments(
        expeditionId
      );

      setPersonnelCount(
        Array.isArray(data)
          ? data.length
          : data.assignments?.length || 0
      );
    } catch (error) {
      console.error(
        "Failed to load dashboard personnel:",
        error
      );

      setPersonnelCount(0);
    } finally {
      setLoadingPersonnel(false);
    }
  }

  async function loadDashboardCargo() {
    try {
      setLoadingCargo(true);

      const data = await getCargo();

      setCargoCount(
        Array.isArray(data)
          ? data.length
          : data.cargo?.length || 0
      );
    } catch (error) {
      console.error(
        "Failed to load dashboard cargo:",
        error
      );

      setCargoCount(0);
    } finally {
      setLoadingCargo(false);
    }
  }
    async function loadDashboardNotifications() {
  try {
    setLoadingNotifications(true);

    const data = await getEmergencies();

    const activeAlerts = (data || []).filter(
      (emergency) =>
        emergency.status !== "resolved"
    );

    setNotifications(activeAlerts);
  } catch (error) {
    console.error(
      "Failed to load dashboard alerts:",
      error
    );

    setNotifications([]);
  } finally {
    setLoadingNotifications(false);
  }
}
  const currentExpedition =
    expeditions.find(
      (expedition) =>
        expedition.status === "active" ||
        expedition.status === "preparation" ||
        expedition.status === "planning"
    ) || expeditions[0];

  useEffect(() => {
    if (!currentExpedition?.id) {
      setPersonnelCount(0);
      setLoadingPersonnel(false);
      return;
    }

    loadDashboardPersonnel(
      currentExpedition.id
    );
  }, [currentExpedition?.id]);

  useEffect(() => {
  loadDashboardCargo();
  loadDashboardNotifications();
}, []);

  const expeditionStatus =
    currentExpedition?.status || null;

  const expeditionPhase = expeditionStatus
    ? expeditionStatus.charAt(0).toUpperCase() +
      expeditionStatus.slice(1)
    : "Awaiting live data";

  let daysRemaining = "—";

  if (currentExpedition?.end_date) {
    const today = new Date();

    const endDate = new Date(
      currentExpedition.end_date
    );

    const difference =
      endDate.getTime() - today.getTime();

    const days = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    daysRemaining = days > 0 ? days : 0;
  }

  return (
    <main className="page">
      <section className="dashboard-hero">
        <div className="hero-dark">
          <small>INDIAN ANTARCTIC EXPEDITION</small>

          <h1>Mission Control Center</h1>

          <p>
            {loadingExpedition
              ? "Loading expedition operations..."
              : currentExpedition
              ? currentExpedition.expedition_name
              : "Planning today. Researching tomorrow."}
          </p>

          <div className="mission-strip">
            <span className="mission-green">
              ● Live System
            </span>

            <span>
              Phase:{" "}
              <b>
                {loadingExpedition
                  ? "Loading..."
                  : expeditionPhase}
              </b>
            </span>

            <span className="days">
              <CalendarDays size={14} />

              Days Remaining{" "}
              <b>
                {loadingExpedition
                  ? "—"
                  : daysRemaining}
              </b>
            </span>
          </div>
        </div>

        <div className="weather-floating">
          <ThermometerSnowflake size={18} />

          <div>
            <small>Antarctica</small>

            <strong>—</strong>

            <span>
              Live weather unavailable
            </span>
          </div>
        </div>
      </section>

      <div className="stats five">
  <Stat
    icon={<Users size={22} />}
    title="Personnel"
    text="Feature in development"
    development
  />

  <Stat
    icon={<Package size={22} />}
    title="Cargo"
    text="shipments"
    value={cargoCount}
  />

  <Stat
    icon={<Database size={22} />}
    color="green"
    title="Inventory"
    text="Feature in development"
    development
  />

  <Stat
    icon={<Wrench size={22} />}
    color="yellow"
    title="Assets"
    text="Feature in development"
    development
  />

  <Stat
    icon={<TriangleAlert size={22} />}
    color="red"
    title="Critical Alerts"
    text="active incidents"
    value={notifications.length}
  />
</div>
      <div className="two-col">
        <Card>
  <div className="section-title">
    <div className="section-title-left">
      <h3>Expedition Map</h3>

      <span className="stat-development">
        IN DEVELOPMENT
      </span>
    </div>
  </div>

  <MapVisual />
</Card>

        <div className="stack">
          <Card>
            <SectionTitle title="Mission Timeline" />

            <Timeline />
          </Card>

          <Card>
  <div className="section-title">
    <h3>Current Alerts</h3>

    <button
      type="button"
      onClick={() => setPage("emergency")}
    >
      View All →
    </button>
  </div>

  {loadingNotifications ? (
    <EmptyState
      icon={<Bell size={22} />}
      title="Loading current alerts"
      text="Fetching live operational alerts..."
    />
  ) : notifications.length === 0 ? (
    <EmptyState
      icon={<Bell size={22} />}
      title="No active alerts"
      text="No current operational incidents require attention."
    />
  ) : (
    <div className="alert-list">
      {notifications
        .slice(0, 3)
        .map((emergency) => (
          <div
            key={emergency.id}
            className="alert-item"
          >
            <div className="alert-item-icon">
              <TriangleAlert size={18} />
            </div>

            <div className="alert-item-content">
              <strong>
                {emergency.emergency_type}
              </strong>

              <p>
                {emergency.description ||
                  `Incident ${emergency.incident_code} reported at ${emergency.location}.`}
              </p>

              <small>
                {emergency.severity
                  ? emergency.severity.toUpperCase()
                  : "ALERT"}
                {" • "}
                {emergency.location}
              </small>
            </div>
          </div>
        ))}
    </div>
  )}
</Card>
          <StationStatus />
        </div>
      </div>

      <Card className="banner">
        <div className="banner-overlay">
          <strong>
            Indian Antarctic Expedition
          </strong>

          <span>
            Science | Sustainability | A Safer Future
          </span>
        </div>
      </Card>
    </main>
  );
}
/* ================= MAP ================= */

function MapVisual() {
  return (
    <div className="map">
      <div className="map-legend">
        <span>🔴 Maitri Station</span>
        <span>🔵 Bharati Station</span>
        <span>┄ Cargo Route</span>
        <span>┄ Personnel Route</span>
        <span>🚢 Ship Route</span>
        <span>✈ Flight Route</span>
      </div>

      <div className="pin maitri">
        ●
        <small>Maitri</small>
      </div>

      <div className="pin bharati">
        ●
        <small>Bharati</small>
      </div>

      <div className="route route-a" />
      <div className="route route-b" />

      <Ship className="map-ship" size={21} />
      <Plane className="map-plane" size={20} />

      <div className="live-position">
        <b>Live Positions</b>
        <span>Personnel —</span>
        <span>Cargo —</span>
        <span>Assets —</span>
      </div>

      <div className="north">N</div>
    </div>
  );
}

function Timeline() {
  const items = [
    ["Planning", "Awaiting data", "done"],
    ["Preparation", "Awaiting data", "done"],
    ["Transit", "Awaiting data", "current"],
    ["Antarctica", "Awaiting data", "pending"],
    ["Station Ops", "Awaiting data", "pending"],
  ];

  return (
    <div className="timeline">
      {items.map(([title, subtitle, state]) => (
        <div className="timeline-item" key={title}>
          <div className={`timeline-dot ${state}`}>
            {state === "done"
              ? "✓"
              : state === "current"
              ? "✈"
              : "•"}
          </div>

          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
      ))}
    </div>
  );
}

/* ================= STATIONS ================= */

function StationStatus() {
  return (
    <Card>
      <SectionTitle title="Station Status" />

      <div className="stations">
        <Station title="Maitri" image="maitri" />
        <Station title="Bharati" image="bharati" />
      </div>
    </Card>
  );
}

function Station({ title, image }) {
  return (
    <div className="station">
      <div className="station-heading">
        📍 {title}
      </div>

      <div className="station-body">
        <div className={`station-photo ${image}`} />

        <div className="station-info">
          <Badge type="blue">Live data</Badge>

          <p>
            Population <b>—</b>
          </p>

          <p>
            Fuel <b>—</b>
          </p>

          <p>
            Water <b>—</b>
          </p>

          <p>
            Medical <b>—</b>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= PLANNING ================= */

function Planning({ currentUser }) {
  const [showCreateExpedition, setShowCreateExpedition] =
    useState(false);

  const [creatingExpedition, setCreatingExpedition] =
    useState(false);

  const [createError, setCreateError] = useState("");

  const [expeditions, setExpeditions] = useState([]);
  const [loadingExpeditions, setLoadingExpeditions] =
    useState(true);

  const [expeditionError, setExpeditionError] =
    useState("");

  const [selectedExpedition, setSelectedExpedition] =
    useState(null);

  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] =
    useState(false);

  const [assignmentError, setAssignmentError] =
    useState("");

  /* ASSIGNMENT FORM STATES */

  const [showAssignmentForm, setShowAssignmentForm] =
    useState(false);

  const [availablePersonnel, setAvailablePersonnel] =
    useState([]);

  const [selectedPersonId, setSelectedPersonId] =
    useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState("expedition_member");

  const [selectedStationId, setSelectedStationId] =
    useState("");

  const [assigningPerson, setAssigningPerson] =
    useState(false);

  const [assignError, setAssignError] =
    useState("");

  /* ================= LOAD EXPEDITIONS ================= */

  useEffect(() => {
    async function loadExpeditions() {
      try {
        setExpeditionError("");

        const data = await getExpeditions();

        setExpeditions(data);
      } catch (error) {
        setExpeditionError(
          error.message || "Failed to load expeditions"
        );
      } finally {
        setLoadingExpeditions(false);
      }
    }

    loadExpeditions();
  }, []);

  /* ================= LOAD ASSIGNMENTS ================= */

  useEffect(() => {
    async function loadAssignments() {
      if (!selectedExpedition) {
        setAssignments([]);
        return;
      }

      try {
        setLoadingAssignments(true);
        setAssignmentError("");

        const data = await getExpeditionAssignments(
          selectedExpedition.id
        );

        setAssignments(Array.isArray(data) ? data : []);
      } catch (error) {
        setAssignmentError(
          error.message || "Failed to load assignments"
        );
      } finally {
        setLoadingAssignments(false);
      }
    }

    loadAssignments();
  }, [selectedExpedition]);

  /* ================= CREATE EXPEDITION ================= */

  async function handleCreateExpedition() {
    setCreateError("");
    setCreatingExpedition(true);

    try {
      await createExpedition({
        expedition_code:
          document.getElementById("expedition-code").value,

        expedition_name:
          document.getElementById("expedition-name").value,

        start_date:
          document.getElementById("expedition-start-date")
            .value || null,

        end_date:
          document.getElementById("expedition-end-date")
            .value || null,

        status:
          document.getElementById("expedition-status").value,

        description:
          document.getElementById("expedition-description")
            .value || null,
      });

      alert("Expedition created successfully");

      setShowCreateExpedition(false);

      const updatedExpeditions =
        await getExpeditions();

      setExpeditions(updatedExpeditions);
    } catch (error) {
      setCreateError(
        error.message || "Failed to create expedition"
      );
    } finally {
      setCreatingExpedition(false);
    }
  }

  /* ================= OPEN ASSIGNMENT FORM ================= */

  async function handleOpenAssignmentForm() {
    if (!selectedExpedition) {
      return;
    }

    try {
      setAssignError("");
      setShowAssignmentForm(false);

      const personnel = await getAvailablePersonnel();

      if (!Array.isArray(personnel)) {
        setAssignError(
          "Invalid personnel data received from server."
        );
        return;
      }

      /*
       * IDs of people already assigned to this expedition.
       * These people should NOT appear in the dropdown.
       */
      const assignedUserIds = assignments.map(
        (assignment) => assignment.person?.id
      );

      const available = personnel.filter(
        (person) =>
          !assignedUserIds.includes(person.id)
      );

      if (available.length === 0) {
        setAvailablePersonnel([]);

        setAssignError(
          "All available personnel are already assigned to this expedition."
        );

        return;
      }

      setAvailablePersonnel(available);

      /*
       * Select the first person only as the initial
       * dropdown value.
       * Nothing is assigned automatically.
       */
      setSelectedPersonId(available[0].id);

      setSelectedAppointment(
        "expedition_member"
      );

      setSelectedStationId("");

      setShowAssignmentForm(true);
    } catch (error) {
      setAssignError(
        error.message ||
          "Failed to load available personnel"
      );
    }
  }

  /* ================= ASSIGN PERSON ================= */

  async function handleAssignPersonnel() {
    if (!selectedExpedition) {
      setAssignError("No expedition selected.");
      return;
    }

    if (!selectedPersonId) {
      setAssignError("Please select a person.");
      return;
    }

    try {
      setAssigningPerson(true);
      setAssignError("");

      await assignPersonToExpedition(
        selectedExpedition.id,
        {
          user_id: selectedPersonId,

          appointment_type:
            selectedAppointment,

          station_id:
            selectedStationId || null,

          start_date:
            selectedExpedition.start_date || null,

          end_date:
            selectedExpedition.end_date || null,

          authority_scope:
            selectedAppointment ===
            "station_leader"
              ? "station_operations"
              : selectedAppointment ===
                "voyage_leader"
              ? "expedition_voyage"
              : "expedition",

          notes:
            "Assigned through POLAROPS",
        }
      );

      /*
       * Reload assignments immediately after
       * successful assignment.
       */
      const updatedAssignments =
        await getExpeditionAssignments(
          selectedExpedition.id
        );

      setAssignments(
        Array.isArray(updatedAssignments)
          ? updatedAssignments
          : []
      );

      /*
       * Close form after successful assignment.
       */
      setShowAssignmentForm(false);

      setSelectedPersonId("");
      setSelectedStationId("");

      alert("Personnel assigned successfully");
    } catch (error) {
      setAssignError(
        error.message ||
          "Failed to assign personnel"
      );
    } finally {
      setAssigningPerson(false);
    }
  }

  /* ================= TIMELINE ================= */

  const timeline = [
    ["Planning & Preparation", "Awaiting dates"],
    ["Expedition", "Awaiting dates"],
    ["Transit to Antarctica", "Awaiting dates"],
    ["Station Operations", "Awaiting dates"],
    ["Return & Demobilisation", "Awaiting dates"],
  ];

  return (
    <main className="page">

      <Hero
        eyebrow="INDIAN ANTARCTIC EXPEDITION"
        title="Expedition Planning (Mission)"
        subtitle="Plan. Prepare. Execute."
      />

      {/* ================= CREATE EXPEDITION FORM ================= */}

      {showCreateExpedition && (
        <Card>
          <SectionTitle
            title="Create Expedition"
            right="New Expedition"
          />

          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            <input
              type="text"
              placeholder="Expedition Code"
              id="expedition-code"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #334155",
                background: "#111827",
                color: "white",
              }}
            />

            <input
              type="text"
              placeholder="Expedition Name"
              id="expedition-name"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #334155",
                background: "#111827",
                color: "white",
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "14px",
              }}
            >
              <input
                type="date"
                id="expedition-start-date"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  borderRadius: "10px",
                  border:
                    "1px solid #334155",
                  background: "#111827",
                  color: "white",
                }}
              />

              <input
                type="date"
                id="expedition-end-date"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  borderRadius: "10px",
                  border:
                    "1px solid #334155",
                  background: "#111827",
                  color: "white",
                }}
              />
            </div>

            <select
              id="expedition-status"
              defaultValue="planning"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "10px",
                border:
                  "1px solid #334155",
                background: "#111827",
                color: "white",
              }}
            >
              <option value="planning">
                Planning
              </option>

              <option value="preparation">
                Preparation
              </option>

              <option value="active">
                Active
              </option>
            </select>

            <textarea
              placeholder="Expedition description"
              id="expedition-description"
              rows="4"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "10px",
                border:
                  "1px solid #334155",
                background: "#111827",
                color: "white",
                resize: "vertical",
              }}
            />

            {createError && (
              <div
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background:
                    "rgba(239,68,68,0.12)",
                  color: "#fca5a5",
                  fontSize: "14px",
                }}
              >
                {createError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setShowCreateExpedition(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleCreateExpedition
                }
                disabled={
                  creatingExpedition
                }
              >
                {creatingExpedition
                  ? "Creating..."
                  : "Create Expedition"}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ================= CREATE BUTTON ================= */}

      {[
        "programme_admin",
        "operations_director",
      ].includes(currentUser?.role) && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "18px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setShowCreateExpedition(true)
            }
            style={{
              padding: "11px 18px",
              borderRadius: "10px",
              border:
                "1px solid rgba(255,255,255,0.12)",
              background: "#2563eb",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Create Expedition
          </button>
        </div>
      )}

      {/* ================= PLANNED EXPEDITIONS ================= */}

      <Card>
        <SectionTitle
          title="Planned Expeditions"
          right={`${expeditions.length} Total`}
        />

        {loadingExpeditions && (
          <div
            style={{
              color: "#94a3b8",
              padding: "20px 0",
            }}
          >
            Loading expeditions...
          </div>
        )}

        {expeditionError && (
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background:
                "rgba(239,68,68,0.12)",
              color: "#fca5a5",
              marginBottom: "12px",
            }}
          >
            {expeditionError}
          </div>
        )}

        {!loadingExpeditions &&
          !expeditionError &&
          expeditions.length === 0 && (
            <div
              style={{
                padding: "25px 0",
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              No expeditions have been
              created yet.
            </div>
          )}

        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {expeditions.map(
            (expedition) => (
              <div
                key={expedition.id}
                onClick={() =>
                  setSelectedExpedition(
                    expedition
                  )
                }
                style={{
                  padding: "16px",
                  borderRadius: "12px",

                  border:
                    selectedExpedition?.id ===
                    expedition.id
                      ? "1px solid #2563eb"
                      : "1px solid rgba(255,255,255,0.08)",

                  background:
                    selectedExpedition?.id ===
                    expedition.id
                      ? "rgba(37,99,235,0.12)"
                      : "rgba(255,255,255,0.03)",

                  cursor: "pointer",
                  transition:
                    "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: "15px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#60a5fa",
                        fontWeight: 600,
                        marginBottom:
                          "5px",
                      }}
                    >
                      {
                        expedition.expedition_code
                      }
                    </div>

                    <h3
                      style={{
                        margin:
                          "0 0 6px",
                        color: "white",
                      }}
                    >
                      {
                        expedition.expedition_name
                      }
                    </h3>

                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      {expedition.start_date ||
                        "Start date not set"}

                      {" → "}

                      {expedition.end_date ||
                        "End date not set"}
                    </div>
                  </div>

                  <Badge type="blue">
                    {expedition.status}
                  </Badge>
                </div>

                {expedition.description && (
                  <p
                    style={{
                      margin:
                        "12px 0 0",
                      color: "#cbd5e1",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    {
                      expedition.description
                    }
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </Card>

      {/* ================= SELECTED EXPEDITION ================= */}

      {selectedExpedition && (
        <Card>
          <SectionTitle
            title="Selected Expedition"
            right={
              selectedExpedition.expedition_code
            }
          />

          <div className="details">
            <p>
              <span>Expedition</span>

              <b>
                {
                  selectedExpedition.expedition_name
                }
              </b>
            </p>

            <p>
              <span>Status</span>

              <b>
                {
                  selectedExpedition.status
                }
              </b>
            </p>

            <p>
              <span>Start Date</span>

              <b>
                {
                  selectedExpedition.start_date ||
                  "—"
                }
              </b>
            </p>

            <p>
              <span>End Date</span>

              <b>
                {
                  selectedExpedition.end_date ||
                  "—"
                }
              </b>
            </p>
          </div>

          {selectedExpedition.description && (
            <p
              style={{
                marginTop: "15px",
                color: "#cbd5e1",
                lineHeight: 1.6,
              }}
            >
              {
                selectedExpedition.description
              }
            </p>
          )}

          {/* ================= PERSONNEL ASSIGNMENT ================= */}

          <div
            style={{
              marginTop: "22px",
              paddingTop: "20px",
              borderTop:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "14px",
                gap: "15px",
              }}
            >
              <div>
                <h4
                  style={{
                    margin: 0,
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  Personnel Assignment
                </h4>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#94a3b8",
                    fontSize: "13px",
                  }}
                >
                  Assign personnel to
                  this expedition.
                </p>
              </div>

              {[
                "programme_admin",
                "operations_director",
                "expedition_logistics",
              ].includes(
                currentUser?.role
              ) && (
                <button
                  type="button"
                  onClick={
                    handleOpenAssignmentForm
                  }
                  style={{
                    padding:
                      "10px 16px",
                    borderRadius:
                      "9px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background:
                      showAssignmentForm
                        ? "#334155"
                        : "#2563eb",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {showAssignmentForm
                    ? "Cancel Assignment"
                    : "+ Assign Personnel"}
                </button>
              )}
            </div>

            {/* ================= ASSIGNMENT FORM ================= */}

            {showAssignmentForm && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "18px",
                  borderRadius: "12px",
                  border:
                    "1px solid rgba(37,99,235,0.35)",
                  background:
                    "rgba(37,99,235,0.06)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                  }}
                >
                  {/* PERSON */}

                  <div>
                    <label
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "7px",
                        color:
                          "#cbd5e1",
                        fontSize:
                          "13px",
                        fontWeight: 600,
                      }}
                    >
                      Select Personnel
                    </label>

                    <select
                      value={
                        selectedPersonId
                      }
                      onChange={(e) =>
                        setSelectedPersonId(
                          e.target.value
                        )
                      }
                      style={{
                        width: "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "12px",
                        borderRadius:
                          "9px",
                        border:
                          "1px solid #334155",
                        background:
                          "#111827",
                        color:
                          "white",
                        fontSize:
                          "14px",
                      }}
                    >
                      {availablePersonnel.map(
                        (person) => (
                          <option
                            key={
                              person.id
                            }
                            value={
                              person.id
                            }
                          >
                            {
                              person.full_name
                            }
                            {" — "}
                            {
                              person.personnel_type ||
                              "Personnel"
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* APPOINTMENT / TASK */}

                  <div>
                    <label
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "7px",
                        color:
                          "#cbd5e1",
                        fontSize:
                          "13px",
                        fontWeight: 600,
                      }}
                    >
                      Assignment / Task
                    </label>

                    <select
                      value={
                        selectedAppointment
                      }
                      onChange={(e) =>
                        setSelectedAppointment(
                          e.target.value
                        )
                      }
                      style={{
                        width: "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "12px",
                        borderRadius:
                          "9px",
                        border:
                          "1px solid #334155",
                        background:
                          "#111827",
                        color:
                          "white",
                        fontSize:
                          "14px",
                      }}
                    >
                      <option value="expedition_member">
                        Expedition Member
                      </option>

                      <option value="voyage_leader">
                        Voyage Leader
                      </option>

                      <option value="station_leader">
                        Station Leader
                      </option>

                      <option value="principal_investigator">
                        Principal Investigator
                      </option>
                    </select>
                  </div>

                  {/* STATION */}

                  {selectedAppointment ===
                    "station_leader" && (
                    <div>
                      <label
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "7px",
                          color:
                            "#cbd5e1",
                          fontSize:
                            "13px",
                          fontWeight: 600,
                        }}
                      >
                        Station
                      </label>

                      <select
                        value={
                          selectedStationId
                        }
                        onChange={(e) =>
                          setSelectedStationId(
                            e.target.value
                          )
                        }
                        style={{
                          width: "100%",
                          boxSizing:
                            "border-box",
                          padding:
                            "12px",
                          borderRadius:
                            "9px",
                          border:
                            "1px solid #334155",
                          background:
                            "#111827",
                          color:
                            "white",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select station
                        </option>

                        <option value="maitri">
                          Maitri Station
                        </option>

                        <option value="bharati">
                          Bharati Station
                        </option>
                      </select>
                    </div>
                  )}

                  {/* ERROR */}

                  {assignError && (
                    <div
                      style={{
                        padding:
                          "10px",
                        borderRadius:
                          "8px",
                        background:
                          "rgba(239,68,68,0.12)",
                        color:
                          "#fca5a5",
                        fontSize:
                          "13px",
                      }}
                    >
                      {assignError}
                    </div>
                  )}

                  {/* ACTIONS */}

                  <div
                    style={{
                      display:
                        "flex",
                      gap: "10px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={
                        handleAssignPersonnel
                      }
                      disabled={
                        assigningPerson ||
                        !selectedPersonId
                      }
                      style={{
                        padding:
                          "10px 17px",
                        borderRadius:
                          "9px",
                        border:
                          "1px solid rgba(255,255,255,0.12)",
                        background:
                          assigningPerson
                            ? "#475569"
                            : "#2563eb",
                        color:
                          "white",
                        fontWeight: 600,
                        cursor:
                          assigningPerson
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {assigningPerson
                        ? "Assigning..."
                        : "Assign Personnel"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAssignmentForm(
                          false
                        );
                        setAssignError("");
                      }}
                      style={{
                        padding:
                          "10px 17px",
                        borderRadius:
                          "9px",
                        border:
                          "1px solid rgba(255,255,255,0.12)",
                        background:
                          "transparent",
                        color:
                          "#cbd5e1",
                        fontWeight: 600,
                        cursor:
                          "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= ASSIGNED PERSONNEL ================= */}

            <div
              style={{
                marginTop: "20px",
              }}
            >
              <h4
                style={{
                  margin:
                    "0 0 12px",
                  color: "white",
                  fontSize: "15px",
                }}
              >
                Assigned Personnel
              </h4>

              {loadingAssignments && (
                <div
                  style={{
                    color:
                      "#94a3b8",
                    fontSize:
                      "14px",
                    padding:
                      "10px 0",
                  }}
                >
                  Loading assigned
                  personnel...
                </div>
              )}

              {assignmentError && (
                <div
                  style={{
                    padding:
                      "10px",
                    borderRadius:
                      "8px",
                    background:
                      "rgba(239,68,68,0.12)",
                    color:
                      "#fca5a5",
                    fontSize:
                      "14px",
                  }}
                >
                  {assignmentError}
                </div>
              )}

              {!loadingAssignments &&
                !assignmentError &&
                assignments.length ===
                  0 && (
                  <div
                    style={{
                      color:
                        "#64748b",
                      fontSize:
                        "14px",
                      padding:
                        "10px 0",
                    }}
                  >
                    No personnel
                    assigned to
                    this expedition
                    yet.
                  </div>
                )}

              {/* 
               * Deduplicate the visual list.
               * This protects the UI from showing the
               * same person twice if duplicate records
               * already exist in the database.
               */}

              {!loadingAssignments &&
                !assignmentError && (
                  <div
                    style={{
                      display:
                        "grid",
                      gap: "10px",
                    }}
                  >
                    {Array.from(
                      new Map(
                        assignments.map(
                          (assignment) => [
                            `${
                              assignment.person?.id
                            }-${
                              assignment.appointment_type
                            }`,
                            assignment,
                          ]
                        )
                      ).values()
                    ).map(
                      (assignment) => (
                        <div
                          key={
                            assignment.assignment_id
                          }
                          style={{
                            padding:
                              "14px",
                            borderRadius:
                              "10px",
                            border:
                              "1px solid rgba(255,255,255,0.08)",
                            background:
                              "rgba(255,255,255,0.025)",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "flex-start",
                              gap: "12px",
                            }}
                          >
                            <div>
                              <strong
                                style={{
                                  color:
                                    "white",
                                  fontSize:
                                    "15px",
                                }}
                              >
                                {
                                  assignment
                                    .person
                                    ?.full_name
                                }
                              </strong>

                              <div
                                style={{
                                  color:
                                    "#94a3b8",
                                  fontSize:
                                    "13px",
                                  marginTop:
                                    "4px",
                                }}
                              >
                                {
                                  assignment
                                    .person
                                    ?.email
                                }
                              </div>
                            </div>

                            <Badge type="blue">
                              {assignment.appointment_type
                                ?.replaceAll(
                                  "_",
                                  " "
                                )}
                            </Badge>
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              flexWrap:
                                "wrap",
                              gap: "8px",
                              marginTop:
                                "10px",
                            }}
                          >
                            <span
                              style={{
                                padding:
                                  "5px 9px",
                                borderRadius:
                                  "6px",
                                background:
                                  "rgba(255,255,255,0.05)",
                                color:
                                  "#cbd5e1",
                                fontSize:
                                  "12px",
                              }}
                            >
                              {assignment
                                .person
                                ?.personnel_type ||
                                "Personnel"}
                            </span>

                            {assignment.station && (
                              <span
                                style={{
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "6px",
                                  background:
                                    "rgba(255,255,255,0.05)",
                                  color:
                                    "#cbd5e1",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                {
                                  assignment
                                    .station
                                    .name
                                }
                              </span>
                            )}

                            {assignment.authority_scope && (
                              <span
                                style={{
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "6px",
                                  background:
                                    "rgba(37,99,235,0.12)",
                                  color:
                                    "#93c5fd",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                {assignment.authority_scope.replaceAll(
                                  "_",
                                  " "
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          </div>
        </Card>
      )}

      {/* ================= EXISTING MISSION CONTENT ================= */}

      <div className="planning-grid">
        <Card>
          <SectionTitle
            title="Mission Overview"
            right="Edit"
          />

          <div className="details">
            <p>
              <span>Mission Name</span>
              <b>Indian Antarctic Expedition</b>
            </p>

            <p>
              <span>Start Date</span>
              <b>—</b>
            </p>

            <p>
              <span>End Date</span>
              <b>—</b>
            </p>

            <p>
              <span>Duration</span>
              <b>—</b>
            </p>
          </div>

          <h4 className="subhead">
            Key Objectives
          </h4>

          <div className="check">
            ✓ Scientific research
          </div>

          <div className="check">
            ✓ Station operations
          </div>

          <div className="check">
            ✓ Environmental monitoring
          </div>

          <div className="check">
            ✓ Safe personnel deployment
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Expedition Timeline"
          />

          <div className="vertical">
            {timeline.map(
              ([title, date]) => (
                <div
                  className="v-row"
                  key={title}
                >
                  <span className="v-dot blue" />

                  <div>
                    <strong>
                      {title}
                    </strong>

                    <small>
                      {date}
                    </small>
                  </div>

                  <Badge type="blue">
                    Awaiting status
                  </Badge>
                </div>
              )
            )}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle
          title="Expedition Route"
        />

        <MapVisual />

        <div className="mini-stats">
          <Mini
            icon={<Users />}
            title="Personnel"
          />

          <Mini
            icon={<Package />}
            title="Cargo"
          />

          <Mini
            icon={<Wrench />}
            title="Assets"
          />
        </div>
      </Card>
    </main>
  );
}

function Mini({ icon, title }) {
  return (
    <div className="mini">
      {icon}

      <div>
        <span>{title}</span>
        <b>—</b>
      </div>
    </div>
  );
}

/* ================= CARGO ================= */

function Cargo() {
  const user = getStoredUser();

  const [activeCargoTab, setActiveCargoTab] =
    useState("Live Tracking");

  const canManageCargo = [
    "programme_admin",
    "operations_director",
    "expedition_logistics",
  ].includes(user?.role);

  /* ================= EXPEDITION STATE ================= */

  const [expeditions, setExpeditions] = useState([]);
  const [loadingExpeditions, setLoadingExpeditions] =
    useState(true);
  const [selectedExpeditionId, setSelectedExpeditionId] =
    useState("");

  /* ================= CARGO STATE ================= */

  const [cargoItems, setCargoItems] = useState([]);
  const [loadingCargo, setLoadingCargo] =
    useState(true);
  const [cargoError, setCargoError] =
    useState("");

  const [selectedCargo, setSelectedCargo] =
    useState(null);

  const [showCreateCargo, setShowCreateCargo] =
    useState(false);

  const [creatingCargo, setCreatingCargo] =
    useState(false);

  const [createCargoError, setCreateCargoError] =
    useState("");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  /* ================= LOAD EXPEDITIONS ================= */

  async function loadExpeditions() {
    try {
      setLoadingExpeditions(true);

      const data = await getExpeditions();

      const expeditionList =
        Array.isArray(data) ? data : [];

      setExpeditions(expeditionList);

      // Prefer ISEA-46 for the prototype
      const preferred =
        expeditionList.find(
          (expedition) =>
            expedition.expedition_code ===
            "ISEA-46"
        ) ||
        expeditionList.find(
          (expedition) =>
            expedition.status === "active"
        ) ||
        expeditionList.find(
          (expedition) =>
            expedition.status ===
            "preparation"
        ) ||
        expeditionList[0];

      if (preferred) {
        setSelectedExpeditionId(
          preferred.id
        );
      }
    } catch (error) {
      setCreateCargoError(
        error.message ||
          "Failed to load expeditions"
      );
    } finally {
      setLoadingExpeditions(false);
    }
  }

  /* ================= LOAD CARGO ================= */

  async function loadCargo() {
    try {
      setLoadingCargo(true);
      setCargoError("");

      const data = await getCargo();

      setCargoItems(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      setCargoError(
        error.message ||
          "Failed to load cargo"
      );
    } finally {
      setLoadingCargo(false);
    }
  }

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    loadExpeditions();
    loadCargo();
  }, []);

  /* ================= CREATE CARGO ================= */

  async function handleCreateCargo() {
    setCreateCargoError("");
    setCreatingCargo(true);

    try {
      await createCargo({
        expedition_id:
          selectedExpeditionId || null,

        cargo_code:
          document.getElementById(
            "cargo-code"
          ).value,

        cargo_name:
          document.getElementById(
            "cargo-name"
          ).value,

        cargo_type:
          document.getElementById(
            "cargo-type"
          ).value || null,

        quantity:
          Number(
            document.getElementById(
              "cargo-quantity"
            ).value
          ) || null,

        origin:
          document.getElementById(
            "cargo-origin"
          ).value || null,

        destination:
          document.getElementById(
            "cargo-destination"
          ).value || null,

        status:
          document.getElementById(
            "cargo-status"
          ).value,

        transport_mode:
          document.getElementById(
            "cargo-transport"
          ).value || null,

        eta:
          document.getElementById(
            "cargo-eta"
          ).value || null,
      });

      setShowCreateCargo(false);

      await loadCargo();

      alert("Cargo created successfully");
    } catch (error) {
      setCreateCargoError(
        error.message ||
          "Failed to create cargo"
      );
    } finally {
      setCreatingCargo(false);
    }
  }

  /* ================= STATUS UPDATE ================= */

  async function handleStatusChange(
    cargoId,
    newStatus
  ) {
    try {
      setUpdatingStatus(true);
      setCargoError("");

      await updateCargoStatus(
        cargoId,
        newStatus
      );

      await loadCargo();

      if (
        selectedCargo &&
        selectedCargo.id === cargoId
      ) {
        const updated =
          await getCargoById(cargoId);

        setSelectedCargo(updated);
      }
    } catch (error) {
      setCargoError(
        error.message ||
          "Failed to update cargo status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  /* ================= STATS ================= */

  const totalCargo =
    cargoItems.length;

  const inTransit =
    cargoItems.filter(
      (cargo) =>
        cargo.status === "in_transit"
    ).length;

  const delivered =
    cargoItems.filter(
      (cargo) =>
        cargo.status === "delivered"
    ).length;

  const delayed =
    cargoItems.filter(
      (cargo) =>
        cargo.status === "delayed"
    ).length;

  return (
    <main className="page">
      <Hero
        eyebrow="LOGISTICS OPERATIONS"
        title="Cargo Tracking"
        subtitle="Track today. Deliver tomorrow."
      />

      {/* ================= STATS ================= */}

      <div className="stats four">
        <Stat
          icon={<Package />}
          title="Total Cargo"
          text={`${totalCargo} shipments`}
        />

        <Stat
          icon={<Ship />}
          title="In Transit"
          text={`${inTransit} shipments`}
        />

        <Stat
          icon={<CheckCircle2 />}
          color="green"
          title="Delivered"
          text={`${delivered} shipments`}
        />

        <Stat
          icon={<TriangleAlert />}
          color="red"
          title="Delayed"
          text={`${delayed} shipments`}
        />
      </div>

      {/* ================= CREATE CARGO ================= */}

      {canManageCargo && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "18px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setCreateCargoError("");
              setShowCreateCargo(
                !showCreateCargo
              );
            }}
            style={{
              padding: "11px 18px",
              borderRadius: "10px",
              border:
                "1px solid rgba(255,255,255,0.12)",
              background: showCreateCargo
                ? "#334155"
                : "#2563eb",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {showCreateCargo
              ? "Cancel"
              : "+ Add Cargo"}
          </button>
        </div>
      )}

      {showCreateCargo &&
        canManageCargo && (
          <Card>
            <SectionTitle
              title="Create Cargo Shipment"
            />

            <div
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              {/* ================= EXPEDITION ================= */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#cbd5e1",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Expedition
                </label>

                <select
                  value={
                    selectedExpeditionId
                  }
                  onChange={(e) =>
                    setSelectedExpeditionId(
                      e.target.value
                    )
                  }
                  disabled={
                    loadingExpeditions
                  }
                  style={cargoInputStyle}
                >
                  <option value="">
                    {loadingExpeditions
                      ? "Loading expeditions..."
                      : "Select Expedition"}
                  </option>

                  {expeditions.map(
                    (expedition) => (
                      <option
                        key={expedition.id}
                        value={
                          expedition.id
                        }
                      >
                        {
                          expedition.expedition_code
                        }{" "}
                        —{" "}
                        {
                          expedition.expedition_name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* ================= CODE + NAME ================= */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "14px",
                }}
              >
                <input
                  id="cargo-code"
                  placeholder="Cargo Code"
                  style={cargoInputStyle}
                />

                <input
                  id="cargo-name"
                  placeholder="Cargo Name"
                  style={cargoInputStyle}
                />
              </div>

              {/* ================= TYPE + QUANTITY ================= */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "14px",
                }}
              >
                <input
                  id="cargo-type"
                  placeholder="Cargo Type"
                  style={cargoInputStyle}
                />

                <input
                  id="cargo-quantity"
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  style={cargoInputStyle}
                />
              </div>

              {/* ================= ORIGIN + DESTINATION ================= */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "14px",
                }}
              >
                <input
                  id="cargo-origin"
                  placeholder="Origin"
                  style={cargoInputStyle}
                />

                <input
                  id="cargo-destination"
                  placeholder="Destination"
                  style={cargoInputStyle}
                />
              </div>

              {/* ================= STATUS + TRANSPORT ================= */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "14px",
                }}
              >
                <select
                  id="cargo-status"
                  defaultValue="preparing"
                  style={cargoInputStyle}
                >
                  <option value="preparing">
                    Preparing
                  </option>

                  <option value="in_transit">
                    In Transit
                  </option>

                  <option value="delivered">
                    Delivered
                  </option>

                  <option value="delayed">
                    Delayed
                  </option>
                </select>

                <select
                  id="cargo-transport"
                  defaultValue="ship"
                  style={cargoInputStyle}
                >
                  <option value="ship">
                    Ship
                  </option>

                  <option value="aircraft">
                    Aircraft
                  </option>

                  <option value="truck">
                    Truck
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              {/* ================= ETA ================= */}

              <input
                id="cargo-eta"
                type="datetime-local"
                style={cargoInputStyle}
              />

              {/* ================= ERROR ================= */}

              {createCargoError && (
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    background:
                      "rgba(239,68,68,0.12)",
                    color: "#fca5a5",
                    fontSize: "14px",
                  }}
                >
                  {createCargoError}
                </div>
              )}

              {/* ================= CREATE BUTTON ================= */}

              <div>
                <button
                  type="button"
                  onClick={
                    handleCreateCargo
                  }
                  disabled={
                    creatingCargo ||
                    loadingExpeditions
                  }
                  style={{
                    padding: "10px 17px",
                    borderRadius: "9px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background:
                      creatingCargo ||
                      loadingExpeditions
                        ? "#475569"
                        : "#2563eb",
                    color: "white",
                    fontWeight: 600,
                    cursor:
                      creatingCargo ||
                      loadingExpeditions
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {creatingCargo
                    ? "Creating..."
                    : "Create Cargo"}
                </button>
              </div>
            </div>
          </Card>
        )}

      {/* ================= ERROR ================= */}

      {cargoError && (
        <div
          style={{
            padding: "12px",
            borderRadius: "10px",
            background:
              "rgba(239,68,68,0.12)",
            color: "#fca5a5",
            marginBottom: "16px",
          }}
        >
          {cargoError}
        </div>
      )}

      {/* ================= TABS ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(140px, 1fr))",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            name: "Live Tracking",
            icon: <Ship size={17} />,
            description:
              "Monitor cargo movement",
          },
          {
            name: "Cargo List",
            icon: <Package size={17} />,
            description:
              "View all cargo",
          },
          {
            name: "Shipments",
            icon: <Ship size={17} />,
            description:
              "Manage shipments",
          },
          {
            name: "Routes",
            icon: <Ship size={17} />,
            description:
              "View cargo routes",
          },
        ].map((tab) => {
          const active =
            activeCargoTab ===
            tab.name;

          return (
            <button
              key={tab.name}
              type="button"
              onClick={() =>
                setActiveCargoTab(
                  tab.name
                )
              }
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                minHeight: "68px",
                textAlign: "left",
                borderRadius: "12px",
                border: active
                  ? "1px solid rgba(59,130,246,0.45)"
                  : "1px solid rgba(148,163,184,0.10)",
                background: active
                  ? "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(15,23,42,0.72))"
                  : "rgba(15,23,42,0.45)",
                color: "#ffffff",
                cursor: "pointer",
                transition:
                  "all 0.2s ease",
                boxShadow: active
                  ? "0 6px 18px rgba(37,99,235,0.10)"
                  : "none",
                overflow: "hidden",
              }}
            >
              {active && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "12px",
                    bottom: "12px",
                    width: "3px",
                    borderRadius:
                      "0 4px 4px 0",
                    background:
                      "#3b82f6",
                  }}
                />
              )}

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  width: "36px",
                  height: "36px",
                  flexShrink: 0,
                  borderRadius: "9px",
                  background: active
                    ? "rgba(37,99,235,0.18)"
                    : "rgba(148,163,184,0.07)",
                  border: active
                    ? "1px solid rgba(59,130,246,0.18)"
                    : "1px solid rgba(148,163,184,0.08)",
                  color: active
                    ? "#60a5fa"
                    : "#94a3b8",
                }}
              >
                {tab.icon}
              </div>

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 650,
                    color: active
                      ? "#f8fafc"
                      : "#cbd5e1",
                    marginBottom: "3px",
                  }}
                >
                  {tab.name}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    whiteSpace:
                      "nowrap",
                    overflow:
                      "hidden",
                    textOverflow:
                      "ellipsis",
                  }}
                >
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ================= LIVE TRACKING ================= */}

      {activeCargoTab ===
        "Live Tracking" && (
        <>
          <div className="two-col">
            <Card>
              <SectionTitle
                title="Cargo Movement Map"
              />
              <MapVisual />
            </Card>

            <Card>
              <SectionTitle
                title="Shipment Details"
              />

              {!selectedCargo ? (
                <EmptyState
                  icon={
                    <Ship size={22} />
                  }
                  title="No cargo selected"
                  text="Select a shipment below to view its details."
                />
              ) : (
                <div className="details">
                  <p>
                    <span>
                      Cargo Code
                    </span>
                    <b>
                      {
                        selectedCargo.cargo_code
                      }
                    </b>
                  </p>

                  <p>
                    <span>
                      Cargo
                    </span>
                    <b>
                      {
                        selectedCargo.cargo_name
                      }
                    </b>
                  </p>

                  <p>
                    <span>
                      Route
                    </span>
                    <b>
                      {
                        selectedCargo.origin ||
                        "—"
                      }{" "}
                      →{" "}
                      {
                        selectedCargo.destination ||
                        "—"
                      }
                    </b>
                  </p>

                  <p>
                    <span>
                      Transport
                    </span>
                    <b>
                      {
                        selectedCargo.transport_mode ||
                        "—"
                      }
                    </b>
                  </p>

                  <p>
                    <span>
                      Status
                    </span>
                    <Badge type="blue">
                      {
                        selectedCargo.status
                      }
                    </Badge>
                  </p>

                  <p>
                    <span>
                      ETA
                    </span>
                    <b>
                      {
                        selectedCargo.eta ||
                        "—"
                      }
                    </b>
                  </p>

                  {canManageCargo && (
                    <div
                      style={{
                        marginTop:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "7px",
                          color:
                            "#cbd5e1",
                          fontSize:
                            "13px",
                          fontWeight:
                            600,
                        }}
                      >
                        Update Status
                      </label>

                      <select
                        value={
                          selectedCargo.status ||
                          "preparing"
                        }
                        disabled={
                          updatingStatus
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            selectedCargo.id,
                            e.target.value
                          )
                        }
                        style={{
                          ...cargoInputStyle,
                          width:
                            "100%",
                        }}
                      >
                        <option value="preparing">
                          Preparing
                        </option>

                        <option value="in_transit">
                          In Transit
                        </option>

                        <option value="delivered">
                          Delivered
                        </option>

                        <option value="delayed">
                          Delayed
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* ================= RECENT SHIPMENTS ================= */}

          <Card>
            <SectionTitle
              title="Recent Shipments"
              right={`${cargoItems.length} Total`}
            />

            {loadingCargo ? (
              <div
                style={{
                  padding:
                    "20px 0",
                  color:
                    "#94a3b8",
                }}
              >
                Loading cargo...
              </div>
            ) : cargoItems.length ===
              0 ? (
              <EmptyState
                icon={
                  <Package size={22} />
                }
                title="No cargo available"
                text="Create a cargo shipment to begin tracking."
              />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>
                        Cargo
                      </th>
                      <th>
                        From → To
                      </th>
                      <th>
                        Status
                      </th>
                      <th>
                        ETA / Delivered
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargoItems.map(
                      (cargo) => (
                        <tr
                          key={
                            cargo.id
                          }
                          onClick={() =>
                            setSelectedCargo(
                              cargo
                            )
                          }
                          style={{
                            cursor:
                              "pointer",
                          }}
                        >
                          <td>
                            <strong>
                              {
                                cargo.cargo_code
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              cargo.cargo_name
                            }
                          </td>

                          <td>
                            {
                              cargo.origin ||
                              "—"
                            }{" "}
                            →{" "}
                            {
                              cargo.destination ||
                              "—"
                            }
                          </td>

                          <td>
                            <Badge
                              type={
                                cargo.status ===
                                "delivered"
                                  ? "green"
                                  : cargo.status ===
                                    "delayed"
                                  ? "red"
                                  : "blue"
                              }
                            >
                              {
                                cargo.status
                              }
                            </Badge>
                          </td>

                          <td>
                            {
                              cargo.delivered_at ||
                              cargo.eta ||
                              "—"
                            }
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* ================= CARGO LIST ================= */}

      {activeCargoTab ===
        "Cargo List" && (
        <Card>
          <SectionTitle
            title="Cargo Inventory"
            right={`${cargoItems.length} Total`}
          />

          {loadingCargo ? (
            <div
              style={{
                padding:
                  "20px 0",
                color:
                  "#94a3b8",
              }}
            >
              Loading cargo...
            </div>
          ) : cargoItems.length ===
            0 ? (
            <EmptyState
              icon={
                <Package size={22} />
              }
              title="No cargo available"
              text="No cargo shipments have been created yet."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      Cargo Code
                    </th>
                    <th>
                      Cargo Name
                    </th>
                    <th>
                      Type
                    </th>
                    <th>
                      Quantity
                    </th>
                    <th>
                      Origin
                    </th>
                    <th>
                      Destination
                    </th>
                    <th>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {cargoItems.map(
                    (cargo) => (
                      <tr
                        key={
                          cargo.id
                        }
                        onClick={() =>
                          setSelectedCargo(
                            cargo
                          )
                        }
                        style={{
                          cursor:
                            "pointer",
                        }}
                      >
                        <td>
                          <strong>
                            {
                              cargo.cargo_code
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            cargo.cargo_name
                          }
                        </td>

                        <td>
                          {
                            cargo.cargo_type ||
                            "—"
                          }
                        </td>

                        <td>
                          {
                            cargo.quantity ||
                            "—"
                          }
                        </td>

                        <td>
                          {
                            cargo.origin ||
                            "—"
                          }
                        </td>

                        <td>
                          {
                            cargo.destination ||
                            "—"
                          }
                        </td>

                        <td>
                          <Badge
                            type={
                              cargo.status ===
                              "delivered"
                                ? "green"
                                : cargo.status ===
                                  "delayed"
                                ? "red"
                                : "blue"
                            }
                          >
                            {
                              cargo.status
                            }
                          </Badge>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ================= SHIPMENTS ================= */}

      {activeCargoTab ===
        "Shipments" && (
        <Card>
          <SectionTitle
            title="Shipment Management"
            right={`${cargoItems.length} Shipments`}
          />

          {cargoItems.length ===
          0 ? (
            <EmptyState
              icon={
                <Ship size={22} />
              }
              title="No shipments"
              text="Create cargo to begin shipment tracking."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      Shipment
                    </th>
                    <th>
                      Route
                    </th>
                    <th>
                      Transport
                    </th>
                    <th>
                      ETA
                    </th>
                    <th>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {cargoItems.map(
                    (cargo) => (
                      <tr
                        key={
                          cargo.id
                        }
                        onClick={() =>
                          setSelectedCargo(
                            cargo
                          )
                        }
                        style={{
                          cursor:
                            "pointer",
                        }}
                      >
                        <td>
                          <strong>
                            {
                              cargo.cargo_code
                            }
                          </strong>

                          <div
                            style={{
                              marginTop:
                                "4px",
                              color:
                                "#94a3b8",
                              fontSize:
                                "12px",
                            }}
                          >
                            {
                              cargo.cargo_name
                            }
                          </div>
                        </td>

                        <td>
                          {
                            cargo.origin ||
                            "—"
                          }{" "}
                          →{" "}
                          {
                            cargo.destination ||
                            "—"
                          }
                        </td>

                        <td>
                          {
                            cargo.transport_mode ||
                            "—"
                          }
                        </td>

                        <td>
                          {
                            cargo.eta ||
                            "—"
                          }
                        </td>

                        <td>
                          <Badge
                            type={
                              cargo.status ===
                              "delivered"
                                ? "green"
                                : cargo.status ===
                                  "delayed"
                                ? "red"
                                : "blue"
                            }
                          >
                            {
                              cargo.status
                            }
                          </Badge>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ================= ROUTES ================= */}

      {activeCargoTab ===
        "Routes" && (
        <Card>
          <SectionTitle
            title="Cargo Routes"
            right={`${cargoItems.length} Routes`}
          />

          {cargoItems.length ===
          0 ? (
            <EmptyState
              icon={
                <Ship size={22} />
              }
              title="No routes available"
              text="Cargo routes will appear here once shipments are created."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {cargoItems.map(
                (cargo) => (
                  <div
                    key={
                      cargo.id
                    }
                    onClick={() =>
                      setSelectedCargo(
                        cargo
                      )
                    }
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "minmax(120px, 0.8fr) minmax(180px, 1.4fr) minmax(100px, 0.6fr)",
                      gap: "16px",
                      alignItems:
                        "center",
                      padding:
                        "16px",
                      borderRadius:
                        "12px",
                      border:
                        "1px solid rgba(148,163,184,0.10)",
                      background:
                        "rgba(15,23,42,0.45)",
                      cursor:
                        "pointer",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#64748b",
                          marginBottom:
                            "4px",
                        }}
                      >
                        CARGO
                      </div>

                      <strong>
                        {
                          cargo.cargo_code
                        }
                      </strong>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#64748b",
                          marginBottom:
                            "4px",
                        }}
                      >
                        ROUTE
                      </div>

                      <span
                        style={{
                          color:
                            "#e2e8f0",
                        }}
                      >
                        {
                          cargo.origin ||
                          "—"
                        }{" "}
                        →{" "}
                        {
                          cargo.destination ||
                          "—"
                        }
                      </span>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#64748b",
                          marginBottom:
                            "4px",
                        }}
                      >
                        STATUS
                      </div>

                      <Badge
                        type={
                          cargo.status ===
                          "delivered"
                            ? "green"
                            : cargo.status ===
                              "delayed"
                            ? "red"
                            : "blue"
                        }
                      >
                        {
                          cargo.status
                        }
                      </Badge>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </Card>
      )}
    </main>
  );
}

/* ================= CARGO INPUT STYLE ================= */

const cargoInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#111827",
  color: "white",
};
/* ================= INVENTORY ================= */

function Inventory() {
  return (
    <main className="page">
      <Hero
  eyebrow="SUPPLY MANAGEMENT"
  title="Inventory Management"
  subtitle="Right supplies. Right place. Right time."
  status="IN DEVELOPMENT"
/>

      <div className="stats three">
        <Stat
          icon={<Boxes />}
          title="Total Items"
          text="Awaiting live data"
        />

        <Stat
          icon={<TriangleAlert />}
          color="yellow"
          title="Low Stock"
          text="Awaiting live data"
        />

        <Stat
          icon={<CircleAlert />}
          color="red"
          title="Out of Stock"
          text="Awaiting live data"
        />
      </div>

      <Tabs
        names={[
          "Overview",
          "Supplies",
          "Equipment",
          "Medical",
          "Station Stock",
        ]}
      />

      <div className="two-col">
        <Card>
          <SectionTitle title="Inventory Overview" />

          <div className="inventory-view">
            <div className="donut">
              <div>
                <b>—</b>
                <span>Total Items</span>
              </div>
            </div>

            <div className="legend">
              <p>
                🔵 Food Supplies <b>—</b>
              </p>

              <p>
                🟢 Fuel & Energy <b>—</b>
              </p>

              <p>
                🔴 Medical Supplies <b>—</b>
              </p>

              <p>
                🟡 Equipment <b>—</b>
              </p>

              <p>
                🟣 Station Supplies <b>—</b>
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Stock Alerts" />

          <EmptyState
            icon={<Boxes size={22} />}
            title="No inventory data"
            text="Connect the inventory source to populate stock alerts."
          />
        </Card>
      </div>

      <Card>
        <SectionTitle title="Recent Inventory Movements" />

        <Table
          headers={[
            "Date",
            "Item",
            "Type",
            "Quantity",
            "Location",
          ]}
          rows={[
            ["—", "—", "—", "—", "—"],
            ["—", "—", "—", "—", "—"],
            ["—", "—", "—", "—", "—"],
            ["—", "—", "—", "—", "—"],
          ]}
        />
      </Card>
    </main>
  );
}

/* ================= PERSONNEL ================= */

function Personnel() {
  return (
    <main className="page">
      <Hero
  eyebrow="PEOPLE OPERATIONS"
  title="Personnel Movement"
  subtitle="Track, manage and monitor expedition personnel across locations."
  status="IN DEVELOPMENT"
/>

      <div className="stats four">
        <Stat
          icon={<Users />}
          title="Total Personnel"
          text="Awaiting live data"
        />

        <Stat
          icon={<Database />}
          color="green"
          title="At Station"
          text="Awaiting live data"
        />

        <Stat
          icon={<Plane />}
          title="In Transit"
          text="Awaiting live data"
        />

        <Stat
          icon={<Clock3 />}
          color="yellow"
          title="On Leave"
          text="Awaiting live data"
        />
      </div>

      <div className="two-col personnel-layout">
        <Card>
          <SectionTitle title="Personnel List" />

          <div className="filter">
            <div className="small-search">
              <Search size={14} />
              Search by name, ID, role...
            </div>

            <button>All Roles⌄</button>
            <button>All Status⌄</button>
          </div>

          <Table
            headers={[
              "Name",
              "Role",
              "Current Location",
              "Status",
            ]}
            rows={[
              ["—", "—", "—", "Awaiting data"],
              ["—", "—", "—", "Awaiting data"],
              ["—", "—", "—", "Awaiting data"],
              ["—", "—", "—", "Awaiting data"],
              ["—", "—", "—", "Awaiting data"],
            ]}
          />
        </Card>

        <Card>
          <SectionTitle title="Movement Timeline" />

          <EmptyState
            icon={<Users size={22} />}
            title="No movement data"
            text="Personnel movement will populate when live data is connected."
          />

          <div className="quick">
            <button>View All Personnel</button>
            <button>Plan Movement</button>
            <button>Emergency Evacuation</button>
          </div>
        </Card>
      </div>
    </main>
  );
}

/* ================= EXPEDITION MAP ================= */

function ExpeditionMap() {
  return (
    <main className="page">
      <Hero
        eyebrow="LIVE OPERATIONS"
        title="Expedition Map"
        subtitle="Real-time view of stations, routes, assets and expedition locations."
        status="IN DEVELOPMENT"
      />

      <Tabs
        names={[
          "Stations",
          "Routes",
          "Assets",
          "Weather",
          "Layers",
        ]}
      />

      <div className="map-page-grid">
        <Card>
          <SectionTitle title="Antarctica Operations" />
          <MapVisual />
        </Card>

        <div className="stack">
          <Card>
            <SectionTitle title="Locations" />

            <Location
              name="Maitri Station"
              place="Schirmacher Oasis"
            />

            <Location
              name="Bharati Station"
              place="Larsemann Hills"
            />

            <Location
              name="NCPOOR"
              place="India"
            />
          </Card>

          <Card>
            <SectionTitle title="Live Weather" />

            <div className="weather-grid">
              <div>
                <Snowflake />
                <b>—</b>
                <span>
                  Maitri · Awaiting data
                </span>
              </div>

              <div>
                <ThermometerSnowflake />
                <b>—</b>
                <span>
                  Bharati · Awaiting data
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Active Assets" />

            <div className="assets">
              <div>
                <Ship />
                <b>—</b>
                <span>Ships</span>
              </div>

              <div>
                <Plane />
                <b>—</b>
                <span>Aircraft</span>
              </div>

              <div>
                <Truck />
                <b>—</b>
                <span>Vehicles</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Location({ name, place }) {
  return (
    <div className="location">
      <Navigation size={15} />

      <div>
        <b>{name}</b>
        <span>{place}</span>
      </div>

      <Badge type="blue">
        Live data
      </Badge>
    </div>
  );
}

/* ================= EMERGENCY ================= */

function Emergency() {
  const [emergencies, setEmergencies] = useState([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(true);
  const [emergencyError, setEmergencyError] = useState("");
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [creatingEmergency, setCreatingEmergency] = useState(false);
  const [createEmergencyError, setCreateEmergencyError] = useState("");
  const [emergencyResources, setEmergencyResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceError, setResourceError] = useState("");

  useEffect(() => {
    loadEmergencies();
  }, []);

  useEffect(() => {
    if (emergencies.length === 0) {
      setEmergencyResources([]);
      return;
    }

    loadEmergencyResources(emergencies[0].id);
  }, [emergencies]);

  async function loadEmergencies() {
    try {
      setLoadingEmergencies(true);
      setEmergencyError("");

      const data = await getEmergencies();

      console.log("EMERGENCIES FROM API:", data);

      setEmergencies(data);
    } catch (error) {
      console.error(
        "Failed to load emergencies:",
        error
      );

      setEmergencyError(
        error.message || "Failed to load emergency data"
      );
    } finally {
      setLoadingEmergencies(false);
    }
  }

  async function loadEmergencyResources(emergencyId) {
    try {
      setLoadingResources(true);
      setResourceError("");

      const data = await getEmergencyResources(emergencyId);

      setEmergencyResources(data.resources || []);
    } catch (error) {
      console.error(
        "Failed to load emergency resources:",
        error
      );

      setResourceError(
        error.message || "Failed to load emergency resources"
      );
    } finally {
      setLoadingResources(false);
    }
  }

  async function handleCreateEmergency(event) {
    event.preventDefault();

    try {
      setCreatingEmergency(true);
      setCreateEmergencyError("");

      const form = event.target;

      const emergencyData = {
        incident_code: form.incident_code.value.trim(),
        emergency_type: form.emergency_type.value,
        location: form.location.value.trim(),
        severity: form.severity.value,
        description: form.description.value.trim(),
      };

      await createEmergency(emergencyData);

      setShowEmergencyForm(false);

      await loadEmergencies();
    } catch (error) {
      console.error(
        "Failed to create emergency:",
        error
      );

      setCreateEmergencyError(
        error.message || "Failed to create emergency"
      );
    } finally {
      setCreatingEmergency(false);
    }
  }

  const activeEmergencies = emergencies.filter(
    (item) =>
      item.status !== "resolved" &&
      item.status !== "closed"
  ).length;

  const openIncidents = emergencies.filter(
    (item) => item.status === "open"
  ).length;

  const resolvedToday = emergencies.filter(
    (item) => item.status === "resolved"
  ).length;

  return (
    <main className="page">
      <Hero
        eyebrow="SAFETY & RESPONSE"
        title="Emergency Response"
        subtitle="Detect. Assess. Respond."
      />

      <div className="stats three">
        <Stat
          icon={<TriangleAlert />}
          color="red"
          title="Active Emergencies"
          text={
            loadingEmergencies
              ? "Loading..."
              : `${activeEmergencies} active incident${
                  activeEmergencies === 1 ? "" : "s"
                }`
          }
        />

        <Stat
          icon={<CircleAlert />}
          color="yellow"
          title="Open Incidents"
          text={
            loadingEmergencies
              ? "Loading..."
              : `${openIncidents} open incident${
                  openIncidents === 1 ? "" : "s"
                }`
          }
        />

        <Stat
          icon={<CheckCircle2 />}
          color="green"
          title="Resolved Today"
          text={
            loadingEmergencies
              ? "Loading..."
              : `${resolvedToday} resolved`
          }
        />
      </div>

      <div className="two-col">
        <Card>
          <SectionTitle title="Current Emergency" />

          {loadingEmergencies ? (
            <EmptyState
              icon={<ShieldAlert size={25} />}
              title="Loading emergency data"
              text="Fetching current incidents..."
            />
          ) : emergencyError ? (
            <EmptyState
              icon={<ShieldAlert size={25} />}
              title="Unable to load emergency data"
              text={emergencyError}
            />
          ) : emergencies.length === 0 ? (
            <EmptyState
              icon={<ShieldAlert size={25} />}
              title="No emergency data available"
              text="There are currently no recorded emergency incidents."
            />
          ) : (
            <div>
              {(() => {
                const currentEmergency = emergencies.find(
                  (item) =>
                    item.status !== "resolved" &&
                    item.status !== "closed"
                );

                if (!currentEmergency) {
                  return (
                    <EmptyState
                      icon={<CheckCircle2 size={25} />}
                      title="No active emergencies"
                      text="All recorded emergency incidents are currently resolved or closed."
                    />
                  );
                }

                return (
                  <div>
                    <b>{currentEmergency.incident_code}</b>

                    <p>
                      {currentEmergency.emergency_type}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {currentEmergency.location}
                    </p>

                    <p>
                      <strong>Severity:</strong>{" "}
                      {currentEmergency.severity}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {currentEmergency.status}
                    </p>

                    {currentEmergency.description && (
                      <p>
                        {currentEmergency.description}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {showEmergencyForm && (
            <form
              onSubmit={handleCreateEmergency}
              style={{
                marginBottom: "20px",
                padding: "18px",
                borderRadius: "12px",
                background: "rgba(15, 23, 42, 0.65)",
                border: "1px solid #334155",
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                Raise Emergency Alert
              </h3>

              {createEmergencyError && (
                <div
                  style={{
                    marginBottom: "14px",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(127, 29, 29, 0.35)",
                    color: "#fca5a5",
                  }}
                >
                  {createEmergencyError}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                <input
                  name="incident_code"
                  placeholder="Incident Code"
                  required
                  style={cargoInputStyle}
                />

                <select
                  name="emergency_type"
                  required
                  defaultValue=""
                  style={cargoInputStyle}
                >
                  <option value="" disabled>
                    Select Emergency Type
                  </option>

                  <option value="Medical Emergency">
                    Medical Emergency
                  </option>

                  <option value="Fire">
                    Fire
                  </option>

                  <option value="Equipment Failure">
                    Equipment Failure
                  </option>

                  <option value="Vehicle / Transport Incident">
                    Vehicle / Transport Incident
                  </option>

                  <option value="Severe Weather">
                    Severe Weather
                  </option>

                  <option value="Personnel Missing">
                    Personnel Missing
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

                <input
                  name="location"
                  placeholder="Location (e.g. Maitri Station)"
                  required
                  style={cargoInputStyle}
                />

                <select
                  name="severity"
                  defaultValue="medium"
                  style={cargoInputStyle}
                >
                  <option value="low">
                    Low Severity
                  </option>

                  <option value="medium">
                    Medium Severity
                  </option>

                  <option value="high">
                    High Severity
                  </option>

                  <option value="critical">
                    Critical Severity
                  </option>
                </select>

                <textarea
                  name="description"
                  placeholder="Describe the emergency..."
                  rows="4"
                  style={{
                    ...cargoInputStyle,
                    resize: "vertical",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="submit"
                    className="primary"
                    disabled={creatingEmergency}
                  >
                    {creatingEmergency
                      ? "Raising Alert..."
                      : "Submit Emergency Alert"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowEmergencyForm(false);
                      setCreateEmergencyError("");
                    }}
                    disabled={creatingEmergency}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="buttons">
            <button
              className="primary"
              onClick={() => {
                setShowEmergencyForm(true);
                setCreateEmergencyError("");
              }}
            >
              Raise Emergency Alert
            </button>

            <button>
              View Protocols
            </button>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Emergency Response Flow" />

          <div className="response">
            <ResponseStep title="Alert Received" />
            <ResponseStep title="Assessment" />
            <ResponseStep title="Team Notification" />
            <ResponseStep title="Response Planning" />
            <ResponseStep title="Resolution" />
          </div>
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <SectionTitle title="Recent Incidents" />

          {loadingEmergencies ? (
            <p>Loading recent incidents...</p>
          ) : emergencies.length === 0 ? (
            <p>No emergency incidents recorded.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px",
                      }}
                    >
                      Date
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px",
                      }}
                    >
                      Type
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px",
                      }}
                    >
                      Location
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {emergencies
                    .slice(0, 5)
                    .map((incident) => (
                      <tr key={incident.id}>
                        <td style={{ padding: "10px" }}>
                          {incident.created_at
                            ? new Date(
                                incident.created_at
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td style={{ padding: "10px" }}>
                          {incident.emergency_type || "—"}
                        </td>

                        <td style={{ padding: "10px" }}>
                          {incident.location || "—"}
                        </td>

                        <td style={{ padding: "10px" }}>
                          {incident.status
                            ? incident.status.replaceAll(
                                "_",
                                " "
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle title="Nearby Resources" />

          {loadingResources ? (
            <EmptyState
              icon={<Radio size={22} />}
              title="Loading resources"
              text="Finding available response personnel..."
            />
          ) : resourceError ? (
            <EmptyState
              icon={<Radio size={22} />}
              title="Unable to load resources"
              text={resourceError}
            />
          ) : emergencyResources.length === 0 ? (
            <EmptyState
              icon={<Radio size={22} />}
              title="No nearby resources"
              text="No relevant response personnel are currently available."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {emergencyResources.map((resource) => (
                <div
                  key={resource.id}
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1px solid #334155",
                    background:
                      "rgba(15, 23, 42, 0.55)",
                  }}
                >
                  <strong>{resource.name}</strong>

                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "13px",
                      opacity: 0.8,
                    }}
                  >
                    {resource.personnel_type
                      ?.replaceAll("_", " ")
                      .replace(
                        /\b\w/g,
                        (char) => char.toUpperCase()
                      )}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "13px",
                      opacity: 0.7,
                    }}
                  >
                    Station:{" "}
                    {resource.station || "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

function ResponseStep({ title }) {
  return (
    <div className="response-step">
      <div className="response-circle">
        <Activity size={15} />
      </div>

      <div>
        <b>{title}</b>
        <small>Awaiting live status</small>
      </div>
    </div>
  );
}
/* ================= ALERTS ================= */

function Alerts({
  notifications,
  setNotifications,
  loadingNotifications,
  notificationError,
  markNotificationAsRead,
}) {
  const criticalCount = notifications.filter(
    (notification) => notification.priority === "critical"
  ).length;

  const highCount = notifications.filter(
    (notification) => notification.priority === "high"
  ).length;

  const mediumCount = notifications.filter(
    (notification) => notification.priority === "medium"
  ).length;

  const lowCount = notifications.filter(
    (notification) => notification.priority === "low"
  ).length;

  async function handleNotificationClick(notificationId) {
  try {
    const data = await markNotificationAsRead(notificationId);

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              ...data.notification,
            }
          : notification
      )
    );
  } catch (error) {
    console.error(
      "Failed to mark notification as read:",
      error
    );
  }
}

  return (
    <main className="page">
      <Hero
        eyebrow="NOTIFICATIONS"
        title="Alerts / Notifications"
        subtitle="Stay informed. Stay prepared."
      />

      <div className="alert-summary">
        <div>
          <b>{criticalCount}</b>
          <span>Critical</span>
        </div>

        <div>
          <b>{highCount}</b>
          <span>High</span>
        </div>

        <div>
          <b>{mediumCount}</b>
          <span>Medium</span>
        </div>

        <div>
          <b>{lowCount}</b>
          <span>Low</span>
        </div>
      </div>

      <div className="two-col">
        <Card>
          <SectionTitle title="Recent Alerts" />

          {loadingNotifications ? (
            <EmptyState
              icon={<Bell size={22} />}
              title="Loading alerts"
              text="Fetching your latest notifications..."
            />
          ) : notificationError ? (
            <EmptyState
              icon={<Bell size={22} />}
              title="Unable to load alerts"
              text={notificationError}
            />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<Bell size={22} />}
              title="No alerts available"
              text="You currently have no emergency alerts."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {notifications.map((notification) => (
                <div
  key={notification.id}
  onClick={() =>
    handleNotificationClick(notification.id)
  }
  style={{
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "rgba(15, 23, 42, 0.55)",
    cursor: notification.is_read
      ? "default"
      : "pointer",
  }}
>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <strong>{notification.title}</strong>

                    <span
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      {notification.priority}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "7px",
                      fontSize: "13px",
                      opacity: 0.8,
                      lineHeight: 1.5,
                    }}
                  >
                    {notification.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="stack">
          <Card>
            <SectionTitle title="Filter & Search" />

            <div className="filter-panel">
              <div className="small-search">
                <Search size={14} />
                Search alerts...
              </div>

              <button>All Types⌄</button>
              <button>All Severities⌄</button>
              <button>Last 7 Days⌄</button>

              <button className="primary">
                Apply Filters
              </button>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Notification Feed" />

            {loadingNotifications ? (
              <EmptyState
                icon={<Activity size={22} />}
                title="Loading notifications"
                text="Fetching your notification feed..."
              />
            ) : notificationError ? (
              <EmptyState
                icon={<Activity size={22} />}
                title="Unable to load notifications"
                text={notificationError}
              />
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={<Activity size={22} />}
                title="No notifications"
                text="The notification feed is currently empty."
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #334155",
                    }}
                  >
                    <strong>{notification.title}</strong>

                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "13px",
                        opacity: 0.75,
                      }}
                    >
                      {notification.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

/* ================= HELPERS ================= */

function Tabs({ names }) {
  return (
    <div className="tabs">
      {names.map((name, index) => (
        <button
          key={name}
          className={
            index === 0
              ? "selected"
              : ""
          }
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map(
            (row, index) => (
              <tr key={index}>
                {row.map(
                  (
                    cell,
                    cellIndex
                  ) => (
                    <td
                      key={
                        cellIndex
                      }
                    >
                      {cell}
                    </td>
                  )
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;