import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import toast from "react-hot-toast";
import api from "../../api/axios";

const EMPTY = { name: "", type: "cricket", description: "", capacity: "", features: "", pricePerHour: "", isAvailable: true, images: [] };

export default function ManageGrounds() {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const isEditing = modal === "edit";
  const modalData = isEditing ? modal : null;

  function fetchGrounds() {
    setLoading(true);
    api.get("/grounds")
      .then((r) => setGrounds(r.data))
      .catch(() => toast.error("Failed to fetch grounds"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchGrounds(); }, []);

  function openAdd() {
    setForm(EMPTY);
    setModal("add");
  }

  function openEdit(g) {
    setForm({ ...g, features: g.features?.join(", ") || "", images: [] });
    setModal("edit");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload._id;
      delete payload.images;
      if (modal === "add") {
        await api.post("/grounds", payload);
        toast.success("Ground added");
      } else {
        await api.put(`/grounds/${form._id}`, payload);
        toast.success("Ground updated");
      }
      setModal(null);
      fetchGrounds();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this ground?")) return;
    try {
      await api.delete(`/grounds/${id}`);
      toast.success("Ground deleted");
      fetchGrounds();
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Ground Management</h2>
        <p>Add, edit, or remove sports grounds</p>
      </div>

      <button className="btn-primary add-btn" onClick={openAdd}>
        <HiPlus /> Add Ground
      </button>

      <div className="table-card glass">
        {loading ? (
          <p className="table-loading">Loading...</p>
        ) : grounds.length === 0 ? (
          <p className="table-empty">No grounds found</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Price/hr</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {grounds.map((g) => (
                  <motion.tr key={g._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td className="td-name">{g.name}</td>
                    <td><span className="status-badge">{g.type}</span></td>
                    <td>{g.capacity}</td>
                    <td>₹{g.pricePerHour}</td>
                    <td><span className={`status-badge ${g.isAvailable ? "approved" : "cancelled"}`}>{g.isAvailable ? "Available" : "Unavailable"}</span></td>
                    <td>
                      <div className="td-actions">
                        <button className="action-btn edit" onClick={() => openEdit(g)}><HiPencil /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(g._id)}><HiTrash /></button>
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
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-card glass modal-lg" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3>{isEditing ? "Edit Ground" : "Add Ground"}</h3>
              <form onSubmit={handleSave} className="modal-form">
                <div className="form-group">
                  <label>Ground Name</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Type</label>
                    <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                      <option value="cricket">Cricket Ball</option>
                      <option value="tennis">Tennis Ball</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Capacity</label>
                    <input type="number" required value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Price per Hour (₹)</label>
                    <input type="number" required value={form.pricePerHour} onChange={(e) => setForm((p) => ({ ...p, pricePerHour: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Features (comma separated)</label>
                    <input type="text" value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} />
                  </div>
                </div>
                {!isEditing && (
                  <div className="form-group">
                    <label>Images</label>
                    <input type="file" multiple accept="image/*" onChange={(e) => setForm((p) => ({ ...p, images: e.target.files }))} />
                  </div>
                )}
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))} />
                    Ground is available for booking
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? "Saving..." : isEditing ? "Update" : "Create"}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
