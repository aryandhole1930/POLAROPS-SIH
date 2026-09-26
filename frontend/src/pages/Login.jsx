import { useState } from "react";
import polarLoginBg from "../assets/polar-login-bg.png";
import { loginUser } from "../services/api";

const DEMO_ACCOUNTS = [
  {
    role: "Programme Admin",
    email: "admin@polarops.gov.in",
    password: "PolarOps@2026",
  },
  {
    role: "Voyage Leader",
    email: "voyage.leader@polarops.test",
    password: "TestPassword123",
  },
  {
    role: "Expedition Logistics",
    email: "logistics@logistics.polarops.gov.in",
    password: "TestPassword123",
  },
  {
    role: "Principal Investigator",
    email: "test2@science.polarops.gov.in",
    password: "TestPassword123",
  },
  {
    role: "Medical Officer",
    email: "doctor@science.polarops.gov.in",
    password: "Doctor@123",
  },
  {
    role: "Maitri Station Leader",
    email: "maitri.leader@polarops.test",
    password: "TestPassword123",
  },
  {
    role: "Bharati Station Leader",
    email: "bharati.leader@polarops.test",
    password: "TestPassword123",
  },
];

export default function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function fillDemoAccount(account) {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser({
        email,
        password,
      });

      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        color: "white",
        backgroundImage:
  `linear-gradient(rgba(3, 14, 29, 0.72), rgba(3, 14, 29, 0.90)), url(${polarLoginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
      }}
    >
      {/* Prototype badge */}
      <div
        title="This is the SIH prototype version of POLAROPS"
        style={{
          position: "absolute",
          top: "22px",
          right: "24px",
          padding: "8px 13px",
          borderRadius: "999px",
          background: "rgba(7, 17, 31, 0.72)",
          border: "1px solid rgba(255,255,255,0.16)",
          color: "#b9dfff",
          fontSize: "11px",
          fontWeight: "700",
          letterSpacing: "1.2px",
          backdropFilter: "blur(10px)",
        }}
      >
        SIH PROTOTYPE
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "1050px",
          display: "grid",
          gridTemplateColumns: "minmax(320px, 420px) minmax(320px, 1fr)",
          gap: "22px",
          alignItems: "stretch",
        }}
      >
        {/* Login Card */}
        <div
          style={{
            background: "rgba(13, 27, 42, 0.93)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "22px",
            padding: "34px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
              color: "#8ecaff",
              marginBottom: "10px",
            }}
          >
            INTEGRATED POLAR EXPEDITION SYSTEM
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
              letterSpacing: "3px",
              fontWeight: "800",
            }}
          >
            POLAROPS
          </h1>

          <p
            style={{
              marginTop: "10px",
              marginBottom: "28px",
              color: "rgba(255,255,255,0.62)",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            Secure access to expedition planning, logistics,
            personnel and emergency operations.
          </p>

          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                marginBottom: "8px",
                color: "rgba(255,255,255,0.78)",
              }}
            >
              Institutional Email
            </label>

            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                marginBottom: "16px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.055)",
                color: "white",
                outline: "none",
                fontSize: "14px",
              }}
            />

            <label
              style={{
                display: "block",
                fontSize: "13px",
                marginBottom: "8px",
                color: "rgba(255,255,255,0.78)",
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                marginBottom: "14px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.055)",
                color: "white",
                outline: "none",
                fontSize: "14px",
              }}
            />

            {error && (
              <div
                style={{
                  marginBottom: "14px",
                  padding: "10px 12px",
                  borderRadius: "9px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#ffb4b4",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "10px",
                background: "#ffffff",
                color: "#07111f",
                fontWeight: "700",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div
            style={{
              marginTop: "22px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              textAlign: "center",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.52)",
                fontSize: "13px",
              }}
            >
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={onRegister}
              style={{
                marginLeft: "7px",
                border: "none",
                background: "transparent",
                color: "#9bd2ff",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Create an account
            </button>
          </div>
        </div>

        {/* Demo Access */}
        <div
          style={{
            background: "rgba(7, 17, 31, 0.78)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "22px",
            padding: "28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "7px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "750",
              }}
            >
              Prototype Demo Access
            </h2>

            <span
              style={{
                padding: "5px 9px",
                borderRadius: "999px",
                background: "rgba(142,202,255,0.10)",
                border: "1px solid rgba(142,202,255,0.18)",
                color: "#a9d7ff",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.7px",
                whiteSpace: "nowrap",
              }}
            >
              SIH ONLY
            </span>
          </div>

          <p
            style={{
              margin: "0 0 18px",
              color: "rgba(255,255,255,0.55)",
              fontSize: "12px",
              lineHeight: 1.5,
            }}
          >
            Demo credentials for evaluating different POLAROPS
            operational roles. Click an account to fill the login form.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "9px",
              maxHeight: "520px",
              overflowY: "auto",
              paddingRight: "3px",
            }}
          >
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemoAccount(account)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 13px",
                  borderRadius: "11px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.045)",
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.085)";
                  e.currentTarget.style.borderColor =
                    "rgba(155,210,255,0.30)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.045)";
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.08)";
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    marginBottom: "4px",
                  }}
                >
                  {account.role}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.58)",
                    wordBreak: "break-all",
                  }}
                >
                  {account.email}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "11px",
                    color: "#9bd2ff",
                  }}
                >
                  Password: {account.password}
                </div>
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "10px 12px",
              borderRadius: "9px",
              background: "rgba(255,255,255,0.035)",
              color: "rgba(255,255,255,0.42)",
              fontSize: "10px",
              lineHeight: 1.45,
            }}
          >
            Prototype credentials are displayed intentionally for SIH
            evaluation. Remove this section before any production deployment.
          </div>
        </div>
      </div>
    </div>
  );
}