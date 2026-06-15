import { GROUNDS, BOOKING_STATS, REVENUE_DATA, SAMPLE_BOOKINGS, SAMPLE_USERS, SLOT_RESTRICTIONS } from "../utils/mockData";

function getBookings() {
  const d = localStorage.getItem("nm_bookings");
  return d ? JSON.parse(d) : [];
}
function setBookings(b) { localStorage.setItem("nm_bookings", JSON.stringify(b)); }

function getUsers() {
  try {
    const raw = localStorage.getItem("nm_users");
    if (!raw) { localStorage.setItem("nm_users", JSON.stringify(SAMPLE_USERS)); return SAMPLE_USERS; }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) { localStorage.setItem("nm_users", JSON.stringify(SAMPLE_USERS)); return SAMPLE_USERS; }
    const merged = SAMPLE_USERS.map((su) => {
      const existing = parsed.find((u) => u._id === su._id);
      return existing ? { ...existing, ...su, password: existing.password } : su;
    });
    parsed.forEach((u) => {
      if (!merged.find((m) => m._id === u._id)) merged.push(u);
    });
    localStorage.setItem("nm_users", JSON.stringify(merged));
    return merged;
  } catch { localStorage.setItem("nm_users", JSON.stringify(SAMPLE_USERS)); return SAMPLE_USERS; }
}
function setUsers(u) { localStorage.setItem("nm_users", JSON.stringify(u)); }

function getRestrictions() {
  const d = localStorage.getItem("nm_restrictions");
  return d ? JSON.parse(d) : [];
}
function setRestrictions(r) { localStorage.setItem("nm_restrictions", JSON.stringify(r)); }

const SEED_NOTIFICATIONS = [
  { _id: "n1", name: "Priya Sharma", groundName: "Tennis Ball Ground", status: "pending", createdAt: "2025-07-13T07:20:00Z" },
  { _id: "n2", name: "Arun Prasad", groundName: "Cricket Ball Ground", status: "completed", createdAt: "2025-07-12T14:00:00Z" },
  { _id: "n3", name: "Deepa Venkat", groundName: "Tennis Ball Ground", status: "approved", createdAt: "2025-07-12T09:45:00Z" },
  { _id: "n4", name: "Rajesh Kumar", groundName: "Cricket Ball Ground", status: "cancelled", createdAt: "2025-07-10T15:30:00Z" },
];
function getNotifications() {
  const d = localStorage.getItem("nm_notifications");
  if (!d) { localStorage.setItem("nm_notifications", JSON.stringify(SEED_NOTIFICATIONS)); return [...SEED_NOTIFICATIONS]; }
  try { return JSON.parse(d); } catch { return [...SEED_NOTIFICATIONS]; }
}
function setNotifications(n) { localStorage.setItem("nm_notifications", JSON.stringify(n)); }
function pushNotification(notification) {
  const list = getNotifications();
  list.unshift({ _id: "n" + Date.now(), createdAt: new Date().toISOString(), ...notification });
  setNotifications(list);
}

function delay(ms = 200) { return new Promise((r) => setTimeout(r, ms)); }

const api = {
  async get(url, { params } = {}) {
    await delay();
    if (url === "/admin/dashboard") return { data: BOOKING_STATS };
    if (url === "/admin/revenue") return { data: REVENUE_DATA };
    if (url === "/admin/notifications") return { data: getNotifications() };

    if (url === "/admin/bookings") {
      let list = getBookings();
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter((b) =>
          b.name?.toLowerCase().includes(q) ||
          b.email?.toLowerCase().includes(q) ||
          b.phone?.includes(q) ||
          b.groundName?.toLowerCase().includes(q)
        );
      }
      if (params?.status) list = list.filter((b) => b.status === params.status);
      if (params?.dateFrom) list = list.filter((b) => b.date >= params.dateFrom);
      if (params?.dateTo) list = list.filter((b) => b.date <= params.dateTo);
      return { data: list };
    }

    if (url === "/admin/users") {
      let list = getUsers();
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter((u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.includes(q)
        );
      }
      return { data: list };
    }

    if (url === "/grounds") {
      const saved = localStorage.getItem("nm_grounds");
      if (saved) { const p = JSON.parse(saved); GROUNDS.length = 0; GROUNDS.push(...p); }
      return { data: GROUNDS };
    }
    if (url === "/grounds/cricket") {
      const saved = localStorage.getItem("nm_grounds");
      if (saved) { const p = JSON.parse(saved); GROUNDS.length = 0; GROUNDS.push(...p); }
      return { data: GROUNDS.find((g) => g.id === "cricket") };
    }
    if (url === "/grounds/tennis") {
      const saved = localStorage.getItem("nm_grounds");
      if (saved) { const p = JSON.parse(saved); GROUNDS.length = 0; GROUNDS.push(...p); }
      return { data: GROUNDS.find((g) => g.id === "tennis") };
    }

    if (url.startsWith("/bookings/check")) {
      const g = params?.groundId || params?.ground;
      const d = params?.date;
      const st = params?.startTime;
      const et = params?.endTime;

      function toMin(t) {
        if (!t) return 0;
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      }

      function hasOverlap(st1, et1, st2, et2) {
        const segs = (st, et) => {
          const s = toMin(st), e = toMin(et);
          if (e <= s) {
            if (e === s) return [[s, 1440]];
            return [[s, 1440], [0, e]];
          }
          return [[s, e]];
        };
        const a = segs(st1, et1), b = segs(st2, et2);
        for (const [a1, a2] of a) {
          for (const [b1, b2] of b) {
            if (Math.max(a1, b1) < Math.min(a2, b2)) return true;
          }
        }
        return false;
      }

      const bookings = getBookings();
      const today = new Date().toISOString().split("T")[0];
      const curMin = new Date().getHours() * 60 + new Date().getMinutes();
      const overlapping = bookings.find(
        (b) =>
          b.ground === g &&
          b.date === d &&
          b.status !== "cancelled" &&
          b.status !== "rejected" &&
          (d !== today || (() => {
            const [sh, sm] = b.startTime.split(":").map(Number);
            const startMin = sh * 60 + sm;
            const [eh, em] = (b.endTime === "00:00" ? "24:00" : b.endTime).split(":").map(Number);
            let endMin = eh * 60 + em;
            if (endMin <= startMin) endMin += 1440;
            return endMin > curMin;
          })()) &&
          hasOverlap(b.startTime, b.endTime, st, et)
      );
      const restrictions = getRestrictions().find(
        (r) =>
          r.ground === g &&
          r.date === d &&
          hasOverlap(r.startTime, r.endTime, st, et)
      );
      const ground = GROUNDS.find((gr) => gr.id === g);
      const maintConflict = ground?.maintenanceSlots?.some(
        (m) => m.date === d && hasOverlap(m.startTime, m.endTime, st, et)
      );
      const available = !overlapping && !restrictions && !maintConflict && ground?.isAvailable !== false;
      return { data: { available, message: available ? "Slot Available" : "Slot Already Booked" } };
    }

    if (url === "/bookings/my") return { data: getBookings().filter((b) => b.user === params?.userId) };

    if (url === "/admin/gst-rate") return { data: { rate: parseFloat(localStorage.getItem("nm_gst_rate") || 18) } };

    if (url === "/admin/slots/restrictions") return { data: getRestrictions() };

    if (url === "/admin/contact") {
      const d = JSON.parse(localStorage.getItem("nm_contact") || '{"phone":"+91 98765 43210","email":"info@nmgreens.com","address":"Chennai, Tamil Nadu"}');
      return { data: d };
    }

    console.warn("Unhandled GET:", url);
    return { data: [] };
  },

  async post(url, data) {
    await delay();
    if (url === "/auth/login") {
      const users = getUsers();
      const found = users.find((u) => u.email === data.email && u.password === data.password);
      if (!found) throw { response: { data: { message: "Invalid email or password" } } };
      if (found.status === "suspended") throw { response: { data: { message: "Account suspended" } } };
      const userData = { ...found };
      delete userData.password;
      return { data: { token: "mock_" + found._id, user: userData } };
    }
    if (url === "/auth/register") {
      const users = getUsers();
      const exists = users.find((u) => u.email === data.email);
      if (exists) throw { response: { data: { message: "Email already registered" } } };
      const newUser = { _id: "u" + Date.now(), ...data, role: "customer", status: "active", createdAt: new Date().toISOString() };
      users.push(newUser);
      setUsers(users);
      pushNotification({ name: data.name, groundName: "—", message: "New user registered" });
      const userData = { ...newUser };
      delete userData.password;
      return { data: { token: "mock_" + newUser._id, user: userData } };
    }
    if (url === "/bookings") {
      const bookings = getBookings();
      const ground = GROUNDS.find((g) => g.id === data.groundId);
      const booking = {
        _id: "bk" + Date.now(),
        user: data.userId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        ground: data.groundId,
        groundId: data.groundId,
        groundName: ground?.name || "Unknown",
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        totalPrice: data.finalAmount || (ground?.pricePerHour || 0) * data.duration,
        status: "pending",
        paymentMethod: data.paymentMethod || "unknown",
        platformFee: data.platformFee || 0,
        gstAmount: data.gstAmount || 0,
        gstWaived: data.gstWaived || false,
        paidFromVault: data.paidFromVault || 0,
        createdAt: new Date().toISOString(),
      };
      bookings.push(booking);
      setBookings(bookings);
      pushNotification({ name: data.name, groundName: ground?.name || "Unknown", message: "booked" });
      return { data: booking };
    }
    if (url === "/admin/slots/block") {
      if (!data.startTime || !data.endTime) throw { response: { data: { message: "Start time and end time are required" } } };
      const restrictions = getRestrictions();
      const ground = GROUNDS.find((g) => g.id === data.groundId);
      const r = { _id: "sr" + Date.now(), ...data, ground: data.groundId, groundName: ground?.name };
      if (data.type === "maintenance" && ground) {
        ground.maintenanceSlots.push({ date: data.date, startTime: data.startTime, endTime: data.endTime, reason: data.reason });
      }
      restrictions.push(r);
      setRestrictions(restrictions);
      return { data: r };
    }
    if (url === "/grounds") {
      const newGround = { _id: "g" + Date.now(), id: "g" + Date.now(), ...data, features: [], images: [], isAvailable: true, maintenanceSlots: [] };
      if (typeof data.features === "string") newGround.features = data.features.split(",").map((s) => s.trim());
      GROUNDS.push(newGround);
      localStorage.setItem("nm_grounds", JSON.stringify(GROUNDS));
      return { data: newGround };
    }
    console.warn("Unhandled POST:", url);
    return { data: {} };
  },

  async put(url, data) {
    await delay();
    if (url.startsWith("/admin/bookings/") && url.endsWith("/status")) {
      const id = url.split("/")[3];
      const bookings = getBookings();
      const idx = bookings.findIndex((b) => b._id === id);
      if (idx > -1) {
        const prevStatus = bookings[idx].status;
        bookings[idx].status = data.status;
        if (data.status === "rejected" && prevStatus !== "rejected" && bookings[idx].totalPrice) {
          const users = getUsers();
          const userIdx = users.findIndex((u) => u._id === bookings[idx].user);
          if (userIdx > -1) {
            users[userIdx].vaultBalance = (users[userIdx].vaultBalance || 0) + bookings[idx].totalPrice;
            setUsers(users);
          }
        }
        if (data.status === "rejected" || data.status === "cancelled") {
          pushNotification({ name: bookings[idx].name, groundName: bookings[idx].groundName, message: data.status === "rejected" ? "was rejected" : "was cancelled" });
        }
        setBookings(bookings);
      }
      return { data: bookings[idx] };
    }
    if (url.startsWith("/admin/bookings/")) {
      const id = url.split("/")[3];
      const bookings = getBookings();
      const idx = bookings.findIndex((b) => b._id === id);
      if (idx > -1) { Object.assign(bookings[idx], data); setBookings(bookings); }
      return { data: bookings[idx] };
    }
    if (url.startsWith("/admin/users/")) {
      const id = url.split("/")[3];
      const users = getUsers();
      const idx = users.findIndex((u) => u._id === id);
      if (idx > -1) { Object.assign(users[idx], data); setUsers(users); }
      return { data: users[idx] };
    }
    if (url.startsWith("/grounds/")) {
      const id = url.split("/")[2];
      const idx = GROUNDS.findIndex((g) => g._id === id || g.id === id);
      if (idx > -1) {
        if (typeof data.features === "string") data.features = data.features.split(",").map((s) => s.trim());
        Object.assign(GROUNDS[idx], data);
        localStorage.setItem("nm_grounds", JSON.stringify(GROUNDS));
      }
      return { data: GROUNDS[idx] };
    }
    if (url === "/admin/gst-rate") {
      localStorage.setItem("nm_gst_rate", String(data.rate));
      return { data: { rate: data.rate } };
    }
    if (url === "/admin/contact") {
      localStorage.setItem("nm_contact", JSON.stringify(data));
      return { data };
    }

    if (url.startsWith("/admin/slots/block/")) {
      const id = url.split("/")[4];
      const restrictions = getRestrictions();
      const idx = restrictions.findIndex((r) => r._id === id);
      if (idx > -1) { Object.assign(restrictions[idx], data); setRestrictions(restrictions); }
      return { data: restrictions[idx] };
    }
    console.warn("Unhandled PUT:", url);
    return { data: {} };
  },

  async delete(url) {
    await delay();
    if (url.startsWith("/admin/bookings/")) {
      const id = url.split("/")[3];
      setBookings(getBookings().filter((b) => b._id !== id));
      return { data: { message: "Deleted" } };
    }
    if (url.startsWith("/admin/users/")) {
      const id = url.split("/")[3];
      setUsers(getUsers().filter((u) => u._id !== id));
      setBookings(getBookings().filter((b) => b.user !== id));
      return { data: { message: "Deleted" } };
    }
    if (url.startsWith("/admin/slots/block/")) {
      const id = url.split("/")[4];
      setRestrictions(getRestrictions().filter((r) => r._id !== id));
      return { data: { message: "Unblocked" } };
    }
    if (url.startsWith("/grounds/")) {
      const id = url.split("/")[2];
      const idx = GROUNDS.findIndex((g) => g._id === id || g.id === id);
      if (idx > -1) { GROUNDS.splice(idx, 1); localStorage.setItem("nm_grounds", JSON.stringify(GROUNDS)); }
      return { data: { message: "Deleted" } };
    }
    console.warn("Unhandled DELETE:", url);
    return { data: {} };
  },
};

export default api;
