import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { HiPhone, HiMail, HiLocationMarker, HiCog } from "react-icons/hi";
import api from "../../api/axios";

const defaultContact = { phone: "+91 98765 43210", email: "info@nmgreens.com", address: "Chennai, Tamil Nadu" };

const fields = [
  { key: "phone", icon: HiPhone, type: "text", placeholder: "+91 98765 43210", desc: "Phone Number" },
  { key: "email", icon: HiMail, type: "email", placeholder: "info@nmgreens.com", desc: "Email Address" },
  { key: "address", icon: HiLocationMarker, type: "text", placeholder: "Chennai, Tamil Nadu", desc: "Address" },
];

export default function Settings() {
  const [form, setForm] = useState({ ...defaultContact });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/contact").then(({ data }) => {
      if (data) setForm({ phone: data.phone || "", email: data.email || "", address: data.address || "" });
    });
  }, []);

  function set(key) {
    return (e) => setForm({ ...form, [key]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.phone.trim() || !form.email.trim() || !form.address.trim()) {
      return toast.error("All fields are required");
    }
    setSaving(true);
    try {
      await api.put("/admin/contact", form);
      toast.success("Contact settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-wrapper">
      <div className="settings-header">
        <div className="settings-header-icon"><HiCog size={24} /></div>
        <div>
          <h2>Contact Settings</h2>
          <p className="settings-subtitle">Manage your business contact details</p>
        </div>
      </div>

      <div className="settings-card">
        <form onSubmit={handleSave}>
          {fields.map((f) => (
            <div className="settings-field" key={f.key}>
              <div className="settings-field-icon"><f.icon size={18} /></div>
              <div className="settings-field-input">
                <label>{f.desc}</label>
                <input type={f.type} value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} />
              </div>
            </div>
          ))}
          <button type="submit" className={`settings-save-btn${saving ? " loading" : ""}`} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
