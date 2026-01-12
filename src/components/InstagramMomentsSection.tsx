import React, { useEffect, useRef } from "react";

const InstagramMomentsSection: React.FC = () => {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = rowRef.current?.children;
    if (!cards) return;

    Array.from(cards).forEach((card, index) => {
      (card as HTMLElement).style.animationDelay = `${index * 0.15}s`;
    });
  }, []);

  return (
    <section style={styles.wrapper}>
      {/* Inject animation styles */}
      <style>
        {`
          @keyframes fadeUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .moment-card:hover img {
            transform: scale(1.08);
          }
        `}
      </style>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.heading}>
          MORE PRETTY MOMENTS
          <br />
          ON THE ‘GRAM
        </h2>
        <p style={styles.handle}>@SILVERQALA</p>
      </div>

      {/* SINGLE ROW */}
      <div ref={rowRef} style={styles.row}>
        {items.map((item, index) => (
          <div
            key={index}
            className="moment-card"
            style={{
              ...styles.card,
              backgroundColor: item.bg || "transparent",
            }}
          >
            {item.image ? (
              <img src={item.image} alt="" style={styles.image} />
            ) : (
              <p style={styles.quote}>{item.text}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default InstagramMomentsSection;

/* ================= DATA ================= */

const items = [
  {
    image:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=800",
  },
  {
    text: "Jewellery that feels personal, powerful, and timeless.",
    bg: "#9a8f85",
  },
  {
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800",
  },
  {
    text: "Designed for modern muses.",
    bg: "#efe6d8",
  },
];

/* ================= STYLES ================= */

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    backgroundColor: "#f7f5f1",
    padding: "90px 20px",
    textAlign: "center",
  },

  header: {
    marginBottom: "50px",
  },

  heading: {
    fontSize: "clamp(22px, 3vw, 36px)",
    fontWeight: 400,
    letterSpacing: "1.5px",
    color: "#514242",
    lineHeight: 1.3,
    textTransform: "uppercase",
    marginBottom: "12px",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  handle: {
    fontSize: "12px",
    letterSpacing: "1.4px",
    color: "#514242",
    opacity: 0.7,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  row: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    gap: "28px",
    overflowX: "auto",
    flexWrap: "nowrap",
    paddingBottom: "10px",
    scrollbarWidth: "none",
  },

  card: {
    flex: "0 0 260px",
    height: "260px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    opacity: 0,
    transform: "translateY(30px)",
    animation: "fadeUp 0.8s ease forwards",
    transition: "transform 0.5s ease",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.6s ease",
  },

  quote: {
    fontSize: "15px",
    lineHeight: 1.7,
    maxWidth: "180px",
    margin: "0 auto",
    color: "#ffffff",
    padding: "0 12px",
    fontFamily: '"Tenor Sans", sans-serif',
    textAlign: "center",
  },
};
