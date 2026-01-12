import React from "react";
import { useNavigate } from "react-router-dom";

const OurStory: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main style={styles.main}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroHeading}>OUR STORY</h1>
          <p style={styles.heroSubtitle}>
            A journey of craftsmanship, consciousness, and timeless beauty
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section style={styles.contentSection}>
        <div style={styles.container}>
          {/* Image and Story Block */}
          <div style={styles.imageStoryWrapper}>
            {/* Circular Image */}
            <div style={styles.imageWrapper}>
              <div style={styles.circleOuter}>
                <div style={styles.circleInner}>
                  <img
                    src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop"
                    alt="Our Brand Story"
                    style={styles.circleImage}
                  />
                </div>
              </div>
            </div>

            {/* Main Story */}
            <div style={styles.storyBlock}>
              <h2 style={styles.sectionHeading}>Who We Are</h2>
              <p style={styles.paragraph}>
                We believe that jewelry is more than just an accessory—it's a
                statement, a reflection of your values, and a celebration of who
                you are. At Carat Craft, we create pieces for women, by women, as
                a tribute to the multifaceted beauty in our everyday lives.
              </p>
              <p style={styles.paragraph}>
                We bring to light the juxtaposition of quiet moments and glamour—two
                halves of a whole person. Because all women have a little bit of
                both inside them. The strength to wear elegance, and the grace to
                wear power.
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={styles.twoColumn}>
            {/* Left Column */}
            <div style={styles.column}>
              <h2 style={styles.sectionHeading}>Our Mission</h2>
              <p style={styles.paragraph}>
                Our mission is to create jewelry that empowers, inspires, and
                celebrates the unique beauty of every woman. We believe that
                luxury should be accessible, ethical, and meaningful.
              </p>
              <p style={styles.paragraph}>
                Each piece is crafted with intention, using ethically sourced
                materials and sustainable practices. We prioritize transparency,
                quality, and the well-being of our craftspeople and the
                environment.
              </p>
            </div>

            {/* Right Column */}
            <div style={styles.column}>
              <h2 style={styles.sectionHeading}>Our Promise</h2>
              <p style={styles.paragraph}>
                We promise to deliver not just beautiful jewelry, but pieces
                with purpose. Every diamond, every gemstone, every metal is
                chosen with care and responsibility.
              </p>
              <p style={styles.paragraph}>
                We stand by our commitment to ethical sourcing, fair labor
                practices, and environmental sustainability. When you wear Carat
                Craft, you're wearing a promise—a promise of quality, integrity,
                and positive change.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div style={styles.valuesSection}>
            <h2 style={styles.sectionHeading}>Our Values</h2>
            <div style={styles.valuesGrid}>
              {[
                {
                  title: "Ethical Sourcing",
                  description:
                    "Every material is traceable and responsibly sourced",
                },
                {
                  title: "Exceptional Quality",
                  description: "Handcrafted with precision and attention to detail",
                },
                {
                  title: "Conscious Luxury",
                  description: "Beauty that does good for the world",
                },
                {
                  title: "Empowerment",
                  description: "Jewelry that celebrates every woman's unique story",
                },
              ].map((value, index) => (
                <div key={index} style={styles.valueCard}>
                  <h3 style={styles.valueTitle}>{value.title}</h3>
                  <p style={styles.valueDescription}>{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Materials Section */}
          <div style={styles.materialsSection}>
            <h2 style={styles.sectionHeading}>Our Materials</h2>
            <p style={styles.paragraph}>
              We are committed to using only the finest, ethically sourced materials:
            </p>
            <div style={styles.materialsList}>
              <div style={styles.materialItem}>
                <h3 style={styles.materialTitle}>Lab-Grown Diamonds</h3>
                <p>
                  Created in controlled environments with the same physical and
                  chemical properties as mined diamonds, but with a lower
                  environmental impact.
                </p>
              </div>
              <div style={styles.materialItem}>
                <h3 style={styles.materialTitle}>Lab-Grown Gemstones</h3>
                <p>
                  Stunning colored gemstones created in laboratories using
                  sustainable methods, ensuring consistency and ethical
                  production.
                </p>
              </div>
              <div style={styles.materialItem}>
                <h3 style={styles.materialTitle}>Recycled Metals</h3>
                <p>
                  We use recycled precious metals whenever possible, reducing
                  the need for new mining and minimizing environmental impact.
                </p>
              </div>
              <div style={styles.materialItem}>
                <h3 style={styles.materialTitle}>Natural Gemstones</h3>
                <p>
                  When using natural gemstones, we source from suppliers who
                  adhere to the highest ethical standards and fair labor
                  practices.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div style={styles.ctaSection}>
            <h2 style={styles.ctaHeading}>Ready to Explore Our Collection?</h2>
            <p style={styles.ctaText}>
              Discover our curated selection of ethically crafted jewelry
            </p>
            <div style={styles.buttonGroup}>
              <button
                style={styles.primaryButton}
                onClick={() => navigate("/all-jewellery")}
              >
                SHOP COLLECTION
              </button>
              <button
                style={styles.secondaryButton}
                onClick={() => navigate("/")}
              >
                BACK TO HOME
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OurStory;

/* ================= STYLES ================= */

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    flex: 1,
    backgroundColor: "#f5f1ed",
  },

  /* Hero Section */
  heroSection: {
    minHeight: "400px",
    background: "linear-gradient(135deg, #5a6b52 0%, #68795e 50%, #4a5a44 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
    color: "#f6f6f1",
  },

  heroContent: {
    maxWidth: "700px",
  },

  heroHeading: {
    fontSize: "clamp(36px, 6vw, 64px)",
    fontWeight: 300,
    letterSpacing: "3px",
    marginBottom: "20px",
    textTransform: "uppercase",
  },

  heroSubtitle: {
    fontSize: "clamp(14px, 1.1vw, 18px)",
    fontWeight: 300,
    letterSpacing: "1px",
    opacity: 0.85,
  },

  /* Content Section */
  contentSection: {
    padding: "80px 20px",
    overflow: "hidden",
    width: "100%",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },

  /* Image and Story Wrapper */
  imageStoryWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "60px",
    alignItems: "center",
    marginBottom: "80px",
  },

  imageWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  circleOuter: {
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    border: "1px solid #d1b26f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  circleInner: {
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "1px solid #e2d3a3",
  },

  circleImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  /* Story Block */
  storyBlock: {
    marginBottom: "60px",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  sectionHeading: {
    fontSize: "clamp(28px, 4vw, 42px)",
    fontWeight: 400,
    letterSpacing: "2px",
    color: "#2c2416",
    marginBottom: "24px",
    textTransform: "uppercase",
    width: "100%",
    overflow: "hidden",
    wordWrap: "break-word",
  },

  paragraph: {
    fontSize: "15px",
    lineHeight: 1.8,
    color: "#5a5a4a",
    marginBottom: "16px",
    letterSpacing: "0.5px",
    width: "100%",
    wordWrap: "break-word",
    overflow: "hidden",
  },

  /* Two Column */
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "40px",
    marginBottom: "80px",
    width: "100%",
    boxSizing: "border-box",
  },

  column: {
    padding: "20px 0",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  /* Values Section */
  valuesSection: {
    marginBottom: "80px",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  valuesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "32px",
    marginTop: "40px",
    width: "100%",
    boxSizing: "border-box",
  },

  valueCard: {
    padding: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    border: "1px solid rgba(139, 94, 60, 0.1)",
    borderRadius: "8px",
    textAlign: "center",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  valueTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#2c2416",
    marginBottom: "12px",
    letterSpacing: "0.5px",
    wordWrap: "break-word",
  },

  valueDescription: {
    fontSize: "14px",
    color: "#5a5a4a",
    lineHeight: 1.6,
    wordWrap: "break-word",
  },

  /* Materials Section */
  materialsSection: {
    marginBottom: "80px",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  materialsList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "28px",
    marginTop: "40px",
    width: "100%",
    boxSizing: "border-box",
  },

  materialItem: {
    padding: "28px",
    backgroundColor: "rgba(230, 211, 163, 0.08)",
    border: "1px solid rgba(230, 211, 163, 0.2)",
    borderRadius: "8px",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  materialTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#8b5e3c",
    marginBottom: "12px",
    letterSpacing: "0.5px",
    wordWrap: "break-word",
  },

  /* CTA Section */
  ctaSection: {
    textAlign: "center",
    padding: "60px 40px",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: "8px",
    border: "1px solid rgba(139, 94, 60, 0.1)",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  ctaHeading: {
    fontSize: "clamp(24px, 4vw, 36px)",
    fontWeight: 400,
    letterSpacing: "2px",
    color: "#2c2416",
    marginBottom: "12px",
    textTransform: "uppercase",
    wordWrap: "break-word",
  },

  ctaText: {
    fontSize: "15px",
    color: "#5a5a4a",
    marginBottom: "32px",
    letterSpacing: "0.5px",
    wordWrap: "break-word",
  },

  buttonGroup: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  primaryButton: {
    padding: "14px 40px",
    fontSize: "12px",
    letterSpacing: "2px",
    backgroundColor: "#8b5e3c",
    color: "#f5f1ed",
    border: "2px solid #8b5e3c",
    borderRadius: "4px",
    cursor: "pointer",
    textTransform: "uppercase",
    fontWeight: 600,
    transition: "all 0.3s ease",
  },

  secondaryButton: {
    padding: "14px 40px",
    fontSize: "12px",
    letterSpacing: "2px",
    backgroundColor: "transparent",
    color: "#8b5e3c",
    border: "2px solid #8b5e3c",
    borderRadius: "4px",
    cursor: "pointer",
    textTransform: "uppercase",
    fontWeight: 600,
    transition: "all 0.3s ease",
  },
};
