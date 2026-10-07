import { useState, useCallback, useMemo } from "react";
import { CheckCircle2, Info } from "lucide-react";
import * as XLSX from "xlsx";
import LocationsPage from "./LocationsPage.jsx";
import { buildInvoices } from "../data/invoices.js";

const LOC_STATUS = { active: "Đang hoạt động", inactive: "Ngừng hoạt động" };
const HEADERS = ["Tên vị trí/phòng", "Ghi chú", "Nhóm", "Trạng thái", "Số thứ tự"];

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

let toastId = 0;

/**
 * Adapter: state vị trí/phòng của app cũ -> trang Vị trí/phòng kiểu KiotViet.
 */
export default function KiotLocationsSection({
  branch, locations, setLocations, groups, setGroups,
  orders, customers, services, products, discounts, onOpenInvoice,
}) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  // dataset hóa đơn dùng chung với trang Hóa đơn (cache theo key trong data/invoices.js)
  const invoices = useMemo(
    () => buildInvoices({ customers, services, products, orders, discounts, locations, count: 60 }),
    [customers, services, products, orders, discounts, locations]
  );

  const groupNameOf = (id) => (groups.find((g) => String(g.id) === String(id)) || {}).name || "";

  const handleSave = (id, data) => {
    if (id == null) {
      const maxOrder = (locations || []).reduce((m, l) => Math.max(m, Number(l.order) || 0), 0);
      setLocations((prev) => [
        ...prev,
        { id: Date.now(), branch, status: "active", order: data.order || maxOrder + 1, ...data },
      ]);
      notify("Đã thêm vị trí/phòng");
    } else {
      setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
      notify("Đã cập nhật vị trí/phòng");
    }
  };

  const handleDelete = (id) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
    notify("Đã xoá vị trí/phòng");
  };

  const handleToggleStatus = (id) => {
    setLocations((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: l.status === "active" ? "inactive" : "active" } : l))
    );
    const l = (locations || []).find((x) => x.id === id);
    notify(l && l.status === "active" ? "Đã ngừng hoạt động vị trí/phòng" : "Đã mở hoạt động vị trí/phòng");
  };

  const handleCreateGroup = (name) => {
    const g = { id: Date.now(), name };
    setGroups((prev) => [...prev, g]);
    notify("Đã tạo nhóm vị trí/phòng");
    return g;
  };

  const handleExport = () => {
    const list = (locations || []).filter((l) => branch === "all" || l.branch === branch);
    if (list.length === 0) {
      notify("Không có dữ liệu để xuất", "info");
      return;
    }
    const rows = list.map((l) => ({
      [HEADERS[0]]: l.name || "",
      [HEADERS[1]]: l.note || "",
      [HEADERS[2]]: groupNameOf(l.groupId),
      [HEADERS[3]]: LOC_STATUS[l.status] || "",
      [HEADERS[4]]: l.order ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
    ws["!cols"] = [{ wch: 24 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vi tri phong");
    downloadWb(wb, `Danh_sach_vi_tri_phong_${dateStamp()}.xlsx`);
    notify(`Đã xuất ${list.length} vị trí/phòng ra file Excel`);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(
      [{ [HEADERS[0]]: "Giường 1", [HEADERS[1]]: "", [HEADERS[2]]: "Tầng 1", [HEADERS[3]]: "Đang hoạt động", [HEADERS[4]]: 1 }],
      { header: HEADERS }
    );
    ws["!cols"] = [{ wch: 24 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vi tri phong");
    downloadWb(wb, "File_mau_vi_tri_phong.xlsx");
  };

  const handleImportFile = async (file) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
    if (rows.length === 0) throw new Error("empty");

    const pick = (row, keys) => {
      for (const k of Object.keys(row)) {
        const nk = k.toLowerCase();
        if (keys.some((key) => nk.includes(key))) return row[k];
      }
      return "";
    };

    let added = 0;
    const groupCache = new Map(groups.map((g) => [g.name.toLowerCase(), g]));
    const newGroups = [];
    const newLocations = [];

    rows.forEach((row, i) => {
      const name = String(pick(row, ["tên", "ten", "name"])).trim();
      if (!name) return;
      const note = String(pick(row, ["ghi chú", "ghi chu", "note"])).trim();
      const groupText = String(pick(row, ["nhóm", "nhom", "group"])).trim();
      const statusText = String(pick(row, ["trạng thái", "trang thai", "status"])).toLowerCase();
      const orderRaw = pick(row, ["số thứ tự", "so thu tu", "thứ tự", "order", "stt"]);

      let groupId = null;
      if (groupText) {
        const key = groupText.toLowerCase();
        if (!groupCache.has(key)) {
          const g = { id: Date.now() + i, name: groupText };
          groupCache.set(key, g);
          newGroups.push(g);
        }
        groupId = groupCache.get(key).id;
      }

      newLocations.push({
        id: Date.now() + i,
        name,
        note,
        groupId,
        branch,
        status: statusText.includes("ngừng") ? "inactive" : "active",
        order: Number(orderRaw) || 0,
      });
      added += 1;
    });

    if (newGroups.length) setGroups((prev) => [...prev, ...newGroups]);
    if (newLocations.length) setLocations((prev) => [...prev, ...newLocations]);
    return { added };
  };

  return (
    <>
      <LocationsPage
        locations={locations}
        groups={groups}
        branch={branch}
        invoices={invoices}
        onSave={handleSave}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onCreateGroup={handleCreateGroup}
        onExport={handleExport}
        onImportFile={handleImportFile}
        onDownloadTemplate={handleDownloadTemplate}
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
