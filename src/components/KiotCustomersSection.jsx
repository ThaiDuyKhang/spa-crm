import { useState, useCallback, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import CustomersPage from "./CustomersPage.jsx";
import CustomerModal from "./CustomerModal.jsx";
import { buildInvoices } from "../data/invoices.js";

/**
 * Adapter: dữ liệu khách hàng của app cũ -> trang Khách hàng kiểu KiotViet.
 * - customers (cũ): { id:number, name, phone, branch, tier, spend, lastVisit, tags, ... }
 * - onSaveCustomer(id, fields, serviceRows): hàm lưu của app cũ
 * - go(page): điều hướng của app cũ (dùng cho dropdown tab)
 */
function toKiotRow(c) {
  return {
    ...c,
    oid: c.id, // giữ id số gốc để khớp hóa đơn/gói dịch vụ
    kid: `KH${String(c.id).padStart(6, "0")}`,
    id: `KH${String(c.id).padStart(6, "0")}`,
    fullName: c.name,
    address: c.address || "",
    city: c.city || "",
    ward: c.ward || "",
    oldAddress: "",
    oldArea: "",
    oldWard: "",
  };
}

let toastId = 0;

const toOldFields = (form, isNew) => ({
  name: form.name,
  phone: form.phone,
  // giữ lại các trường mở rộng từ modal KiotViet
  email: form.email,
  birthday: form.birthday,
  gender: form.gender,
  facebook: form.facebook,
  address: form.address,
  city: form.city,
  ward: form.ward,
  group: form.group,
  source: form.source,
  note: form.note,
  ...(isNew ? { branch: "q1", tier: "Bạc", spend: 0, lastVisit: "Chưa ghé thăm", tags: [] } : {}),
});

export default function KiotCustomersSection({
  customers, onSaveCustomer, onDeleteCustomer,
  services = [], products = [], orders = [], locations = [],
  customerServices = [],
  onOpenInvoice, onOpenVoucher, go,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const rows = useMemo(() => (customers || []).map(toKiotRow), [customers]);

  const invoices = useMemo(
    () => buildInvoices({ customers, services, products, orders, locations, count: 60 }),
    [customers, services, products, orders, locations]
  );

  // Gói dịch vụ/liệu trình của từng khách (từ customerServices của app cũ)
  const packagesByCust = useMemo(() => {
    const map = {};
    (customerServices || []).forEach((cs) => {
      const sv = (services || []).find((s) => s.id === cs.serviceId);
      if (!sv) return;
      const price = cs.price || sv.price || 0;
      const row = {
        name: sv.name,
        code: `GOI${String(sv.id).padStart(4, "0")}`,
        total: price,
        remaining: price,
        remainingValue: price,
        expiry: "",
      };
      map[cs.customerId] = [...(map[cs.customerId] || []), row];
    });
    return map;
  }, [customerServices, services]);

  const handleSaveNew = (form) => {
    onSaveCustomer(null, toOldFields(form, true), []);
    setModalOpen(false);
    notify(`Đã thêm khách hàng ${form.name}`);
  };

  const handleSaveEdit = (form) => {
    if (!editing) return;
    // giữ nguyên gói dịch vụ hiện có của khách (saveCustomer thay thế toàn bộ serviceRows)
    const keepRows = (customerServices || [])
      .filter((cs) => cs.customerId === editing.oid)
      .map((cs) => ({ serviceId: cs.serviceId, price: cs.price, discountId: cs.discountId }));
    onSaveCustomer(editing.oid, toOldFields(form, false), keepRows);
    setEditing(null);
    notify(`Đã lưu thông tin khách hàng ${form.name}`);
  };

  const handleDelete = (row) => {
    if (!window.confirm(`Xóa khách hàng ${row.fullName || row.name}?`)) return;
    onDeleteCustomer && onDeleteCustomer(row.oid);
    notify(`Đã xóa khách hàng ${row.fullName || row.name}`);
  };

  const handleToggleActive = (row) => {
    const stopped = row.status === "Ngừng hoạt động";
    const keepRows = (customerServices || [])
      .filter((cs) => cs.customerId === row.oid)
      .map((cs) => ({ serviceId: cs.serviceId, price: cs.price, discountId: cs.discountId }));
    onSaveCustomer(row.oid, { status: stopped ? "Đang hoạt động" : "Ngừng hoạt động" }, keepRows);
    notify(stopped ? "Đã kích hoạt lại khách hàng" : "Đã ngừng hoạt động khách hàng");
  };

  const handleTabChange = (key) => {
    if (key === "list") return; // đang ở trang này
    if (key === "packages") go("sold-packages");
    else if (key === "voucher") go("discounts");
    else if (key === "promo") go("promotions");
    else if (key === "message") go("messaging");
  };

  return (
    <>
      <CustomersPage
        customers={rows}
        tab="list"
        onTabChange={handleTabChange}
        onAdd={() => setModalOpen(true)}
        notify={notify}
        invoices={invoices}
        packagesByCust={packagesByCust}
        onOpenInvoice={onOpenInvoice}
        onOpenVoucher={onOpenVoucher}
        onEditCustomer={setEditing}
        onDeleteCustomer={handleDelete}
        onToggleCustomerActive={handleToggleActive}
      />
      {modalOpen && (
        <CustomerModal onClose={() => setModalOpen(false)} onSave={handleSaveNew} />
      )}
      {editing && (
        <CustomerModal
          initial={editing}
          title={`Khách hàng ${editing.id}`}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
        />
      )}
      <div className="kv-toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className="kv-toast success">
            <CheckCircle2 size={17} />
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
