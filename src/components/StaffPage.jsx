import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search, Plus, Menu, ChevronDown, Pencil, UserRound,
  TriangleAlert, Download, UserX,
} from "lucide-react";
import StaffModal from "./StaffModal.jsx";
import { formatMoney } from "../data/customers.js";
import "./StaffPage.css";

const DETAIL_TABS = [
  ["info", "Thông tin"],
  ["schedule", "Lịch làm việc"],
  ["salary", "Thiết lập lương"],
  ["payslip", "Phiếu lương"],
  ["debt", "Nợ và tạm ứng"],
];

// [Tích hợp 2026-10-06] Cột bật/tắt của bảng Nhân viên
const ALL_STAFF_COLUMNS = [
  { key: "code", label: "Mã nhân viên" },
  { key: "timekeepingCode", label: "Mã chấm công" },
  { key: "name", label: "Tên nhân viên" },
  { key: "phone", label: "Số điện thoại" },
  { key: "idCard", label: "Số CMND/CCCD" },
  { key: "debt", label: "Nợ và tạm ứng", align: "right" },
  { key: "note", label: "Ghi chú" },
];
const DEFAULT_STAFF_COLS = ALL_STAFF_COLUMNS.map((c) => c.key);
const STAFF_COLS_KEY = "spa-staff-cols";

function loadStaffCols() {
  try {
    if (typeof localStorage === "undefined") return DEFAULT_STAFF_COLS;
    const raw = localStorage.getItem(STAFF_COLS_KEY);
    if (!raw) return DEFAULT_STAFF_COLS;
    const arr = JSON.parse(raw).filter((k) => ALL_STAFF_COLUMNS.some((c) => c.key === k));
    return arr.length ? arr : DEFAULT_STAFF_COLS;
  } catch {
    return DEFAULT_STAFF_COLS;
  }
}

function InfoCell({ label, value }) {
  return (
    <div className="st-info-cell">
      <div className="st-info-label">{label}</div>
      <div className="st-info-value">{value || ""}</div>
    </div>
  );
}

export default function StaffPage({ staff = [], branches = [], onSave, onToggleStatus, notify }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("working");
  const [deptFilter, setDeptFilter] = useState("all");
  const [titleFilter, setTitleFilter] = useState("all");
  const [checked, setChecked] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [detailTab, setDetailTab] = useState("info");
  const [modal, setModal] = useState(null); // {mode: "add"|"edit", staff}
  const [cols, setCols] = useState(loadStaffCols);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const colMenuRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target)) setColMenuOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(STAFF_COLS_KEY, JSON.stringify(cols));
    } catch {}
  }, [cols]);

  const toggleCol = (key) => {
    setCols((prev) => {
      if (prev.includes(key)) {
        return prev.length <= 1 ? prev : prev.filter((k) => k !== key);
      }
      const order = ALL_STAFF_COLUMNS.map((c) => c.key);
      return [...prev, key].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    });
  };

  const visibleCols = ALL_STAFF_COLUMNS.filter((c) => cols.includes(c.key));
  const colSpan = 2 + visibleCols.length;

  const branchName = (id) => (branches || []).find((b) => b.id === id)?.name || "";

  const departments = useMemo(
    () => [...new Set((staff || []).map((s) => s.department).filter(Boolean))],
    [staff]
  );
  const titles = useMemo(
    () => [...new Set((staff || []).map((s) => s.title).filter(Boolean))],
    [staff]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (staff || []).filter((s) => {
      if (statusFilter === "working" && s.status === "resigned") return false;
      if (statusFilter === "resigned" && s.status !== "resigned") return false;
      if (deptFilter !== "all" && s.department !== deptFilter) return false;
      if (titleFilter !== "all" && s.title !== titleFilter) return false;
      if (q && !(`${s.code} ${s.name}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [staff, query, statusFilter, deptFilter, titleFilter]);

  const toggleCheck = (id) => setChecked((prev) => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const renderCell = (s, col) => {
    const right = col.align === "right" ? { textAlign: "right" } : undefined;
    switch (col.key) {
      case "code": return <td key={col.key} className="cell-id">{s.code}</td>;
      case "name":
        return (
          <td key={col.key} className="cell-name">
            {s.name}
            {s.warning && <TriangleAlert size={15} style={{ color: "#f59e0b", marginLeft: 8, verticalAlign: -2 }} />}
          </td>
        );
      case "debt": return <td key={col.key} style={right}>{formatMoney(s.debt)}</td>;
      default: return <td key={col.key} style={right}>{s[col.key] || ""}</td>;
    }
  };

  const openModal = (mode, s) => setModal({ mode, staff: s || null });

  const handleSave = (data) => {
    onSave && onSave(modal?.staff?.id, data, modal?.mode);
    setModal(null);
  };

  return (
    <div className="kv-page">
      <div className="kv-page-head">
        <h1 className="kv-page-title">Danh sách nhân viên</h1>
        <div className="kv-search">
          <Search size={16} />
          <input
            className="kv-input" placeholder="Tìm theo mã, tên nhân viên"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="kv-head-actions">
          <button className="kv-btn kv-btn-outline-primary" onClick={() => openModal("add")}>
            <Plus size={16} /> Nhân viên
          </button>
          <button className="kv-btn kv-btn-white" onClick={() => notify("Chức năng duyệt yêu cầu đang phát triển", "info")}>
            <Download size={15} /> Duyệt yêu cầu
          </button>
          <div style={{ position: "relative" }} ref={moreRef}>
            <button className="kv-btn kv-btn-white kv-btn-icon" title="Thêm" onClick={() => setMoreOpen((v) => !v)}>
              <ChevronDown size={16} />
            </button>
            {moreOpen && (
              <div className="kv-dropdown" style={{ right: 0 }}>
                <button onClick={() => { setMoreOpen(false); notify("Chức năng xuất file đang phát triển", "info"); }}>
                  Xuất file
                </button>
              </div>
            )}
          </div>
          <div style={{ position: "relative" }} ref={colMenuRef}>
            <button
              className="kv-btn kv-btn-white kv-btn-icon" title="Tùy chọn hiển thị"
              onClick={() => setColMenuOpen((v) => !v)}
            >
              <Menu size={16} />
            </button>
            {colMenuOpen && (
              <div className="kv-col-menu kv-col-menu-staff">
                {ALL_STAFF_COLUMNS.map((c) => (
                  <label key={c.key} className="kv-col-item">
                    <input type="checkbox" checked={cols.includes(c.key)} onChange={() => toggleCol(c.key)} />
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
            <div className="f-title">Trạng thái</div>
            <div className="f-radio-col">
              <label className="kv-radio">
                <input type="radio" checked={statusFilter === "working"} onChange={() => setStatusFilter("working")} />
                Đang làm việc
              </label>
              <label className="kv-radio">
                <input type="radio" checked={statusFilter === "resigned"} onChange={() => setStatusFilter("resigned")} />
                Đã nghỉ
              </label>
            </div>
          </div>
          <div className="f-block">
            <div className="f-title-row">
              <div className="f-title">Phòng ban</div>
              <button className="pm-link" onClick={() => notify("Tạo phòng ban đang phát triển", "info")}>Tạo mới</button>
            </div>
            <select className="kv-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="all">Chọn phòng ban</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="f-block">
            <div className="f-title-row">
              <div className="f-title">Chức danh</div>
              <button className="pm-link" onClick={() => notify("Tạo chức danh đang phát triển", "info")}>Tạo mới</button>
            </div>
            <select className="kv-select" value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)}>
              <option value="all">Chọn chức danh</option>
              {titles.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </aside>

        <section className="kv-content">
          <div className="kv-table-wrap">
            <table className="kv-table st-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <label className="kv-check">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && filtered.every((s) => checked.has(s.id))}
                        onChange={(e) => {
                          const n = new Set(checked);
                          filtered.forEach((s) => e.target.checked ? n.add(s.id) : n.delete(s.id));
                          setChecked(n);
                        }}
                      />
                    </label>
                  </th>
                  <th style={{ width: 48 }} />
                  {visibleCols.map((c) => (
                    <th key={c.key} style={c.align === "right" ? { textAlign: "right" } : undefined}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const isExp = expandedId === s.id;
                  return [
                    <tr
                      key={s.id}
                      className={`st-row${isExp ? " expanded" : ""}${checked.has(s.id) ? " selected" : ""}`}
                      onClick={() => { setExpandedId(isExp ? null : s.id); setDetailTab("info"); }}
                      style={{ cursor: "pointer" }}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <label className="kv-check">
                          <input type="checkbox" checked={checked.has(s.id)} onChange={() => toggleCheck(s.id)} />
                        </label>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <span className="st-avatar">
                          {s.avatar ? <img src={s.avatar} alt="" /> : <UserRound size={18} />}
                        </span>
                      </td>
                      {visibleCols.map((c) => renderCell(s, c))}
                    </tr>,
                    isExp && (
                      <tr key={`${s.id}-detail`} className="st-detail-row">
                        <td colSpan={colSpan} style={{ padding: 0 }}>
                          <div className="st-detail">
                            <div className="st-detail-tabs">
                              {DETAIL_TABS.map(([tk, label]) => (
                                <button
                                  key={tk}
                                  className={`st-detail-tab${detailTab === tk ? " active" : ""}`}
                                  onClick={() => setDetailTab(tk)}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            {detailTab === "info" && (
                              <div className="st-info">
                                <div className="st-info-head">
                                  <span className="st-avatar st-avatar-lg">
                                    {s.avatar ? <img src={s.avatar} alt="" /> : <UserRound size={30} />}
                                  </span>
                                  <div>
                                    <div className="st-info-name">{s.name}</div>
                                    <div className="st-info-sub">Mã nhân viên: {s.code}</div>
                                  </div>
                                </div>
                                <div className="st-info-grid">
                                  <InfoCell label="Số điện thoại" value={s.phone} />
                                  <InfoCell label="Chi nhánh trả lương" value={branchName(s.payBranch) || branchName(s.branch)} />
                                  <InfoCell label="Chi nhánh làm việc" value={branchName(s.branch)} />
                                  <InfoCell label="Phòng ban" value={s.department} />
                                  <InfoCell label="Chức danh" value={s.title} />
                                  <InfoCell label="Tài khoản KiotViet" value={s.kvAccount} />
                                  <InfoCell label="Số CMND/CCCD" value={s.idCard} />
                                  <InfoCell label="Ngày sinh" value={s.birthday} />
                                  <InfoCell label="Giới tính" value={s.gender} />
                                  <InfoCell label="Địa chỉ" value={s.address} />
                                  <InfoCell label="Email" value={s.email} />
                                  <InfoCell label="Facebook" value={s.facebook} />
                                  <InfoCell label="Ngày bắt đầu làm việc" value={s.startDate} />
                                  <InfoCell label="Mã chấm công" value={s.timekeepingCode} />
                                  <InfoCell label="Thiết bị di động" value={s.mobileDevice} />
                                  <InfoCell label="Thông tin ngân hàng" value={s.bankAccount ? `${s.bankAccount}${s.bankName ? ` - ${s.bankName}` : ""}` : ""} />
                                </div>
                                <div className="st-note-row">
                                  <Pencil size={14} />
                                  <span className="st-info-label">Ghi chú:</span>
                                  <span className="st-info-value">{s.note || ""}</span>
                                </div>
                                <div className="st-detail-foot">
                                  <button
                                    className="kv-btn kv-btn-text"
                                    onClick={() => onToggleStatus && onToggleStatus(s)}
                                  >
                                    <UserX size={15} />
                                    {s.status === "resigned" ? "Làm việc lại" : "Ngừng làm việc"}
                                  </button>
                                  <div className="st-foot-right">
                                    <button className="kv-btn kv-btn-primary" onClick={() => openModal("edit", s)}>
                                      <Pencil size={15} /> Cập nhật
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {detailTab !== "info" && (
                              <div className="st-tab-empty">Chưa có dữ liệu</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  ];
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={colSpan} className="kv-empty">Không tìm thấy nhân viên nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {modal && (
        <StaffModal
          mode={modal.mode}
          staff={modal.staff}
          branches={branches}
          onClose={() => setModal(null)}
          onSave={handleSave}
          notify={notify}
        />
      )}
    </div>
  );
}
