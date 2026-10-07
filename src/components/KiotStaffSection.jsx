import { useState, useCallback, useMemo } from "react";
import { Info } from "lucide-react";
import StaffPage from "./StaffPage.jsx";

/**
 * Adapter: dữ liệu nhân viên của app cũ -> trang Danh sách nhân viên kiểu KiotViet.
 * - staff (cũ): { id, name, role, branch, ... } (STAFF là const tĩnh, không có setter)
 *   nên adapter giữ state riêng, seed từ dữ liệu cũ.
 */
function toStaffRow(s) {
  return {
    ...s,
    code: s.code || `NV${String(s.id).padStart(6, "0")}`,
    timekeepingCode: s.timekeepingCode || "",
    phone: s.phone || "",
    idCard: s.idCard || "",
    debt: s.debt || 0,
    note: s.note || "",
    status: s.status || "working",
    department: s.department || "",
    title: s.title || s.role || "",
    warning: s.warning ?? !s.phone,
    payBranch: s.payBranch || s.branch,
    kvAccount: s.kvAccount || "",
    birthday: s.birthday || "",
    gender: s.gender || "",
    address: s.address || "",
    email: s.email || "",
    facebook: s.facebook || "",
    startDate: s.startDate || "",
    mobileDevice: s.mobileDevice || "",
    bankAccount: s.bankAccount || "",
    bankName: s.bankName || "",
    accountHolder: s.accountHolder || "",
    province: s.province || "",
    ward: s.ward || "",
    loginAccount: s.loginAccount || "",
  };
}

let toastId = 0;

export default function KiotStaffSection({ staff = [], branches = [], notify: notifyProp }) {
  const [rows, setRows] = useState(() => (staff || []).map(toStaffRow));
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type) => {
    if (notifyProp) {
      notifyProp(message, type);
      return;
    }
    const id = ++toastId;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, [notifyProp]);

  const list = useMemo(() => rows, [rows]);

  const handleSave = useCallback((id, data, mode) => {
    if (mode === "add") {
      const newId = Math.max(0, ...rows.map((r) => r.id)) + 1;
      const row = toStaffRow({
        id: newId,
        ...data,
        code: data.code || `NV${String(newId).padStart(6, "0")}`,
      });
      setRows((prev) => [...prev, row]);
      notify(`Đã thêm nhân viên ${data.name}`);
    } else {
      setRows((prev) => prev.map((r) => (r.id === id ? toStaffRow({ ...r, ...data }) : r)));
      notify(`Đã cập nhật nhân viên ${data.name || ""}`);
    }
  }, [rows, notify]);

  const handleToggleStatus = useCallback((s) => {
    const toResigned = s.status !== "resigned";
    if (!window.confirm(
      toResigned
        ? `Ngừng làm việc với nhân viên ${s.name}?`
        : `Cho nhân viên ${s.name} làm việc lại?`
    )) return;
    setRows((prev) => prev.map((r) =>
      r.id === s.id ? { ...r, status: toResigned ? "resigned" : "working" } : r
    ));
    notify(toResigned ? `Đã ngừng làm việc với ${s.name}` : `${s.name} đã làm việc lại`);
  }, [notify]);

  return (
    <>
      <StaffPage
        staff={list}
        branches={branches}
        onSave={handleSave}
        onToggleStatus={handleToggleStatus}
        notify={notify}
      />
      {!notifyProp && (
        <div className="kv-toast-wrap">
          {toasts.map((t) => (
            <div key={t.id} className="kv-toast info">
              <Info size={17} />
              {t.message}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
