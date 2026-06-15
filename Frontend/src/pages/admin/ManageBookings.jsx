import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiSearch, HiX, HiTrash } from "react-icons/hi";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { to12Hour } from "../../utils/helpers";

const STATUSES = ["pending", "approved", "rejected", "cancelled", "completed"];

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);

  function fetchBookings() {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    api.get("/admin/bookings", { params })
      .then((r) => setBookings(r.data))
      .catch(() => toast.error("Failed to fetch bookings"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchBookings(); }, [search, statusFilter, dateFrom, dateTo]);

  async function updateStatus(id, status) {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch {
      toast.error("Update failed");
    }
  }

  async function deleteBooking(id) {
    if (!confirm("Delete this booking?")) return;
    try {
      await api.delete(`/admin/bookings/${id}`);
      toast.success("Booking deleted");
      fetchBookings();
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Booking Management</h2>
        <p>View, search, filter, and manage all bookings</p>
      </div>

      <div className="table-toolbar">
        <div className="search-wrap">
          <HiSearch />
          <input type="text" placeholder="Search by name, email, phone, ground..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
        {(dateFrom || dateTo) && (
          <button className="btn-secondary" style={{ padding: "9px 16px", fontSize: "0.85rem" }} onClick={() => { setDateFrom(""); setDateTo(""); }}>
            Clear
          </button>
        )}
      </div>

      <div className="table-card glass">
        {loading ? (
          <p className="table-loading">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="table-empty">No bookings found</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Ground</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Booked At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <motion.tr key={b._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td>
                      <div className="td-name">{b.name}</div>
                      <div className="td-sub">{b.email}</div>
                    </td>
                    <td>{b.groundName}</td>
                    <td>{b.date}</td>
                    <td>{to12Hour(b.startTime)} – {to12Hour(b.endTime)}</td>
                    <td>{b.duration}h</td>
                    <td>₹{b.totalPrice.toLocaleString("en-IN")}</td>
                    <td>{new Date(b.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}</td>
                    <td>
                      <div className="td-actions">
                        {b.status === "pending" && (
                          <button className="action-btn reject" onClick={() => updateStatus(b._id, "rejected")} title="Reject"><HiX /></button>
                        )}
                        {b.status === "approved" && (
                          <button className="action-btn cancel" onClick={() => updateStatus(b._id, "cancelled")} title="Cancel">Cancel</button>
                        )}
                        <button className="action-btn delete" onClick={() => deleteBooking(b._id)} title="Delete"><HiTrash /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
