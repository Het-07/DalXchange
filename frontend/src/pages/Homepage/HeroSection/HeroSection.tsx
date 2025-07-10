import { Link } from "react-router-dom";
import "../../Homepage/HeroSection/HeroSection.css";

const HeroSection = () => {
  return (
    <section className="homepage-wrapper">
      <div className="homepage-container">
        {/* Left Content */}
        <div className="homepage-text-content">
          <h1 className="homepage-welcome">Welcome to DalXchange 🎓</h1>
          <h1 className="homepage-heading">
            Your marketplace journey starts here...
          </h1>
          <p className="homepage-subtext">
            Buy and sell items with the Dalhousie community. Find textbooks,
            electronics, furniture, and more from fellow students.
          </p>
          <div className="homepage-buttons">
            <Link to="/listings" className="btn btn-primary">
              Browse Listings
            </Link>
            <Link to="/create-listing" className="btn btn-outline">
              Create Listing
            </Link>
          </div>
        </div>

        {/* Right Content */}
        <div className="homepage-categories-wrapper">
          <div className="homepage-category-header">
            <h2>Popular Categories</h2>
            <p>Find what you need or sell what you don't...</p>
          </div>
          <div className="homepage-category-grid">
            <Link to="/listings/textbooks" className="homepage-category-card">
              <h3>Textbooks</h3>
              <p>Save on course materials</p>
            </Link>
            <Link to="/listings/electronics" className="homepage-category-card">
              <h3>Electronics</h3>
              <p>Devices and accessories</p>
            </Link>
            <Link to="/listings/furniture" className="homepage-category-card">
              <h3>Furniture</h3>
              <p>For your living space</p>
            </Link>
            <Link to="/listings/apparel" className="homepage-category-card">
              <h3>Apparel</h3>
              <p>Clothing and accessories</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
