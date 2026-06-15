export function to12Hour(time24) {
  if (!time24) return "";
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  const [h, m] = parts.map(Number);
  if (isNaN(h) || isNaN(m)) return time24;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function parseTime12(hour12, minute, period) {
  let h = parseInt(hour12);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function splitTime24(time24) {
  if (!time24) return { hour: 12, minute: "00", period: "AM" };
  const [h, m] = time24.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return { hour: 12, minute: "00", period: "AM" };
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return { hour: hour12, minute: String(m).padStart(2, "0"), period };
}

export function isWeekend(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function isTodayWeekend() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

export function calculatePrice(pricePerHour, duration) {
  const subtotal = pricePerHour * duration;
  const platformFee = 1;
  const subtotalWithFee = subtotal + platformFee;
  const gst = Math.round(subtotalWithFee * 0.18 * 100) / 100;
  const finalAmount = subtotalWithFee;
  return { subtotal, platformFee, gst, finalAmount };
}
