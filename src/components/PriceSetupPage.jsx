import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Plus, Download, Menu,
  ArrowUpDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
} from "lucide-react";
import PriceListModal from "./PriceListModal.jsx";
import FormulaEditor, { emptyFormula, applyFormula } from "./FormulaEditor.jsx";
import { itemKey, formatMoney } from "../data/products.js";
import "./PriceSetupPage.css";

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

const fmtNum = (v) => {
  if (v === "" || v == null) return "";
  const n = Number(String(v).replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") : "";
};

function PriceCell({ item, price, onCommit, onApplyFormula, formulaLists, notify }) {
  const k = itemKey(item);
  const [editing, setEditing] = useState(null); // raw string
  const [tipOpen, setTipOpen] = useState(false);
  const [popOpen, setPopOpen] = useState(false);
  const [formula, setFormula] = useState(emptyFormula());
  const wrapRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setTipOpen(false);
        setPopOpen(false);
        setEditing((ed) => {
          if (ed !== null) onCommit(item, Number(String(ed).replace(/[^0-9]/g, "")) || 0);
          return null;
        });
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [item, onCommit]);

  const commit = () => {
    if (editing !== null) {
      onCommit(item, Number(String(editing).replace(/[^0-9]/g, "")) || 0);
      setEditing(null);
    }
  };

  const apply = () => {
    const v = onApplyFormula(item, formula);
    if (v == null) {
      notify("Vui lòng chọn nguồn giá trong công thức", "info");
      return;
    }
    onCommit(item, v);
    setEditing(null);
    setPopOpen(false);
    setTipOpen(false);
    notify(`Đã áp dụng công thức: ${fmtNum(v)}đ`);
  };

  return (
    <div className="ps-price-wrap" ref={wrapRef}>
      <input
        className="kv-input ps-price-input"
        value={editing !== null ? editing : fmtNum(price)}
        onFocus={() => { setEditing(String(price ?? "")); setTipOpen(true); }}
        onChange={(e) => setEditing(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") { commit(); e.target.blur(); } }}
      />
      {tipOpen && !popOpen && (
        <div className="ps-tip">
          Hoặc sử dụng{" "}
          <button
            type="button" className="kv-link"
            onMouseDown={(e) => { e.preventDefault(); setFormula(emptyFormula()); setPopOpen(true); }}
          >
            Công thức
          </button>
        </div>
      )}
      {popOpen && (
        <div className="ps-formula-pop" onMouseDown={(e) => e.stopPropagation()}>
          <div className="ps-formula-title">Công thức giá</div>
          <FormulaEditor value={formula} onChange={setFormula} priceLists={formulaLists} />
          <div className="ps-formula-foot">
            <button type="button" className="kv-btn kv-btn-ghost" onClick={() => { setPopOpen(false); setTipOpen(false); }}>
              Hủy
            </button>
            <button type="button" className="kv-btn kv-btn-primary" onClick={apply}>
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PriceSetupPage({
  items, categories, priceLists, activeListId, onSelectList,
  getPrice, onPriceChange, onSavePriceList, onExport,
  applyFormulaToItem, branches, customerGroups, notify,
}) {
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [sort, setSort] = useState({ key: "name", dir: 1 });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);

  const activeList = (priceLists || []).find((pl) => pl.id === activeListId) || priceLists[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = (items || []).filter((it) => {
      if (groupFilter !== "all" && String(it.categoryId) !== String(groupFilter)) return false;
      if (q && !`${it.code} ${it.name}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const { key, dir } = sort;
    const val = (it) => (key === "price" ? getPrice(it) : it[key]);
    list = [...list].sort((a, b) => {
      const va = val(a), vb = val(b);
      const c = typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va ?? "").localeCompare(String(vb ?? ""), "vi");
      return dir === 1 ? c : -c;
    });
    return list;
  }, [items, query, groupFilter, sort, getPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const toggleSort = (k) => setSort((s) => (s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: 1 }));

  return (
    <div className="kv-page">
      <div className="kv-page-head">
        <h1 className="kv-page-title">Thiết lập giá</h1>
        <div className="kv-search">
          <Search size={16} />
          <input
            className="kv-input" placeholder="Tìm theo mã, tên hàng"
            value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        <div className="kv-head-actions">
          <button className="kv-btn kv-btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Bảng giá
          </button>
          <button className="kv-btn kv-btn-white" onClick={onExport}>
            <Download size={15} /> Xuất file
          </button>
          <button className="kv-btn kv-btn-white kv-btn-icon" title="Tùy chọn hiển thị">
            <Menu size={16} />
          </button>
        </div>
      </div>

      <div className="kv-body">
        <aside className="kv-filter-panel">
          <div className="f-block">
            <div className="f-title">Bảng giá</div>
            <select
              className="kv-select" value={activeListId}
              onChange={(e) => onSelectList(e.target.value)}
            >
              {(priceLists || []).map((pl) => (
                <option key={pl.id} value={pl.id}>{pl.name}</option>
              ))}
            </select>
          </div>
          <div className="f-block">
            <div className="f-title">Nhóm hàng</div>
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
        </aside>

        <section className="kv-content">
          <div className="kv-table-wrap">
            <table className="kv-table ps-table">
              <thead>
                <tr>
                  <SortTh label="Mã hàng hóa" k="code" sort={sort} onSort={toggleSort} />
                  <SortTh label="Tên hàng" k="name" sort={sort} onSort={toggleSort} />
                  <SortTh label="Giá vốn" k="cost" sort={sort} onSort={toggleSort} style={{ textAlign: "right" }} />
                  <SortTh label="Giá nhập cuối" k="cost" sort={sort} onSort={toggleSort} style={{ textAlign: "right" }} />
                  <SortTh label={activeList ? activeList.name : "Bảng giá"} k="price" sort={sort} onSort={toggleSort} style={{ textAlign: "right" }} />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((it) => (
                  <tr key={itemKey(it)}>
                    <td className="cell-id">{it.code}</td>
                    <td className="cell-name">{it.name}</td>
                    <td style={{ textAlign: "right" }}>{formatMoney(it.cost)}</td>
                    <td style={{ textAlign: "right" }}>{formatMoney(it.cost)}</td>
                    <td style={{ textAlign: "right" }}>
                      <PriceCell
                        item={it}
                        price={getPrice(it)}
                        onCommit={onPriceChange}
                        onApplyFormula={applyFormulaToItem}
                        formulaLists={(priceLists || []).filter((pl) => pl.id !== activeListId)}
                        notify={notify}
                      />
                    </td>
                  </tr>
                ))}
                {pageItems.length === 0 && (
                  <tr><td colSpan={5} className="kv-empty">Không tìm thấy hàng hóa nào</td></tr>
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
              {(safePage - 1) * perPage + 1} - {Math.min(safePage * perPage, filtered.length)} trên tổng số {filtered.length} mã hàng
            </span>
          </div>
        </section>
      </div>

      {modalOpen && (
        <PriceListModal
          priceLists={priceLists}
          branches={branches}
          customerGroups={customerGroups}
          onClose={() => setModalOpen(false)}
          onSave={(data) => { onSavePriceList(data); setModalOpen(false); }}
          notify={notify}
        />
      )}
    </div>
  );
}

export { applyFormula };
