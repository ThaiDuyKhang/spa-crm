import { useState } from "react";
import {
  User, Package, History, FileCheck, Receipt, PenLine,
  SlidersHorizontal, CreditCard, Mail, X, Plus, Pencil, Trash2,
} from "lucide-react";
import "./StoreProfilePage.css";

const SIDEBAR = [
  {
    title: "Gian hàng",
    items: [{ id: "store-info", label: "Thông tin gian hàng", icon: User, active: true }],
  },
  {
    title: "Gói dịch vụ Lumiere",
    items: [
      { id: "plan", label: "Gói dịch vụ", icon: Package },
      { id: "plan-history", label: "Lịch sử mua hàng", icon: History },
      { id: "plan-confirm", label: "Bản xác nhận dịch vụ", icon: FileCheck },
    ],
  },
  {
    title: "Hóa đơn điện tử & Chữ ký số",
    items: [
      { id: "einvoice", label: "Hóa đơn điện tử", icon: Receipt },
      { id: "signature", label: "Quản lý chữ ký số", icon: PenLine },
    ],
  },
  {
    title: "Khác",
    items: [
      { id: "terms", label: "Điều khoản sử dụng", icon: SlidersHorizontal },
      { id: "payment", label: "Thanh toán", icon: CreditCard },
      { id: "referral", label: "Giới thiệu khách hàng", icon: Mail, badge: "Mới" },
    ],
  },
];

const DEFAULT_INFO = {
  businessType: "Cá nhân",
  birthday: "",
  representative: "Khang Trần",
  idNumber: "",
  phone: "",
  issueDate: "",
  email: "",
  gender: "",
  issuePlace: "",
  address: "",
  storeName: "Lumière Spa",
  expiryDate: "",
  industry: "Spa & chăm sóc sắc đẹp",
  plan: "",
  status: "Đang sử dụng",
};

const DEFAULT_HISTORY = [
  { time: "07/05/2025 14:32", by: "Khang Trần", content: "Cập nhật thông tin hồ sơ gian hàng" },
  { time: "15/12/2025 09:10", by: "Hệ thống", content: "Gia hạn gói dịch vụ đến 15/12/2026" },
];

function loadJSON(key, fallback) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
function nowStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function InfoCell({ label, value }) {
  const empty = value === "" || value == null;
  return (
    <div className="sp-info-cell">
      <div className="sp-info-label">{label}</div>
      <div className={`sp-info-value${empty ? " empty" : ""}`}>{empty ? "Chưa cập nhật" : value}</div>
    </div>
  );
}

function Modal({ title, onClose, children, onSave, saveLabel = "Lưu" }) {
  return (
    <div className="kv-overlay" onClick={onClose}>
      <div className="kv-modal kv-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="kv-modal-head">
          <h3>{title}</h3>
          <button className="kv-modal-x" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="kv-modal-body">{children}</div>
        <div className="kv-modal-foot">
          <button className="kv-btn kv-btn-light" onClick={onClose}>Bỏ qua</button>
          <button className="kv-btn kv-btn-primary" onClick={onSave}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="acc-field">
      <span className="acc-field-label">{label}</span>
      {children}
    </label>
  );
}

/* ---------- Modal sửa thông tin gian hàng ---------- */
function StoreInfoModal({ info, onSave, onClose }) {
  const [form, setForm] = useState({ ...info });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const inp = (k, ph = "") => (
    <input value={form[k] || ""} onChange={set(k)} placeholder={ph} />
  );
  return (
    <Modal title="Cập nhật thông tin gian hàng" onClose={onClose} onSave={() => onSave(form)}>
      <div className="sp-modal-sec">Thông tin hồ sơ</div>
      <div className="acc-grid">
        <Field label="Loại hình kinh doanh">
          <select className="kv-select" value={form.businessType} onChange={set("businessType")}>
            <option>Cá nhân</option>
            <option>Hộ kinh doanh</option>
            <option>Công ty</option>
          </select>
        </Field>
        <Field label="Ngày sinh">{inp("birthday", "--/--/----")}</Field>
        <Field label="Người đại diện">{inp("representative")}</Field>
        <Field label="CCCD/Hộ chiếu">{inp("idNumber")}</Field>
        <Field label="Điện thoại">{inp("phone")}</Field>
        <Field label="Ngày cấp">{inp("issueDate", "--/--/----")}</Field>
        <Field label="Email">{inp("email", "Nhập email")}</Field>
        <Field label="Giới tính">
          <select className="kv-select" value={form.gender} onChange={set("gender")}>
            <option value="">Chọn giới tính</option>
            <option>Nam</option>
            <option>Nữ</option>
            <option>Khác</option>
          </select>
        </Field>
        <Field label="Nơi cấp">{inp("issuePlace")}</Field>
        <Field label="Địa chỉ">{inp("address", "Nhập địa chỉ")}</Field>
      </div>
      <div className="sp-modal-sec">Thông tin gian hàng</div>
      <div className="acc-grid">
        <Field label="Tên gian hàng">{inp("storeName")}</Field>
        <Field label="Ngày hết hạn">{inp("expiryDate", "--/--/----")}</Field>
        <Field label="Ngành hàng">{inp("industry")}</Field>
        <Field label="Gói dịch vụ">{inp("plan")}</Field>
        <Field label="Tình trạng">
          <select className="kv-select" value={form.status} onChange={set("status")}>
            <option>Đang sử dụng</option>
            <option>Tạm ngưng</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}

/* ---------- Modal thêm/sửa chi nhánh ---------- */
function BranchModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    address: initial?.address || "",
    phone: initial?.phone || "",
  });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = () => {
    if (!form.name.trim()) return setErr("Vui lòng nhập tên chi nhánh.");
    onSave({ ...form, name: form.name.trim() });
  };
  return (
    <Modal
      title={initial ? "Sửa chi nhánh" : "Thêm chi nhánh"}
      onClose={onClose}
      onSave={save}
      saveLabel={initial ? "Lưu" : "Thêm"}
    >
      <Field label="Tên chi nhánh">
        <input value={form.name} onChange={set("name")} placeholder="Bắt buộc" autoFocus />
      </Field>
      <Field label="Địa chỉ">
        <input value={form.address} onChange={set("address")} placeholder="Nhập địa chỉ chi nhánh" />
      </Field>
      <Field label="Số điện thoại">
        <input value={form.phone} onChange={set("phone")} placeholder="Nhập số điện thoại" />
      </Field>
      {err && <div className="acc-err">{err}</div>}
    </Modal>
  );
}

/* ---------- Trang Hồ sơ cửa hàng ---------- */
export default function StoreProfilePage({
  notify, branches = [], onAddBranch, onUpdateBranch, onDeleteBranch,
}) {
  const [tab, setTab] = useState("info");
  const [info, setInfo] = useState(() => loadJSON("spa-store-profile", DEFAULT_INFO));
  const [history, setHistory] = useState(() => {
    try {
      if (typeof localStorage === "undefined") return DEFAULT_HISTORY;
      const raw = localStorage.getItem("spa-store-history");
      return raw ? JSON.parse(raw) : DEFAULT_HISTORY;
    } catch {
      return DEFAULT_HISTORY;
    }
  });
  const [infoModal, setInfoModal] = useState(false);
  const [branchModal, setBranchModal] = useState(null); // null | {mode:"add"} | {mode:"edit", branch}

  const realBranches = (branches || []).filter((b) => b.id !== "all");

  const pushHistory = (content) => {
    const entry = { time: nowStr(), by: info.representative || "Người dùng", content };
    setHistory((h) => {
      const next = [entry, ...h];
      saveJSON("spa-store-history", next);
      return next;
    });
  };

  const saveInfo = (form) => {
    setInfo(form);
    saveJSON("spa-store-profile", form);
    pushHistory("Cập nhật thông tin hồ sơ gian hàng");
    setInfoModal(false);
    notify("Đã cập nhật thông tin gian hàng");
  };

  const saveBranch = (form) => {
    if (branchModal?.mode === "edit" && branchModal.branch) {
      onUpdateBranch(branchModal.branch.id, form);
      pushHistory(`Sửa chi nhánh ${form.name}`);
      notify(`Đã lưu chi nhánh ${form.name}`);
    } else {
      onAddBranch(form);
      pushHistory(`Thêm chi nhánh ${form.name}`);
      notify(`Đã thêm chi nhánh ${form.name}`);
    }
    setBranchModal(null);
  };

  const removeBranch = (b) => {
    if (realBranches.length <= 1) {
      notify("Phải giữ lại ít nhất 1 chi nhánh", "info");
      return;
    }
    if (!window.confirm(`Xóa chi nhánh ${b.name}?`)) return;
    onDeleteBranch(b.id);
    pushHistory(`Xóa chi nhánh ${b.name}`);
    notify(`Đã xóa chi nhánh ${b.name}`);
  };

  const goFeature = (label) => notify(`Chức năng "${label}" sẽ được bổ sung sau`, "info");

  return (
    <div className="sp-page">
      <aside className="sp-side">
        {SIDEBAR.map((sec) => (
          <div key={sec.title} className="sp-side-sec">
            <div className="sp-side-title">{sec.title}</div>
            {sec.items.map((it) => (
              <button
                key={it.id}
                className={`sp-side-item${it.active ? " active" : ""}`}
                onClick={() => !it.active && goFeature(it.label)}
              >
                <it.icon size={16} />
                <span>{it.label}</span>
                {it.badge && <span className="sp-badge">{it.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <div className="sp-main">
        <div className="sp-tabs">
          <button className={`sp-tab${tab === "info" ? " active" : ""}`} onClick={() => setTab("info")}>
            Thông tin chung
          </button>
          <button className={`sp-tab${tab === "branches" ? " active" : ""}`} onClick={() => setTab("branches")}>
            Chi nhánh
          </button>
          <button className={`sp-tab${tab === "history" ? " active" : ""}`} onClick={() => setTab("history")}>
            Lịch sử cập nhật
          </button>
        </div>

        {tab === "info" && (
          <div className="sp-card">
            <h3 className="sp-sec-title">Thông tin hồ sơ</h3>
            <div className="sp-grid">
              <InfoCell label="Loại hình kinh doanh" value={info.businessType} />
              <InfoCell label="Ngày sinh" value={info.birthday} />
              <InfoCell label="Người đại diện" value={info.representative} />
              <InfoCell label="CCCD/Hộ chiếu" value={info.idNumber} />
              <InfoCell label="Điện thoại" value={info.phone} />
              <InfoCell label="Ngày cấp" value={info.issueDate} />
              <InfoCell label="Email" value={info.email} />
              <InfoCell label="Giới tính" value={info.gender} />
              <InfoCell label="Nơi cấp" value={info.issuePlace} />
              <InfoCell label="Địa chỉ" value={info.address} />
            </div>

            <h3 className="sp-sec-title">Thông tin gian hàng</h3>
            <div className="sp-grid">
              <InfoCell label="Tên gian hàng" value={info.storeName} />
              <InfoCell label="Ngày hết hạn" value={info.expiryDate} />
              <InfoCell label="Ngành hàng" value={info.industry} />
              <InfoCell label="Gói dịch vụ" value={info.plan} />
              <InfoCell label="Số chi nhánh" value={String(realBranches.length)} />
              <InfoCell label="Tình trạng" value={info.status} />
            </div>

            <div className="sp-actions">
              <button className="kv-btn kv-btn-outline" onClick={() => goFeature("Bảo lưu gian hàng")}>
                Bảo lưu gian hàng
              </button>
              <button className="kv-btn kv-btn-primary" onClick={() => setInfoModal(true)}>
                Cập nhật
              </button>
            </div>
          </div>
        )}

        {tab === "branches" && (
          <div className="sp-card">
            <div className="sp-branch-head">
              <h3 className="sp-sec-title" style={{ margin: 0 }}>
                Danh sách chi nhánh ({realBranches.length})
              </h3>
              <button
                className="kv-btn kv-btn-primary"
                onClick={() => setBranchModal({ mode: "add" })}
              >
                <Plus size={15} /> Thêm chi nhánh
              </button>
            </div>
            <table className="kv-table">
              <thead>
                <tr>
                  <th>Tên chi nhánh</th>
                  <th>Địa chỉ</th>
                  <th>Số điện thoại</th>
                  <th style={{ width: 110, textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {realBranches.map((b) => (
                  <tr key={b.id}>
                    <td><b>{b.name}</b></td>
                    <td>{b.address || <span className="cd-muted">Chưa cập nhật</span>}</td>
                    <td>{b.phone || <span className="cd-muted">Chưa cập nhật</span>}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        className="sp-icon-btn"
                        title="Sửa"
                        onClick={() => setBranchModal({ mode: "edit", branch: b })}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="sp-icon-btn danger"
                        title="Xóa"
                        onClick={() => removeBranch(b)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "history" && (
          <div className="sp-card">
            <table className="kv-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Người thực hiện</th>
                  <th>Nội dung thay đổi</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td>{h.time}</td>
                    <td>{h.by}</td>
                    <td>{h.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {infoModal && (
        <StoreInfoModal info={info} onSave={saveInfo} onClose={() => setInfoModal(false)} />
      )}
      {branchModal && (
        <BranchModal
          initial={branchModal.mode === "edit" ? branchModal.branch : null}
          onSave={saveBranch}
          onClose={() => setBranchModal(null)}
        />
      )}
    </div>
  );
}
