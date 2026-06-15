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

function getGstRate() {
  return Number(localStorage.getItem("nm_gst_rate")) || 18;
}

export function calculatePrice(pricePerHour, duration) {
  const subtotal = pricePerHour * duration;
  const platformFee = 1;
  const subtotalWithFee = subtotal + platformFee;
  const gst = Math.round(subtotalWithFee * getGstRate() / 100 * 100) / 100;
  const finalAmount = subtotalWithFee;
  return { subtotal, platformFee, gst, finalAmount };
}

export function getCricketKey(duration, startTime) {
  if (duration === "24") return "24";
  if (duration === "12" && startTime === "06:00") return "12_06";
  if (duration === "12" && startTime === "18:00") return "12_18";
  return null;
}

export function getEffectiveHourlyRate(ground, date, startTime) {
  if (!ground) return 0;
  let rate = ground.pricePerHour;

  if (date && ground.dateBasedPricing?.length) {
    const match = ground.dateBasedPricing.find(
      (d) => date >= d.from && date <= d.to && d.pricePerHour
    );
    if (match) rate = match.pricePerHour;
  }

  if (ground.weekendPricePerHour && date && isWeekend(date)) {
    rate = ground.weekendPricePerHour;
  }

  return rate;
}

export function getBookingTotal(ground, { date, startTime, duration, platformFee }) {
  if (!ground) return { subtotal: 0, platformFee: 1, gst: 0, finalAmount: 0, isSlotPricing: false, effectiveRate: 0 };

  const dur = parseInt(duration) || 0;
  let subtotal = 0;
  let isSlotPricing = false;
  let effectiveRate = 0;

  if (ground.type === "cricket" && startTime && ground.slotPricing) {
    const key = getCricketKey(duration, startTime);
    if (key && ground.slotPricing[key]) {
      subtotal = ground.slotPricing[key];
      isSlotPricing = true;
      effectiveRate = subtotal / (dur || 1);
    }
  }

  if (!isSlotPricing) {
    effectiveRate = getEffectiveHourlyRate(ground, date, startTime);
    subtotal = effectiveRate * dur;
  }

  const pf = platformFee != null ? platformFee : 1;
  const subtotalWithFee = subtotal + pf;
  const gst = Math.round(subtotalWithFee * getGstRate() / 100 * 100) / 100;
  const finalAmount = subtotalWithFee;

  return { subtotal, platformFee: pf, gst, finalAmount, isSlotPricing, effectiveRate };
}
