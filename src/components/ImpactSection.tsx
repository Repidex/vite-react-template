import React from "react";

const JewelleryImpactSection: React.FC = () => {
  return (
    <section style={styles.wrapper}>
      {/* Decorative elements */}
      <div style={styles.decorLeft} />
      <div style={styles.decorRight} />

      <div style={styles.container}>
        {/* Image Section */}
        <div style={styles.imageWrapper}>
          <div style={styles.imageFrame}>
            <div style={styles.goldAccent} />
            <div style={styles.circleOuter}>
              <div style={styles.circleInner}>
                <img
                  src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=800&fit=crop&crop=faces"
                  alt="Elegant woman wearing luxury jewellery"
                  style={styles.image}
                />
              </div>
            </div>
            <div style={styles.goldAccentBottom} />
          </div>
        </div>

        {/* Content Section */}
        <div style={styles.content}>
          <span style={styles.tagline}>OUR COMMITMENT</span>

          <h2 style={styles.heading}>
            Making a Positive Impact on People & Planet
          </h2>

          <p style={styles.text}>
            Our jewellery is crafted with care, combining timeless elegance with
            responsible sourcing. Each piece reflects our commitment to
            sustainability, quality, and ethical craftsmanship — designed to be
            treasured for generations.
          </p>
        </div>
      </div>
    </section>
  );
};

export default JewelleryImpactSection;

/* ================= STYLES ================= */

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    width: "100%",
    overflow: "hidden",
    background: "linear-gradient(135deg, #5a6b52 0%, #68795e 50%, #4a5a44 100%)",
    textAlign: "center",
    position: "relative",
  },

  decorLeft: {
    position: "absolute",
    top: "10%",
    left: "-5%",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  decorRight: {
    position: "absolute",
    bottom: "10%",
    right: "-5%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "clamp(50px, 8vw, 100px)",
    flexWrap: "wrap",
    padding: "0 clamp(24px, 5vw, 60px)",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 1,
  },

  imageWrapper: {
    flex: "1 1 350px",
    maxWidth: "480px",
    display: "flex",
    justifyContent: "center",
  },

  imageFrame: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  goldAccent: {
    position: "absolute",
    top: "-20px",
    left: "-20px",
    width: "90px",
    height: "90px",
    borderTop: "2px solid rgba(255, 255, 255, 0.5)",
    borderLeft: "2px solid rgba(255, 255, 255, 0.5)",
    opacity: 0.8,
  },

  goldAccentBottom: {
    position: "absolute",
    bottom: "-20px",
    right: "-20px",
    width: "90px",
    height: "90px",
    borderBottom: "2px solid rgba(255, 255, 255, 0.5)",
    borderRight: "2px solid rgba(255, 255, 255, 0.5)",
    opacity: 0.8,
  },

  circleOuter: {
    width: "clamp(280px, 38vw, 400px)",
    height: "clamp(280px, 38vw, 400px)",
    borderRadius: "50%",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 30px 70px rgba(0,0,0,0.25), inset 0 0 40px rgba(255, 255, 255, 0.15)",
    background:
      "linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, transparent 50%)",
    boxSizing: "border-box",
  },

  circleInner: {
    width: "94%",
    height: "94%",
    borderRadius: "50%",
    overflow: "hidden",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    boxSizing: "border-box",
    boxShadow: "inset 0 0 25px rgba(0,0,0,0.35)",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  content: {
    flex: "1 1 380px",
    maxWidth: "520px",
    boxSizing: "border-box",
  },

  tagline: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "4px",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: "20px",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
    paddingBottom: "8px",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  heading: {
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 300,
    lineHeight: 1.2,
    marginBottom: "28px",
    letterSpacing: "0.5px",
    color: "#ffffff",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  headingAccent: {
    display: "block",
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: 400,
    fontStyle: "italic",
    marginTop: "4px",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  dividerWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },

  dividerDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },

  divider: {
    width: "50px",
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },

  text: {
    fontSize: "clamp(15px, 1.2vw, 17px)",
    lineHeight: 1.95,
    color: "rgba(255, 255, 255, 0.88)",
    marginBottom: "36px",
    fontWeight: 300,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  features: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  featureIcon: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: "12px",
  },

  featureText: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontWeight: 400,
    fontFamily: '"Tenor Sans", sans-serif',
  },
};
