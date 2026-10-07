import { useState } from "react";
import { X } from "lucide-react";

/** Modal thêm / cập nhật vị trí-phòng, kiểu KiotViet. */
export default function LocationModal({ location, groups, onClose, onSave }) {
  const isNew = !location;
  const [form, setForm] = useState({
    name: location?.name || "",
    note: location?.note || "",
    groupId: location?.groupId != null ? String(location.groupId) : "",
    order: location?.order ?? "",
  });
  const [tried, setTried] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const nameError = tried && !form.name.trim();

  const handleSave = () => {
    setTried(true);
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      note: form.note.trim(),
      groupId: form.groupId === "" ? null : (isNaN(Number(form.groupId)) ? form.groupId : Number(form.groupId)),
      order: form.order === "" ? 0 : Number(form.order),
    });
  };

  return (
    <div className="kv-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="kv-modal" style={{ maxWidth: 560 }}>
        <div className="kv-modal-head">
          <h2 className="kv-modal-title">{isNew ? "Thêm vị trí/phòng" : "Cập nhật vị trí/phòng"}</h2>
          <button className="kv-modal-close" onClick={onClose}><X size={19} /></button>
        </div>
        <div className="kv-modal-body">
          <div className="lm-grid">
            <div className={`lm-field full${nameError ? " kv-field-error" : ""}`}>
              <label className="kv-label">Tên vị trí/phòng</label>
              <input
                className="kv-input"
                placeholder="Bắt buộc"
                style={nameError ? undefined : { }}
                value={form.name}
                onChange={set("name")}
                autoFocus
              />
              {nameError && <div className="kv-error-text">Hãy nhập Tên vị trí/phòng</div>}
            </div>
            <div className="lm-field full">
              <label className="kv-label">Ghi chú</label>
              <input className="kv-input" placeholder="Nhập ghi chú" value={form.note} onChange={set("note")} />
            </div>
            <div className="lm-field">
              <label className="kv-label">Nhóm</label>
              <select className={`kv-select${!form.groupId ? " cm-ph" : ""}`} value={form.groupId} onChange={set("groupId")}>
                <option value="">Chọn nhóm</option>
                {groups.map((g) => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
              </select>
            </div>
            <div className="lm-field">
              <label className="kv-label">Số thứ tự</label>
              <input
                className="kv-input"
                type="number"
                min="0"
                placeholder="0"
                value={form.order}
                onChange={set("order")}
              />
            </div>
          </div>
        </div>
        <div className="kv-modal-foot">
          <button className="kv-btn kv-btn-ghost" onClick={onClose}>Bỏ qua</button>
          <button className="kv-btn kv-btn-primary" onClick={handleSave}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
