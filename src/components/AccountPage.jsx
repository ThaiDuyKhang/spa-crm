import { useState } from "react";
import { Lock, ShieldCheck, Pencil, Eye, EyeOff, X } from "lucide-react";
import "./AccountPage.css";

function Field({ label, children, type = "text", placeholder = "" }) {
  return (
    <label className="acc-field">
      <span className="acc-field-label">{label}</span>
      {children || <input type={type} placeholder={placeholder} />}
    </label>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="kv-overlay" onClick={onClose}>
      <div
        className={`kv-modal${wide ? " kv-modal-wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="kv-modal-head">
          <h3>{title}</h3>
          <button className="kv-modal-x" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Modal: Sửa thông tin người dùng (hình 4) ---------- */
function EditUserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    displayName: user.displayName || "",
    username: user.username || "",
    phone: user.phone || "",
    email: user.email || "",
    note: user.note || "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Modal title="Sửa thông tin người dùng" onClose={onClose} wide>
      <div className="kv-modal-body">
        <div className="acc-grid">
          <Field label="Tên hiển thị">
            <input value={form.displayName} onChange={set("displayName")} />
          </Field>
          <Field label="Tên đăng nhập">
            <input value={form.username} onChange={set("username")} />
          </Field>
          <Field label="Số điện thoại">
            <input value={form.phone} onChange={set("phone")} />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={set("email")} placeholder="Nhập email" />
          </Field>
        </div>
        <Field label="Ghi chú">
          <textarea
            value={form.note}
            onChange={set("note")}
            placeholder="Nhập ghi chú"
            rows={4}
          />
        </Field>
      </div>
      <div className="kv-modal-foot">
        <button className="kv-btn kv-btn-light" onClick={onClose}>Bỏ qua</button>
        <button
          className="kv-btn kv-btn-primary"
          onClick={() => {
            onSave(form);
            onClose();
          }}
        >
          Lưu
        </button>
      </div>
    </Modal>
  );
}

/* ---------- Modal: Đổi mật khẩu (hình 5) ---------- */
function ChangePasswordModal({ onClose, notify }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ cur: false, next: false, confirm: false });
  const [err, setErr] = useState("");

  const pwField = (label, value, setValue, key) => (
    <Field label={label}>
      <span className="acc-pw-wrap">
        <input
          type={show[key] ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Bắt buộc"
        />
        <button
          type="button"
          className="acc-pw-eye"
          onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
          aria-label="Hiện/ẩn mật khẩu"
        >
          {show[key] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </Field>
  );

  const save = () => {
    if (!cur || !next || !confirm) return setErr("Vui lòng nhập đầy đủ các trường bắt buộc.");
    if (next.length < 6) return setErr("Mật khẩu mới phải có ít nhất 6 ký tự.");
    if (next !== confirm) return setErr("Mật khẩu nhập lại không khớp.");
    notify("Đổi mật khẩu thành công", "success");
    onClose();
  };

  return (
    <Modal title="Đổi mật khẩu" onClose={onClose}>
      <div className="kv-modal-body">
        {pwField("Mật khẩu hiện tại", cur, setCur, "cur")}
        {pwField("Mật khẩu mới", next, setNext, "next")}
        {pwField("Nhập lại mật khẩu mới", confirm, setConfirm, "confirm")}
        {err && <div className="acc-err">{err}</div>}
      </div>
      <div className="kv-modal-foot">
        <button className="kv-btn kv-btn-light" onClick={onClose}>Bỏ qua</button>
        <button className="kv-btn kv-btn-primary" onClick={save}>Lưu</button>
      </div>
    </Modal>
  );
}

/* ---------- Modal: Thiết lập xác thực 2 lớp qua EMAIL (hình 6) ---------- */
function TwoFactorModal({ user, onEnable, onClose, notify }) {
  const [email, setEmail] = useState(user.email || "");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!email.trim()) return setErr("Vui lòng nhập email để nhận mã xác thực.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setErr("Email chưa đúng định dạng.");
    onEnable({ email: email.trim() });
    notify(`Đã gửi mã xác thực tới ${email.trim()}`, "success");
    onClose();
  };

  return (
    <Modal title="Thiết lập xác thực 2 lớp" onClose={onClose}>
      <div className="kv-modal-body acc-2fa-body">
        <p>
          Mỗi khi bạn đăng nhập trên điện thoại hoặc máy tính mà chưa từng đăng
          nhập trước đó, chúng tôi sẽ yêu cầu bạn nhập thêm mã xác thực.
        </p>
        <p>Bạn vui lòng nhập email để nhận mã xác thực</p>
        <Field label="Email">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Bắt buộc"
          />
        </Field>
        {err && <div className="acc-err">{err}</div>}
      </div>
      <div className="kv-modal-foot">
        <button className="kv-btn kv-btn-light" onClick={onClose}>Bỏ qua</button>
        <button className="kv-btn kv-btn-primary" onClick={submit}>
          Nhận mã xác thực
        </button>
      </div>
    </Modal>
  );
}

/* ---------- Trang Tài khoản (hình 3) ---------- */
export default function AccountPage({ user, onUpdateUser, notify }) {
  const [modal, setModal] = useState(null); // "edit" | "password" | "2fa"

  const infoRow = (label, value, emptyText = "Chưa có") => (
    <div className="acc-info-cell">
      <div className="acc-info-label">{label}</div>
      <div className={`acc-info-value${value ? "" : " empty"}`}>{value || emptyText}</div>
    </div>
  );

  const toggle2fa = () => {
    if (user.twoFactor) {
      onUpdateUser({ twoFactor: false });
      notify("Đã tắt xác thực 2 lớp", "info");
    } else {
      setModal("2fa");
    }
  };

  return (
    <div className="acc-page">
      <h1 className="acc-title">Tài khoản</h1>

      <div className="acc-card">
        <div className="acc-card-head">
          <h2>Thông tin người dùng</h2>
          <button className="kv-btn kv-btn-outline" onClick={() => setModal("edit")}>
            Chỉnh sửa
          </button>
        </div>
        <div className="acc-info-grid">
          {infoRow("Tên hiển thị", user.displayName)}
          {infoRow("Tên đăng nhập", user.username)}
          {infoRow("Vai trò", user.role)}
          {infoRow("Email", user.email)}
          {infoRow("Số điện thoại", user.phone)}
          <div className="acc-info-cell" />
        </div>
        <div className="acc-note">
          <Pencil size={14} />
          <span>
            <b>Ghi chú:</b> <span className={user.note ? "" : "empty"}>{user.note || "Chưa có"}</span>
          </span>
        </div>
      </div>

      <div className="acc-card">
        <h2 className="acc-card-title">Đăng nhập và bảo mật</h2>
        <div className="acc-sec-row">
          <div className="acc-sec-icon"><Lock size={18} /></div>
          <div className="acc-sec-text">
            <b>Mật khẩu</b>
            <p>Bạn nên sử dụng mật khẩu mạnh mà mình chưa sử dụng ở đâu khác</p>
          </div>
          <button className="kv-btn kv-btn-outline" onClick={() => setModal("password")}>
            Đổi mật khẩu
          </button>
        </div>
        <div className="acc-sec-row">
          <div className="acc-sec-icon"><ShieldCheck size={18} /></div>
          <div className="acc-sec-text">
            <b>Xác thực 2 lớp khi đăng nhập trên thiết bị mới</b>
            <p>Tăng cường bảo mật cho tài khoản của bạn với xác thực 2 lớp</p>
          </div>
          <button
            type="button"
            className={`akh-switch${user.twoFactor ? " on" : ""}`}
            onClick={toggle2fa}
            aria-label="Bật/tắt xác thực 2 lớp"
          >
            <span className="akh-switch-dot" />
          </button>
        </div>
      </div>

      {modal === "edit" && (
        <EditUserModal
          user={user}
          onSave={(patch) => {
            onUpdateUser(patch);
            notify("Đã lưu thông tin người dùng", "success");
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "password" && (
        <ChangePasswordModal onClose={() => setModal(null)} notify={notify} />
      )}
      {modal === "2fa" && (
        <TwoFactorModal
          user={user}
          onEnable={(patch) => onUpdateUser({ ...patch, twoFactor: true })}
          onClose={() => setModal(null)}
          notify={notify}
        />
      )}
    </div>
  );
}
