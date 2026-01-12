import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sanitizeEmail = (value: string) =>
    value.replace(/[^a-zA-Z0-9@._+-]/g, "").slice(0, 72);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error("Failed to send reset email", {
          description: error.message,
        });
        setLoading(false);
        return;
      }
      toast.success("Password reset email sent 📧");
      navigate("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Forgot Password</h1>
        <p style={styles.subtitle}>Enter your email to reset your password</p>
        <form onSubmit={handleForgotPassword}>
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
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p style={styles.footerText}>
          Remembered your password?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

const styles = {
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
