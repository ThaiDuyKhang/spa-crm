import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./DateRangePicker.css";

const WD = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const WD_FULL = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

export function fmtLong(d) {
  if (!d) return "…";
  const p = (n) => String(n).padStart(2, "0");
  return `${WD_FULL[d.getDay()]}, ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function fmtShort(d) {
  if (!d) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a, b) => a && b && a.getTime() === b.getTime();

function monthCells(y, m) {
  const first = new Date(y, m, 1);
  const lead = (first.getDay() + 6) % 7; // Thứ 2 đầu tuần
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrev = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = lead - 1; i >= 0; i--) cells.push({ d: new Date(y, m - 1, daysInPrev - i), other: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d: new Date(y, m, d), other: false });
  while (cells.length < 42) {
    const last = cells[cells.length - 1].d;
    cells.push({ d: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), other: true });
  }
  return cells;
}

function MonthPanel({ year, month, onPrev, onNext, sel, onPick }) {
  const cells = monthCells(year, month);
  const inRange = (d) => {
    if (!sel.start || !sel.end) return false;
    const t = stripTime(d).getTime();
    return t > sel.start.getTime() && t < sel.end.getTime();
  };
  return (
    <div className="drp-panel">
      <div className="drp-panel-head">
        <span className="drp-panel-title">Tháng {month + 1} {year}</span>
        <span className="drp-nav">
          <button type="button" onClick={onPrev} title="Tháng trước"><ChevronLeft size={15} /></button>
          <button type="button" onClick={onNext} title="Tháng sau"><ChevronRight size={15} /></button>
        </span>
      </div>
      <div className="drp-week">{WD.map((w) => <span key={w}>{w}</span>)}</div>
      <div className="drp-days">
        {cells.map(({ d, other }, i) => {
          const sd = stripTime(d);
          const isSel = sameDay(sd, sel.start) || sameDay(sd, sel.end);
          return (
            <button
              key={i}
              type="button"
              className={`drp-day${other ? " other" : ""}${isSel ? " sel" : ""}${!isSel && inRange(sd) ? " in-range" : ""}`}
              onClick={() => onPick(sd)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Popup chọn khoảng ngày kiểu KiotViet.
 * initial: {start: Date|null, end: Date|null} | null
 * onApply: ({start, end} | null) => void
 * single: chỉ chọn 1 ngày
 */
export default function DateRangePicker({ initial, onApply, onClose, single }) {
  const today = new Date();
  const base = initial?.start || today;
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });
  const [sel, setSel] = useState({
    start: initial?.start ? stripTime(initial.start) : null,
    end: initial?.end ? stripTime(initial.end) : null,
  });

  const shift = (dy, dm) => {
    setView((v) => {
      const d = new Date(v.y + dy, v.m + dm, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const pick = (sd) => {
    if (single) {
      setSel({ start: sd, end: sd });
      return;
    }
    setSel(({ start, end }) => {
      if (!start || (start && end)) return { start: sd, end: null };
      if (sd.getTime() < start.getTime()) return { start: sd, end: null };
      if (sd.getTime() === start.getTime()) return { start: sd, end: sd };
      return { start, end: sd };
    });
  };

  const second = new Date(view.y, view.m + 1, 1);

  return (
    <div className="drp" onMouseDown={(e) => e.stopPropagation()}>
      <div className="drp-head">
        {single ? (
          <>Ngày: <b>{fmtLong(sel.start)}</b></>
        ) : (
          <>Từ <b>{fmtLong(sel.start)}</b> đến <b>{fmtLong(sel.end || sel.start)}</b></>
        )}
      </div>
      <div className="drp-calendars">
        <MonthPanel
          year={view.y} month={view.m}
          onPrev={() => shift(0, -1)} onNext={() => shift(0, 1)}
          sel={sel} onPick={pick}
        />
        <MonthPanel
          year={second.getFullYear()} month={second.getMonth()}
          onPrev={() => shift(0, -1)} onNext={() => shift(0, 1)}
          sel={sel} onPick={pick}
        />
      </div>
      <div className="drp-foot">
        <button type="button" className="kv-btn kv-btn-ghost" onClick={() => setSel({ start: null, end: null })}>
          Đặt lại
        </button>
        <button
          type="button"
          className="kv-btn kv-btn-primary"
          onClick={() => { onApply(sel.start ? sel : null); if (onClose) onClose(); }}
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}
