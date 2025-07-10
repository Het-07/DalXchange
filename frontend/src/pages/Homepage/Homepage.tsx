import HeroSection from "./HeroSection/HeroSection";
import CategorySection from "./CategorySection/CategorySection";
import HowToUse from "./HowToUse/HowToUse";
import "./Homepage.css";

const Homepage = () => {
  return (
    <div className="homepage">
      <HeroSection />
      <CategorySection />
      <HowToUse />
    </div>
  );
};

export default Homepage;
