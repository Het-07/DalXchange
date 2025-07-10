import { Link } from "react-router-dom";
import "./Footer.css";
import { Instagram, Youtube, Linkedin, Twitter, Globe } from "lucide-react";
import logo from "../../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logo || "/placeholder.svg"} alt="DalXchange Logo" />
            </div>

            <p className="footer-tagline">
              The marketplace exclusively for the Dalhousie community
            </p>

            <div className="footer-social">
              <a
                href="https://www.instagram.com/dalhousie_university/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.linkedin.com/school/dalhousie-university/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://www.youtube.com/user/dalhousieu"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a
                href="https://twitter.com/dalhousieu"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://www.dal.ca"
                target="_blank"
                rel="noreferrer"
                aria-label="Website"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>

          <div className="footer-links-container">
            <div className="footer-links-column">
              <h3>DalXchange</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/listings">Browse Listings</Link>
                </li>
                <li>
                  <Link to="/create-listing">Create Listing</Link>
                </li>
                <li>
                  <Link to="/profile">My Profile</Link>
                </li>
                <li>
                  <Link to="/saved">Saved Items</Link>
                </li>
                <li>
                  <Link to="/messages">Messages</Link>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Categories</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/listings/textbooks">Textbooks</Link>
                </li>
                <li>
                  <Link to="/listings/electronics">Electronics</Link>
                </li>
                <li>
                  <Link to="/listings/furniture">Furniture</Link>
                </li>
                <li>
                  <Link to="/listings/apparel">Apparel</Link>
                </li>
                <li>
                  <Link to="/listings/other">Other</Link>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Information</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/about">About DalXchange</Link>
                </li>
                <li>
                  <Link to="/faq">FAQ</Link>
                </li>
                <li>
                  <Link to="/terms">Terms of Service</Link>
                </li>
                <li>
                  <Link to="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/contact">Contact Us</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} DalXchange | All Rights Reserved
          </p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/accessibility">Accessibility</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
