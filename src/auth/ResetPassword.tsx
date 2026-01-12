import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Sanitize and validate password
  const sanitizePassword = (value: string) =>
    value.replace(/[^\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/g, "").slice(0, 64);

  // Strong password policy: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
  const isStrongPassword = (pwd: string) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pwd)
    );
  };

  // Prevent common passwords
  const commonPasswords = [
    "password",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "111111",
    "123123",
    "letmein",
    "welcome",
    "admin",
  ];

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sanitizedPassword = sanitizePassword(password);
    const sanitizedConfirm = sanitizePassword(confirmPassword);
    if (!isStrongPassword(sanitizedPassword)) {
      toast.error(
        "Password must be at least 8 characters, include uppercase, lowercase, digit, and special character."
      );
      setLoading(false);
      return;
    }
    if (commonPasswords.includes(sanitizedPassword.toLowerCase())) {
      toast.error("Password is too common. Please choose a stronger password.");
      setLoading(false);
      return;
    }
    if (sanitizedPassword !== sanitizedConfirm) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: sanitizedPassword,
      });
      if (error) {
        toast.error("Failed to reset password", { description: error.message });
        setLoading(false);
        return;
      }
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err: any) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>Enter your new password below</p>
        <form onSubmit={handleResetPassword}>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(sanitizePassword(e.target.value))}
              style={styles.input}
              required
              maxLength={64}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={styles.eyeButton}
              tabIndex={-1}
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
          <div style={styles.passwordWrapper}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(sanitizePassword(e.target.value))
              }
              style={styles.input}
              required
              maxLength={64}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              style={styles.eyeButton}
              tabIndex={-1}
            >
              {showConfirm ? (
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
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p style={styles.footerText}>
          Back to{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;

const styles = {
  passwordWrapper: {
    position: "relative" as const,
    width: "100%",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
  },
  eyeButton: {
    position: "absolute" as const,
    right: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#514242",
    opacity: 0.7,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "32px",
    width: "32px",
    transition: "opacity 0.2s ease",
    zIndex: 2,
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
  wrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
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
};
