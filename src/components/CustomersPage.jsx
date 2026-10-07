import { useState, useRef, useEffect, useMemo, Fragment } from "react";
import {
  Search, Plus, Upload, Download, Menu, ChevronDown,
  ArrowUpDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
} from "lucide-react";
import {
  CUSTOMER_GROUPS, CUSTOMER_TYPES, GENDERS, STATUSES, formatMoney,
} from "../data/customers";
import { FreeTimeFilter } from "./TimeFilter.jsx";
import CustomerDetail from "./CustomerDetail.jsx";
import { invoicesByCustomer } from "../data/invoices.js";
import "./CustomersPage.css";

export const CUSTOMER_TABS = [
  { key: "list", label: "Khách hàng" },
  { key: "packages", label: "Gói & thẻ đã bán" },
  { type: "divider" },
  { type: "label", label: "CSKH & Marketing" },
  { key: "voucher", label: "Voucher" },
  { key: "promo", label: "Khuyến mại" },
  { key: "message", label: "Tin nhắn Zalo/SMS/Email" },
];

// [Tích hợp 2026-10-06] 28 cột bật/tắt của bảng Khách hàng, đúng thứ tự panel mẫu
export const ALL_CUSTOMER_COLUMNS = [
  { key: "id", label: "Mã khách hàng", sortKey: "id" },
  { key: "name", label: "Tên khách hàng", sortKey: "name" },
  { key: "type", label: "Loại khách" },
  { key: "phone", label: "Số điện thoại", sortKey: "phone" },
  { key: "group", label: "Nhóm khách hàng" },
  { key: "gender", label: "Giới tính" },
  { key: "birthday", label: "Ngày sinh" },
  { key: "source", label: "Nguồn khách" },
  { key: "email", label: "Email" },
  { key: "facebook", label: "Facebook" },
  { key: "company", label: "Công ty" },
  { key: "taxCode", label: "Mã số thuế" },
  { key: "address", label: "Địa chỉ" },
  { key: "city", label: "Tỉnh/Thành phố" },
  { key: "ward", label: "Xã/Phường" },
  { key: "oldAddress", label: "Địa chỉ cũ", sortKey: "oldAddress" },
  { key: "oldArea", label: "Khu vực cũ", sortKey: "oldArea" },
  { key: "oldWard", label: "Phường xã cũ", sortKey: "oldWard" },
  { key: "createdAt", label: "Ngày tạo", sortKey: "createdAt" },
  { key: "note", label: "Ghi chú" },
  { key: "lastTx", label: "Ngày giao dịch cuối", sortKey: "lastTx" },
  { key: "firstTx", label: "Ngày giao dịch đầu", sortKey: "firstTx" },
  { key: "debt", label: "Nợ hiện tại", sortKey: "debt", align: "right", money: true },
  { key: "totalSales", label: "Tổng bán", sortKey: "totalSales", align: "right", money: true },
  { key: "totalNet", label: "Tổng bán trừ trả hàng", sortKey: "totalNet", align: "right", money: true },
  { key: "status", label: "Trạng thái" },
  { key: "cardBalance", label: "Số dư thẻ TK", align: "right", money: true },
  { key: "remainingSessions", label: "Số buổi còn lại gói DV, liệu trình", align: "right" },
];
// Các cột được tick mặc định trong hình mẫu
const DEFAULT_CUSTOMER_COLS = [
  "id", "name", "phone", "address", "city", "ward",
  "oldAddress", "oldArea", "oldWard", "createdAt",
  "debt", "totalSales", "totalNet",
];
const CUSTOMER_COLS_KEY = "spa-customer-cols";

function loadCustomerCols() {
  try {
    if (typeof localStorage === "undefined") return DEFAULT_CUSTOMER_COLS;
    const raw = localStorage.getItem(CUSTOMER_COLS_KEY);
    if (!raw) return DEFAULT_CUSTOMER_COLS;
    const arr = JSON.parse(raw).filter((k) => ALL_CUSTOMER_COLUMNS.some((c) => c.key === k));
    return arr.length ? arr : DEFAULT_CUSTOMER_COLS;
  } catch {
    return DEFAULT_CUSTOMER_COLS;
  }
}

function fmtDateOnly(ts) {
  if (!ts) return "---";
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function DateRange({ title }) {
  return <FreeTimeFilter title={title} />;
}

function MoneyRange({ title }) {
  return (
    <div className="f-block">
      <div className="f-title">{title}</div>
      <div className="f-sub">Số tiền</div>
      <div className="f-row">
        <div className="f-inline-input" style={{ flex: 1 }}>
          <span className="kv-label-inline">Từ</span>
          <input className="kv-input" defaultValue="0" />
        </div>
      </div>
      <div className="f-row">
        <div className="f-inline-input" style={{ flex: 1 }}>
          <span className="kv-label-inline">Tới</span>
          <input className="kv-input" defaultValue="0" />
        </div>
      </div>
      <div className="f-sub">Thời gian</div>
      <FreeTimeFilter title="" nested />
    </div>
  );
}

export default function CustomersPage({
  customers, tab, onTabChange, onAdd, notify,
  invoices = [], packagesByCust = {},
  onOpenInvoice, onOpenVoucher, onEditCustomer, onDeleteCustomer, onToggleCustomerActive,
}) {
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState(-1);
  const [expandedId, setExpandedId] = useState(null);
  const [cols, setCols] = useState(loadCustomerCols);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const colMenuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target)) setColMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(CUSTOMER_COLS_KEY, JSON.stringify(cols));
    } catch {}
  }, [cols]);

  const toggleCol = (key) => {
    setCols((prev) => {
      if (prev.includes(key)) {
        return prev.length <= 1 ? prev : prev.filter((k) => k !== key);
      }
      const order = ALL_CUSTOMER_COLUMNS.map((c) => c.key);
      return [...prev, key].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    });
  };

  const visibleCols = ALL_CUSTOMER_COLUMNS.filter((c) => cols.includes(c.key));
  const colSpan = 1 + visibleCols.length;

  // Thống kê theo hóa đơn cho các cột tính toán
  const statsById = useMemo(() => {
    const m = {};
    (customers || []).forEach((c) => {
      const invs = invoicesByCustomer(invoices, c.oid ?? c.id);
      let total = 0, debt = 0, minTs = Infinity, maxTs = -Infinity;
      invs.forEach((inv) => {
        total += inv.amountDue || 0;
        debt += (inv.amountDue || 0) - (inv.paid || 0);
        if (inv.ts < minTs) minTs = inv.ts;
        if (inv.ts > maxTs) maxTs = inv.ts;
      });
      m[c.id] = {
        totalSales: total,
        totalNet: total,
        debt,
        lastTx: maxTs === -Infinity ? null : maxTs,
        firstTx: minTs === Infinity ? null : minTs,
      };
    });
    return m;
  }, [customers, invoices]);

  const sortVal = (c, key) => {
    const st = statsById[c.id] || {};
    switch (key) {
      case "name": return (c.fullName || c.name || "").toLowerCase();
      case "createdAt": return c.createdAt ? new Date(c.createdAt).getTime() : -1;
      case "lastTx": return st.lastTx ?? -1;
      case "firstTx": return st.firstTx ?? -1;
      case "debt": return st.debt || 0;
      case "totalSales": return st.totalSales || 0;
      case "totalNet": return st.totalNet || 0;
      default: return (c[key] ?? "").toString().toLowerCase();
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = customers;
    if (q) {
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          (c.fullName || c.name || "").toLowerCase().includes(q) ||
          (c.phone || "").includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      const va = sortVal(a, sortKey);
      const vb = sortVal(b, sortKey);
      const c =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "vi");
      return c * sortDir;
    });
    return sorted;
  }, [customers, query, sortKey, sortDir, statsById]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  const rows = filtered.slice(start, start + perPage);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => -d);
    else { setSortKey(key); setSortDir(1); }
  };

  const toggleCheck = (id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (rows.every((r) => checked.has(r.id))) {
      setChecked((prev) => {
        const next = new Set(prev);
        rows.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setChecked((prev) => new Set([...prev, ...rows.map((r) => r.id)]));
    }
  };

  const activeTab = CUSTOMER_TABS.find((t) => t.key === tab);

  const th = (label, key, sortable = true) => (
    <th key={label}>
      {sortable ? (
        <span className="th-sort" onClick={() => toggleSort(key)}>
          {label} <ArrowUpDown size={13} />
        </span>
      ) : (
        label
      )}
    </th>
  );

  const renderCell = (c, col) => {
    const st = statsById[c.id] || {};
    const right = col.align === "right" ? { textAlign: "right" } : undefined;
    const dash = (v) => (v === "" || v == null ? "---" : v);
    switch (col.key) {
      case "id": return <td key={col.key} className="cell-id">{c.id}</td>;
      case "name": return <td key={col.key} className="cell-name">{c.fullName || c.name}</td>;
      case "phone": return <td key={col.key}>{dash(c.phone)}</td>;
      case "type": return <td key={col.key}>{dash(c.type)}</td>;
      case "group": return <td key={col.key}>{dash(c.group)}</td>;
      case "gender": return <td key={col.key}>{dash(c.gender)}</td>;
      case "birthday": return <td key={col.key}>{dash(c.birthday)}</td>;
      case "source": return <td key={col.key}>{dash(c.source)}</td>;
      case "email": return <td key={col.key}>{dash(c.email)}</td>;
      case "facebook": return <td key={col.key}>{dash(c.facebook)}</td>;
      case "company": return <td key={col.key}>{dash(c.company)}</td>;
      case "taxCode": return <td key={col.key}>{dash(c.taxCode)}</td>;
      case "address": return <td key={col.key}>{dash(c.address)}</td>;
      case "city": return <td key={col.key}>{dash(c.city)}</td>;
      case "ward": return <td key={col.key}>{dash(c.ward)}</td>;
      case "oldAddress": return <td key={col.key}>{dash(c.oldAddress)}</td>;
      case "oldArea": return <td key={col.key}>{dash(c.oldArea)}</td>;
      case "oldWard": return <td key={col.key}>{dash(c.oldWard)}</td>;
      case "createdAt": return <td key={col.key}>{dash(c.createdAt)}</td>;
      case "note": return <td key={col.key}>{dash(c.note)}</td>;
      case "lastTx": return <td key={col.key}>{fmtDateOnly(st.lastTx)}</td>;
      case "firstTx": return <td key={col.key}>{fmtDateOnly(st.firstTx)}</td>;
      case "debt": return <td key={col.key} style={right}>{formatMoney(st.debt)}</td>;
      case "totalSales": return <td key={col.key} style={right}>{formatMoney(st.totalSales)}</td>;
      case "totalNet": return <td key={col.key} style={right}>{formatMoney(st.totalNet)}</td>;
      case "status": return <td key={col.key}>{c.status || "Đang hoạt động"}</td>;
      case "cardBalance": return <td key={col.key} style={right}>{formatMoney(c.cardBalance)}</td>;
      case "remainingSessions": return <td key={col.key} style={right}>{dash(c.remainingSessions)}</td>;
      default: return <td key={col.key} />;
    }
  };

  return (
    <div className="kv-page">
      <div className="kv-page-head">
        <h1 className="kv-page-title">Khách hàng</h1>

        <div style={{ position: "relative" }} ref={menuRef}>
          <button className="kv-tabbtn" onClick={() => setMenuOpen((v) => !v)}>
            {activeTab?.label || "Khách hàng"} <ChevronDown size={15} />
          </button>
          {menuOpen && (
            <div className="kv-menu" style={{ top: "calc(100% + 6px)", left: 0, minWidth: 230 }}>
              {CUSTOMER_TABS.map((t, i) =>
                t.type === "divider" ? (
                  <div className="kv-menu-divider" key={`d${i}`} />
                ) : t.type === "label" ? (
                  <div className="kv-menu-label" key={`l${i}`}>{t.label}</div>
                ) : (
                  <button
                    key={t.key}
                    className={`kv-menu-item${tab === t.key ? " active" : ""}`}
                    onClick={() => { onTabChange(t.key); setMenuOpen(false); }}
                  >
                    {t.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <div className="kv-search">
          <Search size={16} />
          <input
            className="kv-input"
            placeholder="Tìm theo mã, tên, số điện thoại"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>

        <div className="kv-head-actions">
          <button className="kv-btn kv-btn-primary" onClick={onAdd}>
            <Plus size={16} /> Khách hàng
          </button>
          <button className="kv-btn kv-btn-white" onClick={() => notify("Chức năng nhập file đang phát triển", "info")}>
            <Upload size={15} /> Nhập file <ChevronDown size={14} />
          </button>
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
              <div className="kv-col-menu kv-col-menu-cust">
                {ALL_CUSTOMER_COLUMNS.map((c) => (
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
        {/* ===== Bộ lọc ===== */}
        <aside className="kv-filter-panel">
          <div className="f-block">
            <div className="f-title">
              Nhóm khách hàng
              <button className="f-link" onClick={() => notify("Tạo nhóm khách hàng đang phát triển", "info")}>Tạo mới</button>
            </div>
            <select className="kv-select">
              {CUSTOMER_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>

          <DateRange title="Ngày tạo" />
          <DateRange title="Sinh nhật" />
          <DateRange title="Ngày giao dịch cuối" />
          <DateRange title="Ngày giao dịch đầu" />
          <MoneyRange title="Tổng bán" />

          <div className="f-block">
            <div className="f-title">Nợ hiện tại</div>
            <div className="f-row">
              <div className="f-inline-input" style={{ flex: 1 }}>
                <span className="kv-label-inline">Từ</span>
                <input className="kv-input" defaultValue="0" />
              </div>
            </div>
            <div className="f-row">
              <div className="f-inline-input" style={{ flex: 1 }}>
                <span className="kv-label-inline">Tới</span>
                <input className="kv-input" defaultValue="0" />
              </div>
            </div>
          </div>

          <div className="f-block">
            <div className="f-title">Loại khách</div>
            <select className="kv-select">
              {CUSTOMER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="f-block">
            <div className="f-title">Nguồn khách</div>
            <input className="kv-input" placeholder="Chọn nguồn khách" />
          </div>

          <div className="f-block">
            <div className="f-title">Giới tính</div>
            <select className="kv-select">
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>

          <div className="f-block">
            <div className="f-title">Khu vực cũ</div>
            <input className="kv-input" placeholder="Chọn Tỉnh/TP - Quận/Huyện" />
          </div>

          <div className="f-block">
            <div className="f-title">Tỉnh/Thành phố</div>
            <input className="kv-input" placeholder="Chọn Tỉnh/Thành phố" />
          </div>

          <div className="f-block">
            <div className="f-title">Trạng thái</div>
            <select className="kv-select" defaultValue="Đang hoạt động">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </aside>

        {/* ===== Bảng ===== */}
        <section className="kv-content">
          <div className="kv-table-wrap">
            <table className="kv-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <label className="kv-check">
                      <input type="checkbox" checked={rows.length > 0 && rows.every((r) => checked.has(r.id))} onChange={toggleAll} />
                    </label>
                  </th>
                  {visibleCols.map((col) => th(col.label, col.sortKey, !!col.sortKey))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const expanded = expandedId === c.id;
                  const custInvoices = invoicesByCustomer(invoices, c.oid ?? c.id);
                  return (
                    <Fragment key={c.id}>
                      <tr
                        className={`${checked.has(c.id) ? "selected" : ""}${expanded ? " expanded" : ""}`}
                        onClick={(e) => {
                          if (e.target.closest("label, input, button, a")) return;
                          setExpandedId(expanded ? null : c.id);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <label className="kv-check">
                            <input type="checkbox" checked={checked.has(c.id)} onChange={() => toggleCheck(c.id)} />
                          </label>
                        </td>
                        {visibleCols.map((col) => renderCell(c, col))}
                      </tr>
                      {expanded && (
                        <tr className="cd-detail-row">
                          <td colSpan={colSpan} style={{ padding: 0 }}>
                            <CustomerDetail
                              customer={c}
                              invoices={custInvoices}
                              packages={packagesByCust[c.oid ?? c.id] || []}
                              onOpenInvoice={onOpenInvoice}
                              onOpenVoucher={onOpenVoucher}
                              onEdit={() => onEditCustomer && onEditCustomer(c)}
                              onDelete={() => onDeleteCustomer && onDeleteCustomer(c)}
                              onToggleActive={() => onToggleCustomerActive && onToggleCustomerActive(c)}
                              notify={notify}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={colSpan} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                      Không tìm thấy khách hàng phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="kv-pagination">
            <span className="per-page">
              Hiển thị
              <select className="kv-select" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
                {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n} bản ghi</option>)}
              </select>
            </span>
            <button className="kv-pg-btn" disabled={safePage <= 1} onClick={() => setPage(1)} title="Trang đầu">
              <ChevronsLeft size={15} />
            </button>
            <button className="kv-pg-btn" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} title="Trang trước">
              <ChevronLeft size={15} />
            </button>
            <input
              className="kv-pg-input"
              value={safePage}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!Number.isNaN(v)) setPage(Math.max(1, Math.min(totalPages, v)));
              }}
            />
            <button className="kv-pg-btn" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} title="Trang sau">
              <ChevronRight size={15} />
            </button>
            <button className="kv-pg-btn" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)} title="Trang cuối">
              <ChevronsRight size={15} />
            </button>
            <span className="kv-pg-total">
              {total === 0 ? "0" : `${start + 1} - ${Math.min(start + perPage, total)}`} trên tổng số {formatMoney(total)} khách hàng
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
