import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX, HiSun, HiMoon } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
    setOpen(false);
  }

  const links = [
    { label: "Home", path: "/" },
    { label: "Cricket Ground", path: "/booking?ground=cricket" },
    { label: "Tennis Ground", path: "/booking?ground=tennis" },
  ];

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">NM GREENS</Link>

        <div className="nav-right">
          <div className="nav-links-desktop">
            {links.map((l) => (
              <Link key={l.path} to={l.path} className="nav-link">
                {l.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link to="/admin" className="nav-link nav-link-admin">
                Admin
              </Link>
            )}
          </div>

          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <HiMoon size={18} /> : <HiSun size={18} />}
          </button>

          {user ? (
            <div className="nav-user">
              <span className="nav-user-name">{user.name}</span>
              <button className="nav-logout" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="nav-login-btn">Sign In</Link>
          )}

          <button className="hamburger" onClick={() => setOpen((p) => !p)} aria-label="Menu">
            {open ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {links.map((l) => (
              <Link key={l.path} to={l.path} className="nav-mobile-link" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link to="/admin" className="nav-mobile-link" onClick={() => setOpen(false)}>Admin</Link>
            )}
            {user ? (
              <button className="nav-mobile-link" onClick={handleLogout}>Logout</button>
            ) : (
              <Link to="/login" className="nav-mobile-link" onClick={() => setOpen(false)}>Sign In</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
