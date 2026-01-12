import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const LuxuryFooter: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const footerRoutes: Record<string, string> = {
    Sustainability: "/sustainability",
    FAQ: "/faqs",
    "Care Guide": "/care-guide",

    "Shipping & Returns": "/shipping-returns",
    Contact: "/contact",
    "Terms & Conditions": "/terms",

    Instagram: "https://www.instagram.com/yourprofile",
    Facebook: "https://www.facebook.com/yourprofile",
    LinkedIn: "https://www.linkedin.com/in/yourprofile",
  };

  return (
    <footer style={styles.footer}>
      <div
        style={{
          ...styles.container,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "center" : "flex-start",
        }}
      >
        {/* LEFT */}
        <div style={styles.left}>
          <div style={styles.links}>
            {[
              {
                title: "Learn More",
                items: ["Sustainability", "FAQ", "Care Guide"],
              },
              {
                title: "Support",
                items: ["Shipping & Returns", "Contact", "Terms & Conditions"],
              },
              {
                title: "Connect",
                items: ["Instagram", "Facebook", "LinkedIn"],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={styles.title}>{col.title}</h4>
                <ul style={styles.list}>
                  {col.items.map((item) => (
                    <li
                      key={item}
                      style={{ ...styles.link, cursor: "pointer" }}
                      onClick={() => {
                        const url = footerRoutes[item];
                        if (url.startsWith("http")) {
                          // external link → open in new tab
                          window.open(url, "_blank");
                        } else {
                          // internal link → navigate
                          navigate(url);
                        }
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <hr style={styles.divider} />

          <h4 style={styles.title}>Stay in touch</h4>
          <p style={styles.subText}>
            Become a VIP — a gift from us to you. Receive 10% off your first
            purchase when you join our mailing list.
          </p>

          <div style={styles.subscribe}>
            <input
              type="email"
              placeholder="Your email address"
              style={styles.input}
            />
            <button style={styles.button}>Subscribe</button>
          </div>

          <p style={styles.copy}>© 2026 Silverqala</p>
          <p style={styles.credits}>Design credits</p>
        </div>

        {/* RIGHT IMAGE */}
        <div
          style={{
            ...styles.right,
            width: isMobile ? "100%" : "300px",
            marginTop: isMobile ? "30px" : "0",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800"
            alt="Stories"
            style={styles.image}
          />
          <div style={styles.imageText}>
            <h3 style={styles.imageTitle}>Stories</h3>
            <p style={styles.imageSubtitle}>Read our journal</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LuxuryFooter;

/* ================= LUXURY STYLES ================= */

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    width: "100%",
    backgroundColor: "#f3ead9",
    padding: "60px 20px",
    boxSizing: "border-box",
  },

  container: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "40px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  left: {
    flex: "1 1 500px",
    minWidth: "280px",
  },

  links: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "40px",
    marginBottom: "40px",
  },

  title: {
    fontSize: "15px",
    letterSpacing: "2.2px",
    color: "#a8894d",
    textTransform: "uppercase",
    marginBottom: "16px",
    fontWeight: 600,
  },

  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  link: {
    fontSize: "13px",
    lineHeight: 2,
    color: "#5f5c52",
    cursor: "pointer",
    transition: "color 0.3s ease",
  },

  divider: {
    margin: "40px 0",
    border: "none",
    borderTop: "1px solid rgba(0,0,0,0.12)",
  },

  subText: {
    fontSize: "13px",
    lineHeight: 1.8,
    maxWidth: "440px",
    color: "#6b685f",
    marginBottom: "18px",
  },

  subscribe: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    maxWidth: "440px",
    marginBottom: "30px",
  },

  input: {
    flex: 1,
    padding: "14px 16px",
    fontSize: "13px",
    border: "1px solid rgba(0,0,0,0.2)",
    outline: "none",
    backgroundColor: "transparent",
    minWidth: "180px",
  },

  button: {
    padding: "14px 26px",
    backgroundColor: "#a8894d",
    color: "#fff",
    border: "none",
    fontSize: "12px",
    letterSpacing: "1.6px",
    textTransform: "uppercase",
    cursor: "pointer",
  },

  copy: {
    fontSize: "11px",
    color: "#7a776d",
    marginTop: "30px",
  },

  credits: {
    fontSize: "11px",
    letterSpacing: "1.2px",
    color: "#a8894d",
    marginTop: "8px",
  },

  right: {
    flex: "0 0 300px",
    minWidth: "280px",
    position: "relative",
    maxHeight: "400px",
    overflow: "hidden",
    borderRadius: "12px",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "12px",
  },

  imageText: {
    position: "absolute",
    bottom: "16px",
    left: "16px",
    color: "#fff",
  },

  imageTitle: {
    fontSize: "24px",
    fontWeight: 400,
    letterSpacing: "1.5px",
    marginBottom: "4px",
  },

  imageSubtitle: {
    fontSize: "12px",
    opacity: 0.9,
  },
};
