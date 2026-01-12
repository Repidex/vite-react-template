import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../providers/AuthProvider";

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Sanitization helpers
  const sanitizeEmail = (value: string) =>
    value.replace(/[^a-zA-Z0-9@._+-]/g, "").slice(0, 72);
  const sanitizePassword = (value: string) =>
    value.replace(/[^\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/g, "").slice(0, 64);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate email format
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      toast.error("Invalid email address");
      setLoading(false);
      return;
    }
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError("Invalid credentials");
        toast.error("Invalid credentials");
        return;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FORGOT PASSWORD ================= */
  const handleForgotPassword = async () => {
    navigate("/forgot-password");
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
            style={styles.input}
            required
            maxLength={254}
            autoComplete="email"
          />

          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(sanitizePassword(e.target.value))}
              style={styles.passwordInput}
              required
              maxLength={64}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <div style={styles.forgotRow}>
            <button
              type="button"
              style={styles.link}
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footerText}>
          New here?{" "}
          <span style={styles.link} onClick={() => navigate("/register")}>
            Create an account
          </span>
        </p>
      </div>

      <div style={styles.copyright}>
        <p style={styles.copyrightText}>
          © {new Date().getFullYear()} Carat Craft Boutique. All rights
          reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "rgb(246, 242, 238)",
    position: "relative" as const,
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "transparent",
    padding: "40px 24px",
    borderRadius: "0",
    boxShadow: "none",
    boxSizing: "border-box" as const,
    textAlign: "center" as const,
  },

  title: {
    fontSize: "32px",
    fontWeight: 500,
    marginBottom: "8px",
    color: "#514242",
    letterSpacing: "0.5px",
  },

  subtitle: {
    fontSize: "15px",
    color: "#514242",
    marginBottom: "40px",
    fontWeight: 400,
    opacity: 0.7,
  },

  input: {
    width: "100%",
    height: "52px",
    padding: "0 18px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid rgba(81, 66, 66, 0.15)",
    marginBottom: "16px",
    outline: "none",
    boxSizing: "border-box" as const,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    color: "#514242",
    transition: "all 0.2s ease",
  },

  passwordWrapper: {
    position: "relative" as const,
    width: "100%",
    marginBottom: "16px",
  },

  passwordInput: {
    width: "100%",
    height: "52px",
    padding: "0 50px 0 18px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid rgba(81, 66, 66, 0.15)",
    outline: "none",
    boxSizing: "border-box" as const,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    color: "#514242",
    transition: "all 0.2s ease",
  },

  eyeButton: {
    position: "absolute" as const,
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#514242",
    opacity: 0.5,
    padding: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s ease",
  },

  forgotRow: {
    textAlign: "right" as const,
    marginBottom: "24px",
  },

  button: {
    width: "100%",
    height: "52px",
    background: "#514242",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    letterSpacing: "0.5px",
  },

  error: {
    background: "rgba(255, 59, 48, 0.1)",
    color: "#d32f2f",
    padding: "14px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid rgba(211, 47, 47, 0.2)",
  },

  footerText: {
    marginTop: "32px",
    fontSize: "15px",
    color: "rgb(20 18 18)",
    opacity: 0.8,
  },

  link: {
    background: "none",
    border: "none",
    padding: 0,
    color: "rgb(47 38 38)",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "none",
    opacity: 0.7,
    transition: "opacity 0.2s ease",
  },

  copyright: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: "15px 20px",
    textAlign: "center" as const,
    borderTop: "1px solid rgba(81, 66, 66, 0.1)",
    background: "rgb(246, 242, 238)",
  },

  copyrightText: {
    fontSize: "13px",
    color: "#514242",
    opacity: 0.6,
    margin: 0,
  },
};
