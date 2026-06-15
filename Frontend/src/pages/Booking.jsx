import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle, HiXCircle, HiArrowRight, HiExclamationCircle } from "react-icons/hi";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { to12Hour, isWeekend, isTodayWeekend } from "../utils/helpers";
import PaymentModal from "../components/PaymentModal";
import GoldLockIcon from "../components/common/GoldLockIcon";

const CRICKET_OPTIONS = [
  { key: "12_06", duration: "12", label: "12 hrs (6AM–6PM)", startTime: "06:00" },
  { key: "12_18", duration: "12", label: "12 hrs (6PM–6AM)", startTime: "18:00" },
  { key: "24", duration: "24", label: "24 hrs (Full Day)", startTime: "00:00" },
];
const TENNIS_SLOTS = [
  { section: "Morning", slots: [
    { start: "06:00", end: "07:00", label: "6–7 AM" },
    { start: "07:00", end: "08:00", label: "7–8 AM" },
    { start: "08:00", end: "09:00", label: "8–9 AM" },
    { start: "09:00", end: "10:00", label: "9–10 AM" },
    { start: "10:00", end: "11:00", label: "10–11 AM" },
    { start: "11:00", end: "12:00", label: "11–12 PM" },
  ]},
  { section: "Afternoon", slots: [
    { start: "12:00", end: "13:00", label: "12–1 PM" },
    { start: "13:00", end: "14:00", label: "1–2 PM" },
    { start: "14:00", end: "15:00", label: "2–3 PM" },
    { start: "15:00", end: "16:00", label: "3–4 PM" },
    { start: "16:00", end: "17:00", label: "4–5 PM" },
    { start: "17:00", end: "18:00", label: "5–6 PM" },
  ]},
  { section: "Evening", slots: [
    { start: "18:00", end: "19:00", label: "6–7 PM" },
    { start: "19:00", end: "20:00", label: "7–8 PM" },
    { start: "20:00", end: "21:00", label: "8–9 PM" },
    { start: "21:00", end: "22:00", label: "9–10 PM" },
    { start: "22:00", end: "23:00", label: "10–11 PM" },
    { start: "23:00", end: "00:00", label: "11–12 AM" },
  ]},
  { section: "Late Night", slots: [
    { start: "00:00", end: "01:00", label: "12–1 AM" },
    { start: "01:00", end: "02:00", label: "1–2 AM" },
    { start: "02:00", end: "03:00", label: "2–3 AM" },
    { start: "03:00", end: "04:00", label: "3–4 AM" },
    { start: "04:00", end: "05:00", label: "4–5 AM" },
    { start: "05:00", end: "06:00", label: "5–6 AM" },
  ]},
];
const allSlots = TENNIS_SLOTS.flatMap(sec => sec.slots);

const GROUNDS = [
  { id: "cricket", name: "Cricket Ball Ground", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80", price: 500 },
  { id: "tennis", name: "Tennis Ball Ground", image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1200&q=80", price: 300 },
];

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getCricketKey(duration, startTime) {
  if (duration === "24") return "24";
  if (duration === "12" && startTime === "06:00") return "12_06";
  if (duration === "12" && startTime === "18:00") return "12_18";
  return null;
}

function hasOverlap(st1, et1, st2, et2) {
  const toMin = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
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

export default function Booking() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [form, setForm] = useState({
    groundId: "",
    name: "",
    phone: "",
    email: "",
    date: "",
    startTime: "",
    duration: "",
  });
  const [errors, setErrors] = useState({});
  const [weekendError, setWeekendError] = useState("");
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [soldOptions, setSoldOptions] = useState([]);
  const [blockedOptions, setBlockedOptions] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  useEffect(() => {
    const g = searchParams.get("ground");
    if (g === "cricket" || g === "tennis") {
      setForm((p) => ({ ...p, groundId: g }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setForm((p) => ({
        ...p,
        name: user.name || p.name,
        email: user.email || p.email,
        phone: user.phone || p.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    setSoldOptions([]);
    setBlockedOptions([]);
    setSelectedSlots([]);
  }, [form.groundId, form.date]);

  useEffect(() => {
    const refresh = () => {
      const restrictions = JSON.parse(localStorage.getItem("nm_restrictions") || "[]");
      const matchRestricts = restrictions.filter(
        (r) => r.ground === form.groundId && r.date === form.date
      );
      if (matchRestricts.length) {
        if (form.groundId === "tennis") {
          const blocked = TENNIS_SLOTS.flatMap((sec) => sec.slots)
            .filter((slot) => {
              const slotEnd = slot.end === "00:00" ? "24:00" : slot.end;
              return matchRestricts.some((r) => hasOverlap(slot.start, slotEnd, r.startTime, r.endTime));
            })
            .map((slot) => slot.start);
          if (blocked.length) setBlockedOptions((prev) => [...new Set([...prev, ...blocked])]);
        }
        if (form.groundId === "cricket") {
          const blocked = [];
          if (matchRestricts.some((r) => hasOverlap("06:00", "18:00", r.startTime, r.endTime)))
            blocked.push("12_06", "24");
          if (matchRestricts.some((r) => hasOverlap("18:00", "06:00", r.startTime, r.endTime)))
            blocked.push("12_18", "24");
          if (blocked.length) setBlockedOptions((prev) => [...new Set([...prev, ...blocked])]);
        }
      }
      const today = new Date().toISOString().split("T")[0];
      if (form.date === today) {
        const curMin = new Date().getHours() * 60 + new Date().getMinutes();
        setSoldOptions((prev) => prev.filter((key) => {
          if (form.groundId === "tennis") {
            const slot = TENNIS_SLOTS.flatMap((s) => s.slots).find((s) => s.start === key);
            if (!slot) return true;
            const startMin = timeToMinutes(slot.start);
            if (startMin < 360) return true;
            const [eh, em] = slot.end === "00:00" ? [24, 0] : slot.end.split(":").map(Number);
            return (eh * 60 + em) > curMin;
          }
          if (form.groundId === "cricket") {
            const ends = { "12_06": 1080, "12_18": Infinity, "24": Infinity };
            const endMin = ends[key];
            return endMin ? endMin > curMin : true;
          }
          return true;
        }));
        setBlockedOptions((prev) => prev.filter((key) => {
          if (form.groundId === "tennis") {
            const slot = TENNIS_SLOTS.flatMap((s) => s.slots).find((s) => s.start === key);
            if (!slot) return true;
            const startMin = timeToMinutes(slot.start);
            if (startMin < 360) return true;
            const [eh, em] = slot.end === "00:00" ? [24, 0] : slot.end.split(":").map(Number);
            return (eh * 60 + em) > curMin;
          }
          if (form.groundId === "cricket") {
            const ends = { "12_06": 1080, "12_18": Infinity, "24": Infinity };
            const endMin = ends[key];
            return endMin ? endMin > curMin : true;
          }
          return true;
        }));
      }
    };
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [form.date, form.groundId]);

  useEffect(() => {
    if (!form.groundId || !form.date) return;
    const bookings = JSON.parse(localStorage.getItem("nm_bookings") || "[]");
    const today = new Date().toISOString().split("T")[0];
    const curMin = new Date().getHours() * 60 + new Date().getMinutes();
    const active = bookings.filter(
      (b) => b.ground === form.groundId && b.date === form.date && b.status !== "cancelled" && b.status !== "rejected"
    ).filter((b) => {
      if (form.date !== today) return true;
      const [sh, sm] = b.startTime.split(":").map(Number);
      let startMin = sh * 60 + sm;
      const [eh, em] = (b.endTime === "00:00" ? "24:00" : b.endTime).split(":").map(Number);
      let endMin = eh * 60 + em;
      if (endMin <= startMin) endMin += 1440;
      if (startMin < 360) { startMin += 1440; endMin += 1440; }
      return endMin > curMin;
    });
    const restrictions = JSON.parse(localStorage.getItem("nm_restrictions") || "[]");
    const matchRestricts = restrictions.filter(
      (r) => r.ground === form.groundId && r.date === form.date
    );
    if (form.groundId === "tennis") {
      const sold = TENNIS_SLOTS.flatMap((sec) => sec.slots)
        .filter((slot) => {
          const slotEnd = slot.end === "00:00" ? "24:00" : slot.end;
          return active.some((b) => hasOverlap(slot.start, slotEnd, b.startTime, b.endTime));
        })
        .map((slot) => slot.start);
      if (sold.length) setSoldOptions((prev) => [...new Set([...prev, ...sold])]);
      const blocked = TENNIS_SLOTS.flatMap((sec) => sec.slots)
        .filter((slot) => {
          const slotEnd = slot.end === "00:00" ? "24:00" : slot.end;
          return matchRestricts.some((r) => hasOverlap(slot.start, slotEnd, r.startTime, r.endTime));
        })
        .map((slot) => slot.start);
      if (blocked.length) setBlockedOptions((prev) => [...new Set([...prev, ...blocked])]);
    }
    if (form.groundId === "cricket") {
      const sold = [];
      const block = [];
      const dayOverlap = (arr) => arr.some((x) => hasOverlap("06:00", "18:00", x.startTime, x.endTime));
      const nightOverlap = (arr) => arr.some((x) => hasOverlap("18:00", "06:00", x.startTime, x.endTime));
      if (dayOverlap(active)) sold.push("12_06", "24");
      if (nightOverlap(active)) sold.push("12_18", "24");
      if (dayOverlap(matchRestricts)) block.push("12_06", "24");
      if (nightOverlap(matchRestricts)) block.push("12_18", "24");
      if (sold.length) setSoldOptions((prev) => [...new Set([...prev, ...sold])]);
      if (block.length) setBlockedOptions((prev) => [...new Set([...prev, ...block])]);
    }
  }, [form.groundId, form.date]);

  function set(field) {
    return (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  function handleDateChange(e) {
    const val = e.target.value;
    setForm((p) => ({ ...p, date: val, startTime: "", duration: "" }));
    if (val && isWeekend(val) && !isTodayWeekend()) {
      setWeekendError("Weekend slots can only be booked on the previous Saturday or Sunday.");
    } else {
      setWeekendError("");
    }
  }

  const selectedGround = GROUNDS.find((g) => g.id === form.groundId);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  function isPastEnd(endTime) {
    const m = new Date().getHours() * 60 + new Date().getMinutes();
    return endTime === "00:00" ? m >= 1440 : timeToMinutes(endTime) <= m;
  }

  function handleSlotClick(idx) {
    const slot = allSlots[idx];
    if (soldOptions.includes(slot.start) || blockedOptions.includes(slot.start)) return;
    if (form.date === todayStr && isPastEnd(slot.end)) { toast.error("time is past"); return; }

    setSelectedSlots((prev) => {
      if (prev.includes(slot.start)) {
        return prev.filter((s) => s !== slot.start);
      }
      if (!prev.length) return [slot.start];
      const curIdx = prev.map((s) => allSlots.findIndex((a) => a.start === s));
      const allIdx = [...curIdx, idx].sort((a, b) => a - b);
      const contiguous = allIdx[allIdx.length - 1] - allIdx[0] + 1 === allIdx.length;
      if (!contiguous) {
        toast.error("Slots must be contiguous — select adjacent slots only");
        return prev;
      }
      return [...prev, slot.start];
    });
  }

  const endTime = form.startTime && form.duration
    ? (() => {
        const [h, m] = form.startTime.split(":").map(Number);
        const total = h * 60 + m + parseInt(form.duration) * 60;
        const rh = Math.floor(total / 60) % 24;
        const rm = total % 60;
        return `${String(rh).padStart(2, "0")}:${String(rm).padStart(2, "0")}`;
      })()
    : "";

  useEffect(() => {
    if (selectedSlots.length) {
      const sorted = [...selectedSlots].sort();
      setForm((p) => ({ ...p, startTime: sorted[0], duration: String(sorted.length) }));
    } else {
      setForm((p) => ({ ...p, startTime: "", duration: "" }));
    }
  }, [selectedSlots]);

  const checkAvailability = useCallback(async () => {
    if (!form.groundId || !form.date || !form.startTime || !form.duration) {
      setAvailability(null);
      return;
    }
    setChecking(true);
    try {
      const res = await api.get("/bookings/check", {
        params: {
          groundId: form.groundId,
          date: form.date,
          startTime: form.startTime,
          endTime,
        },
      });
      setAvailability(res.data);

      if (!res.data.available && form.groundId === "cricket") {
        const currentKey = getCricketKey(form.duration, form.startTime);
        if (currentKey === "24") {
          setSoldOptions((prev) => [...new Set([...prev, "12_06", "12_18", "24"])]);
        } else if (currentKey) {
          setSoldOptions((prev) => [...new Set([...prev, currentKey, "24"])]);
        }
      }
    } catch {
      setAvailability(null);
    } finally {
      setChecking(false);
    }
  }, [form.groundId, form.date, form.startTime, form.duration, endTime, selectedSlots]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  function validate() {
    const e = {};
    if (!form.groundId) e.groundId = "Select a ground";
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = "Enter valid 10-digit number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.date) e.date = "Select a date";
    if (!form.startTime && form.groundId !== "cricket" && form.groundId !== "tennis") e.startTime = "Select start time";
    if (!form.duration) e.duration = "Select duration";
    if (weekendError) e.weekend = weekendError;
    if (availability && !availability.available) e.availability = "Slot is not available";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function handlePaymentSuccess(bookingData) {
    setBookingResult(bookingData);
    setSubmitted(true);
    setShowPayment(false);
    if (bookingData.groundId === "cricket") {
      const key = getCricketKey(bookingData.duration, bookingData.startTime);
      if (key === "24") {
        setSoldOptions((p) => [...new Set([...p, "12_06", "12_18", "24"])]);
      } else if (key) {
        setSoldOptions((p) => [...new Set([...p, key, "24"])]);
      }
    } else if (bookingData.groundId === "tennis") {
      const stIdx = allSlots.findIndex(s => s.start === bookingData.startTime);
      if (stIdx !== -1 && bookingData.duration) {
        const covered = allSlots.slice(stIdx, stIdx + parseInt(bookingData.duration)).map(s => s.start);
        setSoldOptions((p) => [...new Set([...p, ...covered])]);
      }
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (!user) {
      toast.error("Please sign in to book");
      return;
    }
    setShowPayment(true);
  }

  if (submitted && bookingResult) {
    return (
      <div className="booking-success">
        <motion.div
          className="booking-success-card glass"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="success-icon">✓</div>
          <h2>Booking Confirmed!</h2>
          <p>Your {bookingResult.groundName} has been booked successfully.</p>
            <div className="success-details">
              <div><span>Ground</span><span>{bookingResult.groundName}</span></div>
              <div><span>Date</span><span>{bookingResult.date}</span></div>
              <div><span>Time</span><span>{to12Hour(bookingResult.startTime)} - {to12Hour(bookingResult.endTime)}</span></div>
              <div><span>Duration</span><span>{bookingResult.duration} hr{bookingResult.duration > 1 ? "s" : ""}</span></div>
              <div><span>Payment</span><span className="capitalize">{bookingResult.paymentMethod?.replace("upi_", "UPI (")}{bookingResult.paymentMethod?.includes("upi_") ? ")" : ""}</span></div>
              <div className="success-total"><span>Amount Paid</span><span>₹{(bookingResult.totalPrice || 0).toLocaleString("en-IN")}</span></div>
            </div>
          <button className="btn-primary" onClick={() => window.location.href = "/"}>
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="booking-page">
      <div className="booking-hero" style={{ backgroundImage: `url(${selectedGround?.image || GROUNDS[0].image})` }}>
        <div className="booking-hero-overlay" />
        <div className="booking-hero-content">
          <h1>{selectedGround ? selectedGround.name : "Select a Ground"}</h1>
          <p>Fill in your details and confirm your booking</p>
        </div>
      </div>

      <div className="booking-layout">
        <form className="booking-form glass" onSubmit={handleSubmit}>
          <h2>Booking Details</h2>

          <div className="form-group">
            <label>Ground</label>
            <div className="ground-selector">
              {GROUNDS.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  className={`ground-option${form.groundId === g.id ? " active" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, groundId: g.id, duration: "", startTime: "" }))}
                >
                  <span className="ground-option-name">{g.name}</span>
                  <span className="ground-option-price">₹{g.price}/hr</span>
                </button>
              ))}
            </div>
            {errors.groundId && <span className="field-error">{errors.groundId}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" value={form.name} onChange={set("name")} className={errors.name ? "error" : ""} />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="10-digit number" value={form.phone} onChange={set("phone")} className={errors.phone ? "error" : ""} />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" value={form.email} onChange={set("email")} className={errors.email ? "error" : ""} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className={`form-grid${form.groundId === "cricket" || form.groundId === "tennis" ? " form-grid-full" : ""}`}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={handleDateChange} min={new Date().toISOString().split("T")[0]} className={errors.date ? "error" : ""} />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
          </div>

          {weekendError && (
            <div className="weekend-error">
              <HiExclamationCircle /> {weekendError}
            </div>
          )}

          <div className="form-group">
            <label>
              Duration
              {form.groundId === "cricket" && <span className="label-hint">(6AM–6PM, 6PM–6AM, or Full Day)</span>}
              {form.groundId === "tennis" && <span className="label-hint">(1-hr slots, 6AM–6AM)</span>}
            </label>
              {form.groundId ? (
              <div className={`duration-grid${form.groundId === "cricket" ? " duration-grid-3" : ""}${form.groundId === "tennis" ? " tennis-grid-2" : ""}`}>
                {form.groundId === "cricket"
                  ? CRICKET_OPTIONS.map((opt) => {
                      const currentKey = getCricketKey(form.duration, form.startTime);
                      const isActive = currentKey === opt.key;
                      const isBlocked = blockedOptions.includes(opt.key);
                      const isSold = soldOptions.includes(opt.key);
                      const m = new Date().getHours() * 60 + new Date().getMinutes();
                      const optEnd = parseInt(opt.duration) * 60 + timeToMinutes(opt.startTime);
                      const isPast = form.date === todayStr && m >= optEnd;
                      const disabled = isBlocked || isSold || isPast;
                      return (
                        <button
                          type="button"
                          key={opt.key}
                          className={`duration-chip${isActive ? " active" : ""}${disabled ? " sold" : ""}${isPast ? " past" : ""}`}
                          onClick={() => {
                            if (isPast) { toast.error("time is past"); return; }
                            setForm((p) => ({ ...p, duration: opt.duration, startTime: opt.startTime }));
                          }}
                          disabled={disabled}
                          title={isBlocked ? "Blocked by Admin" : isSold ? "Sold (Already Booked)" : isPast ? "Time is Past" : "Available"}
                        >
                          {opt.label}
                          {isBlocked && <span className="locked-badge"><GoldLockIcon size={16} /></span>}
                          {!isBlocked && isSold && <span className="sold-badge">Sold</span>}
                        </button>
                      );
                    })
                  : (() => {
                      let flatIdx = -1;
                      const sorted = [...selectedSlots].sort();
                      const minSlot = sorted[0] || "";
                      return TENNIS_SLOTS.map((sec) => (
                        <div key={sec.section} className="tennis-section">
                          <div className="tennis-section-header">{sec.section}</div>
                          <div className="tennis-slot-grid">
                            {sec.slots.map((slot) => {
                              flatIdx++;
                              const idx = flatIdx;
                              const isBlocked = blockedOptions.includes(slot.start);
                              const isSold = soldOptions.includes(slot.start);
                              const isPast = form.date === todayStr && isPastEnd(slot.end);
                              const isSelected = selectedSlots.includes(slot.start);
                              const isStartSelected = isSelected && slot.start === minSlot;
                              const disabled = isBlocked || isSold || isPast;
                              return (
                                <button
                                  type="button"
                                  key={slot.start}
                                  className={`duration-chip${isSelected ? " selected" : ""}${isStartSelected ? " active" : ""}${disabled ? " sold" : ""}${isPast ? " past" : ""}`}
                                  onClick={() => handleSlotClick(idx)}
                                  disabled={disabled}
                                  title={isBlocked ? "Blocked by Admin" : isSold ? "Sold (Already Booked)" : isPast ? "Time is Past" : "Available"}
                                >
                                  {slot.label}
                                  {isBlocked && <span className="locked-badge"><GoldLockIcon size={16} /></span>}
                                  {!isBlocked && isSold && <span className="sold-badge">Sold</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
              </div>
            ) : (
              <p className="select-ground-hint">Select a ground first</p>
            )}
            {errors.duration && <span className="field-error">{errors.duration}</span>}
          </div>

          <button type="submit" className="btn-primary booking-submit" disabled={!!weekendError || !availability?.available}>
            Confirm Booking <HiArrowRight />
          </button>
        </form>

        <div className="booking-sidebar">
          {/* ─── Summary ─── */}
          <div className="summary-card glass">
            <div className="summary-header">
              <h3>Booking Summary</h3>
            </div>
            <div className="summary-body">
              <div className="summary-row">
                <span>Ground</span>
                <span className={!form.groundId ? "muted" : ""}>{selectedGround?.name || "Not selected"}</span>
              </div>
              <div className="summary-row">
                <span>Date</span>
                <span className={!form.date ? "muted" : ""}>{form.date || "Not set"}</span>
              </div>
              <div className="summary-row">
                <span>Start Time</span>
                <span className={!form.startTime ? "muted" : ""}>
                  {form.groundId === "cricket" && form.duration === "24" ? "Full Day" : (form.groundId === "cricket" && form.duration === "12" ? (form.startTime === "18:00" ? "6:00 PM" : "6:00 AM") : (to12Hour(form.startTime) || "Not set"))}
                </span>
              </div>
              <div className="summary-row">
                <span>End Time</span>
                <span className={!endTime ? "muted" : ""}>
                  {form.groundId === "cricket" && form.duration === "24" ? "Full Day" : (form.groundId === "cricket" && form.duration === "12" ? (form.startTime === "06:00" ? "6:00 PM" : "6:00 AM") : (to12Hour(endTime) || "Not set"))}
                </span>
              </div>
              <div className="summary-row">
                <span>Duration</span>
                <span className={!form.duration ? "muted" : ""}>
                  {form.duration ? `${form.duration} hr${+form.duration > 1 ? "s" : ""}` : "—"}
                </span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Rate</span>
                <span>{selectedGround ? `₹${selectedGround.price}/hr` : "—"}</span>
              </div>
              <div className="summary-total-row">
                <span>Total</span>
                <span className="total-amount">
                  ₹{selectedGround && form.duration
                    ? (selectedGround.price * parseInt(form.duration)).toLocaleString("en-IN")
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* ─── Availability Status ─── */}
          <AnimatePresence>
            {checking && (
              <motion.div
                className="availability-card checking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Checking availability...
              </motion.div>
            )}
            {availability && !checking && (
              <motion.div
                className={`availability-card ${availability.available ? "available" : "unavailable"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {availability.available ? (
                  <><HiCheckCircle /> Slot Available</>
                ) : (
                  <><HiXCircle /> Slot Already Booked</>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {errors.availability && (
            <span className="field-error">{errors.availability}</span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPayment && (
          <PaymentModal
            bookingData={{ ...form, endTime }}
            ground={selectedGround}
            onSuccess={handlePaymentSuccess}
            onClose={() => setShowPayment(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
