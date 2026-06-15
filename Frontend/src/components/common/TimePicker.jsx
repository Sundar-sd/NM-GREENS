import { useState, useEffect } from "react";

export default function TimePicker({ value, onChange, className, ...props }) {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        setPeriod(h >= 12 ? "PM" : "AM");
        setHour(h % 12 || 12);
        setMinute(String(m).padStart(2, "0"));
      }
    }
  }, [value]);

  function emit(h, m, p) {
    let hr = parseInt(h);
    if (p === "PM" && hr !== 12) hr += 12;
    if (p === "AM" && hr === 12) hr = 0;
    const result = `${String(hr).padStart(2, "0")}:${m}`;
    if (onChange) onChange({ target: { value: result } });
  }

  function handleHour(e) {
    const h = parseInt(e.target.value);
    setHour(h);
    emit(h, minute, period);
  }

  function handleMinute(e) {
    const m = e.target.value;
    setMinute(m);
    emit(hour, m, period);
  }

  function handlePeriod(e) {
    const p = e.target.value;
    setPeriod(p);
    emit(hour, minute, p);
  }

  return (
    <div className={"time-picker" + (className ? " " + className : "")} {...props}>
      <select value={hour} onChange={handleHour} className="time-picker-hour">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="time-picker-sep">:</span>
      <select value={minute} onChange={handleMinute} className="time-picker-minute">
        {["00", "15", "30", "45"].map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select value={period} onChange={handlePeriod} className="time-picker-period">
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
