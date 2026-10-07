import { useState } from "react";
import { X, ChevronDown, ChevronUp, CalendarDays, UserRound } from "lucide-react";
import { CUSTOMER_SOURCES, PROVINCES, WARDS_SG } from "../data/customers";
import "./CustomerModal.css";

function Collapse({ title, open, onToggle, children }) {
  return (
    <div className="kv-collapse">
      <button type="button" className="kv-collapse-head" onClick={onToggle}>
        {title}
        {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
      {open && <div className="kv-collapse-body">{children}</div>}
    </div>
  );
}

export default function CustomerModal({ onClose, onSave, initial = null, title = "Thêm khách hàng" }) {
  const [form, setForm] = useState({
    name: initial?.fullName || initial?.name || "",
    phone: initial?.phone || "",
    birthday: initial?.birthday || "",
    gender: initial?.gender || "",
    email: initial?.email || "",
    facebook: initial?.facebook || "",
    address: initial?.address || "",
    city: initial?.city || "",
    ward: initial?.ward || "",
    group: initial?.group || "",
    source: initial?.source || "Khách đến trực tiếp",
    note: initial?.note || "",
  });
  const [tried, setTried] = useState(false);
  const [openInvoice, setOpenInvoice] = useState(false);
  const [openAddress, setOpenAddress] = useState(true);
  const [openGroup, setOpenGroup] = useState(true);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const nameError = tried && !form.name.trim();

  const handleSave = () => {
    setTried(true);
    if (!form.name.trim()) return;
    onSave({ ...form, name: form.name.trim() });
  };

  return (
    <div className="kv-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="kv-modal" style={{ maxWidth: 790 }}>
        <div className="kv-modal-head">
          <h2 className="kv-modal-title">{title}</h2>
          <button className="kv-modal-close" onClick={onClose} title="Đóng">
            <X size={19} />
          </button>
        </div>

        <div className="kv-modal-body">
          <div className="cm-top">
            <div className="cm-avatar">
              <UserRound size={38} strokeWidth={1.8} />
            </div>
            <div className={`cm-field${nameError ? " kv-field-error" : ""}`} style={{ flex: "1.35" }}>
              <label className="kv-label">Tên khách hàng</label>
              <input
                className="kv-input cm-name-input"
                placeholder="Bắt buộc"
                value={form.name}
                onChange={set("name")}
                autoFocus
              />
              {nameError && <div className="kv-error-text">Hãy nhập Tên khách hàng</div>}
            </div>
            <div className="cm-field" style={{ flex: 1 }}>
              <label className="kv-label">Mã khách hàng</label>
              <input className="kv-input" placeholder="Tự động" disabled value={initial?.id || ""} />
            </div>
          </div>

          <div className="cm-grid cm-grid-3">
            <div className="cm-field">
              <label className="kv-label">Số điện thoại</label>
              <input className="kv-input" placeholder="Nhập số điện thoại" value={form.phone} onChange={set("phone")} />
            </div>
            <div className="cm-field">
              <label className="kv-label">Ngày sinh</label>
              <div className="cm-date">
                <input className="kv-input" placeholder="--/--/----" value={form.birthday} onChange={set("birthday")} />
                <CalendarDays size={16} />
              </div>
            </div>
            <div className="cm-field">
              <label className="kv-label">Giới tính</label>
              <select className={`kv-select${!form.gender ? " cm-ph" : ""}`} value={form.gender} onChange={set("gender")}>
                <option value="">Chọn giới tính</option>
                <option>Nam</option>
                <option>Nữ</option>
                <option>Khác</option>
              </select>
            </div>
          </div>

          <div className="cm-grid cm-grid-2">
            <div className="cm-field">
              <label className="kv-label">Email</label>
              <input className="kv-input" placeholder="Nhập email" value={form.email} onChange={set("email")} />
            </div>
            <div className="cm-field">
              <label className="kv-label">Facebook</label>
              <input className="kv-input" placeholder="Nhập link Facebook" value={form.facebook} onChange={set("facebook")} />
            </div>
          </div>

          <Collapse title="Thông tin xuất hóa đơn" open={openInvoice} onToggle={() => setOpenInvoice((v) => !v)}>
            <div className="cm-grid cm-grid-2">
              <div className="cm-field">
                <label className="kv-label">Tên công ty</label>
                <input className="kv-input" placeholder="Nhập tên công ty" />
              </div>
              <div className="cm-field">
                <label className="kv-label">Mã số thuế</label>
                <input className="kv-input" placeholder="Nhập mã số thuế" />
              </div>
            </div>
            <div className="cm-field" style={{ marginTop: 12 }}>
              <label className="kv-label">Địa chỉ xuất hóa đơn</label>
              <input className="kv-input" placeholder="Nhập địa chỉ" />
            </div>
          </Collapse>

          <Collapse title="Địa chỉ" open={openAddress} onToggle={() => setOpenAddress((v) => !v)}>
            <div className="cm-field">
              <label className="kv-label">Địa chỉ chi tiết</label>
              <input className="kv-input" placeholder="Nhập địa chỉ" value={form.address} onChange={set("address")} />
            </div>
            <div className="cm-grid cm-grid-2" style={{ marginTop: 12 }}>
              <div className="cm-field">
                <label className="kv-label">Tỉnh/Thành phố</label>
                <select className={`kv-select${!form.city ? " cm-ph" : ""}`} value={form.city} onChange={set("city")}>
                  <option value="">Chọn Tỉnh/Thành phố</option>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="cm-field">
                <label className="kv-label">Xã/Phường/Đặc khu</label>
                <select className={`kv-select${!form.ward ? " cm-ph" : ""}`} value={form.ward} onChange={set("ward")}>
                  <option value="">Chọn Xã/Phường/Đặc khu</option>
                  {WARDS_SG.map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
            </div>
          </Collapse>

          <Collapse title="Nhóm khách, nguồn khách, ghi chú" open={openGroup} onToggle={() => setOpenGroup((v) => !v)}>
            <div className="cm-grid cm-grid-2">
              <div className="cm-field">
                <label className="kv-label">Nhóm khách</label>
                <select className={`kv-select${!form.group ? " cm-ph" : ""}`} value={form.group} onChange={set("group")}>
                  <option value="">Chọn nhóm khách</option>
                  <option>Khách lẻ</option>
                  <option>Khách VIP</option>
                  <option>Khách thân thiết</option>
                  <option>Khách mới</option>
                </select>
              </div>
              <div className="cm-field">
                <label className="kv-label">Nguồn khách</label>
                <select className="kv-select" value={form.source} onChange={set("source")}>
                  {CUSTOMER_SOURCES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="cm-field" style={{ marginTop: 12 }}>
              <label className="kv-label">Ghi chú</label>
              <input className="kv-input" placeholder="Nhập ghi chú" value={form.note} onChange={set("note")} />
            </div>
          </Collapse>
        </div>

        <div className="kv-modal-foot">
          <button className="kv-btn kv-btn-ghost" onClick={onClose}>Bỏ qua</button>
          <button className="kv-btn kv-btn-primary" onClick={handleSave}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
