import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BrandStorySection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section style={styles.wrapper}>
      <div
        style={{
          ...styles.container,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          textAlign: isMobile ? "center" : "left",
          gap: isMobile ? 40 : 60,
        }}
      >
        {/* Left Content */}
        <div style={styles.imageWrapper}>
          <div
            style={{
              ...styles.circleOuter,
              width: isMobile ? 280 : 360,
              height: isMobile ? 280 : 360,
            }}
          >
            <div
              style={{
                ...styles.circleInner,
                width: isMobile ? 240 : 320,
                height: isMobile ? 240 : 320,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop"
                alt="Brand Story"
                style={styles.image}
              />
            </div>
          </div>
        </div>
        <div
          style={{ ...styles.content, maxWidth: isMobile ? "100%" : "500px" }}
        >
          <h2 style={styles.heading}>
            YOU DESERVE TO
            <br />
            FEEL BEAUTIFUL.
          </h2>

          <p style={styles.text}>
            Our pieces are designed for women, by women, as a celebration of the
            beauty in our everyday lives. We bring to light the juxtaposition of
            quiet moments and glamour—two halves of a whole person—because all
            women have a little bit of both Silverqala inside them.
          </p>

          <button style={styles.button} onClick={() => navigate("/our-story")}>
            OUR STORY
          </button>
        </div>

        {/* Right Image */}
      </div>
    </section>
  );
};

export default BrandStorySection;

/* ================= STYLES ================= */

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    width: "100%",
    backgroundColor: "#f6f2ee",
    padding: "clamp(60px, 10vw, 120px) 20px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    alignItems: "center",
  },

  content: {
    marginBottom: 20,
  },

  heading: {
    fontSize: "clamp(28px, 4vw, 42px)",
    fontWeight: 400,
    letterSpacing: "2px",
    color: "#514242",
    marginBottom: "24px",
    lineHeight: 1.3,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  text: {
    fontSize: "15px",
    lineHeight: 1.8,
    color: "#514242",
    marginBottom: "32px",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.85,
  },

  button: {
    padding: "12px 28px",
    fontSize: "12px",
    letterSpacing: "2px",
    backgroundColor: "transparent",
    color: "#514242",
    border: "1px solid #514242",
    borderRadius: "20px",
    cursor: "pointer",
    fontFamily: '"Tenor Sans", sans-serif',
    transition: "all 0.3s ease",
  },

  imageWrapper: {
    display: "flex",
    justifyContent: "center",
  },

  circleOuter: {
    borderRadius: "50%",
    border: "1px solid #d1b26f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  circleInner: {
    borderRadius: "50%",
    overflow: "hidden",
    border: "1px solid #e2d3a3",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
};
