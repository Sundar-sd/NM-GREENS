import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import api from "../../api/axios";

const COLORS = ["#0d9488", "#14b8a6", "#f59e0b", "#6366f1", "#ef4444", "#22c55e"];

export default function RevenueAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/revenue")
      .then((r) => setAnalytics(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page"><p>Loading analytics...</p></div>;
  if (!analytics) return <div className="admin-page"><p>No data available</p></div>;

  const peakData = analytics.peakHours?.map((p) => ({
    hour: `${p._id}:00`,
    bookings: p.count,
  })) || [];

  const monthlyData = analytics.monthlyRevenue?.map((m) => ({
    month: m._id,
    revenue: m.revenue,
    bookings: m.count,
  })) || [];

  const trendData = analytics.bookingTrends?.map((t) => ({
    date: t._id?.slice(5) || t._id,
    bookings: t.count,
    revenue: t.revenue,
  })) || [];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Revenue Analytics</h2>
        <p>Track revenue, booking trends, and insights</p>
      </div>

      <div className="insight-cards">
        {analytics.mostBooked && (
          <motion.div className="insight-card glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3>Most Booked Ground</h3>
            <div className="insight-value">{analytics.mostBooked._id}</div>
            <p>{analytics.mostBooked.count} total bookings</p>
          </motion.div>
        )}
        {analytics.peakHours?.[0] && (
          <motion.div className="insight-card glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3>Peak Booking Hour</h3>
            <div className="insight-value">{analytics.peakHours[0]._id}:00</div>
            <p>{analytics.peakHours[0].count} bookings at this hour</p>
          </motion.div>
        )}
        <motion.div className="insight-card glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3>Monthly Revenue</h3>
          <div className="insight-value">
            ₹{monthlyData.reduce((sum, m) => sum + m.revenue, 0).toLocaleString("en-IN")}
          </div>
          <p>Total across all months</p>
        </motion.div>
      </div>

      <div className="admin-charts">
        <div className="chart-card glass">
          <h3>Booking Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--text-light)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--text-light)" />
              <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="bookings" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} name="Bookings" />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card glass">
          <h3>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--text-light)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--text-light)" />
              <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-charts">
        <div className="chart-card glass">
          <h3>Peak Booking Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--text-light)" />
              <YAxis dataKey="hour" type="category" tick={{ fontSize: 12 }} stroke="var(--text-light)" width={60} />
              <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="bookings" fill="#6366f1" radius={[0, 4, 4, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card glass">
          <h3>Monthly Booking Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--text-light)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--text-light)" />
              <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="bookings" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
