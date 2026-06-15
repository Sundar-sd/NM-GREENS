import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiArrowRight, HiBadgeCheck } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";

function formatPrice(val) {
  if (!val) return "—";
  return `₹${val.toLocaleString("en-IN")}`;
}

function PriceTag({ label, value }) {
  return (
    <div className="price-tag">
      <span className="price-tag-label">{label}</span>
      <span className="price-tag-value">{formatPrice(value)}</span>
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gstRate, setGstRate] = useState(18);
  const [gstSaving, setGstSaving] = useState(false);

  function fetchData() {
    setLoading(true);
    Promise.all([
      api.get("/grounds"),
      api.get("/admin/gst-rate"),
    ])
      .then(([gr, gst]) => {
        setGrounds(gr.data);
        setGstRate(gst.data.rate);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  async function handleGstSave() {
    const val = parseFloat(gstRate);
    if (isNaN(val) || val < 0) { toast.error("Enter a valid GST rate"); return; }
    setGstSaving(true);
    try {
      await api.put("/admin/gst-rate", { rate: val });
      toast.success("GST rate updated");
    } catch {
      toast.error("Failed to update GST rate");
    } finally {
      setGstSaving(false);
    }
  }

  if (loading) return <div className="admin-page"><p className="table-loading">Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Pricing Management</h2>
        <p>Configure pricing for each ground — weekend, night, and slot-based rates</p>
      </div>

      <div className="pricing-platform-fee glass">
          <HiBadgeCheck size={22} />
          <div className="pricing-platform-fee-input">
            <label>GST (%)</label>
            <div className="pricing-fee-row">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
              />
              <button className="btn-primary" onClick={handleGstSave} disabled={gstSaving}>
                {gstSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

      <div className="pricing-grid">
        {grounds.map((g) => (
          <motion.div
            key={g._id}
            className="pricing-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="pricing-card-header">
              <h3>{g.name}</h3>
              <span className="status-badge">{g.type}</span>
            </div>
            <div className="pricing-card-body">
              <PriceTag label="Base Price / hr" value={g.pricePerHour} />
              <PriceTag label="Weekend Price / hr" value={g.weekendPricePerHour} />

              {g.type === "cricket" && g.slotPricing && (
                <div className="pricing-slot-section">
                  <span className="price-tag-label">Cricket Slot Packages</span>
                  <div className="pricing-slot-grid">
                    <span>12hr Day: <strong>{formatPrice(g.slotPricing["12_06"])}</strong></span>
                    <span>12hr Night: <strong>{formatPrice(g.slotPricing["12_18"])}</strong></span>
                    <span>24hr Full: <strong>{formatPrice(g.slotPricing["24"])}</strong></span>
                  </div>
                </div>
              )}
            </div>
            <button className="btn-primary pricing-configure-btn" onClick={() => navigate(`/admin/pricing/${g.id}`)}>
              Configure <HiArrowRight />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
