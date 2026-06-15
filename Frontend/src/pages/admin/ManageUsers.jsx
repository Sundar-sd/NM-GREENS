import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiSearch, HiPencil, HiTrash, HiBan } from "react-icons/hi";
import toast from "react-hot-toast";
import api from "../../api/axios";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);

  function fetchUsers() {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    api.get("/admin/users", { params })
      .then((r) => setUsers(r.data))
      .catch(() => toast.error("Failed to fetch users"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchUsers(); }, [search]);

  async function updateUser(id, data) {
    try {
      await api.put(`/admin/users/${id}`, data);
      toast.success("User updated");
      fetchUsers();
    } catch {
      toast.error("Update failed");
    }
  }

  async function deleteUser(id) {
    if (!confirm("Delete this user and all their bookings?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Delete failed");
    }
  }

  function toggleSuspend(user) {
    const newStatus = user.status === "active" ? "suspended" : "active";
    updateUser(user._id, { status: newStatus });
  }

  async function saveEdit() {
    try {
      await api.put(`/admin/users/${editModal._id}`, editModal);
      toast.success("User updated");
      setEditModal(null);
      fetchUsers();
    } catch {
      toast.error("Update failed");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>User Management</h2>
        <p>View, edit, suspend, or delete users</p>
      </div>

      <div className="table-toolbar">
        <div className="search-wrap">
          <HiSearch />
          <input type="text" placeholder="Search by name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-card glass">
        {loading ? (
          <p className="table-loading">Loading...</p>
        ) : users.length === 0 ? (
          <p className="table-empty">No users found</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <motion.tr key={u._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td className="td-name">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td><span className={`status-badge ${u.role}`}>{u.role}</span></td>
                    <td><span className={`status-badge ${u.status === "active" ? "approved" : "cancelled"}`}>{u.status}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="td-actions">
                        <button className="action-btn edit" onClick={() => setEditModal(u)} title="Edit"><HiPencil /></button>
                        <button className={`action-btn ${u.status === "active" ? "reject" : "approve"}`} onClick={() => toggleSuspend(u)} title={u.status === "active" ? "Suspend" : "Activate"}>
                          <HiBan />
                        </button>
                        <button className="action-btn delete" onClick={() => deleteUser(u._id)} title="Delete"><HiTrash /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-card glass" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3>Edit User</h3>
              <div className="modal-form">
                {["name", "email", "phone"].map((f) => (
                  <div className="form-group" key={f}>
                    <label>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                    <input type="text" value={editModal[f] || ""} onChange={(e) => setEditModal((p) => ({ ...p, [f]: e.target.value }))} />
                  </div>
                ))}
                <div className="form-group">
                  <label>Role</label>
                  <select value={editModal.role} onChange={(e) => setEditModal((p) => ({ ...p, role: e.target.value }))}>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={editModal.status} onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={saveEdit}>Save</button>
                <button className="btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
