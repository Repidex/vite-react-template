import React, { useState } from "react";
import OtpInput from "react-otp-input";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Unified sanitization helpers (match Login)
  const sanitizeEmail = (value: string) => value.replace(/[^a-zA-Z0-9@._+-]/g, "").slice(0, 254);
  const sanitizePassword = (value: string) => value.replace(/[^\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/g, "").slice(0, 64);
  const sanitizeInput = (input: string): string => input.trim().replace(/[<>]/g, "").replace(/['";]/g, "");

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const isValidPassword = (password: string): boolean => password.length >= 8;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize inputs
    const sanitizedFullName = sanitizeInput(fullName);
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();

    if (!sanitizedFullName || !sanitizedEmail || !sanitizedPassword) {
      toast.error("Please fill all fields");
      return;
    }

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate password strength
    if (!isValidPassword(sanitizedPassword)) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Validate full name (only letters and spaces)
    if (!/^[a-zA-Z\s]+$/.test(sanitizedFullName)) {
      toast.error("Full name should contain only letters and spaces");
      return;
    }

    // Check if user with this email already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", sanitizedEmail);

    if (checkError) {
      console.error("Error checking user:", checkError);
    }

    if (existingUsers && existingUsers.length > 0) {
      toast.error("This email is already registered. Please login instead.");
      return;
    }

    const { error } = await signUp(
      sanitizedEmail,
      sanitizedPassword,
      sanitizedFullName
    );

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("OTP sent to your email");
    setShowOtpModal(true);
  };

  const verifyOtp = async () => {
    // Sanitize OTP input (only digits)
    const sanitizedOtp = otp.replace(/\D/g, "");

    if (sanitizedOtp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    setVerifying(true);

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: sanitizedOtp,
      type: "email",
    });

    setVerifying(false);

    if (error) {
      toast.error("Invalid OTP");
      return;
    }

    toast.success("Account verified successfully");
    setShowOtpModal(false);
    navigate("/");
  };

  return (
    <>
      {/* ===== REGISTER ===== */}
      <div style={styles.wrapper}>
        <form onSubmit={handleRegister} style={styles.card}>
          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.subtitle}>Join us and start your journey today</p>

          <input
            style={styles.input}
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={50}
          />

          <input
            style={styles.input}
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
            maxLength={254}
            autoComplete="email"
          />

          <div style={styles.passwordWrapper}>
            <input
              style={styles.passwordInput}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(sanitizePassword(e.target.value))}
              maxLength={64}
              autoComplete="new-password"
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

          <button style={styles.primaryBtn} disabled={isLoading}>
            {isLoading ? "Creating account..." : "Register"}
          </button>

          <div style={styles.copyright}>
            <p style={styles.copyrightText}>
              © {new Date().getFullYear()} Carat Craft Boutique. All rights
              reserved.
            </p>
          </div>

          <p style={styles.footerText}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/login")}>
              Sign in
            </span>
          </p>
        </form>
      </div>

      {/* ===== OTP MODAL ===== */}
      {showOtpModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Verify your email</h2>
            <p style={styles.modalSubtitle}>
              Enter the 6-digit code sent to <b>{email}</b>
            </p>

            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              inputType="tel"
              shouldAutoFocus
              containerStyle={styles.otpContainer}
              renderInput={(props) => (
                <input
                  {...props}
                  style={styles.otpInput}
                  disabled={verifying}
                  autoComplete="one-time-code"
                />
              )}
            />

            <button
              style={{
                ...styles.primaryBtn,
                opacity: otp.length === 6 ? 1 : 0.6,
                cursor: otp.length === 6 ? "pointer" : "not-allowed",
              }}
              disabled={otp.length !== 6 || verifying}
              onClick={verifyOtp}
            >
              {verifying ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => setShowOtpModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "rgb(246, 242, 238)",
    position: "relative",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "transparent",
    padding: "40px 24px",
    borderRadius: "0",
    boxShadow: "none",
    textAlign: "center",
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
    boxSizing: "border-box",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    color: "#514242",
    transition: "all 0.2s ease",
  },

  passwordWrapper: {
    position: "relative",
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
    boxSizing: "border-box",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    color: "#514242",
    transition: "all 0.2s ease",
  },

  eyeButton: {
    position: "absolute",
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

  primaryBtn: {
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
    textTransform: "none",
  },

  secondaryBtn: {
    width: "100%",
    marginTop: "12px",
    height: "52px",
    background: "transparent",
    border: "1px solid rgba(81, 66, 66, 0.15)",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    color: "#514242",
    fontWeight: 400,
    transition: "all 0.2s ease",
  },

  footerText: {
    marginTop: "32px",
    fontSize: "15px",
    color: "#514242",
    opacity: 0.8,
  },

  link: {
    color: "#514242",
    fontWeight: 500,
    cursor: "pointer",
    opacity: 0.7,
    transition: "opacity 0.2s ease",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(81, 66, 66, 0.4)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "380px",
    background: "rgb(246, 242, 238)",
    padding: "36px 28px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    border: "1px solid rgba(81, 66, 66, 0.1)",
  },

  modalTitle: {
    fontSize: "24px",
    fontWeight: 500,
    marginBottom: "8px",
    color: "#514242",
    letterSpacing: "0.5px",
  },

  modalSubtitle: {
    fontSize: "14px",
    color: "#514242",
    marginBottom: "28px",
    opacity: 0.7,
  },

  otpContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    marginBottom: "28px",
  },

  otpInput: {
    width: "42px",
    height: "52px",
    borderRadius: "8px",
    border: "1px solid rgba(81, 66, 66, 0.15)",
    fontSize: "18px",
    textAlign: "center",
    outline: "none",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    color: "#514242",
    fontWeight: 500,
  },

  copyright: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "15px 20px",
    textAlign: "center",
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
