import { useState, useRef, useEffect } from "react";
import {
  X, ChevronDown, ChevronUp, CalendarDays, Clock, Trash2, Plus,
} from "lucide-react";
import DateRangePicker, { fmtShort } from "./DateRangePicker.jsx";
import TimeInput from "./TimeInput.jsx";
import "./TimeInput.css";
import "./DateRangePicker.css";
import FormulaEditor, { emptyFormula } from "./FormulaEditor.jsx";
import "./FormulaEditor.css";
import "./PriceListModal.css";

const p2 = (n) => String(n).padStart(2, "0");
const WEEKDAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ v: String(i + 1), label: `Tháng ${i + 1}` }));
const DAYS = Array.from({ length: 31 }, (_, i) => ({ v: String(i + 1), label: `Ngày ${i + 1}` }));

function nowStamp() {
  const d = new Date();
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
}
function plusYearStamp() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
}
function parseDT(v) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/.exec(v || "");
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4] || 0), Number(m[5] || 0));
}
function datePart(v) {
  const d = parseDT(v);
  return d ? fmtShort(d) : "";
}
function timePart(v) {
  const m = /(?:\s+(\d{2}:\d{2}))?/.exec(v || "");
  return m[1] || "";
}

function DateTimeField({ value, onChange }) {
  const [openCal, setOpenCal] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) { setOpenCal(false); setOpenTime(false); }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const setDate = (d) => {
    const t = timePart(value) || "00:00";
    onChange(`${fmtShort(d)} ${t}`);
    setOpenCal(false);
  };
  const setTime = (t) => {
    const dp = datePart(value) || fmtShort(new Date());
    onChange(`${dp} ${t}`);
  };
  const initDate = parseDT(value);

  return (
    <span className="dt-wrap" ref={ref}>
      <input
        className="kv-input dt-input" value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="dd/MM/yyyy HH:mm"
      />
      <button type="button" className="dt-icon" onClick={() => { setOpenCal(!openCal); setOpenTime(false); }} title="Chọn ngày">
        <CalendarDays size={15} />
      </button>
      <button type="button" className="dt-icon dt-icon-2" onClick={() => { setOpenTime(!openTime); setOpenCal(false); }} title="Chọn giờ">
        <Clock size={15} />
      </button>
      {openCal && (
        <div className="drp-wrap dt-cal">
          <DateRangePicker
            single
            initial={initDate ? { start: initDate, end: initDate } : null}
            onApply={(v) => v && v.start && setDate(v.start)}
            onClose={() => setOpenCal(false)}
          />
        </div>
      )}
      {openTime && (
        <div className="dt-time">
          <TimeInput value={timePart(value)} onChange={(t) => setTime(t)} />
        </div>
      )}
    </span>
  );
}

function CheckDropdown({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggle = (v) => {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };
  const label = selected.length === 0 ? placeholder
    : selected.length <= 3
      ? options.filter((o) => selected.includes(o.v)).map((o) => o.label).join(", ")
      : `Đã chọn ${selected.length}`;

  return (
    <span className="cd-wrap" ref={ref}>
      <button
        type="button"
        className={`kv-input cd-btn${selected.length === 0 ? " placeholder" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className="cd-label">{label}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="cd-drop">
          {options.map((o) => (
            <label key={o.v} className="cd-opt">
              <input type="checkbox" checked={selected.includes(o.v)} onChange={() => toggle(o.v)} />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </span>
  );
}

function Collapse({ title, desc, open, onToggle, children }) {
  return (
    <div className="pl-collapse">
      <button type="button" className="pl-collapse-head" onClick={onToggle}>
        <span className="pl-collapse-text">
          <span className="pl-collapse-title">{title}</span>
          {desc && <span className="pl-collapse-desc">{desc}</span>}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="pl-collapse-body">{children}</div>}
    </div>
  );
}

function ScopeCard({ title, specificLabel, mode, onModeChange, children, inputPlaceholder }) {
  return (
    <div className="pl-scope">
      <div className="pl-scope-title">{title}</div>
      <label className="kv-radio">
        <input type="radio" checked={mode === "all"} onChange={() => onModeChange("all")} />
        Tất cả
      </label>
      <label className="kv-radio">
        <input type="radio" checked={mode === "specific"} onChange={() => onModeChange("specific")} />
        {specificLabel}
      </label>
      {mode === "specific" && (
        <div className="pl-scope-input">{children || <input className="kv-input" placeholder={inputPlaceholder} />}</div>
      )}
    </div>
  );
}

/**
 * Modal tạo/sửa bảng giá kiểu KiotViet (hình 2/5).
 */
export default function PriceListModal({
  priceList, priceLists, branches, customerGroups,
  onClose, onSave, notify, initialTab,
}) {
  const editing = !!priceList;
  const [tab, setTab] = useState(initialTab || "info");
  const [name, setName] = useState(priceList?.name || "");
  const [nameError, setNameError] = useState(false);
  const [effOpen, setEffOpen] = useState(true);
  const [effFrom, setEffFrom] = useState(priceList?.effectiveFrom || nowStamp());
  const [effTo, setEffTo] = useState(priceList?.effectiveTo || plusYearStamp());
  const [status, setStatus] = useState(priceList?.status || "active");
  const [timeOpen, setTimeOpen] = useState(true);
  const [months, setMonths] = useState(priceList?.months || []);
  const [weeks, setWeeks] = useState(priceList?.weeks || "all");
  const [days, setDays] = useState(priceList?.days || []);
  const [weekdays, setWeekdays] = useState(priceList?.weekdays || []);
  const [ranges, setRanges] = useState(priceList?.timeRanges || [{ from: "", to: "" }]);
  const [formulaOpen, setFormulaOpen] = useState(true);
  const [formula, setFormula] = useState(priceList?.formula || emptyFormula());
  const [scope, setScope] = useState(priceList?.scope || {
    branch: { mode: "all", value: "" },
    account: { mode: "all", value: "" },
    customerGroup: { mode: "all", value: "" },
    channel: { mode: "all", value: "" },
  });

  const setScopePart = (key, patch) =>
    setScope((s) => ({ ...s, [key]: { ...s[key], ...patch } }));

  const toggleWeekday = (w) =>
    setWeekdays((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onSave({
      id: priceList?.id,
      name: name.trim(),
      status,
      effectiveFrom: effFrom,
      effectiveTo: effTo,
      months, weeks, days, weekdays,
      timeRanges: ranges.filter((r) => r.from || r.to),
      formula,
      scope,
    });
  };

  const otherLists = (priceLists || []).filter((pl) => pl.id !== priceList?.id);

  return (
    <div className="kv-overlay" onMouseDown={onClose}>
      <div className="kv-modal pl-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="kv-modal-head">
          <h2 className="kv-modal-title">{editing ? "Sửa bảng giá" : "Tạo bảng giá"}</h2>
          <button className="kv-modal-close" onClick={onClose} title="Đóng"><X size={18} /></button>
        </div>

        <div className="pm-tabs">
          <button
            type="button" className={`pm-tab${tab === "info" ? " active" : ""}`}
            onClick={() => setTab("info")}
          >
            Thông tin
          </button>
          <button
            type="button" className={`pm-tab${tab === "scope" ? " active" : ""}`}
            onClick={() => setTab("scope")}
          >
            Phạm vi áp dụng
          </button>
        </div>

        <div className="kv-modal-body pl-body">
          {tab === "info" && (
            <>
              <div className="pl-field">
                <label className="kv-label">Tên bảng giá</label>
                <input
                  className={`kv-input${nameError ? " kv-input-error" : ""}`}
                  value={name} autoFocus
                  placeholder="Bắt buộc"
                  onChange={(e) => { setName(e.target.value); setNameError(false); }}
                />
                {nameError && <div className="pl-error">Hãy nhập Tên bảng giá</div>}
              </div>

              <Collapse title="Hiệu lực" open={effOpen} onToggle={() => setEffOpen(!effOpen)}>
                <div className="pl-eff-row">
                  <span className="pl-eff-label">Hiệu lực</span>
                  <DateTimeField value={effFrom} onChange={setEffFrom} />
                  <span className="pl-eff-sep">đến</span>
                  <DateTimeField value={effTo} onChange={setEffTo} />
                </div>
                <div className="pl-status-row">
                  <span className="pl-eff-label">Trạng thái</span>
                  <label className="kv-radio">
                    <input type="radio" checked={status === "active"} onChange={() => setStatus("active")} />
                    Áp dụng
                  </label>
                  <label className="kv-radio">
                    <input type="radio" checked={status === "inactive"} onChange={() => setStatus("inactive")} />
                    Chưa áp dụng
                  </label>
                </div>
              </Collapse>

              <Collapse
                title="Khung thời gian áp dụng"
                desc="Chọn giờ, ngày, thứ và tháng sử dụng trong bảng giá này"
                open={timeOpen} onToggle={() => setTimeOpen(!timeOpen)}
              >
                <div className="pl-field">
                  <label className="kv-label">Tháng</label>
                  <CheckDropdown options={MONTHS} selected={months} onChange={setMonths} placeholder="Không thiết lập" />
                </div>
                <div className="pl-field">
                  <label className="kv-label">Tuần</label>
                  <select className="kv-select pl-full" value={weeks} onChange={(e) => setWeeks(e.target.value)}>
                    <option value="all">Tất cả các tuần</option>
                    <option value="1">Tuần 1</option>
                    <option value="2">Tuần 2</option>
                    <option value="3">Tuần 3</option>
                    <option value="4">Tuần 4</option>
                  </select>
                </div>
                <div className="pl-field">
                  <label className="kv-label">Ngày</label>
                  <CheckDropdown options={DAYS} selected={days} onChange={setDays} placeholder="Không thiết lập" />
                </div>
                <div className="pl-field">
                  <label className="kv-label">Thứ</label>
                  <div className="pl-chips">
                    {WEEKDAYS.map((w) => (
                      <button
                        key={w} type="button"
                        className={`pl-chip${weekdays.includes(w) ? " on" : ""}`}
                        onClick={() => toggleWeekday(w)}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pl-field">
                  <label className="kv-label">Khung giờ</label>
                  {ranges.map((r, i) => (
                    <div key={i} className="pl-timerow">
                      <TimeInput value={r.from} onChange={(v) => setRanges((prev) => prev.map((x, k) => k === i ? { ...x, from: v } : x))} />
                      <span className="pl-eff-sep">-</span>
                      <TimeInput value={r.to} onChange={(v) => setRanges((prev) => prev.map((x, k) => k === i ? { ...x, to: v } : x))} />
                      <button
                        type="button" className="pl-trash"
                        onClick={() => setRanges((prev) => prev.filter((_, k) => k !== i))}
                        title="Xóa khung giờ"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button" className="pm-link pl-addtime"
                    onClick={() => setRanges((prev) => [...prev, { from: "", to: "" }])}
                  >
                    <Plus size={14} /> Thêm khung giờ
                  </button>
                </div>
              </Collapse>

              <Collapse
                title="Công thức giá"
                desc="Tạo công thức dựa trên giá vốn, giá nhập hoặc giá bán ở các bảng giá khác"
                open={formulaOpen} onToggle={() => setFormulaOpen(!formulaOpen)}
              >
                <FormulaEditor value={formula} onChange={setFormula} priceLists={otherLists} />
              </Collapse>
            </>
          )}

          {tab === "scope" && (
            <>
              <ScopeCard
                title="Chi nhánh áp dụng" specificLabel="Chi nhánh cụ thể"
                mode={scope.branch.mode} onModeChange={(m) => setScopePart("branch", { mode: m })}
              >
                <select
                  className="kv-input" value={scope.branch.value}
                  onChange={(e) => setScopePart("branch", { value: e.target.value })}
                >
                  <option value="">Chọn chi nhánh</option>
                  {(branches || []).map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </ScopeCard>

              <ScopeCard
                title="Tài khoản áp dụng" specificLabel="Tài khoản cụ thể"
                mode={scope.account.mode} onModeChange={(m) => setScopePart("account", { mode: m })}
                inputPlaceholder="Chọn tài khoản"
              >
                <input
                  className="kv-input" placeholder="Chọn tài khoản"
                  value={scope.account.value}
                  onChange={(e) => setScopePart("account", { value: e.target.value })}
                />
              </ScopeCard>

              <ScopeCard
                title="Nhóm khách hàng" specificLabel="Nhóm khách hàng cụ thể"
                mode={scope.customerGroup.mode} onModeChange={(m) => setScopePart("customerGroup", { mode: m })}
              >
                <select
                  className="kv-input" value={scope.customerGroup.value}
                  onChange={(e) => setScopePart("customerGroup", { value: e.target.value })}
                >
                  <option value="">Chọn nhóm khách hàng</option>
                  {(customerGroups || []).filter((g) => g !== "Tất cả").map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </ScopeCard>

              <ScopeCard
                title="Kênh bán" specificLabel="Kênh bán cụ thể"
                mode={scope.channel.mode} onModeChange={(m) => setScopePart("channel", { mode: m })}
                inputPlaceholder="Chọn kênh bán"
              >
                <input
                  className="kv-input" placeholder="Chọn kênh bán"
                  value={scope.channel.value}
                  onChange={(e) => setScopePart("channel", { value: e.target.value })}
                />
              </ScopeCard>
            </>
          )}
        </div>

        <div className="kv-modal-foot">
          <button className="kv-btn kv-btn-ghost" onClick={onClose}>Bỏ qua</button>
          <button className="kv-btn kv-btn-primary" onClick={handleSave}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
