import { useState, useRef, useEffect } from "react";
import {
  Search, Download, Menu, ArrowUpDown, Archive, SlidersHorizontal, Info,
} from "lucide-react";
import { CustomDatePick } from "./TimeFilter.jsx";
import { formatMoney } from "../data/customers.js";

// [Tích hợp 2026-10-06] 17 cột bật/tắt của bảng Gói & thẻ đã bán, đúng thứ tự panel mẫu
const ALL_PKG_COLUMNS = [
  { key: "code", label: "Mã gói dịch vụ" },
  { key: "name", label: "Tên gói dịch vụ" },
  { key: "customerCode", label: "Mã khách hàng" },
  { key: "customer", label: "Khách hàng", sortKey: "customer" },
  { key: "phone", label: "Điện thoại" },
  { key: "group", label: "Nhóm khách hàng" },
  { key: "soldDate", label: "Ngày bán" },
  { key: "invoice", label: "Hóa đơn bán" },
  { key: "price", label: "Giá bán", sortKey: "price", align: "right", money: true, info: true },
  { key: "remainingValue", label: "Giá trị còn lại", align: "right", money: true },
  { key: "status", label: "Trạng thái" },
  { key: "total", label: "Tổng", align: "right" },
  { key: "used", label: "Đã dùng", align: "right" },
  { key: "paid", label: "Đã trả", align: "right", money: true },
  { key: "remaining", label: "Còn lại", align: "right" },
  { key: "expiry", label: "Hạn sử dụng", sortKey: "expiry" },
  { key: "lastUsed", label: "SD gần nhất" },
];
// Các cột được tick mặc định trong hình mẫu
const DEFAULT_PKG_COLS = ["code", "name", "customerCode", "customer", "price", "used", "remaining", "expiry"];
const PKG_COLS_KEY = "spa-package-cols";

function loadPkgCols() {
  try {
    if (typeof localStorage === "undefined") return DEFAULT_PKG_COLS;
    const raw = localStorage.getItem(PKG_COLS_KEY);
    if (!raw) return DEFAULT_PKG_COLS;
    const arr = JSON.parse(raw).filter((k) => ALL_PKG_COLUMNS.some((c) => c.key === k));
    return arr.length ? arr : DEFAULT_PKG_COLS;
  } catch {
    return DEFAULT_PKG_COLS;
  }
}

function RadioDate({ title, options, defaultMode }) {
  const [mode, setMode] = useState(defaultMode);
  const [range, setRange] = useState(null);
  return (
    <div className="f-block">
      <div className="f-title">{title}</div>
      <div className="f-radio-col">
        {options.map((op) => (
          <label className="kv-radio" key={op.value} style={{ display: "flex" }}>
            <input
              type="radio"
              checked={mode === op.value}
              onChange={() => setMode(op.value)}
            />
            {op.select ? (
              <select className="kv-select" disabled={mode !== op.value} onClick={(e) => e.stopPropagation()}>
                {op.select.map((s) => <option key={s}>{s}</option>)}
              </select>
            ) : op.date ? (
              <CustomDatePick
                value={range}
                onChange={setRange}
                disabled={mode !== op.value}
                onActivate={() => setMode(op.value)}
              />
            ) : (
              op.label
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function PackagesPage({ notify, items = [] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("package");
  const [cols, setCols] = useState(loadPkgCols);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const colMenuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target)) setColMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(PKG_COLS_KEY, JSON.stringify(cols));
    } catch {}
  }, [cols]);

  const toggleCol = (key) => {
    setCols((prev) => {
      if (prev.includes(key)) {
        return prev.length <= 1 ? prev : prev.filter((k) => k !== key);
      }
      const order = ALL_PKG_COLUMNS.map((c) => c.key);
      return [...prev, key].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    });
  };

  const visibleCols = ALL_PKG_COLUMNS.filter((c) => cols.includes(c.key));

  const renderCell = (it, col) => {
    const right = col.align === "right" ? { textAlign: "right" } : undefined;
    const dash = (v) => (v === "" || v == null ? "---" : v);
    if (col.money) return <td key={col.key} style={right}>{formatMoney(it[col.key])}</td>;
    switch (col.key) {
      case "code": return <td key={col.key} className="cell-id">{dash(it.code)}</td>;
      case "name": return <td key={col.key} className="cell-name">{dash(it.name)}</td>;
      case "customerCode": return <td key={col.key} className="cell-id">{dash(it.customerCode)}</td>;
      default: return <td key={col.key} style={right}>{dash(it[col.key])}</td>;
    }
  };

  const renderHead = (col) => {
    const style = col.align === "right" ? { textAlign: "right" } : undefined;
    if (col.info) {
      return (
        <th key={col.key} style={style}>
          <span className="th-sort" style={{ gap: 5 }}>
            {col.label} <Info size={14} style={{ color: "var(--muted-2)" }} />
          </span>
        </th>
      );
    }
    if (col.sortKey) {
      return (
        <th key={col.key} style={style}>
          <span className="th-sort">{col.label} <ArrowUpDown size={13} /></span>
        </th>
      );
    }
    return <th key={col.key} style={style}>{col.label}</th>;
  };

  return (
    <div className="kv-page">
      <div className="kv-page-head">
        <h1 className="kv-page-title">Gói &amp; thẻ đã bán</h1>

        <div className="kv-search" style={{ width: 340 }}>
          <Search size={16} />
          <input
            className="kv-input"
            placeholder="Tìm theo mã, tên gói"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingRight: 34 }}
          />
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)", display: "inline-flex" }}>
            <SlidersHorizontal size={15} />
          </span>
        </div>

        <div className="kv-head-actions">
          <button className="kv-btn kv-btn-white" onClick={() => notify("Chức năng xuất file đang phát triển", "info")}>
            <Download size={15} /> Xuất file
          </button>
          <div style={{ position: "relative" }} ref={colMenuRef}>
            <button
              className="kv-btn kv-btn-white kv-btn-icon"
              title="Tùy chọn hiển thị"
              onClick={() => setColMenuOpen((v) => !v)}
            >
              <Menu size={16} />
            </button>
            {colMenuOpen && (
              <div className="kv-col-menu kv-col-menu-pkg">
                {ALL_PKG_COLUMNS.map((c) => (
                  <label key={c.key} className="kv-col-item">
                    <input
                      type="checkbox"
                      checked={cols.includes(c.key)}
                      onChange={() => toggleCol(c.key)}
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="kv-body">
        <aside className="kv-filter-panel">
          <div className="f-block">
            <div className="f-title">Loại hàng</div>
            <div className="f-radio-col">
              <label className="kv-radio">
                <input type="radio" checked={kind === "package"} onChange={() => setKind("package")} />
                Gói dịch vụ
              </label>
              <label className="kv-radio">
                <input type="radio" checked={kind === "card"} onChange={() => setKind("card")} />
                Thẻ tài khoản
              </label>
            </div>
          </div>

          <div className="f-block">
            <div className="f-title">Trạng thái</div>
            <select className="kv-select">
              <option>Tất cả</option>
              <option>Còn hạn</option>
              <option>Hết hạn</option>
              <option>Đã dùng hết</option>
            </select>
          </div>

          <RadioDate
            title="Hạn sử dụng"
            defaultMode="all"
            options={[
              { value: "all", label: "Tất cả" },
              { value: "unlimited", label: "Vô thời hạn" },
              { value: "custom", date: true },
            ]}
          />

          <RadioDate
            title="Ngày bán"
            defaultMode="month"
            options={[
              { value: "month", select: ["Tháng này", "Tháng trước", "Quý này", "Năm này"] },
              { value: "custom", date: true },
            ]}
          />

          <div className="f-block">
            <div className="f-title">Nhóm khách hàng</div>
            <select className="kv-select">
              <option>Tất cả</option>
              <option>Khách lẻ</option>
              <option>Khách VIP</option>
              <option>Khách thân thiết</option>
            </select>
          </div>
        </aside>

        <section className="kv-content">
          <div className="kv-table-wrap">
            <table className="kv-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <label className="kv-check"><input type="checkbox" /></label>
                  </th>
                  {visibleCols.map(renderHead)}
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.code || i}>
                    <td>
                      <label className="kv-check"><input type="checkbox" /></label>
                    </td>
                    {visibleCols.map((col) => renderCell(it, col))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && (
          <div className="kv-empty">
            <div className="kv-empty-icon">
              <Archive size={34} strokeWidth={1.6} />
            </div>
            Chưa có {kind === "package" ? "gói dịch vụ" : "thẻ tài khoản"}
          </div>
          )}
        </section>
      </div>
    </div>
  );
}
