import { useState, useMemo, useRef } from "react";
import {
  Search, Plus, Upload, Download, ChevronDown, ArrowUpDown,
  LayoutGrid, SquarePen, Trash2, Pencil, Lock, LockOpen,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, X,
} from "lucide-react";
import LocationModal from "./LocationModal.jsx";
import { invoicesByLocation, formatMoney } from "../data/invoices.js";
import "./LocationsPage.css";

const LOC_STATUS = { active: "Đang hoạt động", inactive: "Ngừng hoạt động" };

function StatusPill({ status }) {
  return (
    <span className={`stt-pill ${status === "active" ? "stt-active" : "stt-inactive"}`}>
      {LOC_STATUS[status] || status}
    </span>
  );
}

/** Tab "Lịch sử giao dịch": các hóa đơn dịch vụ đã sử dụng vị trí này. */
function LocationHistoryTab({ invoices, onOpenInvoice }) {
  const [hPage, setHPage] = useState(1);
  const perH = 5;
  const totalH = invoices.length;
  const totalHPages = Math.max(1, Math.ceil(totalH / perH));
  const safeH = Math.min(hPage, totalHPages);
  const hStart = (safeH - 1) * perH;
  const hRows = invoices.slice(hStart, hStart + perH);

  return (
    <div className="loc-history">
      <table className="inv-items loc-history-table">
        <thead>
          <tr>
            <th>Mã hóa đơn</th>
            <th>Thời gian</th>
            <th>Tài khoản tạo</th>
            <th style={{ textAlign: "right" }}>Tổng cộng</th>
          </tr>
        </thead>
        <tbody>
          {hRows.map((inv) => (
            <tr key={inv.code}>
              <td>
                <button
                  className="inv-code-link"
                  onClick={(e) => { e.stopPropagation(); onOpenInvoice(inv.code); }}
                >
                  {inv.code}
                </button>
              </td>
              <td>{inv.time.split(" ")[0]}</td>
              <td>{inv.creator}</td>
              <td style={{ textAlign: "right" }}>{formatMoney(inv.amountDue)}</td>
            </tr>
          ))}
          {hRows.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>
                Chưa có giao dịch nào tại vị trí này.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="loc-history-pg">
        <button className="kv-pg-btn" disabled={safeH <= 1} onClick={() => setHPage(1)} title="Trang đầu">
          <ChevronsLeft size={14} />
        </button>
        <button className="kv-pg-btn" disabled={safeH <= 1} onClick={() => setHPage(safeH - 1)} title="Trang trước">
          <ChevronLeft size={14} />
        </button>
        <input
          className="kv-pg-input"
          value={safeH}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!Number.isNaN(v)) setHPage(Math.max(1, Math.min(totalHPages, v)));
          }}
        />
        <button className="kv-pg-btn" disabled={safeH >= totalHPages} onClick={() => setHPage(safeH + 1)} title="Trang sau">
          <ChevronRight size={14} />
        </button>
        <button className="kv-pg-btn" disabled={safeH >= totalHPages} onClick={() => setHPage(totalHPages)} title="Trang cuối">
          <ChevronsRight size={14} />
        </button>
        <span className="kv-pg-total">
          {totalH === 0 ? "0" : `${hStart + 1} - ${Math.min(hStart + perH, totalH)}`} trên tổng số {totalH} giao dịch
        </span>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onCancel, onConfirm }) {  return (
    <div className="kv-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="kv-modal" style={{ maxWidth: 400 }}>
        <div className="kv-modal-head">
          <h2 className="kv-modal-title" style={{ fontSize: 15 }}>{title}</h2>
          <button className="kv-modal-close" onClick={onCancel}><X size={18} /></button>
        </div>
        <div className="kv-modal-body" style={{ color: "var(--text-2)", fontSize: 13.5 }}>{message}</div>
        <div className="kv-modal-foot">
          <button className="kv-btn kv-btn-ghost" onClick={onCancel}>Hủy</button>
          <button className="kv-btn kv-btn-primary" style={{ background: "var(--danger)", borderColor: "var(--danger)" }} onClick={onConfirm}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LocationsPage({
  locations, groups, branch, invoices,
  onSave, onDelete, onToggleStatus, onCreateGroup,
  onExport, onImportFile, onDownloadTemplate, onOpenInvoice, notify,
}) {
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [sortKey, setSortKey] = useState("order");
  const [sortDir, setSortDir] = useState(-1);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [expandedId, setExpandedId] = useState(null);
  const [detailTab, setDetailTab] = useState("info");
  const [modal, setModal] = useState(null); // null | "new" | location
  const [groupModal, setGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importBusy, setImportBusy] = useState(false);
  const fileRef = useRef(null);

  const groupNameOf = (id) => (groups.find((g) => String(g.id) === String(id)) || {}).name || "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (locations || [])
      .filter((l) => branch === "all" || l.branch === branch)
      .filter((l) => !q || (l.name || "").toLowerCase().includes(q))
      .filter((l) => groupFilter === "all" || String(l.groupId) === groupFilter)
      .filter((l) => statusFilter === "all" || l.status === statusFilter);
    const val = (l) => {
      switch (sortKey) {
        case "name": return (l.name || "").toLowerCase();
        case "note": return (l.note || "").toLowerCase();
        case "group": return groupNameOf(l.groupId).toLowerCase();
        case "status": return l.status;
        default: return Number(l.order) || 0;
      }
    };
    return [...list].sort((a, b) => {
      const va = val(a), vb = val(b);
      let c = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb), "vi");
      if (c === 0) c = String(a.name).localeCompare(String(b.name), "vi");
      return sortDir === 1 ? c : -c;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, groups, branch, query, groupFilter, statusFilter, sortKey, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  const rows = filtered.slice(start, start + perPage);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => -d);
    else { setSortKey(key); setSortDir(1); }
  };
  const th = (label, key, align) => (
    <th key={key} style={align === "right" ? { textAlign: "right" } : undefined}>
      <span className="th-sort" onClick={() => toggleSort(key)} style={align === "right" ? { justifyContent: "flex-end", width: "100%" } : undefined}>
        {label} <ArrowUpDown size={13} />
      </span>
    </th>
  );

  const toggleExpand = (id) => {
    setExpandedId((cur) => (cur === id ? null : id));
    setDetailTab("info");
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImportBusy(true);
    try {
      const res = await onImportFile(importFile);
      setImportOpen(false);
      setImportFile(null);
      notify(`Đã nhập ${res.added} vị trí/phòng từ file`);
    } catch (e) {
      notify("Không đọc được file. Vui lòng kiểm tra lại.", "info");
    } finally {
      setImportBusy(false);
    }
  };

  return (
    <div className="kv-page">
      <div className="kv-page-head">
        <h1 className="kv-page-title">Vị trí/phòng</h1>
        <div className="kv-search">
          <Search size={16} />
          <input
            className="kv-input"
            placeholder="Tìm tên vị trí/phòng"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        <div className="kv-head-actions">
          <button className="kv-btn kv-btn-primary" onClick={() => setModal("new")}>
            <Plus size={16} /> Vị trí/phòng
          </button>
          <button className="kv-btn kv-btn-white" onClick={() => setImportOpen(true)}>
            <Upload size={15} /> Nhập file
          </button>
          <button className="kv-btn kv-btn-white" onClick={() => { onExport(); }}>
            <Download size={15} /> Xuất file
          </button>
        </div>
      </div>

      <div className="kv-body">
        <aside className="kv-filter-panel">
          <div className="f-block">
            <div className="f-title">
              Nhóm
              <button className="f-link" onClick={() => { setGroupModal(true); setGroupName(""); }}>Tạo mới</button>
            </div>
            <select className="kv-select" value={groupFilter} onChange={(e) => { setGroupFilter(e.target.value); setPage(1); }}>
              <option value="all">Tất cả</option>
              {groups.map((g) => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
            </select>
          </div>
          <div className="f-block">
            <div className="f-title">Trạng thái</div>
            <select className="kv-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </aside>

        <section className="kv-content">
          <div className="kv-table-wrap">
            <table className="kv-table loc-table">
              <thead>
                <tr>
                  {th("Tên vị trí/phòng", "name")}
                  {th("Ghi chú", "note")}
                  {th("Nhóm", "group")}
                  {th("Trạng thái", "status")}
                  {th("Số thứ tự", "order", "right")}
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => {
                  const expanded = expandedId === l.id;
                  return [
                    <tr
                      key={l.id}
                      className={`loc-row${expanded ? " expanded" : ""}`}
                      onClick={() => toggleExpand(l.id)}
                    >
                      <td className="cell-name">{l.name}</td>
                      <td className="cell-dim">{l.note}</td>
                      <td className="cell-dim">{groupNameOf(l.groupId) || "---"}</td>
                      <td>{LOC_STATUS[l.status]}</td>
                      <td style={{ textAlign: "right" }}>{l.order}</td>
                    </tr>,
                    expanded && (
                      <tr key={`${l.id}-detail`} className="loc-detail-row">
                        <td colSpan={5}>
                          <div className="loc-detail">
                            <div className="loc-detail-tabs">
                              <button
                                className={detailTab === "info" ? "active" : ""}
                                onClick={(e) => { e.stopPropagation(); setDetailTab("info"); }}
                              >
                                Thông tin
                              </button>
                              <button
                                className={detailTab === "history" ? "active" : ""}
                                onClick={(e) => { e.stopPropagation(); setDetailTab("history"); }}
                              >
                                Lịch sử giao dịch
                              </button>
                            </div>
                            {detailTab === "info" ? (
                              <div className="loc-detail-body">
                                <div className="loc-detail-main">
                                  <div className="loc-detail-title">
                                    {l.name} <StatusPill status={l.status} />
                                  </div>
                                  <div className="loc-detail-line">
                                    <LayoutGrid size={15} />
                                    <span className="dim">{groupNameOf(l.groupId) || "Chưa có"}</span>
                                  </div>
                                  <div className="loc-detail-line">
                                    <SquarePen size={15} />
                                    <span><b>Ghi chú:</b> <span className="dim">{l.note || "Chưa có"}</span></span>
                                  </div>
                                  <button
                                    className="loc-delete"
                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(l); }}
                                  >
                                    <Trash2 size={15} /> Xóa
                                  </button>
                                </div>
                                <div className="loc-detail-actions">
                                  <button
                                    className="kv-btn kv-btn-primary"
                                    onClick={(e) => { e.stopPropagation(); setModal(l); }}
                                  >
                                    <Pencil size={15} /> Chỉnh sửa
                                  </button>
                                  <button
                                    className="kv-btn kv-btn-white"
                                    onClick={(e) => { e.stopPropagation(); onToggleStatus(l.id); }}
                                  >
                                    {l.status === "active" ? <Lock size={15} /> : <LockOpen size={15} />}
                                    {l.status === "active" ? "Ngừng hoạt động" : "Mở hoạt động"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <LocationHistoryTab
                                key={l.id}
                                invoices={invoicesByLocation(invoices || [], l.id)}
                                onOpenInvoice={onOpenInvoice}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  ];
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                      Không tìm thấy vị trí/phòng nào.
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
              {total === 0 ? "0" : `${start + 1} - ${Math.min(start + perPage, total)}`} trên tổng số {total} vị trí/phòng
            </span>
          </div>
        </section>
      </div>

      {modal && (
        <LocationModal
          location={modal === "new" ? null : modal}
          groups={groups}
          onClose={() => setModal(null)}
          onSave={(data) => { onSave(modal === "new" ? null : modal.id, data); setModal(null); }}
        />
      )}

      {groupModal && (
        <div className="kv-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setGroupModal(false); }}>
          <div className="kv-modal" style={{ maxWidth: 420 }}>
            <div className="kv-modal-head">
              <h2 className="kv-modal-title" style={{ fontSize: 16 }}>Thêm nhóm vị trí/phòng</h2>
              <button className="kv-modal-close" onClick={() => setGroupModal(false)}><X size={18} /></button>
            </div>
            <div className="kv-modal-body">
              <label className="kv-label">Tên nhóm</label>
              <input
                className="kv-input"
                placeholder="Nhập tên nhóm"
                value={groupName}
                autoFocus
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && groupName.trim()) { onCreateGroup(groupName.trim()); setGroupModal(false); } }}
              />
            </div>
            <div className="kv-modal-foot">
              <button className="kv-btn kv-btn-ghost" onClick={() => setGroupModal(false)}>Bỏ qua</button>
              <button
                className="kv-btn kv-btn-primary"
                disabled={!groupName.trim()}
                onClick={() => { onCreateGroup(groupName.trim()); setGroupModal(false); }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Xóa vị trí/phòng"
          message={`Bạn có chắc muốn xóa "${confirmDelete.name}"? Thao tác này không thể hoàn tác.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => { onDelete(confirmDelete.id); setConfirmDelete(null); setExpandedId(null); }}
        />
      )}

      {importOpen && (
        <div className="kv-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setImportOpen(false); }}>
          <div className="kv-modal" style={{ maxWidth: 440 }}>
            <div className="kv-modal-head">
              <h2 className="kv-modal-title" style={{ fontSize: 16 }}>Nhập vị trí/phòng từ file</h2>
              <button className="kv-modal-close" onClick={() => setImportOpen(false)}><X size={18} /></button>
            </div>
            <div className="kv-modal-body">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={(e) => setImportFile(e.target.files[0] || null)}
              />
              <button className="kv-btn kv-btn-white" style={{ width: "100%", justifyContent: "center" }} onClick={() => fileRef.current?.click()}>
                <Upload size={15} /> {importFile ? importFile.name : "Chọn file Excel (.xlsx)"}
              </button>
              <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--muted)" }}>
                Chưa có file mẫu?{" "}
                <button
                  style={{ background: "none", border: "none", padding: 0, color: "var(--kv-blue)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}
                  onClick={onDownloadTemplate}
                >
                  Tải file mẫu
                </button>
              </div>
            </div>
            <div className="kv-modal-foot">
              <button className="kv-btn kv-btn-ghost" onClick={() => setImportOpen(false)}>Bỏ qua</button>
              <button className="kv-btn kv-btn-primary" disabled={!importFile || importBusy} onClick={handleImport}>
                {importBusy ? "Đang nhập..." : "Nhập file"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
