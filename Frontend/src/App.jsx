import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/admin/Dashboard";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageGrounds from "./pages/admin/ManageGrounds";
import SlotManagement from "./pages/admin/SlotManagement";
import Pricing from "./pages/admin/Pricing";
import GroundPricing from "./pages/admin/GroundPricing";
import Settings from "./pages/admin/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<ManageBookings />} />
        <Route path="grounds" element={<ManageGrounds />} />
        <Route path="slots" element={<SlotManagement />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="pricing/:groundId" element={<GroundPricing />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

