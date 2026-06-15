import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiBan, HiPencil, HiTrash, HiArrowLeft } from "react-icons/hi";
import toast from "react-hot-toast";
import api from "../../api/axios";
import TimePicker from "../../components/common/TimePicker";
import { to12Hour } from "../../utils/helpers";

const EMPTY_FORM = { groundId: "", date: "", startTime: "", endTime: "", reason: "", type: "blocked" };

export default function SlotManagement() {
  const [grounds, setGrounds] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [selectedGround, setSelectedGround] = useState(null);
  const isEditing = modal && typeof modal === "object";

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/grounds"),
      api.get("/admin/slots/restrictions"),
    ]).then(([g, r]) => {
      setGrounds(g.data);
      setRestrictions(r.data);
    }).catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/admin/slots/block/${modal._id}`, form);
        toast.success("Restriction updated");
      } else {
        await api.post("/admin/slots/block", form);
        toast.success(form.type === "maintenance" ? "Maintenance period added" : "Slot blocked");
      }
      setModal(null);
      setForm({ ...EMPTY_FORM });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/admin/slots/block/${id}`);
      toast.success("Restriction removed");
      fetchData();
    } catch {
      toast.error("Failed to remove");
    }
  }

  function openModal(groundId) {
    setForm({ ...EMPTY_FORM, groundId: groundId || "" });
    setModal("add");
  }

  function openEdit(r) {
    setForm({ groundId: r.groundId || r.ground, date: r.date, startTime: r.startTime, endTime: r.endTime, reason: r.reason || "", type: r.type });
    setModal(r);
  }

  const groundRestrictions = selectedGround
    ? restrictions.filter((r) => r.ground === selectedGround.id || r.ground === selectedGround._id)
    : [];

  if (loading) {
    return (
      <div className="admin-page">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {selectedGround ? (
        <>
          <div className="detail-header">
            <button className="back-btn" onClick={() => setSelectedGround(null)}>
              <HiArrowLeft /> Back to Overview
            </button>
            <h2>{selectedGround.name} — Slot Management</h2>
            <div className="detail-header-actions">
              <button className="btn-primary add-btn" onClick={() => openModal(selectedGround._id)}>
                <HiBan /> Add Restriction
              </button>
            </div>
          </div>

          {groundRestrictions.length === 0 ? (
            <p className="no-restrictions">No restrictions for this ground.</p>
          ) : (
            <div className="restriction-table-wrap">
              <table className="restriction-table">
                <thead>
                  <tr>
                    <th>Ground</th>
                    <th>Date</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groundRestrictions.map((r) => (
                    <tr key={r._id}>
                      <td>{selectedGround.name}</td>
                      <td>{r.date}</td>
                      <td>{to12Hour(r.startTime)}</td>
                      <td>{to12Hour(r.endTime)}</td>
                      <td>
                        <span className={`restriction-type-badge type-${r.type}`}>
                          {r.type === "maintenance" ? "Maintenance" : "Blocked"}
                        </span>
                      </td>
                      <td>{r.reason || "—"}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn-icon edit" onClick={() => openEdit(r)} title="Edit">
                            <HiPencil />
                          </button>
                          <button className="btn-icon" onClick={() => handleDelete(r._id)} title="Remove">
                            <HiTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="admin-header">
            <h2>Slot Management</h2>
            <p>Block slots or schedule maintenance periods</p>
          </div>

          <button className="btn-primary add-btn" onClick={() => openModal()}>
            <HiBan /> Block Slot / Maintenance
          </button>

          <div className="ground-slots">
            {grounds.map((g) => {
              const gr = restrictions.filter((r) => r.ground === g.id || r.ground === g._id);
              return (
                <div key={g._id} className="ground-slot-card glass">
                  <h3>{g.name}</h3>
                  <p className="slot-status-text">
                    {g.isAvailable ? (
                      <span className="status-badge approved">Available</span>
                    ) : (
                      <span className="status-badge cancelled">Unavailable</span>
                    )}
                  </p>

                  {(g.maintenanceSlots?.length > 0 || gr.length > 0) && (
                    <div className="maintenance-list">
                      {gr.map((r) => (
                        <div key={r._id} className="maintenance-item">
                          <div className="maintenance-item-info">
                            <span className={`restriction-type-badge type-${r.type}`}>{r.type === "maintenance" ? "Maint" : "Blocked"}</span>
                            <span>{r.date} | {to12Hour(r.startTime)} - {to12Hour(r.endTime)}</span>
                            {r.reason && <span className="maint-reason">{r.reason}</span>}
                          </div>
                          <button className="btn-icon edit" onClick={() => openEdit(r)} title="Edit" style={{ marginRight: 4 }}>
                            <HiPencil />
                          </button>
                          <button className="btn-icon" onClick={() => handleDelete(r._id)} title="Remove">
                            <HiTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {gr.length === 0 && (!g.maintenanceSlots || g.maintenanceSlots.length === 0) && (
                    <p className="no-restrictions">No blocked slots or maintenance periods</p>
                  )}

                  <button
                    className="btn-secondary"
                    style={{ marginTop: 12, width: "100%" }}
                    onClick={() => setSelectedGround(g)}
                  >
                    Manage Slots
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-card glass" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3>{isEditing ? "Edit Restriction" : "Block Slot / Add Maintenance"}</h3>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Ground</label>
                  <select value={form.groundId} onChange={(e) => setForm((p) => ({ ...p, groundId: e.target.value }))} required>
                    <option value="">Select ground</option>
                    {grounds.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                    <option value="blocked">Block Slot</option>
                    <option value="maintenance">Maintenance Period</option>
                  </select>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Reason</label>
                    <input type="text" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} placeholder="e.g. Maintenance" />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Start Time</label>
                    <TimePicker value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <TimePicker value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">{isEditing ? "Update" : "Apply"}</button>
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
