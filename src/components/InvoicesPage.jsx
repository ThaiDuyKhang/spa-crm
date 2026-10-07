import { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, Download, Menu, ChevronDown, X, SlidersHorizontal,
  ArrowUpDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  ExternalLink, Receipt, Tag, Pencil,
} from "lucide-react";
import { formatMoney } from "../data/invoices.js";
import TimeFilter from "./TimeFilter.jsx";
import "./InvoicesPage.css";

function OverviewTab({ inv }) {
  return (
    <div className="inv-ov">
      <div className="inv-ov-head">
        <div className="inv-ov-cust">
          <span className="inv-ov-custname">{inv.customerName} - {inv.customerPhone}</span>
          <ExternalLink size={15} className="inv-ov-ext" />
          <span className="stt-pill stt-active">{inv.status}</span>
        </div>
        <div className="inv-ov-branch">
          <div>Chi nhánh {inv.branchName}</div>
          <div>Người tạo: {inv.creator}</div>
        </div>
      </div>

      <div className="inv-ov-meta">
        <span className="inv-ov-meta-item"><Receipt size={15} /> {inv.code}</span>
        <span className="inv-ov-meta-item"><Tag size={15} /> {inv.priceList}</span>
      </div>

      <div className="inv-ov-grid">
        <div className="inv-ov-cell">
          <div className="inv-ov-label">Thu ngân</div>
          <div className="inv-ov-value">{inv.cashier}</div>
        </div>
        <div className="inv-ov-cell">
          <div className="inv-ov-label">Thời gian tạo</div>
          <div className="inv-ov-value">{inv.time}</div>
        </div>
        <div className="inv-ov-cell">
          <div className="inv-ov-label">Kênh bán</div>
          <div className="inv-ov-value">{inv.channel}</div>
        </div>
        <div className="inv-ov-cell">
          <div className="inv-ov-label">Mã tra cứu HĐĐT</div>
          <div className="inv-ov-value dim">Chưa có</div>
        </div>
      </div>

      <div className="inv-notebox">
        <div className="inv-notebox-title">Ghi chú</div>
        <div className="inv-notebox-body">{inv.note || "Chưa có ghi chú"}</div>
      </div>

      <table className="inv-items">
        <thead>
          <tr>
            <th>Mã hàng hóa</th>
            <th>Tên hàng</th>
            <th style={{ textAlign: "center" }}>Số lượng</th>
            <th style={{ textAlign: "right" }}>Đơn giá</th>
            <th style={{ textAlign: "right" }}>Giảm giá</th>
            <th style={{ textAlign: "right" }}>Giá bán</th>
            <th style={{ textAlign: "right" }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it, i) => (
            <tr key={i}>
              <td>{it.sku}</td>
              <td>
                <div className="inv-item-name">{it.name}</div>
                {it.type === "service" && (
                  <div className="inv-item-staff">
                    <div>• Tư vấn bán {it.staffConsult && <span>{it.staffConsult}</span>} <Pencil size={12} className="inv-edit" /></div>
                    <div>• Làm dịch vụ: {it.staffService} <Pencil size={12} className="inv-edit" /></div>
                  </div>
                )}
              </td>
              <td style={{ textAlign: "center" }}>{it.qty}</td>
              <td style={{ textAlign: "right" }}>{formatMoney(it.price)}</td>
              <td style={{ textAlign: "right" }}>{it.discount ? formatMoney(it.discount) : ""}</td>
              <td style={{ textAlign: "right" }}>{formatMoney(it.price)}</td>
              <td style={{ textAlign: "right" }}>{formatMoney(it.price * it.qty - (it.discount || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="inv-totals">
        <div className="inv-total-row"><span>Tổng số lượng:</span><span>{inv.totalQty}</span></div>
        <div className="inv-total-row"><span>Tổng tiền hàng:</span><span>{formatMoney(inv.totalAmount)}</span></div>
        <div className="inv-total-row"><span>Giảm giá hóa đơn:</span><span>{formatMoney(inv.totalDiscount)}</span></div>
        <div className="inv-total-row grand"><span>Khách cần trả:</span><span>{formatMoney(inv.amountDue)}</span></div>
      </div>
    </div>
  );
}

function ServicesTab({ inv }) {
  const services = inv.items.filter((it) => it.type === "service");
  return (
    <table className="inv-items">
      <thead>
        <tr>
          <th>Tên dịch vụ</th>
          <th>Nhân viên thực hiện</th>
          <th style={{ textAlign: "center" }}>Số lượng</th>
          <th style={{ textAlign: "right" }}>Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        {services.map((it, i) => (
          <tr key={i}>
            <td>{it.name}</td>
            <td>{it.staffService || "Chưa xác định"}</td>
            <td style={{ textAlign: "center" }}>{it.qty}</td>
            <td style={{ textAlign: "right" }}>{formatMoney(it.price * it.qty - (it.discount || 0))}</td>
          </tr>
        ))}
        {services.length === 0 && (
          <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>Không có dịch vụ nào.</td></tr>
        )}
      </tbody>
    </table>
  );
}

function PaymentsTab({ inv }) {
  return (
    <table className="inv-items">
      <thead>
        <tr>
          <th>Thời gian</th>
          <th>Phương thức</th>
          <th>Người tạo</th>
          <th style={{ textAlign: "right" }}>Số tiền</th>
        </tr>
      </thead>
      <tbody>
        {(inv.payments || []).map((p, i) => (
          <tr key={i}>
            <td>{p.time}</td>
            <td>{p.method}</td>
            <td>{p.creator}</td>
            <td style={{ textAlign: "right" }}>{formatMoney(p.amount)}</td>
          </tr>
        ))}
        {(!inv.payments || inv.payments.length === 0) && (
          <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>Chưa có thanh toán nào.</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default function InvoicesPage({ invoices, focusCode, onClearFocus, onNewInvoice, onExport, notify }) {
  const [query, setQuery] = useState(focusCode ? `Mã hóa đơn: ${focusCode}` : "");
  const [expandedCode, setExpandedCode] = useState(focusCode || null);
  const [detailTab, setDetailTab] = useState("overview");
  const [checked, setChecked] = useState(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortKey, setSortKey] = useState("ts");
  const [sortDir, setSortDir] = useState(-1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all"); // "all" | {start,end}

  useEffect(() => {
    if (focusCode) {
      setQuery(`Mã hóa đơn: ${focusCode}`);
      setExpandedCode(focusCode);
      setDetailTab("overview");
      setPage(1);
    }
  }, [focusCode]);

  const clearFocus = () => {
    setQuery("");
    if (onClearFocus) onClearFocus();
  };

  const filtered = useMemo(() => {
    let q = query.trim();
    const m = q.match(/^mã hóa đơn:\s*(.+)$/i);
    if (m) q = m[1].trim();
    q = q.toLowerCase();
    let list = (invoices || []).filter((inv) => {
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (timeFilter !== "all" && timeFilter.start) {
        const s = new Date(timeFilter.start.getFullYear(), timeFilter.start.getMonth(), timeFilter.start.getDate()).getTime();
        const e0 = timeFilter.end || timeFilter.start;
        const e = new Date(e0.getFullYear(), e0.getMonth(), e0.getDate(), 23, 59, 59, 999).getTime();
        if (inv.ts < s || inv.ts > e) return false;
      }
      if (!q) return true;
      return (
        inv.code.toLowerCase().includes(q) ||
        (inv.customerName || "").toLowerCase().includes(q) ||
        (inv.customerPhone || "").includes(q)
      );
    });
    const val = (inv) => {
      switch (sortKey) {
        case "code": return inv.code;
        case "customer": return (inv.customerName || "").toLowerCase();
        case "discount": return inv.totalDiscount;
        case "paid": return inv.paid;
        default: return inv.ts;
      }
    };
    return [...list].sort((a, b) => {
      const va = val(a), vb = val(b);
      const c = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb), "vi");
      return sortDir === 1 ? c : -c;
    });
  }, [invoices, query, sortKey, sortDir, statusFilter, timeFilter]);

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
    <th key={label} style={align ? { textAlign: align } : undefined}>
      <span className="th-sort" onClick={() => toggleSort(key)}>
        {label} <ArrowUpDown size={13} />
      </span>
    </th>
  );

  const toggleCheck = (code) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  return (
    <div className="kv-page">
      <div className="kv-page-head">
        <h1 className="kv-page-title">Hóa đơn</h1>
        <div className="kv-search inv-search">
          <Search size={16} />
          <input
            className="kv-input"
            placeholder="Tìm theo mã hóa đơn, khách hàng"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
          {query && (
            <button className="inv-search-clear" onClick={clearFocus} title="Xóa tìm kiếm">
              <X size={14} />
            </button>
          )}
          <span className="inv-search-filter"><SlidersHorizontal size={15} /></span>
        </div>
        <div className="kv-head-actions">
          <button className="kv-btn kv-btn-primary" onClick={onNewInvoice}>
            <Plus size={16} /> Hóa đơn
          </button>
          <button className="kv-btn kv-btn-white" onClick={onExport}>
            <Download size={15} /> Xuất file <ChevronDown size={14} />
          </button>
          <button
            className="kv-btn kv-btn-white kv-btn-icon"
            title="Tùy chọn hiển thị"
            onClick={() => notify("Tùy chỉnh cột hiển thị đang phát triển", "info")}
          >
            <Menu size={16} />
          </button>
        </div>
      </div>

      <div className="kv-body">
        <aside className="kv-filter-panel">
          <TimeFilter title="Thời gian" value={timeFilter} onChange={setTimeFilter} />
          <div className="f-block">
            <div className="f-title">Trạng thái</div>
            <select className="kv-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">Tất cả</option>
              <option>Hoàn thành</option>
              <option>Đã hủy</option>
            </select>
          </div>
          <div className="f-block">
            <div className="f-title">Còn nợ</div>
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
            <div className="f-title">Nhân viên thực hiện</div>
            <input className="kv-input" placeholder="Chọn nhân viên thực hiện" />
          </div>
          <div className="f-block">
            <div className="f-title">Nhân viên tư vấn</div>
            <input className="kv-input" placeholder="Chọn nhân viên tư vấn" />
          </div>
          <div className="f-block">
            <div className="f-title">
              Kênh bán
              <button className="f-link" onClick={() => notify("Tạo kênh bán đang phát triển", "info")}>Tạo mới</button>
            </div>
            <input className="kv-input" placeholder="Chọn kênh bán" />
          </div>
          <div className="f-block">
            <div className="f-title">Phương thức</div>
            <input className="kv-input" placeholder="Chọn phương thức" />
          </div>
          <div className="f-block">
            <div className="f-title">Bảng giá</div>
            <input className="kv-input" placeholder="Chọn bảng giá" />
          </div>
          <div className="f-block">
            <div className="f-title">Loại thu khác</div>
            <input className="kv-input" placeholder="Chọn loại thu khác" />
          </div>
        </aside>

        <section className="kv-content">
          <div className="kv-table-wrap">
            <table className="kv-table inv-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <label className="kv-check">
                      <input
                        type="checkbox"
                        checked={rows.length > 0 && rows.every((r) => checked.has(r.code))}
                        onChange={() => {
                          if (rows.every((r) => checked.has(r.code))) {
                            setChecked((prev) => {
                              const next = new Set(prev);
                              rows.forEach((r) => next.delete(r.code));
                              return next;
                            });
                          } else {
                            setChecked((prev) => new Set([...prev, ...rows.map((r) => r.code)]));
                          }
                        }}
                      />
                    </label>
                  </th>
                  {th("Mã hóa đơn", "code")}
                  {th("Thời gian", "ts")}
                  {th("Khách hàng", "customer")}
                  <th style={{ textAlign: "right" }}>Tổng tiền hàng</th>
                  {th("Giảm giá", "discount", "right")}
                  <th style={{ textAlign: "right" }}>Tổng sau giảm giá</th>
                  {th("Khách đã trả", "paid", "right")}
                </tr>
              </thead>
              <tbody>
                {rows.map((inv) => {
                  const expanded = expandedCode === inv.code;
                  return [
                    <tr
                      key={inv.code}
                      className={`inv-row${expanded ? " expanded" : ""}${checked.has(inv.code) ? " selected" : ""}`}
                      onClick={() => { setExpandedCode(expanded ? null : inv.code); setDetailTab("overview"); }}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <label className="kv-check">
                          <input type="checkbox" checked={checked.has(inv.code)} onChange={() => toggleCheck(inv.code)} />
                        </label>
                      </td>
                      <td className="cell-id">{inv.code}</td>
                      <td>{inv.time}</td>
                      <td className="cell-name">{inv.customerName}</td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text)" }}>{formatMoney(inv.totalAmount)}</td>
                      <td style={{ textAlign: "right" }}>{formatMoney(inv.totalDiscount)}</td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text)" }}>{formatMoney(inv.amountDue)}</td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text)" }}>{formatMoney(inv.paid)}</td>
                    </tr>,
                    expanded && (
                      <tr key={`${inv.code}-detail`} className="inv-detail-row">
                        <td colSpan={8}>
                          <div className="inv-detail">
                            <div className="loc-detail-tabs">
                              {[
                                ["overview", "Tổng quan"],
                                ["services", "Dịch vụ sử dụng"],
                                ["payments", "Lịch sử thanh toán"],
                              ].map(([k, label]) => (
                                <button
                                  key={k}
                                  className={detailTab === k ? "active" : ""}
                                  onClick={(e) => { e.stopPropagation(); setDetailTab(k); }}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            {detailTab === "overview" && <OverviewTab inv={inv} />}
                            {detailTab === "services" && <ServicesTab inv={inv} />}
                            {detailTab === "payments" && <PaymentsTab inv={inv} />}
                          </div>
                        </td>
                      </tr>
                    ),
                  ];
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                      Không tìm thấy hóa đơn nào.
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
              {total === 0 ? "0" : `${start + 1} - ${Math.min(start + perPage, total)}`} trên tổng số {formatMoney(total)} hóa đơn
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
