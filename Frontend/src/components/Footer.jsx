import { Link } from "react-router-dom";
import { HiPhone, HiMail, HiLocationMarker } from "react-icons/hi";
import logo from "../assets/logo.png";

export default function Footer() {
  const contact = JSON.parse(
    localStorage.getItem("nm_contact") ||
      '{"phone":"+91 98765 43210","email":"info@nmgreens.com","address":"Chennai, Tamil Nadu"}'
  );
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
              <p><HiPhone /> {contact.phone}</p>
              <p><HiMail /> {contact.email}</p>
              <p><HiLocationMarker /> {contact.address}</p>
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
