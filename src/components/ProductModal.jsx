import { useState, useRef } from "react";
import {
  X, ChevronDown, ChevronUp, Tag, ImagePlus,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Image as ImageIcon,
} from "lucide-react";
import { initialsCode } from "../data/products.js";
import "./ProductsPage.css";

export { initialsCode };

function MoneyInput({ value, onChange, placeholder }) {
  const fmt = (v) => {
    if (v === "" || v == null) return "";
    const n = Number(String(v).replace(/[^0-9]/g, ""));
    return Number.isFinite(n) ? n.toLocaleString("vi-VN") : "";
  };
  return (
    <input
      className="kv-input pm-money"
      placeholder={placeholder}
      value={fmt(value)}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
    />
  );
}

function Collapse({ title, desc, open, onToggle, children, action }) {
  return (
    <div className="pm-collapse">
      <button type="button" className="pm-collapse-head" onClick={onToggle}>
        <span className="pm-collapse-text">
          <span className="pm-collapse-title">{title}</span>
          {desc && <span className="pm-collapse-desc">{desc}</span>}
        </span>
        {action || (open ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
      </button>
      {open && <div className="pm-collapse-body">{children}</div>}
    </div>
  );
}

function GroupModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  return (
    <div className="kv-overlay" style={{ zIndex: 210 }} onMouseDown={onClose}>
      <div className="kv-modal" style={{ maxWidth: 400 }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="kv-modal-head">
          <h2 className="kv-modal-title">Thêm nhóm hàng</h2>
          <button className="kv-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="kv-modal-body">
          <label className="kv-label">Tên nhóm hàng</label>
          <input
            className="kv-input" autoFocus value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Dịch vụ lẻ"
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name.trim()); }}
          />
        </div>
        <div className="kv-modal-foot">
          <button className="kv-btn kv-btn-ghost" onClick={onClose}>Bỏ qua</button>
          <button
            className="kv-btn kv-btn-primary"
            disabled={!name.trim()}
            onClick={() => name.trim() && onSave(name.trim())}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

const TOOLBAR = [
  { icon: Bold, label: "In đậm" },
  { icon: Italic, label: "In nghiêng" },
  { icon: Underline, label: "Gạch chân" },
  null,
  { icon: AlignLeft, label: "Căn trái" },
  { icon: AlignCenter, label: "Căn giữa" },
  { icon: AlignRight, label: "Căn phải" },
  { icon: AlignJustify, label: "Căn đều" },
  null,
  { icon: List, label: "Danh sách" },
  { icon: ListOrdered, label: "Danh sách số" },
  null,
  { icon: Link2, label: "Chèn liên kết" },
  { icon: ImageIcon, label: "Chèn ảnh" },
];

/**
 * Modal thêm/sửa hàng hóa & dịch vụ kiểu KiotViet (hình 4/5).
 */
export default function ProductModal({
  kind, item, initialTab, categories,
  onClose, onSave, onCreateCategory, notify,
}) {
  const isService = kind === "service";
  const [tab, setTab] = useState(initialTab || "info");
  const [name, setName] = useState(item?.name || "");
  const [code, setCode] = useState(item?.code || "");
  const [codeTouched, setCodeTouched] = useState(!!item?.code);
  const [duration, setDuration] = useState(item?.duration ?? "");
  const [unit, setUnit] = useState(item?.unit || "Cái");
  const [categoryId, setCategoryId] = useState(item?.categoryId || "");
  const [brand, setBrand] = useState(item?.brand || "");
  const [allowSale, setAllowSale] = useState(item?.allowSale !== false);
  const [price, setPrice] = useState(item?.price ?? "");
  const [cost, setCost] = useState(item?.cost ?? "");
  const [priceOpen, setPriceOpen] = useState(true);
  const [matOpen, setMatOpen] = useState(false);
  const [description, setDescription] = useState(item?.description || "");
  const [note, setNote] = useState(item?.note || "");
  const [images, setImages] = useState([]);
  const [groupModal, setGroupModal] = useState(false);
  const fileRef = useRef(null);

  const title = `${item ? "Sửa" : "Thêm"} ${isService ? "dịch vụ" : "hàng hóa"}`;

  const handleName = (v) => {
    setName(v);
    if (!codeTouched) setCode(initialsCode(v));
  };

  const handleFiles = (files) => {
    const arr = Array.from(files || {});
    if (images.length + arr.length > 10) {
      notify("Chỉ được upload tối đa 10 ảnh", "info");
      return;
    }
    const ok = [];
    for (const f of arr) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 2 * 1024 * 1024) {
        notify(`Ảnh ${f.name} vượt quá 2MB`, "info");
        continue;
      }
      ok.push({ url: URL.createObjectURL(f), name: f.name });
    }
    if (ok.length) setImages((prev) => [...prev, ...ok].slice(0, 10));
  };

  const handleSave = () => {
    if (!name.trim()) {
      notify("Vui lòng nhập tên hàng", "info");
      return;
    }
    onSave({
      kind,
      id: item?.id,
      code: code.trim() || initialsCode(name),
      name: name.trim(),
      categoryId: categoryId || null,
      brand: brand.trim(),
      price: Number(price) || 0,
      cost: Number(cost) || 0,
      duration: isService ? Number(duration) || 0 : undefined,
      unit: !isService ? unit : undefined,
      allowSale,
      description: description.trim(),
      note: note.trim(),
      status: item?.status || "active",
    });
  };

  const handleCreateGroup = (groupName) => {
    const g = onCreateCategory(groupName);
    if (g) setCategoryId(g.id);
    setGroupModal(false);
  };

  return (
    <div className="kv-overlay" onMouseDown={onClose}>
      <div className="kv-modal pm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="kv-modal-head">
          <h2 className="kv-modal-title">{title}</h2>
          <button className="kv-modal-close" onClick={onClose} title="Đóng"><X size={18} /></button>
        </div>

        <div className="pm-tabs">
          <button
            type="button"
            className={`pm-tab${tab === "info" ? " active" : ""}`}
            onClick={() => setTab("info")}
          >
            Thông tin
          </button>
          <button
            type="button"
            className={`pm-tab${tab === "media" ? " active" : ""}`}
            onClick={() => setTab("media")}
          >
            Hình ảnh, mô tả, ghi chú
          </button>
        </div>

        <div className="kv-modal-body pm-body">
          {tab === "info" && (
            <>
              <div className="pm-field">
                <label className="kv-label">Tên hàng</label>
                <input
                  className="kv-input" value={name} autoFocus
                  onChange={(e) => handleName(e.target.value)}
                  placeholder={isService ? "VD: Cạo gió" : "VD: Dầu gội dưỡng ẩm"}
                />
              </div>
              <div className="pm-row">
                <div className="pm-field">
                  <label className="kv-label">Mã hàng</label>
                  <input
                    className="kv-input" value={code}
                    onChange={(e) => { setCode(e.target.value); setCodeTouched(true); }}
                    placeholder="Tự động tạo nếu để trống"
                  />
                </div>
                {isService ? (
                  <div className="pm-field">
                    <label className="kv-label">Thời lượng</label>
                    <div className="pm-suffix-wrap">
                      <input
                        className="kv-input" value={duration}
                        onChange={(e) => setDuration(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="20"
                      />
                      <span className="pm-suffix">Phút</span>
                    </div>
                  </div>
                ) : (
                  <div className="pm-field">
                    <label className="kv-label">Đơn vị tính</label>
                    <input
                      className="kv-input" value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="pm-row">
                <div className="pm-field">
                  <div className="pm-label-row">
                    <label className="kv-label">Nhóm hàng</label>
                    <button type="button" className="pm-link" onClick={() => setGroupModal(true)}>Tạo mới</button>
                  </div>
                  <select
                    className="kv-select" value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">-- Chọn nhóm hàng --</option>
                    {(categories || []).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pm-field">
                  <div className="pm-label-row">
                    <label className="kv-label">Thương hiệu</label>
                    <button type="button" className="pm-link" onClick={() => notify("Quản lý thương hiệu sẽ được bổ sung sau", "info")}>Tạo mới</button>
                  </div>
                  <select className="kv-select" value={brand} onChange={(e) => setBrand(e.target.value)}>
                    <option value="">Chọn thương hiệu</option>
                    {brand && <option value={brand}>{brand}</option>}
                  </select>
                </div>
              </div>
              <label className="pm-check">
                <input type="checkbox" checked={allowSale} onChange={(e) => setAllowSale(e.target.checked)} />
                Cho phép bán
              </label>

              <Collapse title="Giá bán, giá vốn" open={priceOpen} onToggle={() => setPriceOpen(!priceOpen)}>
                <div className="pm-row pm-price-row">
                  <div className="pm-field">
                    <label className="kv-label">Giá bán</label>
                    <MoneyInput value={price} onChange={setPrice} placeholder="0" />
                  </div>
                  <Tag size={16} className="pm-tag-icon" />
                  <div className="pm-field">
                    <label className="kv-label">Giá vốn</label>
                    <MoneyInput value={cost} onChange={setCost} placeholder="0" />
                  </div>
                </div>
              </Collapse>

              <Collapse
                title="Nguyên liệu tiêu hao"
                desc="Thiết lập nguyên liệu sử dụng trong quá trình làm dịch vụ"
                open={matOpen}
                onToggle={() => setMatOpen(!matOpen)}
              >
                <div className="pm-empty">Chưa có nguyên liệu tiêu hao</div>
              </Collapse>

              <div className="pm-rowline">
                <span className="pm-collapse-text">
                  <span className="pm-collapse-title">Hoa hồng nhân viên</span>
                  <span className="pm-collapse-desc">Thiết lập hoa hồng cho nhân viên tư vấn bán, làm dịch vụ</span>
                </span>
                <button
                  type="button" className="pm-link"
                  onClick={() => notify("Thiết lập hoa hồng sẽ được bổ sung sau", "info")}
                >
                  Thiết lập
                </button>
              </div>

              <div className="pm-rowline">
                <span className="pm-collapse-text">
                  <span className="pm-collapse-title">Quản lý theo đơn vị tính và thuộc tính</span>
                  <span className="pm-collapse-desc">Tạo nhiều hàng hoá khác đơn vị tính (buổi, ngày) hoặc đặc điểm (chất liệu, mức độ)</span>
                </span>
                <button
                  type="button" className="kv-btn kv-btn-outline"
                  onClick={() => notify("Quản lý đơn vị tính sẽ được bổ sung sau", "info")}
                >
                  Thiết lập
                </button>
              </div>
            </>
          )}

          {tab === "media" && (
            <>
              <div className="pm-field">
                <label className="kv-label">Hình ảnh</label>
                <div className="pm-upload" onClick={() => fileRef.current?.click()}>
                  <div className="pm-upload-hint">Upload tối đa 10 ảnh, dung lượng mỗi ảnh tối đa 2MB</div>
                  <div className="pm-upload-tiles">
                    {images.map((img, i) => (
                      <span key={i} className="pm-thumb">
                        <img src={img.url} alt={img.name} />
                        <button
                          type="button" className="pm-thumb-x"
                          onClick={(e) => {
                            e.stopPropagation();
                            URL.revokeObjectURL(img.url);
                            setImages((prev) => prev.filter((_, k) => k !== i));
                          }}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                    {images.length < 10 && (
                      <span className="pm-add-tile"><ImagePlus size={20} /></span>
                    )}
                  </div>
                  <input
                    ref={fileRef} type="file" accept="image/*" multiple hidden
                    onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                  />
                </div>
              </div>
              <div className="pm-field">
                <label className="kv-label">Mô tả</label>
                <div className="pm-toolbar">
                  {TOOLBAR.map((t, i) =>
                    t ? (
                      <button key={i} type="button" className="pm-tool" title={t.label}>
                        <t.icon size={15} />
                      </button>
                    ) : (
                      <span key={i} className="pm-tool-sep" />
                    )
                  )}
                  <span className="pm-tool pm-tool-format">Format <ChevronDown size={13} /></span>
                </div>
                <textarea
                  className="kv-input pm-textarea" rows={5}
                  value={description} onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="pm-field">
                <label className="kv-label">Ghi chú</label>
                <textarea
                  className="kv-input pm-textarea" rows={4}
                  value={note} onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="kv-modal-foot">
          <button className="kv-btn kv-btn-ghost" onClick={onClose}>Bỏ qua</button>
          <button className="kv-btn kv-btn-primary" onClick={handleSave}>Lưu</button>
        </div>
      </div>

      {groupModal && (
        <GroupModal onClose={() => setGroupModal(false)} onSave={handleCreateGroup} />
      )}
    </div>
  );
}
