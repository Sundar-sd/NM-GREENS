import { NavLink } from "react-router-dom";
import { HiChartBar, HiBookOpen, HiCollection, HiClock, HiCash } from "react-icons/hi";
import logo from "../assets/logo.png";

const links = [
  { to: "/admin", icon: HiChartBar, label: "Dashboard", end: true },
  { to: "/admin/bookings", icon: HiBookOpen, label: "Bookings" },
  { to: "/admin/grounds", icon: HiCollection, label: "Grounds" },
  { to: "/admin/slots", icon: HiClock, label: "Slots" },
  { to: "/admin/pricing", icon: HiCash, label: "Pricing" },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand"><img src={logo} alt="NM GREENS" className="sidebar-logo-img" /></div>
      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <l.icon size={18} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
