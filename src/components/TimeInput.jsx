import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import "./TimeInput.css";

const p2 = (n) => String(n).padStart(2, "0");
const QUICK = [];
for (let h = 0; h < 24; h++) { QUICK.push(`${p2(h)}:00`, `${p2(h)}:30`); }

function normalize(v) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v.trim());
  if (!m) return v;
  const h = Number(m[1]), mi = Number(m[2]);
  if (h > 23 || mi > 59) return v;
  return `${p2(h)}:${p2(mi)}`;
}

/**
 * Ô nhập giờ: gõ tự do + bấm icon đồng hồ để chọn nhanh (00:00, 00:30, ...).
 */
export default function TimeInput({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <span className="ti-wrap" ref={ref}>
      <input
        className="kv-input ti-input"
        placeholder={placeholder || "--:--"}
        value={value || ""}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9:]/g, "").slice(0, 5))}
        onBlur={() => { if (value) onChange(normalize(value)); }}
      />
      <button type="button" className="ti-clock" onClick={() => setOpen(!open)} title="Chọn giờ">
        <Clock size={15} />
      </button>
      {open && (
        <div className="ti-drop">
          {QUICK.map((t) => (
            <button
              key={t} type="button"
              className={`ti-opt${value === t ? " sel" : ""}`}
              onClick={() => { onChange(t); setOpen(false); }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
