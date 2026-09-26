import { useState } from "react";
import polarLoginBg from "../assets/polar-login-bg.png";
import { registerUser } from "../services/api";

const AUTHORIZED_DOMAINS = [
  "@polarops.gov.in",
  "@ops.polarops.gov.in",
  "@logistics.polarops.gov.in",
  "@science.polarops.gov.in",
  "@maitri.polarops.gov.in",
  "@bharati.polarops.gov.in",
];

export default function Register({ onRegister, onBackToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [station, setStation] = useState("");
  const [personnelType, setPersonnelType] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDomains, setShowDomains] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await registerUser({
        full_name: fullName,
        email,
        password,
        station,
        personnel_type: personnelType,
      });

      setSuccess("Registration successful. Please sign in to continue.");

      setFullName("");
      setEmail("");
      setPassword("");
      setStation("");
      setPersonnelType("");

      if (onRegister) {
        onRegister(data);
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        boxSizing: "border-box",
       backgroundImage:
  `linear-gradient(rgba(3, 14, 29, 0.68), rgba(3, 14, 29, 0.88)), url(${polarLoginBg})`,
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Prototype Badge */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          right: "28px",
          padding: "7px 12px",
          borderRadius: "8px",
          background: "rgba(8, 25, 42, 0.78)",
          border: "1px solid rgba(120, 190, 235, 0.22)",
          color: "#a9d8f5",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1.2px",
          backdropFilter: "blur(10px)",
        }}
      >
        SIH PROTOTYPE
      </div>

      {/* Registration Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "rgba(8, 22, 37, 0.88)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "20px",
          padding: "30px",
          boxSizing: "border-box",
          color: "white",
          backdropFilter: "blur(16px)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "22px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "#8fc5e8",
              letterSpacing: "2.5px",
              fontWeight: 600,
              marginBottom: "7px",
            }}
          >
            POLAROPS
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "27px",
              fontWeight: 700,
              letterSpacing: "-0.4px",
            }}
          >
            Create Account
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#9cafc0",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            Register for the polar expedition management system.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Full Name</label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "8px" }}>
            <label style={labelStyle}>Institutional Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@polarops.gov.in"
              required
              style={inputStyle}
            />
          </div>

          {/* Compact domain information */}
          <div
            style={{
              marginBottom: "15px",
              border: "1px solid rgba(120,190,235,0.13)",
              borderRadius: "9px",
              background: "rgba(80,150,200,0.045)",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setShowDomains(!showDomains)}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                color: "#8fb9d5",
                padding: "8px 11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              <span>
                ✓ Authorized prototype email domains
              </span>

              <span
                style={{
                  fontSize: "13px",
                  transform: showDomains
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "0.2s",
                }}
              >
                ▾
              </span>
            </button>

            {showDomains && (
              <div
                style={{
                  padding: "0 11px 10px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px",
                    paddingTop: "9px",
                  }}
                >
                  {AUTHORIZED_DOMAINS.map((domain) => (
                    <span
                      key={domain}
                      style={{
                        padding: "4px 7px",
                        borderRadius: "5px",
                        background: "rgba(255,255,255,0.045)",
                        color: "#94aabd",
                        fontSize: "10px",
                        fontFamily: "monospace",
                      }}
                    >
                      {domain}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "7px",
                    color: "#637b8f",
                    fontSize: "9px",
                  }}
                >
                  Prototype domains for SIH demonstration only.
                </div>
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              style={inputStyle}
            />
          </div>

          {/* Station */}
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Station / Assignment</label>

            <select
              value={station}
              onChange={(e) => setStation(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select assignment</option>
              <option value="headquarters">Headquarters</option>
              <option value="maitri">Maitri</option>
              <option value="bharati">Bharati</option>
              <option value="voyage">Voyage</option>
            </select>
          </div>

          {/* Personnel Type */}
          <div style={{ marginBottom: "19px" }}>
            <label style={labelStyle}>Personnel Type</label>

            <select
              value={personnelType}
              onChange={(e) => setPersonnelType(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select personnel type</option>
              <option value="scientist">Scientist</option>
              <option value="medical_officer">Medical Officer</option>
              <option value="engineer">Engineer</option>
              <option value="technician">Technician</option>
              <option value="logistics">Logistics</option>
              <option value="support_staff">Support Staff</option>
              <option value="crew">Crew</option>
              <option value="observer">Observer</option>
              <option value="administration">Administration</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: "14px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "rgba(220,60,60,0.10)",
                border: "1px solid rgba(220,60,60,0.22)",
                color: "#ff9696",
                fontSize: "12px",
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              style={{
                marginBottom: "14px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "rgba(50,180,110,0.10)",
                border: "1px solid rgba(50,180,110,0.22)",
                color: "#7de0a6",
                fontSize: "12px",
              }}
            >
              {success}
            </div>
          )}

          {/* Create Account */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "9px",
              background: loading ? "#31506b" : "#3f8fd9",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Back to Login */}
        <button
          type="button"
          onClick={onBackToLogin}
          style={{
            width: "100%",
            marginTop: "11px",
            padding: "10px",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "9px",
            background: "rgba(255,255,255,0.025)",
            color: "#9eafbe",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "12px",
  color: "#d2deea",
  fontWeight: 500,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.11)",
  background: "rgba(4,14,25,0.82)",
  color: "white",
  outline: "none",
  fontSize: "13px",
};