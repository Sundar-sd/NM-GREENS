import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { HiBookOpen, HiCalendar, HiCash, HiUsers, HiClock, HiXCircle } from "react-icons/hi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import api from "../../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => setStats(r.data)).catch(() => {});
    api.get("/admin/revenue").then((r) => {
      setAnalytics(r.data);
      if (r.data?.bookingTrends?.length) {
        const dates = r.data.bookingTrends.map((d) => d._id).sort();
        if (!dateFrom) setDateFrom(dates[0]);
        if (!dateTo) setDateTo(dates[dates.length - 1]);
      }
    }).catch(() => {});
    api.get("/admin/notifications").then((r) => setNotifications(r.data)).catch(() => {});
  }, []);

  const isFiltered = dateFrom || dateTo;

  const filteredTrends = useMemo(() => {
    if (!analytics?.bookingTrends) return [];
    if (!dateFrom && !dateTo) return analytics.bookingTrends;
    return analytics.bookingTrends.filter((d) => {
      if (dateFrom && d._id < dateFrom) return false;
      if (dateTo && d._id > dateTo) return false;
      return true;
    });
  }, [analytics, dateFrom, dateTo]);

  const filteredStats = useMemo(() => {
    if (!stats) return null;
    if (!isFiltered || !analytics?.bookingTrends) return stats;
    const totalBookings = filteredTrends.reduce((sum, d) => sum + (d.count || 0), 0);
    const revenue = filteredTrends.reduce((sum, d) => sum + (d.revenue || 0), 0);
    return { ...stats, totalBookings, totalRevenue: revenue };
  }, [stats, analytics, isFiltered, filteredTrends]);

  const cards = (filteredStats || stats) ? [
    { icon: HiBookOpen, label: "Total Bookings", value: (filteredStats || stats).totalBookings, color: "#0d9488" },
    { icon: HiCalendar, label: "Today's Bookings", value: (filteredStats || stats).todayBookings, color: "#14b8a6" },
    { icon: HiCash, label: "Revenue", value: `₹${((filteredStats || stats).totalRevenue || 0).toLocaleString("en-IN")}`, color: "#f59e0b" },
    { icon: HiUsers, label: "Active Users", value: (filteredStats || stats).activeUsers, color: "#6366f1" },
    { icon: HiClock, label: "Available Slots", value: (filteredStats || stats).availableSlots, color: "#22c55e" },
    { icon: HiXCircle, label: "Occupied Slots", value: (filteredStats || stats).occupiedSlots, color: "#ef4444" },
  ] : [];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Dashboard</h2>
        <p>Overview of your sports booking platform</p>
      </div>

      <div className="table-toolbar" style={{ marginBottom: 24 }}>
        <div className="search-wrap" style={{ display: "flex", gap: 12, alignItems: "center", maxWidth: "none" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap", color: "var(--text)" }}>From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            max={dateTo || today}
            style={{ padding: "9px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.9rem", color: "var(--dark)", background: "var(--white)" }}
          />
          <label style={{ fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap", color: "var(--text)" }}>To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || undefined}
            max={today}
            style={{ padding: "9px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.9rem", color: "var(--dark)", background: "var(--white)" }}
          />
          {isFiltered && (
            <button className="btn-secondary" style={{ padding: "9px 16px", fontSize: "0.85rem" }} onClick={() => { setDateFrom(""); setDateTo(""); }}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid-admin">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            className="stat-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="stat-card-icon" style={{ background: `${card.color}15`, color: card.color }}>
              <card.icon />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-value">{card.value}</span>
              <span className="stat-card-label">{card.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="admin-charts">
        <div className="chart-card glass">
          <h3>Revenue {dateFrom && dateTo ? `(${dateFrom} to ${dateTo})` : "(Last 30 Days)"}</h3>
          {filteredTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} stroke="var(--text-light)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--text-light)" />
                <Tooltip
                  contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No data for this date range</p>
          )}
        </div>

        <div className="chart-card glass">
          <h3>Monthly Revenue</h3>
          {analytics?.monthlyRevenue ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} stroke="var(--text-light)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--text-light)" />
                <Tooltip
                  contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Bar dataKey="revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Loading chart data...</p>
          )}
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="notifications-panel glass" style={{ marginBottom: 32, padding: 24, borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <HiCalendar style={{ color: "var(--primary)" }} />
            <h3 style={{ fontSize: "1rem" }}>Recent Notifications</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.slice(0, 5).map((n) => (
              <div key={n._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--section-bg)", borderRadius: "var(--radius)", fontSize: "0.85rem" }}>
                <span>
                  <strong>{n.name}</strong> booked <strong>{n.groundName}</strong>
                  {n.status === "cancelled" && " (cancelled)"}
                </span>
                <span style={{ color: "var(--text-light)", fontSize: "0.8rem" }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-insights">
        {analytics?.mostBooked && (
          <div className="insight-card glass">
            <h3>Most Booked Ground</h3>
            <div className="insight-value">{analytics.mostBooked._id}</div>
            <p>{analytics.mostBooked.count} bookings</p>
          </div>
        )}
        {analytics?.peakHours && analytics.peakHours.length > 0 && (
          <div className="insight-card glass">
            <h3>Peak Booking Hour</h3>
            <div className="insight-value">{analytics.peakHours[0]._id}:00</div>
            <p>{analytics.peakHours[0].count} bookings</p>
          </div>
        )}
      </div>
    </div>
  );
}
