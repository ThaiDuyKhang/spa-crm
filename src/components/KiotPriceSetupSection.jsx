import { useState, useCallback, useMemo } from "react";
import { CheckCircle2, Info } from "lucide-react";
import * as XLSX from "xlsx";
import PriceSetupPage from "./PriceSetupPage.jsx";
import { buildProductItems, itemKey, KIND_LABEL } from "../data/products.js";
import { CUSTOMER_GROUPS } from "../data/customers.js";
import { applyFormula } from "./FormulaEditor.jsx";

let toastId = 0;

function dateStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

const BRANCHES = [
  { id: "q1", name: "Quận 1" },
  { id: "q7", name: "Quận 7" },
  { id: "dn", name: "Đà Nẵng" },
];

const DEFAULT_LIST = { id: "default", name: "Bảng giá chung", status: "active" };

/**
 * Adapter: trang Thiết lập giá kiểu KiotViet.
 * - Bảng giá chung = giá gốc trên services/products của app cũ (sửa trực tiếp).
 * - Các bảng giá khác lưu giá override theo từng hàng hóa (state cục bộ của adapter).
 * - Công thức giá: tính giá mới từ giá vốn / giá nhập cuối / bảng giá khác.
 */
export default function KiotPriceSetupSection({
  services, products, categories,
  updateService, updateProduct,
}) {
  const [toasts, setToasts] = useState([]);
  const [priceLists, setPriceLists] = useState([DEFAULT_LIST]);
  const [activeListId, setActiveListId] = useState("default");
  const [overrides, setOverrides] = useState({}); // { [listId]: { [itemKey]: price } }

  const notify = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const items = useMemo(
    () => buildProductItems(services, products),
    [services, products]
  );

  const priceOf = useCallback((listId, item) => {
    const k = itemKey(item);
    const ov = overrides[listId]?.[k];
    return ov ?? item.price;
  }, [overrides]);

  const getPrice = useCallback((item) => priceOf(activeListId, item), [priceOf, activeListId]);

  const handlePriceChange = useCallback((item, price) => {
    if (activeListId === "default") {
      if (item.kind === "service") updateService(item.id, { price });
      else updateProduct(item.id, { price });
    } else {
      const k = itemKey(item);
      setOverrides((prev) => ({
        ...prev,
        [activeListId]: { ...(prev[activeListId] || {}), [k]: price },
      }));
    }
  }, [activeListId, updateService, updateProduct]);

  const resolveBase = useCallback((item, base) => {
    if (base === "cost") return item.cost;
    if (base === "lastImport") return 0;
    if (base) return priceOf(base, item);
    return null;
  }, [priceOf]);

  const applyFormulaToItem = useCallback((item, formula) => {
    if (!formula || !formula.base) return null;
    return applyFormula(resolveBase(item, formula.base), formula);
  }, [resolveBase]);

  const handleSavePriceList = useCallback((data) => {
    const id = data.id || `pl-${Date.now()}`;
    const list = { ...data, id };
    setPriceLists((prev) => {
      const exists = prev.some((pl) => pl.id === id);
      return exists ? prev.map((pl) => (pl.id === id ? { ...pl, ...data } : pl)) : [...prev, list];
    });
    // áp dụng công thức cho toàn bộ hàng hóa nếu có
    if (data.formula && data.formula.base) {
      const ov = {};
      items.forEach((it) => {
        const v = applyFormula(resolveBase(it, data.formula.base), data.formula);
        if (v != null) ov[itemKey(it)] = v;
      });
      setOverrides((prev) => ({ ...prev, [id]: ov }));
    }
    setActiveListId(id);
    notify(`Đã ${data.id ? "cập nhật" : "tạo"} bảng giá "${data.name}"`);
  }, [items, resolveBase, notify]);

  const handleExport = useCallback(() => {
    const active = priceLists.find((pl) => pl.id === activeListId) || DEFAULT_LIST;
    const catName = (id) => (categories || []).find((c) => String(c.id) === String(id))?.name || "";
    const rows = items.map((it) => ({
      "Mã hàng hóa": it.code,
      "Tên hàng": it.name,
      "Loại hàng": KIND_LABEL[it.kind],
      "Nhóm hàng": catName(it.categoryId),
      "Giá vốn": it.cost,
      [active.name]: priceOf(activeListId, it),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 14 }, { wch: 32 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thiet lap gia");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Thiet_lap_gia_${dateStamp()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    notify(`Đã xuất bảng giá "${active.name}" ra file Excel`);
  }, [items, categories, priceLists, activeListId, priceOf, notify]);

  return (
    <>
      <PriceSetupPage
        items={items}
        categories={categories}
        priceLists={priceLists}
        activeListId={activeListId}
        onSelectList={setActiveListId}
        getPrice={getPrice}
        onPriceChange={handlePriceChange}
        onSavePriceList={handleSavePriceList}
        onExport={handleExport}
        applyFormulaToItem={applyFormulaToItem}
        branches={BRANCHES}
        customerGroups={CUSTOMER_GROUPS}
        notify={notify}
      />
      <div className="kv-toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`kv-toast ${t.type}`}>
            {t.type === "success" ? <CheckCircle2 size={17} /> : <Info size={17} />}
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
