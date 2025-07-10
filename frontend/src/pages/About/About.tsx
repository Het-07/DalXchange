import "./About.css";

const About = () => {
  return (
    <main className="about-main">
      <div className="about-container">
        <h1 className="about-title">About DalXchange</h1>

        <section className="about-section">
          <h2 className="section-heading">Our Mission</h2>
          <p className="section-text">
            DalXchange is a marketplace created exclusively for the Dalhousie
            University community. Our mission is to provide students with a
            safe, convenient platform to buy and sell used items within the
            university community.
          </p>
          <p className="section-text">
            Whether you're looking for textbooks, furniture for your apartment,
            electronics, or clothing, DalXchange connects you with fellow
            students who have what you need or want what you're selling.
          </p>
        </section>

        <section className="about-section">
          <h2 className="section-heading">How It Works?</h2>
          <div className="how-it-works-grid">
            <div className="info-card">
              <div className="icon">📱</div>
              <h3 className="card-title">Create An Account</h3>
              <p className="card-text">
                Sign up with your Dalhousie email address to join our community
                marketplace.
              </p>
            </div>
            <div className="info-card">
              <div className="icon">📦</div>
              <h3 className="card-title">Post Your Listings</h3>
              <p className="card-text">
                Take photos, set a price, and create detailed listings for items
                you want to sell.
              </p>
            </div>
            <div className="info-card">
              <div className="icon">🔍</div>
              <h3 className="card-title">Browse & Connect</h3>
              <p className="card-text">
                Search for items or browse categories to find what you need,
                then message sellers.
              </p>
            </div>
            <div className="info-card">
              <div className="icon">🤝</div>
              <h3 className="card-title">Meet & Exchange</h3>
              <p className="card-text">
                Arrange to meet on campus or nearby to complete the transaction
                safely.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2 className="section-heading">Why Choose DalXchange?</h2>
          <ul className="why-list">
            <li>
              Exclusive to the Dalhousie community - creating a safer
              marketplace experience
            </li>
            <li>Free to use - no listing fees or commissions</li>
            <li>Convenient campus-based exchanges</li>
            <li>Environmentally friendly - give used items a second life</li>
            <li>Save money compared to buying new</li>
            <li>Support your fellow students</li>
          </ul>
        </section>

        <section className="about-section">
          <h2 className="section-heading">Contact Us</h2>
          <p className="section-text">
            Have questions, suggestions, or feedback? We'd love to hear from
            you!
          </p>
          <p className="section-text">
            Email us at:{" "}
            <a href="mailto:support@dalxchange.ca" className="email-link">
              support@dalxchange.ca
            </a>
          </p>
        </section>
      </div>
    </main>
  );
};

export default About;
