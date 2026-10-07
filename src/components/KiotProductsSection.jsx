import { useState, useCallback, useMemo } from "react";
import { CheckCircle2, Info } from "lucide-react";
import * as XLSX from "xlsx";
import ProductsPage from "./ProductsPage.jsx";
import { initialsCode } from "./ProductModal.jsx";
import { buildProductItems } from "../data/products.js";
import { buildInvoices, formatMoney } from "../data/invoices.js";

let toastId = 0;

function dateStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

function downloadWb(wb, filename) {
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const KIND_LABEL = { service: "Dịch vụ", product: "Hàng hóa" };
const STATUS_LABEL = { active: "Đang kinh doanh", inactive: "Ngừng kinh doanh" };

/**
 * Adapter: trang Hàng hóa kiểu KiotViet, dùng state services/products/categories của app cũ.
 * - services -> Loại hàng "Dịch vụ"; products -> Loại hàng "Hàng hóa"
 * - tab "Thẻ kho" dùng chung dataset hóa đơn với trang Hóa đơn (có refId để link ngược)
 */
export default function KiotProductsSection({
  services, products, categories, setCategories,
  addService, updateService, deleteService,
  addProduct, updateProduct, deleteProduct,
  orders, customers, discounts, locations,
  onOpenInvoice,
}) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const invoices = useMemo(
    () => buildInvoices({ customers, services, products, orders, discounts, locations, count: 60 }),
    [customers, services, products, orders, discounts, locations]
  );

  // gộp services + products thành danh sách hàng hóa thống nhất
  const items = useMemo(
    () => buildProductItems(services, products),
    [services, products]
  );

  const handleSave = useCallback((data) => {
    const { kind, id, ...rest } = data;
    if (kind === "service") {
      const payload = {
        code: rest.code, name: rest.name, categoryId: rest.categoryId,
        brand: rest.brand, price: rest.price, duration: rest.duration,
        allowSale: rest.allowSale, description: rest.description,
        note: rest.note, status: rest.status,
      };
      if (id) { updateService(id, payload); notify("Đã cập nhật dịch vụ"); }
      else { addService(payload); notify("Đã thêm dịch vụ"); }
    } else {
      const payload = {
        code: rest.code, name: rest.name, categoryId: rest.categoryId,
        brand: rest.brand, price: rest.price, cost: rest.cost,
        unit: rest.unit, allowSale: rest.allowSale,
        description: rest.description, note: rest.note, status: rest.status,
      };
      if (id) { updateProduct(id, payload); notify("Đã cập nhật hàng hóa"); }
      else { addProduct({ stock: 0, ...payload }); notify("Đã thêm hàng hóa"); }
    }
  }, [addService, updateService, addProduct, updateProduct, notify]);

  const handleDelete = useCallback((item) => {
    if (item.kind === "service") deleteService(item.id);
    else deleteProduct(item.id);
    notify("Đã xóa hàng hóa");
  }, [deleteService, deleteProduct, notify]);

  const handleCopy = useCallback((item) => {
    const raw = item._raw || {};
    const copy = {
      ...raw,
      id: Date.now(),
      name: `${raw.name} (sao chép)`,
      code: `${item.code}-copy`,
    };
    delete copy.status;
    if (item.kind === "service") { addService(copy); notify("Đã sao chép dịch vụ"); }
    else { addProduct(copy); notify("Đã sao chép hàng hóa"); }
  }, [addService, addProduct, notify]);

  const handleToggleStatus = useCallback((item) => {
    const next = item.status === "active" ? "inactive" : "active";
    if (item.kind === "service") updateService(item.id, { status: next });
    else updateProduct(item.id, { status: next });
    notify(next === "active" ? "Đã mở kinh doanh trở lại" : "Đã ngừng kinh doanh");
  }, [updateService, updateProduct, notify]);

  const handleCreateCategory = useCallback((name) => {
    const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const g = { id, name };
    setCategories((prev) => [...prev, g]);
    notify("Đã tạo nhóm hàng");
    return g;
  }, [setCategories, notify]);

  const handleExport = useCallback(() => {
    if (!items.length) { notify("Không có dữ liệu để xuất", "info"); return; }
    const catName = (id) => (categories || []).find((c) => String(c.id) === String(id))?.name || "";
    const rows = items.map((it) => ({
      "Mã hàng hóa": it.code,
      "Tên hàng": it.name,
      "Loại hàng": KIND_LABEL[it.kind],
      "Nhóm hàng": catName(it.categoryId),
      "Giá bán": it.price,
      "Giá vốn": it.cost,
      "Tồn kho": it.kind === "product" ? it.stock : "",
      "Trạng thái": STATUS_LABEL[it.status] || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 14 }, { wch: 32 }, { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hang hoa");
    downloadWb(wb, `Danh_sach_hang_hoa_${dateStamp()}.xlsx`);
    notify(`Đã xuất ${items.length} hàng hóa ra file Excel`);
  }, [items, categories, notify]);

  const handleImportFile = useCallback(async (file) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
    if (!rows.length) throw new Error("empty");
    const pick = (row, keys) => {
      for (const k of Object.keys(row)) {
        const nk = String(k).toLowerCase();
        if (keys.some((key) => nk.includes(key))) return row[k];
      }
      return "";
    };
    const num = (v) => Number(String(v).replace(/[^0-9]/g, "")) || 0;
    let added = 0;
    rows.forEach((row) => {
      const name = String(pick(row, ["tên", "ten", "name"])).trim();
      if (!name) return;
      const typeText = String(pick(row, ["loại", "loai", "type"])).toLowerCase();
      const isService = typeText.includes("dịch vụ") || typeText.includes("dich vu") || typeText.includes("service");
      const data = {
        code: String(pick(row, ["mã", "ma", "code"])).trim() || initialsCode(name),
        name,
        price: num(pick(row, ["giá bán", "gia ban", "price"])),
        cost: num(pick(row, ["giá vốn", "gia von", "cost"])),
        status: "active",
      };
      if (isService) {
        data.duration = num(pick(row, ["thời lượng", "thoi luong", "duration"]));
        addService(data);
      } else {
        data.stock = num(pick(row, ["tồn", "ton", "stock"]));
        addProduct(data);
      }
      added += 1;
    });
    return { added };
  }, [addService, addProduct]);

  return (
    <>
      <ProductsPage
        items={items}
        categories={categories}
        invoices={invoices}
        onSave={handleSave}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onToggleStatus={handleToggleStatus}
        onCreateCategory={handleCreateCategory}
        onExport={handleExport}
        onImportFile={handleImportFile}
        onOpenInvoice={onOpenInvoice}
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

export { formatMoney };
