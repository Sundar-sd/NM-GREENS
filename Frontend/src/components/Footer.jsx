import { Link } from "react-router-dom";
import { HiPhone, HiMail, HiLocationMarker } from "react-icons/hi";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3><img src={logo} alt="NM GREENS" className="footer-logo-img" /></h3>
            <p>Premium Cricket and Tennis Ball Ground booking platform. Book your game, play your way.</p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/booking?ground=cricket">Cricket Ground</Link>
              <Link to="/booking?ground=tennis">Tennis Ground</Link>
              <Link to="/login">Sign In</Link>
            </div>
          </div>

          <div>
            <h4>Contact</h4>
            <div className="footer-contact">
              <p><HiPhone /> +91 98765 43210</p>
              <p><HiMail /> info@nmgreens.com</p>
              <p><HiLocationMarker /> Chennai, Tamil Nadu</p>
            </div>
          </div>
        </div>
                                 
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NM Greens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
