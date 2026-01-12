import Slider from "../components/Sliders";
import ImpactSection from "../components/ImpactSection";
import CategoriesGrid from "../components/Categories";
import BrandStorySection from "../components/BrandStorySection";
import EthicalJewelrySection from "../components/items";
import InstagramMomentsSection from "../components/InstagramMomentsSection";
import AllCategorySection from "../components/allCategories";
import FeaturesList from "../components/FeaturesList";
import TopMarquee from "../components/TopMarquee";
const Home = () => {
  return (
    <main style={styles.main}>
      {/* Hero Slider Section */}
      <section style={styles.section}>
        <Slider />
      </section>
      <section style={styles.section}>
        <AllCategorySection />
      </section>

      {/* 1px spacer */}
      <div style={styles.spacer} />

      {/* Impact Section */}
      <section style={styles.sectionAlt}>
        <ImpactSection />
      </section>
      <div style={styles.spacer} />

      {/* Impact Section */}
      <section style={styles.sectionAlt}>
        <CategoriesGrid />
      </section>
      <div style={styles.spacer} />

      <section style={styles.sectionAlt}>
        <BrandStorySection />
      </section>
      <section style={styles.sectionAlt}>
        <EthicalJewelrySection />
      </section>
      <section style={styles.sectionAlt}>
        <InstagramMomentsSection />
      </section>
      <section style={styles.sectionAlt}>
        <FeaturesList />
      </section>
      <section style={styles.sectionAlt}>
        <TopMarquee />
      </section>
    </main>
  );
};

const styles = {
  main: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
  },
  sectionAlt: {
    backgroundColor: "#fafafa",
  },
  spacer: {
    height: "1px",
    backgroundColor: "#e0e0e0",
  },
};

export default Home;
