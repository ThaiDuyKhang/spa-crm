import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Info, Plus, Minus } from "lucide-react";
import "./FormulaEditor.css";

export const ROUND_UNITS = [
  { v: "1", label: "đồng" },
  { v: "10", label: "chục đồng" },
  { v: "100", label: "trăm đồng" },
  { v: "1000", label: "nghìn đồng" },
  { v: "10000", label: "chục nghìn đồng" },
];

export const roundLabel = (v) => (ROUND_UNITS.find((u) => u.v === String(v)) || ROUND_UNITS[0]).label;

/** Tính giá mới từ công thức. Trả về null nếu chưa chọn nguồn giá. */
export function applyFormula(basePrice, f) {
  if (!f || !f.base) return null;
  let v = Number(basePrice) || 0;
  const amt = Number(String(f.amount).replace(/[^0-9]/g, "")) || 0;
  if (f.unit === "percent") {
    v = f.op === "-" ? v * (1 - amt / 100) : v * (1 + amt / 100);
  } else {
    v = f.op === "-" ? v - amt : v + amt;
  }
  if (f.autoRound) {
    const step = Number(f.roundTo) || 1;
    v = Math.round(v / step) * step;
  }
  return Math.max(0, Math.round(v));
}

export const emptyFormula = () => ({
  base: "", op: "+", amount: "", unit: "vnd",
  autoRound: false, roundTo: "1", autoUpdate: false,
});

function SearchSelect({ value, onChange, priceLists }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const options = [
    { v: "", label: "Chọn bảng giá" },
    { v: "cost", label: "Giá vốn" },
    { v: "lastImport", label: "Giá nhập lần cuối" },
    ...(priceLists || []).map((pl) => ({ v: pl.id, label: pl.name })),
  ];
  const selected = options.find((o) => o.v === value);
  const isEmpty = !value;
  const shown = options.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <span className="fe-select" ref={ref}>
      <button
        type="button"
        className={`kv-select fe-select-btn${isEmpty ? " placeholder" : ""}`}
        onClick={() => { setOpen(!open); setQ(""); }}
      >
        <span className="fe-select-label">{isEmpty ? "Chọn bảng giá" : selected.label}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="fe-drop">
          <div className="fe-search">
            <input
              className="kv-input" placeholder="Tìm kiếm" autoFocus
              value={q} onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="fe-opts">
            {shown.map((o) => (
              <button
                key={o.v} type="button"
                className={`fe-opt${o.v === value ? " sel" : ""}`}
                onClick={() => { onChange(o.v); setOpen(false); }}
              >
                <span>{o.label}</span>
                {o.v === value && <Check size={15} />}
              </button>
            ))}
            {shown.length === 0 && <div className="fe-noopt">Không tìm thấy</div>}
          </div>
        </div>
      )}
    </span>
  );
}

function RoundInfo() {
  return (
    <span className="fe-info">
      <Info size={14} />
      <span className="fe-tooltip">
        <b>Ví dụ:</b><br />
        Nếu kết quả là 23,432 thì làm tròn đến hàng chục đồng là: 23,430<br />
        Nếu kết quả là 23,678 thì làm tròn đến hàng chục đồng là: 23,680
      </span>
    </span>
  );
}

/**
 * Khối "Công thức giá" kiểu KiotViet (hình 2/3/7/8).
 * value: { base, op, amount, unit, autoRound, roundTo, autoUpdate }
 */
export default function FormulaEditor({ value, onChange, priceLists }) {
  const f = value || emptyFormula();
  const set = (patch) => onChange({ ...f, ...patch });
  const baseList = (priceLists || []).find((pl) => pl.id === f.base);
  const isCostBase = f.base === "cost" || f.base === "lastImport";
  const isListBase = !!baseList;

  const fmtAmount = (v) => {
    if (v === "" || v == null) return "";
    const n = Number(String(v).replace(/[^0-9]/g, ""));
    return Number.isFinite(n) ? n.toLocaleString("vi-VN") : "";
  };

  return (
    <div className="fe">
      <div className="fe-row">
        <span className="fe-eq">Giá mới =</span>
        <SearchSelect value={f.base} onChange={(base) => set({ base })} priceLists={priceLists} />
        <span className="fe-op">
          <button
            type="button" className={`fe-opbtn${f.op === "+" ? " on" : ""}`}
            onClick={() => set({ op: "+" })} title="Cộng"
          >
            <Plus size={14} />
          </button>
          <button
            type="button" className={`fe-opbtn${f.op === "-" ? " on" : ""}`}
            onClick={() => set({ op: "-" })} title="Trừ"
          >
            <Minus size={14} />
          </button>
        </span>
        <input
          className="kv-input fe-amount"
          value={fmtAmount(f.amount)}
          onChange={(e) => set({ amount: e.target.value.replace(/[^0-9]/g, "") })}
          placeholder="0"
        />
        <span className="fe-unit">
          <button
            type="button" className={f.unit === "vnd" ? "on" : ""}
            onClick={() => set({ unit: "vnd" })}
          >
            VNĐ
          </button>
          <button
            type="button" className={f.unit === "percent" ? "on" : ""}
            onClick={() => set({ unit: "percent" })}
          >
            %
          </button>
        </span>
      </div>

      {isCostBase && (
        <label className="fe-check">
          <input
            type="checkbox" checked={!!f.autoRound}
            onChange={(e) => set({ autoRound: e.target.checked })}
          />
          <span>Tự động làm tròn giá bán đến hàng</span>
          <select
            className="fe-roundsel" value={f.roundTo}
            onChange={(e) => set({ roundTo: e.target.value })}
            onClick={(e) => e.stopPropagation()}
          >
            {ROUND_UNITS.map((u) => <option key={u.v} value={u.v}>{u.label}</option>)}
          </select>
          <RoundInfo />
        </label>
      )}

      {isListBase && (
        <>
          <label className="fe-check">
            <input
              type="checkbox" checked={!!f.autoUpdate}
              onChange={(e) => set({ autoUpdate: e.target.checked })}
            />
            <span>Tự động cập nhật giá bán theo bảng giá <b>{baseList.name}</b></span>
          </label>
          <label className="fe-check">
            <input
              type="checkbox" checked={!!f.autoRound}
              onChange={(e) => set({ autoRound: e.target.checked })}
            />
            <span>Tự động làm tròn giá bán đến hàng</span>
            <select
              className="fe-roundsel" value={f.roundTo}
              onChange={(e) => set({ roundTo: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            >
              {ROUND_UNITS.map((u) => <option key={u.v} value={u.v}>{u.label}</option>)}
            </select>
            <RoundInfo />
          </label>
        </>
      )}
    </div>
  );
}
