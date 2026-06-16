import { useState, useEffect } from "react";
import { HiCalendar, HiClock, HiCash, HiLocationMarker, HiX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { to12Hour } from "../utils/helpers";
import api from "../api/axios";
import "../styles/mybookings.css";

const statusColors = {
  pending: { bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" },
  approved: { bg: "rgba(34, 197, 94, 0.12)", color: "#22c55e" },
  completed: { bg: "rgba(99, 102, 241, 0.12)", color: "#6366f1" },
  cancelled: { bg: "rgba(148, 163, 184, 0.12)", color: "#64748b" },
  rejected: { bg: "rgba(239, 68, 68, 0.12)", color: "#ef4444" },
};

const statusLabels = {
  pending: "Booked",
  approved: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const paymentLabels = {
  upi_gpay: "Google Pay",
  upi_paytm: "Paytm",
  upi_phonepe: "PhonePe",
  upi_bhim: "BHIM UPI",
  vault: "Vault Balance",
  unknown: "—",
};

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get("/bookings/my", { params: { userId: user._id } })
      .then(({ data }) => setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="mybookings-page">
      <div className="mybookings-header">
        <HiCalendar size={22} />
        <h2>My Bookings</h2>
      </div>

      {loading ? (
        <div className="loading-text">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="mybookings-empty">
          <HiCalendar size={48} />
          <h3>No bookings yet</h3>
          <p>Book a cricket or tennis ground to get started.</p>
        </div>
      ) : (
        <div className="mybookings-list">
          {bookings.map((b) => {
            const sc = statusColors[b.status] || statusColors.pending;
            return (
              <div key={b._id} className="mybooking-card" onClick={() => setSelected(b)}>
                <div className="mybooking-card-top">
                  <span className="mybooking-date"><HiCalendar size={14} /> {formatDate(b.date)}</span>
                  <span className="mybooking-status" style={{ background: sc.bg, color: sc.color }}>{statusLabels[b.status] || b.status}</span>
                </div>
                <div className="mybooking-card-body">
                  <h3>{b.groundName}</h3>
                  <div className="mybooking-card-meta">
                    <span><HiClock size={14} /> {to12Hour(b.startTime)} – {to12Hour(b.endTime)} · {b.duration} hr{b.duration > 1 ? "s" : ""}</span>
                    <span><HiCash size={14} /> ₹{b.totalPrice?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card booking-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelected(null)}><HiX size={20} /></button>

            <div className="booking-detail-top">
              <div>
                <h3>{selected.groundName}</h3>
                <span className="mybooking-status" style={{ background: (statusColors[selected.status] || statusColors.pending).bg, color: (statusColors[selected.status] || statusColors.pending).color }}>
                  {statusLabels[selected.status] || selected.status}
                </span>
              </div>
              <span className="booking-detail-id">#{selected._id}</span>
            </div>

            <div className="booking-detail-grid">
              <div className="booking-detail-item">
                <label>Date</label>
                <span>{formatDate(selected.date)}</span>
              </div>
              <div className="booking-detail-item">
                <label>Time</label>
                <span>{to12Hour(selected.startTime)} – {to12Hour(selected.endTime)} · {selected.duration} hr{selected.duration > 1 ? "s" : ""}</span>
              </div>
              <div className="booking-detail-item">
                <label>Booked On</label>
                <span>{formatTime(selected.createdAt)}</span>
              </div>
              <div className="booking-detail-item">
                <label>Payment</label>
                <span>{paymentLabels[selected.paymentMethod] || "—"}</span>
              </div>
            </div>

            <div className="booking-detail-section">
              <h4>Price Breakdown</h4>
              <div className="booking-detail-prices">
                <div className="bd-price-row">
                  <span>Subtotal</span>
                  <span>₹{((selected.totalPrice || 0) - (selected.platformFee || 0)).toLocaleString("en-IN")}</span>
                </div>
                <div className="bd-price-row">
                  <span>Platform Fee</span>
                  <span>₹{(selected.platformFee || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="bd-price-row gst-row">
                  <span>GST ({Number(localStorage.getItem("nm_gst_rate")) || 18}%)</span>
                  <span className="gst-added">+₹{(selected.gstAmount || 0).toLocaleString("en-IN")}</span>
                </div>
                {selected.gstWaived && (
                  <div className="bd-price-row discount-row">
                    <span>Discount</span>
                    <span className="gst-waived">−₹{(selected.gstAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                )}
                {selected.paidFromVault > 0 && (
                  <div className="bd-price-row bd-price-vault">
                    <span>Paid from Vault</span>
                    <span>₹{(selected.paidFromVault || 0).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="bd-price-row bd-price-total">
                  <span>Total</span>
                  <span>₹{(selected.totalPrice || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="booking-detail-section">
              <h4>Customer Details</h4>
              <div className="booking-detail-grid">
                <div className="booking-detail-item">
                  <label>Name</label>
                  <span>{selected.name}</span>
                </div>
                <div className="booking-detail-item">
                  <label>Phone</label>
                  <span>{selected.phone || "—"}</span>
                </div>
                <div className="booking-detail-item">
                  <label>Email</label>
                  <span>{selected.email || "—"}</span>
                </div>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={() => setSelected(null)} style={{ width: "100%", marginTop: 8 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
