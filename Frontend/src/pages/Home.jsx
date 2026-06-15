import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowRight, HiShieldCheck, HiLightningBolt, HiStar, HiClock, HiDeviceMobile, HiCreditCard, HiCash } from "react-icons/hi";
import Reveal from "../components/common/Reveal";
import Counter from "../components/common/Counter";
import { useAuth } from "../context/AuthContext";
import VaultModal from "../components/VaultModal";
import logo from "../assets/logo.png";

const features = [
  { icon: HiLightningBolt, title: "Instant Booking", desc: "Book in under 2 minutes" },
  { icon: HiStar, title: "Real-Time Availability", desc: "Live slot status updates" },
  { icon: HiShieldCheck, title: "Premium Grounds", desc: "Top quality surfaces" },
  { icon: HiClock, title: "Flood Lights", desc: "Play any time day or night" },
  { icon: HiCreditCard, title: "Secure Payments", desc: "100% safe transactions" },
  { icon: HiDeviceMobile, title: "Mobile Friendly", desc: "Book from any device" },
];

const stats = [
  { end: 5000, suffix: "+", label: "Bookings" },
  { end: 2, suffix: "", label: "Premium Grounds" },
  { end: 24, suffix: "/7", label: "Support" },
  { end: 99, suffix: "%", label: "Satisfaction" },
];

const grounds = [
  {
    name: "Cricket Ball Ground",
    type: "cricket",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
    capacity: "22 Players",
    features: ["Natural Turf Wickets", "Floodlights Available", "Practice Nets", "Changing Rooms"],
    price: "₹500/hr",
    link: "/booking?ground=cricket",
  },
  {
    name: "Tennis Ball Ground",
    type: "tennis",
    image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
    capacity: "22 Players",
    features: ["Natural Grass Outfield", "Floodlights Available", "Equipment Rental", "Coaching Available"],
    price: "₹300/hr",
    link: "/booking?ground=tennis",
  },
];

const faqs = [
  { q: "How do I book a ground?", a: "Simply go to the booking page, select your ground, pick a date and time, fill in your details, and confirm. It takes less than 2 minutes!" },
  { q: "What are the operating hours?", a: "Our grounds are open 24/7. Floodlights are available for night sessions at no extra cost." },
  { q: "Can I cancel or reschedule?", a: "Yes, you can cancel or reschedule up to 24 hours before your booking free of charge." },
  { q: "Are equipment and gear provided?", a: "Basic equipment like bats, balls, and stumps are available for rent at the ground." },
  { q: "Do you host tournaments?", a: "Absolutely! Contact us for custom packages and bulk booking discounts." },
];

const GROUNDS_DATA = [
  {
    name: "Cricket Ball Ground",
    type: "cricket",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
    price: "₹500/hr",
    link: "/booking?ground=cricket",
  },
  {
    name: "Tennis Ball Ground",
    type: "tennis",
    image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
    price: "₹300/hr",
    link: "/booking?ground=tennis",
  },
];

export default function Home() {
  const { user } = useAuth();
  const [vaultOpen, setVaultOpen] = useState(false);

  if (user) {
    const statPills = [
      { icon: "🏏", label: "5K+ Bookings" },
      { icon: "⭐", label: "99% Satisfaction" },
    ];
    return (
      <section className="home-loggedin">
        <div className="home-loggedin-bg" />

        <div className="home-loggedin-inner">
          <motion.div
            className="home-loggedin-welcome"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="home-loggedin-greeting">
              <h1>Welcome back, <span className="gradient-text">{user.name?.split(" ")[0]}</span></h1>
              <p>Ready to play? Book your ground now</p>
            </div>
            <button className="home-loggedin-vault-badge" onClick={() => setVaultOpen(true)}>
              <HiCash />
              <span>₹{(user.vaultBalance || 0).toLocaleString("en-IN")}</span>
            </button>
          </motion.div>

          <motion.div
            className="home-loggedin-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {statPills.map((s) => (
              <span key={s.label} className="home-stat-pill">{s.icon} {s.label}</span>
            ))}
          </motion.div>

          <motion.div
            className="home-loggedin-grid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {GROUNDS_DATA.map((g, i) => (
              <motion.div
                key={g.type}
                className="home-loggedin-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.15 }}
                whileHover={{ y: -8 }}
              >
                <div className="home-loggedin-image" style={{ backgroundImage: `url(${g.image})` }}>
                  <div className="home-loggedin-overlay" />
                  <div className="home-loggedin-price-tag">{g.price}</div>
                  {i === 0 && <span className="home-loggedin-badge">Most Booked</span>}
                  {i === 1 && <span className="home-loggedin-badge popular">Popular</span>}
                </div>
                <div className="home-loggedin-body">
                  <h2>{g.name}</h2>
                  <div className="home-loggedin-features">
                    <span>🏏 Full Day</span>
                    <span>🌙 Floodlights</span>
                  </div>
                  <Link to={g.link} className="btn-primary home-book-btn">
                    Book Now <HiArrowRight />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <AnimatePresence>
          {vaultOpen && <VaultModal onClose={() => setVaultOpen(false)} />}
        </AnimatePresence>
      </section>
    );
  }

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="home-hero">
        <div className="home-hero-bg" />
        <div className="hero-watermark">
          <div className="hero-watermark-glow" />
          <img src={logo} alt="" className="hero-watermark-img" />
        </div>
        <div className="hero-glass" />
        <div className="home-hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Sports
            <br />
            <span className="gradient-text">Booking Platform</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Book Premium Cricket and Tennis Ball Grounds Instantly
          </motion.p>
          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/booking?ground=cricket" className="btn-primary">
              Book Cricket Ground <HiArrowRight />
            </Link>
            <Link to="/booking?ground=tennis" className="btn-secondary">
              Book Tennis Ball Ground <HiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="section features-section">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: "center" }}>
              <span className="section-tag">Features</span>
              <h2>Why Choose NM Greens?</h2>
              <p className="section-subtitle">We provide the best sports infrastructure for your game</p>
            </div>
          </Reveal>
          <div className="features-grid">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="feature-card glass">
                  <f.icon className="feature-icon" />
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="stat-item">
                  <h2>
                    <Counter end={s.end} suffix={s.suffix} />
                  </h2>
                  <p>{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Ground Showcase ─── */}
      <section className="section showcase-section">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: "center" }}>
              <span className="section-tag">Our Grounds</span>
              <h2>Premium Facilities</h2>
              <p className="section-subtitle">Two world-class grounds for your game</p>
            </div>
          </Reveal>
          <div className="showcase-grid">
            {grounds.map((g, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="showcase-card">
                  <div className="showcase-image" style={{ backgroundImage: `url(${g.image})` }}>
                    <div className="showcase-image-overlay" />
                  </div>
                  <div className="showcase-body">
                    <h3>{g.name}</h3>
                    <div className="showcase-capacity">
                      <HiStar /> {g.capacity}
                    </div>
                    <div className="showcase-features">
                      {g.features.map((f, j) => (
                        <span key={j} className="showcase-tag">{f}</span>
                      ))}
                    </div>
                    <div className="showcase-price">
                      <span className="price-value">{g.price}</span>
                      <span className="price-label">Starting from</span>
                    </div>
                    <Link to={g.link} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                      Book Now <HiArrowRight />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="section testimonials-section">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: "center" }}>
              <span className="section-tag">Testimonials</span>
              <h2>What Our Customers Say</h2>
              <p className="section-subtitle">Real reviews from real players</p>
            </div>
          </Reveal>
          <div className="testimonials-grid">
            {[
              { name: "Rajesh Kumar", role: "Cricket Enthusiast", text: "Excellent grounds with top-notch facilities. The floodlights make evening matches possible. Highly recommend!", rating: 5 },
              { name: "Priya Sharma", role: "Tennis Ball Cricket Player", text: "Great grounds for tennis-ball cricket. Booking is super easy and the staff is very helpful.", rating: 5 },
              { name: "Arun Prasad", role: "Regular Customer", text: "Been using NM Greens for months. The 24/7 support is fantastic and the grounds are always in great condition.", rating: 4 },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="testimonial-card glass">
                  <div className="testimonial-stars">
                    {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
                  </div>
                  <p className="testimonial-text">"{t.text}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="section faq-section">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: "center" }}>
              <span className="section-tag">FAQ</span>
              <h2>Frequently Asked Questions</h2>
              <p className="section-subtitle">Everything you need to know</p>
            </div>
          </Reveal>
          <div className="faq-list">
            {faqs.map((item, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <details className="faq-item glass">
                  <summary className="faq-question">
                    <span>{item.q}</span>
                    <span className="faq-chevron">▾</span>
                  </summary>
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
