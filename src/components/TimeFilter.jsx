import { useState, useRef, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import DateRangePicker, { fmtShort } from "./DateRangePicker.jsx";
import "./DateRangePicker.css";

/**
 * Ô input "Lựa chọn khác" mở popup chọn khoảng ngày kiểu KiotViet.
 * Luôn mở popup khi bấm (kể cả lúc đang disabled) — parent tự xử onActivate để tick radio.
 * value: {start: Date|null, end: Date|null} | null
 */
export function CustomDatePick({ value, onChange, disabled, onActivate }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const display =
    value && value.start ? `${fmtShort(value.start)} - ${fmtShort(value.end || value.start)}` : "";

  const handleClick = () => {
    if (onActivate) onActivate();
    setOpen(true);
  };

  return (
    <span className={`tf-custom${disabled ? " tf-disabled" : ""}`} ref={wrapRef}>
      <span
        className={`f-datepick${open || display ? " tf-input-active" : ""}`}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <input
          className="kv-input"
          placeholder="Lựa chọn khác"
          value={display}
          readOnly
          tabIndex={-1}
          style={{ cursor: "pointer" }}
        />
        <CalendarDays size={15} />
      </span>
      {open && (
        <div className="drp-wrap">
          <DateRangePicker
            initial={value}
            onApply={(v) => { onChange(v); setOpen(false); }}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </span>
  );
}

/**
 * Khối lọc thời gian kiểu KiotViet:
 *   radio "Toàn thời gian" (dropdown trang trí) / radio "Lựa chọn khác" (mở popup chọn khoảng ngày)
 * value: "all" | {start: Date|null, end: Date|null} | null
 * onChange: ("all" | {start,end} | null) => void
 */
export default function TimeFilter({ title, value, onChange, nested }) {
  const isCustom = value !== "all";

  const activateCustom = () => {
    if (!isCustom) onChange({ start: null, end: null });
  };

  const radios = (
    <div className="f-radio-col">
      <label className="kv-radio">
        <input type="radio" checked={!isCustom} onChange={() => onChange("all")} />
        <select className="kv-select" disabled={isCustom} onClick={(e) => e.stopPropagation()}>
          <option>Toàn thời gian</option>
          <option>Hôm nay</option>
          <option>Hôm qua</option>
          <option>Tuần này</option>
          <option>Tháng này</option>
        </select>
      </label>
      <div className="tf-custom-row" onClick={activateCustom}>
        <span className="kv-radio" style={{ flexShrink: 0 }}>
          <input type="radio" checked={isCustom} onChange={() => {}} tabIndex={-1} />
        </span>
        <CustomDatePick
          value={isCustom ? value : null}
          onChange={(v) => onChange(v || "all")}
          disabled={!isCustom}
          onActivate={activateCustom}
        />
      </div>
    </div>
  );

  if (nested) {
    return (
      <>
        {title ? <div className="f-sub">{title}</div> : null}
        {radios}
      </>
    );
  }
  return (
    <div className="f-block">
      <div className="f-title">{title}</div>
      {radios}
    </div>
  );
}

/** Bản tự quản state — dùng cho các filter chỉ mang tính hiển thị. */
export function FreeTimeFilter(props) {
  const [v, setV] = useState("all");
  return <TimeFilter {...props} value={v} onChange={setV} />;
}
