import { useState, useCallback, useMemo } from "react";
import { CheckCircle2, Info } from "lucide-react";
import * as XLSX from "xlsx";
import InvoicesPage from "./InvoicesPage.jsx";
import { buildInvoices, formatMoney } from "../data/invoices.js";

let toastId = 0;

/**
 * Adapter: trang Hóa đơn kiểu KiotViet, dùng chung dataset hóa đơn
 * với tab "Lịch sử giao dịch" của trang Vị trí/phòng.
 */
export default function KiotInvoicesSection({
  orders, customers, services, products, discounts, locations,
  focusCode, onClearFocus, go,
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

  const handleExport = useCallback(() => {
    if (!invoices.length) {
      notify("Không có dữ liệu để xuất", "info");
      return;
    }
    const rows = invoices.map((inv) => ({
      "Mã hóa đơn": inv.code,
      "Thời gian": inv.time,
      "Khách hàng": inv.customerName,
      "Điện thoại": inv.customerPhone,
      "Tổng tiền hàng": inv.totalAmount,
      "Giảm giá": inv.totalDiscount,
      "Tổng sau giảm giá": inv.amountDue,
      "Khách đã trả": inv.paid,
      "Trạng thái": inv.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 12 }, { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 15 }, { wch: 12 }, { wch: 17 }, { wch: 14 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoa don");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Danh_sach_hoa_don.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    notify(`Đã xuất ${invoices.length} hóa đơn ra file Excel`);
  }, [invoices, notify]);

  return (
    <>
      <InvoicesPage
        invoices={invoices}
        focusCode={focusCode}
        onClearFocus={onClearFocus}
        onNewInvoice={() => go("pos")}
        onExport={handleExport}
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
