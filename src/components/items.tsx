import React from "react";

const EthicalEditorialSection: React.FC = () => {
  return (
    <section style={styles.wrapper}>
      {/* TOP HERO SECTION */}
      <div style={styles.topSection}>
        <div style={styles.topSectionInner}>
          <div style={styles.heroContent}>
            <span style={styles.badge}>ETHICAL LUXURY</span>
            <h1 style={styles.heading}>
              CONSCIOUS LUXURY,
              <br />
              ETHICAL ELEGANCE
            </h1>

            <p style={styles.description}>
              We believe everything is connected and by making an effort to live
              holistically aware of our surroundings, we can indulge in luxury
              that does good in the world. Our jewelry is crafted with purpose,
              using ethically sourced and fully traceable materials.
            </p>

            <button style={styles.button}>DISCOVER COLLECTION</button>
          </div>
          <div style={styles.decorativeElement}></div>
        </div>
      </div>
    </section>
  );
};

export default EthicalEditorialSection;

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },

  /* -------- TOP HERO SECTION -------- */
  topSection: {
    minHeight: "500px",
    background: "linear-gradient(135deg, #5a6b52 0%, #68795e 50%, #4a5a44 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },

  topSectionInner: {
    maxWidth: "1000px",
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  heroContent: {
    color: "#f5f1ed",
    animation: "fadeInUp 0.8s ease-out",
  },

  badge: {
    display: "inline-block",
    padding: "8px 20px",
    backgroundColor: "rgba(230, 211, 163, 0.2)",
    border: "1px solid rgba(230, 211, 163, 0.4)",
    borderRadius: "50px",
    fontSize: "11px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#f6f6f1",
    marginBottom: "20px",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  heading: {
    fontSize: "clamp(28px, 5vw, 56px)",
    fontWeight: 300,
    letterSpacing: "3px",
    lineHeight: 1.2,
    marginBottom: "28px",
    textTransform: "uppercase",
    backgroundClip: "text",
    color: "#f6f6f1",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  description: {
    fontSize: "clamp(14px, 1.1vw, 16px)",
    lineHeight: 1.8,
    maxWidth: "650px",
    marginBottom: "32px",
    opacity: 0.85,
    color: "#f6f6f1",
    letterSpacing: "0.5px",
    margin: "0 auto 32px",
    fontWeight: 300,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  button: {
    padding: "14px 40px",
    fontSize: "12px",
    letterSpacing: "2px",
    backgroundColor: "transparent",
    color: "#f6f6f1",
    border: "1px solid #f6f6f1",
    cursor: "pointer",
    textTransform: "uppercase",
    borderRadius: "50px",
    fontWeight: 400,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "none",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  /* Decorative element */
  decorativeElement: {
    display: "none",
  },

  /* -------- BOTTOM SECTION -------- */
  bottomSection: {
    backgroundColor: "#f7f5f1",
    padding: "90px 20px 60px",
  },

  /* SINGLE ROW SCROLLABLE CARDS */
  cards: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    gap: "32px",
    overflowX: "auto",
    flexWrap: "nowrap",
    paddingBottom: "10px",
    scrollbarWidth: "none",
  },

  card: {
    flex: "0 0 320px",
    textAlign: "center",
  },

  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    marginBottom: "16px",
  },

  title: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#7a7a55",
    fontFamily: '"Tenor Sans", sans-serif',
  },
};
