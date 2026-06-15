import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowLeft, HiPlus, HiTrash } from "react-icons/hi";
import toast from "react-hot-toast";
import api from "../../api/axios";

const EMPTY_SLOT = { "12_06": 0, "12_18": 0, "24": 0 };

export default function GroundPricing() {
  const { groundId } = useParams();
  const navigate = useNavigate();

  const [ground, setGround] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [basePrice, setBasePrice] = useState("");
  const [weekendPrice, setWeekendPrice] = useState("");
  const [slotPricing, setSlotPricing] = useState({ ...EMPTY_SLOT });
  const [datePricing, setDatePricing] = useState([]);
  const [showDateForm, setShowDateForm] = useState(false);
  const [dateLabel, setDateLabel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePrice, setDatePrice] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get("/grounds")
      .then((r) => {
        const g = r.data.find((x) => x.id === groundId);
        if (!g) { toast.error("Ground not found"); navigate("/admin/pricing"); return; }
        setGround(g);
        setBasePrice(String(g.pricePerHour));
        setWeekendPrice(String(g.weekendPricePerHour || ""));
        setSlotPricing({ ...EMPTY_SLOT, ...(g.slotPricing || {}) });
        setDatePricing(g.dateBasedPricing || []);
      })
      .catch(() => toast.error("Failed to load ground"))
      .finally(() => setLoading(false));
  }, [groundId, navigate]);

  function num(v) {
    const n = parseInt(v);
    return isNaN(n) ? 0 : n;
  }

  function addDatePricing() {
    if (!dateLabel.trim() || !dateFrom || !dateTo || !datePrice) {
      toast.error("Fill all fields"); return;
    }
    if (dateFrom > dateTo) { toast.error("From date must be before To date"); return; }
    setDatePricing(prev => [...prev, {
      _id: "dbp" + Date.now(),
      label: dateLabel.trim(),
      from: dateFrom,
      to: dateTo,
      pricePerHour: num(datePrice),
    }]);
    setShowDateForm(false);
    setDateLabel(""); setDateFrom(""); setDateTo(""); setDatePrice("");
  }

  function removeDatePricing(id) {
    setDatePricing(prev => prev.filter(d => d._id !== id));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!ground) return;
    const bp = num(basePrice);
    if (bp < 1) { toast.error("Base price must be at least ₹1"); return; }
    setSaving(true);
    try {
      const payload = {
        pricePerHour: bp,
        weekendPricePerHour: num(weekendPrice) || 0,
        dateBasedPricing: datePricing,
      };
      if (ground.type === "cricket") {
        payload.slotPricing = {
          "12_06": num(slotPricing["12_06"]) || 0,
          "12_18": num(slotPricing["12_18"]) || 0,
          "24": num(slotPricing["24"]) || 0,
        };
      }
      await api.put(`/grounds/${ground._id}`, payload);
      toast.success("Pricing updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-page"><p className="table-loading">Loading...</p></div>;
  if (!ground) return null;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <button className="btn-secondary" onClick={() => navigate("/admin/pricing")}>
          <HiArrowLeft /> Back
        </button>
        <h2>Pricing — {ground.name}</h2>
        <p>Configure all pricing options for this ground</p>
      </div>

      <motion.div
        className="table-card glass"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSave} className="pricing-form">
          {/* Base price */}
          <div className="pricing-form-section">
            <h3>Base Pricing</h3>
            <div className="form-group">
              <label>Base Price per Hour (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
              <span className="field-hint">Default rate used when no special pricing applies</span>
            </div>
          </div>

          {/* Special Rates */}
          <div className="pricing-form-section">
            <h3>Special Rates</h3>
            <p className="section-subtitle">Leave at 0 to use the base price</p>
            <div className="form-group">
              <label>Weekend Price per Hour (₹)</label>
              <input
                type="number"
                min="0"
                value={weekendPrice}
                onChange={(e) => setWeekendPrice(e.target.value)}
                placeholder="0 = use base price"
              />
              <span className="field-hint">Applied on Saturdays and Sundays</span>
            </div>
          </div>

          {/* Cricket slot packages */}
          {ground.type === "cricket" && (
            <div className="pricing-form-section">
              <h3>Cricket Slot Packages</h3>
              <p className="section-subtitle">Flat-rate packages by slot type. Leave at 0 for hourly rate.</p>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>12hr Day (6AM–6PM) — ₹</label>
                  <input
                    type="number"
                    min="0"
                    value={slotPricing["12_06"]}
                    onChange={(e) => setSlotPricing((p) => ({ ...p, "12_06": e.target.value }))}
                    placeholder="0 = hourly × 12"
                  />
                </div>
                <div className="form-group">
                  <label>12hr Night (6PM–6AM) — ₹</label>
                  <input
                    type="number"
                    min="0"
                    value={slotPricing["12_18"]}
                    onChange={(e) => setSlotPricing((p) => ({ ...p, "12_18": e.target.value }))}
                    placeholder="0 = hourly × 12"
                  />
                </div>
                <div className="form-group">
                  <label>24hr Full Day — ₹</label>
                  <input
                    type="number"
                    min="0"
                    value={slotPricing["24"]}
                    onChange={(e) => setSlotPricing((p) => ({ ...p, "24": e.target.value }))}
                    placeholder="0 = hourly × 24"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Date-Based Pricing */}
          <div className="pricing-form-section">
            <h3>Date-Based Pricing</h3>
            <p className="section-subtitle">Override base price for specific date ranges (e.g. peak season)</p>

            {datePricing.length > 0 && (
              <div className="date-pricing-list">
                {datePricing.map(d => (
                  <div key={d._id} className="date-pricing-row">
                    <span className="date-pricing-label">{d.label}</span>
                    <span className="date-pricing-dates">{d.from} → {d.to}</span>
                    <span className="date-pricing-price">₹{d.pricePerHour}/hr</span>
                    <button type="button" className="btn-icon" onClick={() => removeDatePricing(d._id)}><HiTrash /></button>
                  </div>
                ))}
              </div>
            )}

            {!showDateForm ? (
              <button type="button" className="btn-primary add-btn" onClick={() => setShowDateForm(true)}>
                <HiPlus /> Add Date Range
              </button>
            ) : (
              <div className="date-pricing-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Label</label>
                    <input type="text" value={dateLabel} onChange={e => setDateLabel(e.target.value)} placeholder="e.g. Summer Peak" />
                  </div>
                  <div className="form-group">
                    <label>Price per Hour (₹)</label>
                    <input type="number" min="1" value={datePrice} onChange={e => setDatePrice(e.target.value)} placeholder="Override price" />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                  </div>
                </div>
                <div className="modal-actions" style={{ marginTop: 8 }}>
                  <button type="button" className="btn-primary" onClick={addDatePricing}>Add</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowDateForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Save */}
          <div className="modal-actions" style={{ marginTop: 24 }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Pricing"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate("/admin/pricing")}>
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
