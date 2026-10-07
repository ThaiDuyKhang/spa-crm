import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Plus, Download, Upload, Menu, ChevronDown, Star,
  ArrowUpDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  Trash2, Copy, Pencil, Lock, Printer, Package, Box, LayoutGrid, X,
} from "lucide-react";
import ProductModal from "./ProductModal.jsx";
import { formatMoney } from "../data/customers.js";
import "./ProductsPage.css";

const TABS = [
  ["overview", "Tổng quan"],
  ["stock", "Thẻ kho"],
  ["materials", "Nguyên liệu tiêu hao"],
  ["desc", "Mô tả, ghi chú"],
];

const KIND_LABEL = { service: "Dịch vụ", product: "Hàng hóa" };

// [Tích hợp 2026-10-06] 16 cột bật/tắt của bảng Hàng hóa (mặc định như hình mẫu)
const ALL_COLUMNS = [
  { key: "image", label: "Hình ảnh" },
  { key: "code", label: "Mã hàng hóa", sortKey: "code" },
  { key: "barcode", label: "Mã vạch" },
  { key: "name", label: "Tên hàng", sortKey: "name" },
  { key: "duration", label: "Thời lượng (phút)" },
  { key: "group", label: "Nhóm hàng" },
  { key: "kind", label: "Loại hàng" },
  { key: "price", label: "Giá bán", sortKey: "price", align: "right" },
  { key: "cost", label: "Giá vốn", sortKey: "cost", align: "right" },
  { key: "brand", label: "Thương hiệu" },
  { key: "stock", label: "Tồn kho", sortKey: "stock", align: "right" },
  { key: "location", label: "Vị trí" },
  { key: "minStock", label: "Định mức tồn thấp nhất", align: "right" },
  { key: "maxStock", label: "Định mức tồn cao nhất", align: "right" },
  { key: "status", label: "Trạng thái" },
  { key: "expiry", label: "Hạn sử dụng" },
];
const DEFAULT_COLS = ["code", "name", "kind", "price", "cost", "stock"];
const COLS_KEY = "spa-product-cols";

function loadCols() {
  try {
    if (typeof localStorage === "undefined") return DEFAULT_COLS;
    const raw = localStorage.getItem(COLS_KEY);
    if (!raw) return DEFAULT_COLS;
    const arr = JSON.parse(raw).filter((k) => ALL_COLUMNS.some((c) => c.key === k));
    return arr.length ? arr : DEFAULT_COLS;
  } catch {
    return DEFAULT_COLS;
  }
}

export function linesForProduct(invoices, item) {
  const out = [];
  (invoices || []).forEach((inv) => {
    (inv.items || []).forEach((it) => {
      const match =
        it.refId != null
          ? String(it.refId) === String(item.id) && it.type === item.kind
          : it.name === item.name && it.type === item.kind;
      if (match) {
        out.push({
          code: inv.code,
          time: inv.time,
          ts: inv.ts,
          customer: inv.customerName || "",
          qty: it.qty || 1,
        });
      }
    });
  });
  return out.sort((a, b) => b.ts - a.ts);
}

function ConfirmModal({ title, message, onCancel, onConfirm }) {
  return (
    <div className="kv-overlay" style={{ zIndex: 210 }} onMouseDown={onCancel}>
      <div className="kv-modal" style={{ maxWidth: 420 }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="kv-modal-head">
          <h2 className="kv-modal-title" style={{ fontSize: 16 }}>{title}</h2>
          <button className="kv-modal-close" onClick={onCancel}><X size={18} /></button>
        </div>
        <div className="kv-modal-body"><p style={{ fontSize: 14, color: "var(--text-2)" }}>{message}</p></div>
        <div className="kv-modal-foot">
          <button className="kv-btn kv-btn-ghost" onClick={onCancel}>Bỏ qua</button>
          <button className="kv-btn kv-btn-danger" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
}

function SortTh({ label, k, sort, onSort, style }) {
  const active = sort.key === k;
  return (
    <th style={style}>
      <span className="th-sort" onClick={() => onSort(k)} style={{ cursor: "pointer" }}>
        {label}
        <ArrowUpDown size={12} style={{ opacity: active ? 1 : 0.45, color: active ? "var(--kv-blue)" : undefined }} />
      </span>
    </th>
  );
}

export default function ProductsPage({
  items, categories, invoices,
  onSave, onDelete, onCopy, onToggleStatus, onCreateCategory,
  onExport, onImportFile, onDownloadTemplate, onOpenInvoice, notify,
}) {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [brandQuery, setBrandQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [sort, setSort] = useState({ key: "name", dir: 1 });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [checked, setChecked] = useState(new Set());
  const [fav, setFav] = useState(new Set());
  const [expandedKey, setExpandedKey] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [modal, setModal] = useState(null); // {mode, kind, item, tab}
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [groupModal, setGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [cols, setCols] = useState(loadCols);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const fileRef = useRef(null);
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
      if (typeof localStorage !== "undefined") localStorage.setItem(COLS_KEY, JSON.stringify(cols));
    } catch {}
  }, [cols]);

  const toggleCol = (key) => {
    setCols((prev) => {
      if (prev.includes(key)) {
        return prev.length <= 1 ? prev : prev.filter((k) => k !== key);
      }
      const order = ALL_COLUMNS.map((c) => c.key);
      return [...prev, key].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    });
  };

  const visibleCols = ALL_COLUMNS.filter((c) => cols.includes(c.key));
  const colSpan = 2 + visibleCols.length;

  const renderCell = (it, col) => {
    const right = col.align === "right" ? { textAlign: "right" } : undefined;
    switch (col.key) {
      case "image":
        return (
          <td key={col.key}>
            <span className="prod-thumb">
              {it.image ? <img src={it.image} alt="" /> : <Package size={16} />}
            </span>
          </td>
        );
      case "code": return <td key={col.key} className="cell-id">{it.code}</td>;
      case "barcode": return <td key={col.key}>{it.barcode || "---"}</td>;
      case "name": return <td key={col.key} className="cell-name">{it.name}</td>;
      case "duration": return <td key={col.key}>{it.kind === "service" ? (it.duration || 0) : "---"}</td>;
      case "group": return <td key={col.key}>{catName(it.categoryId) || "---"}</td>;
      case "kind": return <td key={col.key}><span className="kv-pill">{KIND_LABEL[it.kind]}</span></td>;
      case "price": return <td key={col.key} style={right}>{formatMoney(it.price)}</td>;
      case "cost": return <td key={col.key} style={right}>{formatMoney(it.cost)}</td>;
      case "brand": return <td key={col.key}>{it.brand || "---"}</td>;
      case "stock": return <td key={col.key} style={right}>{it.kind === "product" ? it.stock : "---"}</td>;
      case "location": return <td key={col.key}>{it.location || "---"}</td>;
      case "minStock": return <td key={col.key} style={right}>{it.minStock ?? "---"}</td>;
      case "maxStock": return <td key={col.key} style={right}>{it.maxStock ?? "---"}</td>;
      case "status": return <td key={col.key}>{it.status === "active" ? "Đang kinh doanh" : "Ngừng kinh doanh"}</td>;
      case "expiry": return <td key={col.key}>{it.expiry || "---"}</td>;
      default: return <td key={col.key} />;
    }
  };

  const keyOf = (it) => `${it.kind}:${it.id}`;
  const catName = (id) => (categories || []).find((c) => String(c.id) === String(id))?.name || "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = (items || []).filter((it) => {
      if (kindFilter !== "all" && it.kind !== kindFilter) return false;
      if (groupFilter !== "all" && String(it.categoryId) !== String(groupFilter)) return false;
      if (stockFilter === "in" && it.kind === "product" && !(it.stock > 0)) return false;
      if (stockFilter === "out" && !(it.kind === "product" && it.stock <= 0)) return false;
      if (statusFilter !== "all" && it.status !== statusFilter) return false;
      if (brandQuery.trim() && !(it.brand || "").toLowerCase().includes(brandQuery.trim().toLowerCase())) return false;
      if (q && !(`${it.code} ${it.name}`.toLowerCase().includes(q))) return false;
      return true;
    });
    const { key, dir } = sort;
    const val = (it) => {
      if (key === "stock") return it.kind === "product" ? it.stock : -1;
      return it[key];
    };
    list = [...list].sort((a, b) => {
      const va = val(a), vb = val(b);
      const c = typeof va === "number" && typeof vb === "number" ? va - vb : String(va ?? "").localeCompare(String(vb ?? ""), "vi");
      return dir === 1 ? c : -c;
    });
    return list;
  }, [items, query, kindFilter, groupFilter, stockFilter, brandQuery, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const toggleSort = (k) => setSort((s) => s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: 1 });
  const toggleCheck = (k) => setChecked((prev) => {
    const n = new Set(prev);
    n.has(k) ? n.delete(k) : n.add(k);
    return n;
  });
  const toggleFav = (k) => setFav((prev) => {
    const n = new Set(prev);
    n.has(k) ? n.delete(k) : n.add(k);
    return n;
  });

  const openModal = (mode, kind, item, tab) => setModal({ mode, kind, item, tab: tab || "info" });
  const closeModal = () => setModal(null);

  const handleSave = (data) => {
    onSave(data);
    closeModal();
  };

  const expanded = (items || []).find((it) => keyOf(it) === expandedKey);
  const stockLines = useMemo(
    () => (expanded ? linesForProduct(invoices, expanded) : []),
    [invoices, expanded]
  );

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const res = await onImportFile(file);
      notify(`Đã nhập ${res.added} hàng hóa từ file`);
    } catch {
      notify("File không hợp lệ, vui lòng kiểm tra lại", "info");
    }
  };

  return (
    <div className="kv-page">
      <div className="kv-page-head">
        <h1 className="kv-page-title">Hàng hóa</h1>
        <div className="kv-search">
          <Search size={16} />
          <input
            className="kv-input" placeholder="Tìm theo mã, tên hàng"
            value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        <div className="kv-head-actions">
          <div className="kv-split-btn">
            <button className="kv-btn kv-btn-primary" onClick={() => openModal("add", "product", null)}>
              <Plus size={16} /> Hàng hóa
            </button>
            <button
              className="kv-btn kv-btn-primary kv-split-caret"
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              title="Thêm loại khác"
            >
              <ChevronDown size={16} />
            </button>
            {addMenuOpen && (
              <div className="kv-dropdown" onMouseLeave={() => setAddMenuOpen(false)}>
                <button onClick={() => { setAddMenuOpen(false); openModal("add", "product", null); }}>
                  <Package size={15} /> Thêm hàng hóa
                </button>
                <button onClick={() => { setAddMenuOpen(false); openModal("add", "service", null); }}>
                  <Box size={15} /> Thêm dịch vụ
                </button>
              </div>
            )}
          </div>
          <button className="kv-btn kv-btn-white" onClick={() => fileRef.current?.click()}>
            <Upload size={15} /> Nhập file
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleImport} />
          <button className="kv-btn kv-btn-white" onClick={onExport}>
            <Download size={15} /> Xuất file
          </button>
          <div style={{ position: "relative" }} ref={colMenuRef}>
            <button
              className="kv-btn kv-btn-white kv-btn-icon" title="Tùy chọn hiển thị"
              onClick={() => setColMenuOpen((v) => !v)}
            >
              <Menu size={16} />
            </button>
            {colMenuOpen && (
              <div className="kv-col-menu">
                {ALL_COLUMNS.map((c) => (
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
            <select
              className="kv-select" value={kindFilter}
              onChange={(e) => { setKindFilter(e.target.value); setPage(1); }}
            >
              <option value="all">Chọn loại hàng</option>
              <option value="service">Dịch vụ</option>
              <option value="product">Hàng hóa</option>
            </select>
          </div>
          <div className="f-block">
            <div className="f-title-row">
              <div className="f-title">Nhóm hàng</div>
              <button className="pm-link" onClick={() => setGroupModal(true)}>Tạo mới</button>
            </div>
            <select
              className="kv-select" value={groupFilter}
              onChange={(e) => { setGroupFilter(e.target.value); setPage(1); }}
            >
              <option value="all">Tất cả</option>
              {(categories || []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="f-block">
            <div className="f-title">Tồn kho</div>
            <select
              className="kv-select" value={stockFilter}
              onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
            >
              <option value="all">Tất cả</option>
              <option value="in">Còn hàng</option>
              <option value="out">Hết hàng</option>
            </select>
          </div>
          <div className="f-block">
            <div className="f-title">Thương hiệu</div>
            <input
              className="kv-input" placeholder="Chọn thương hiệu"
              value={brandQuery} onChange={(e) => { setBrandQuery(e.target.value); setPage(1); }}
            />
          </div>
          <div className="f-block">
            <div className="f-title">Trạng thái</div>
            <select
              className="kv-select" value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="active">Đang kinh doanh</option>
              <option value="inactive">Ngừng kinh doanh</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
        </aside>

        <section className="kv-content">
          <div className="kv-table-wrap">
            <table className="kv-table prod-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <label className="kv-check">
                      <input
                        type="checkbox"
                        checked={pageItems.length > 0 && pageItems.every((it) => checked.has(keyOf(it)))}
                        onChange={(e) => {
                          const n = new Set(checked);
                          pageItems.forEach((it) => e.target.checked ? n.add(keyOf(it)) : n.delete(keyOf(it)));
                          setChecked(n);
                        }}
                      />
                    </label>
                  </th>
                  <th style={{ width: 40 }}><Star size={14} style={{ color: "var(--muted-2)" }} /></th>
                  {visibleCols.map((c) =>
                    c.sortKey ? (
                      <SortTh key={c.key} label={c.label} k={c.sortKey} sort={sort} onSort={toggleSort}
                        style={c.align === "right" ? { textAlign: "right" } : undefined} />
                    ) : (
                      <th key={c.key} style={c.align === "right" ? { textAlign: "right" } : undefined}>{c.label}</th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((it) => {
                  const k = keyOf(it);
                  const isExp = expandedKey === k;
                  return [
                    <tr
                      key={k}
                      className={`prod-row${isExp ? " expanded" : ""}${checked.has(k) ? " selected" : ""}`}
                      onClick={() => { setExpandedKey(isExp ? null : k); setDetailTab("overview"); }}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <label className="kv-check">
                          <input type="checkbox" checked={checked.has(k)} onChange={() => toggleCheck(k)} />
                        </label>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className={`prod-star${fav.has(k) ? " on" : ""}`}
                          onClick={() => toggleFav(k)} title="Đánh dấu yêu thích"
                        >
                          <Star size={15} fill={fav.has(k) ? "currentColor" : "none"} />
                        </button>
                      </td>
                      {visibleCols.map((c) => renderCell(it, c))}
                    </tr>,
                    isExp && (
                      <tr key={`${k}-detail`} className="prod-detail-row">
                        <td colSpan={colSpan}>
                          <div className="prod-detail">
                            <div className="loc-detail-tabs">
                              {TABS.map(([tk, label]) => (
                                <button
                                  key={tk}
                                  className={`loc-detail-tab${detailTab === tk ? " active" : ""}`}
                                  onClick={() => setDetailTab(tk)}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>

                            {detailTab === "overview" && (
                              <div className="prod-overview">
                                <div className="prod-ov-top">
                                  <div className="prod-ov-img">
                                    <Package size={34} />
                                  </div>
                                  <div>
                                    <div className="prod-ov-name">{it.name}</div>
                                    <div className="prod-ov-meta">
                                      <span><Box size={14} /> {KIND_LABEL[it.kind]}</span>
                                      <span><LayoutGrid size={14} /> Nhóm hàng: {catName(it.categoryId) || "---"}</span>
                                    </div>
                                    {it.allowSale && <span className="kv-pill kv-pill-soft">Cho phép bán</span>}
                                  </div>
                                </div>
                                <div className="prod-ov-grid">
                                  <div className="prod-ov-cell">
                                    <div className="prod-ov-label">Mã hàng</div>
                                    <div className="prod-ov-value">{it.code}</div>
                                  </div>
                                  <div className="prod-ov-cell">
                                    <div className="prod-ov-label">Giá vốn</div>
                                    <div className="prod-ov-value">{formatMoney(it.cost)}</div>
                                  </div>
                                  <div className="prod-ov-cell">
                                    <div className="prod-ov-label">Giá bán</div>
                                    <div className="prod-ov-value">{formatMoney(it.price)}</div>
                                  </div>
                                  <div className="prod-ov-cell">
                                    <div className="prod-ov-label">Thời lượng</div>
                                    <div className="prod-ov-value">
                                      {it.kind === "service" ? `${it.duration || 0} phút` : "---"}
                                    </div>
                                  </div>
                                </div>
                                <div className="prod-ov-grid">
                                  <div className="prod-ov-cell">
                                    <div className="prod-ov-label">Thương hiệu</div>
                                    <div className="prod-ov-value muted">{it.brand || "Chưa có"}</div>
                                  </div>
                                </div>
                                <div className="prod-ov-actions">
                                  <div className="prod-ov-left">
                                    <button className="kv-btn kv-btn-text-danger" onClick={() => setConfirmDelete(it)}>
                                      <Trash2 size={15} /> Xóa
                                    </button>
                                    <button className="kv-btn kv-btn-text" onClick={() => onCopy(it)}>
                                      <Copy size={15} /> Sao chép
                                    </button>
                                  </div>
                                  <div className="prod-ov-right">
                                    <button className="kv-btn kv-btn-primary" onClick={() => openModal("edit", it.kind, it)}>
                                      <Pencil size={15} /> Chỉnh sửa
                                    </button>
                                    <button className="kv-btn kv-btn-white" onClick={() => openModal("add", it.kind, null)}>
                                      <Plus size={15} /> Hàng cùng loại
                                    </button>
                                    <button className="kv-btn kv-btn-white" onClick={() => onToggleStatus(it)}>
                                      <Lock size={15} /> {it.status === "active" ? "Ngừng kinh doanh" : "Mở kinh doanh"}
                                    </button>
                                    <button className="kv-btn kv-btn-white" onClick={() => notify("Đã gửi lệnh in tem mã", "info")}>
                                      <Printer size={15} /> In tem mã
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {detailTab === "stock" && (
                              <div className="prod-stock">
                                <table className="kv-table prod-mini-table">
                                  <thead>
                                    <tr>
                                      <th>Chứng từ</th>
                                      <th>Phương thức</th>
                                      <th>Đối tác</th>
                                      <th>Thời gian</th>
                                      <th style={{ textAlign: "right" }}>Giá vốn</th>
                                      <th style={{ textAlign: "right" }}>Số lượng</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {stockLines.map((ln, i) => (
                                      <tr key={i}>
                                        <td>
                                          <button className="kv-link" onClick={() => onOpenInvoice(ln.code)}>
                                            {ln.code}
                                          </button>
                                        </td>
                                        <td>Bán hàng</td>
                                        <td>{ln.customer}</td>
                                        <td>{ln.time}</td>
                                        <td style={{ textAlign: "right" }}>{formatMoney(it.cost)}</td>
                                        <td style={{ textAlign: "right" }}>-{ln.qty}</td>
                                      </tr>
                                    ))}
                                    {stockLines.length === 0 && (
                                      <tr><td colSpan={6} className="kv-empty">Chưa có giao dịch kho</td></tr>
                                    )}
                                  </tbody>
                                </table>
                                <button
                                  className="kv-btn kv-btn-white"
                                  onClick={() => notify("Đã xuất thẻ kho ra file Excel", "info")}
                                >
                                  <Download size={15} /> Xuất file
                                </button>
                              </div>
                            )}

                            {detailTab === "materials" && (
                              <div className="prod-mats">
                                <table className="kv-table prod-mini-table">
                                  <thead>
                                    <tr>
                                      <th style={{ width: 60 }}>STT</th>
                                      <th>Mã hàng hóa</th>
                                      <th>Tên nguyên liệu tiêu hao</th>
                                      <th style={{ textAlign: "right" }}>Số lượng</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr><td colSpan={4} className="kv-empty">Chưa có nguyên liệu tiêu hao</td></tr>
                                  </tbody>
                                </table>
                                <div className="prod-mats-foot">
                                  <button className="kv-btn kv-btn-white" onClick={() => openModal("edit", it.kind, it, "info")}>
                                    <Pencil size={15} /> Chỉnh sửa
                                  </button>
                                </div>
                              </div>
                            )}

                            {detailTab === "desc" && (
                              <div className="prod-desc">
                                <div className="prod-desc-box">
                                  <div className="prod-desc-title">Mô tả</div>
                                  <div className="prod-desc-body">{it.description || "Chưa có mô tả"}</div>
                                </div>
                                <div className="prod-desc-box">
                                  <div className="prod-desc-title">Ghi chú</div>
                                  <div className="prod-desc-body">{it.note || "Chưa có ghi chú"}</div>
                                </div>
                                <div className="prod-mats-foot">
                                  <button className="kv-btn kv-btn-white" onClick={() => openModal("edit", it.kind, it, "media")}>
                                    <Pencil size={15} /> Chỉnh sửa
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  ];
                })}
                {pageItems.length === 0 && (
                  <tr><td colSpan={colSpan} className="kv-empty">Không tìm thấy hàng hóa nào</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="kv-pagination">
            <span className="kv-pg-label">Hiển thị</span>
            <select className="kv-select" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n} bản ghi</option>)}
            </select>
            <button className="kv-pg-btn" disabled={safePage <= 1} onClick={() => setPage(1)} title="Trang đầu"><ChevronsLeft size={15} /></button>
            <button className="kv-pg-btn" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} title="Trang trước"><ChevronLeft size={15} /></button>
            <input
              className="kv-pg-input" value={safePage}
              onChange={(e) => { const v = Number(e.target.value); if (v >= 1 && v <= totalPages) setPage(v); }}
            />
            <button className="kv-pg-btn" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} title="Trang sau"><ChevronRight size={15} /></button>
            <button className="kv-pg-btn" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)} title="Trang cuối"><ChevronsRight size={15} /></button>
            <span className="kv-pg-info">
              {(safePage - 1) * perPage + 1} - {Math.min(safePage * perPage, filtered.length)} trên tổng số {filtered.length} hàng hóa
            </span>
          </div>
        </section>
      </div>

      {modal && (
        <ProductModal
          kind={modal.kind}
          item={modal.item}
          initialTab={modal.tab}
          categories={categories}
          onClose={closeModal}
          onSave={handleSave}
          onCreateCategory={onCreateCategory}
          notify={notify}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title={`Xóa ${confirmDelete.kind === "service" ? "dịch vụ" : "hàng hóa"}`}
          message={`Bạn có chắc muốn xóa "${confirmDelete.name}"? Thao tác này không thể hoàn tác.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => { onDelete(confirmDelete); setConfirmDelete(null); setExpandedKey(null); }}
        />
      )}

      {groupModal && (
        <div className="kv-overlay" style={{ zIndex: 210 }} onMouseDown={() => setGroupModal(false)}>
          <div className="kv-modal" style={{ maxWidth: 400 }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="kv-modal-head">
              <h2 className="kv-modal-title" style={{ fontSize: 16 }}>Thêm nhóm hàng</h2>
              <button className="kv-modal-close" onClick={() => setGroupModal(false)}><X size={18} /></button>
            </div>
            <div className="kv-modal-body">
              <label className="kv-label">Tên nhóm hàng</label>
              <input
                className="kv-input" autoFocus value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="VD: Dịch vụ lẻ"
                onKeyDown={(e) => { if (e.key === "Enter" && groupName.trim()) { onCreateCategory(groupName.trim()); setGroupModal(false); setGroupName(""); } }}
              />
            </div>
            <div className="kv-modal-foot">
              <button className="kv-btn kv-btn-ghost" onClick={() => setGroupModal(false)}>Bỏ qua</button>
              <button
                className="kv-btn kv-btn-primary" disabled={!groupName.trim()}
                onClick={() => { onCreateCategory(groupName.trim()); setGroupModal(false); setGroupName(""); }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
