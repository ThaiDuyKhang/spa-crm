import { useState, useRef } from "react";
import {
  X, ChevronDown, ChevronUp, Info, Trash2, Plus,
  CalendarDays, ImagePlus,
} from "lucide-react";
import { PROVINCES, WARDS_SG } from "../data/customers.js";
import "./StaffModal.css";

const SALARY_TYPES = ["Theo ca làm việc", "Theo giờ làm việc", "Theo ngày công chuẩn", "Cố định"];
const BONUS_KINDS = ["Thực hiện dịch vụ", "Tư vấn bán hàng"];
const OT_DAYS = ["Ngày thường", "Thứ 7", "Chủ nhật", "Ngày nghỉ", "Ngày lễ tết"];

/* ---------- Switch ---------- */
function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`sw${checked ? " on" : ""}`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="sw-knob" />
    </button>
  );
}

/* ---------- Field ---------- */
function Field({ label, children, span }) {
  return (
    <label className={`sm-field${span ? " sm-span" : ""}`}>
      <span className="sm-label">{label}</span>
      {children}
    </label>
  );
}

function DateField({ value, onChange, placeholder }) {
  return (
    <span className="sm-date">
      <input
        className="kv-input"
        placeholder={placeholder || "dd/MM/yyyy"}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <CalendarDays size={15} />
    </span>
  );
}

/* ---------- Collapse card ---------- */
function Card({ title, open, onToggle, right, children }) {
  return (
    <section className="sm-card">
      <button type="button" className="sm-card-head" onClick={onToggle}>
        <span className="sm-card-title">{title}</span>
        <span className="sm-card-right">
          {right}
          {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </span>
      </button>
      {open && <div className="sm-card-body">{children}</div>}
    </section>
  );
}

/* ---------- Bảng lương làm thêm giờ (dùng chung) ---------- */
function OvertimeTable({ rates, onChange }) {
  const setRate = (i, v) => onChange(rates.map((r, k) => (k === i ? v : r)));
  return (
    <table className="kv-table sm-mini-table">
      <thead>
        <tr>
          <th />
          {OT_DAYS.map((d) => <th key={d} style={{ textAlign: "center" }}>{d}</th>)}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Hệ số lương trên giờ</td>
          {rates.map((r, i) => (
            <td key={i} style={{ textAlign: "center" }}>
              <input className="kv-input sm-w90" value={r} onChange={(e) => setRate(i, e.target.value)} />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function OvertimeBlock({ label, enabled, onToggle, rates, onRates }) {
  return (
    <div className="sm-sub-block">
      <div className="sm-row-between">
        <span className="sm-sub-title">{label}</span>
        <Switch checked={enabled} onChange={onToggle} />
      </div>
      {enabled && <OvertimeTable rates={rates} onChange={onRates} />}
    </div>
  );
}

/* ---------- Cấu hình theo loại lương ---------- */
function SalaryTypeConfig({ sal, set }) {
  const upd = (patch) => set({ ...sal, ...patch });
  const advRow = (label, rows, setRows, cols) => (
    <>
      <table className="kv-table sm-mini-table">
        <thead>
          <tr>
            <th>{cols[0]}</th>
            {cols.slice(1).map((c) => <th key={c} style={{ textAlign: "center" }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td>
              <td style={{ textAlign: "center" }}>
                <input className="kv-input sm-w110" value={r.wage} onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, wage: e.target.value } : x))} />
              </td>
              {("sat" in r) && (
                <>
                  <td style={{ textAlign: "center" }}><button type="button" className="sm-plus" onClick={() => setRows(rows.map((x, k) => k === i ? { ...x, sat: x.sat === "+" ? "100%" : "+" } : x))}>{r.sat}</button></td>
                  <td style={{ textAlign: "center" }}><button type="button" className="sm-plus" onClick={() => setRows(rows.map((x, k) => k === i ? { ...x, sun: x.sun === "+" ? "100%" : "+" } : x))}>{r.sun}</button></td>
                </>
              )}
              <td style={{ textAlign: "center" }}>
                <input className="kv-input sm-w110" value={r.off} onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, off: e.target.value } : x))} />
              </td>
              <td style={{ textAlign: "center" }}>
                <input className="kv-input sm-w110" value={r.holiday} onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, holiday: e.target.value } : x))} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="sm-link" onClick={() => setRows([...rows, { name: "Mặc định", wage: "", sat: "+", sun: "+", off: "100%", holiday: "100%" }])}>
        Thêm điều kiện
      </button>
    </>
  );

  const advToggleRow = (label, wage, setWage, suffix, advOn, setAdvOn) => (
    <div className="sm-wage-row">
      <span className="sm-sub-title">{label}</span>
      <span className="sm-wage-input">
        <input className="kv-input" value={wage} onChange={(e) => setWage(e.target.value)} />
        <span className="sm-suffix">{suffix}</span>
      </span>
      <span className="sm-adv">
        <span>Thiết lập nâng cao</span>
        <Switch checked={advOn} onChange={setAdvOn} />
      </span>
    </div>
  );

  if (sal.type === "Theo ca làm việc") {
    return (
      <div className="sm-sub-block">
        {advToggleRow("Mức lương", sal.shiftWage, (v) => upd({ shiftWage: v }), "/ ca", sal.shiftAdvanced, (v) => upd({ shiftAdvanced: v }))}
        {sal.shiftAdvanced && advRow(null, sal.shiftRows, (r) => upd({ shiftRows: r }), ["Ca", "Lương/ca", "Thứ 7", "Chủ nhật", "Ngày nghỉ", "Ngày lễ tết"])}
        <OvertimeBlock label="Lương làm thêm giờ" enabled={sal.shiftOvertime} onToggle={(v) => upd({ shiftOvertime: v })} rates={sal.shiftOtRates} onRates={(r) => upd({ shiftOtRates: r })} />
      </div>
    );
  }
  if (sal.type === "Theo giờ làm việc") {
    return (
      <div className="sm-sub-block">
        {advToggleRow("Mức lương", sal.hourlyWage, (v) => upd({ hourlyWage: v }), "/ Giờ", sal.hourlyAdvanced, (v) => upd({ hourlyAdvanced: v }))}
        {sal.hourlyAdvanced && advRow(null, sal.hourlyRows, (r) => upd({ hourlyRows: r }), ["Mức lương", "Lương/giờ", "Thứ 7", "Chủ nhật", "Ngày nghỉ", "Ngày lễ tết"])}
        <OvertimeBlock label="Lương làm thêm giờ" enabled={sal.hourlyOvertime} onToggle={(v) => upd({ hourlyOvertime: v })} rates={sal.hourlyOtRates} onRates={(r) => upd({ hourlyOtRates: r })} />
      </div>
    );
  }
  if (sal.type === "Theo ngày công chuẩn") {
    return (
      <div className="sm-sub-block">
        {advToggleRow("Mức lương", sal.stdWage, (v) => upd({ stdWage: v }), "/ Kỳ lương", sal.stdAdvanced, (v) => upd({ stdAdvanced: v }))}
        {sal.stdAdvanced && advRow(null, sal.stdRows, (r) => upd({ stdRows: r }), ["Mức lương", "Lương/kỳ lương", "Ngày nghỉ", "Ngày lễ tết"])}
        <OvertimeBlock label="Lương làm thêm giờ" enabled={sal.stdOvertime} onToggle={(v) => upd({ stdOvertime: v })} rates={sal.stdOtRates} onRates={(r) => upd({ stdOtRates: r })} />
      </div>
    );
  }
  if (sal.type === "Cố định") {
    return (
      <div className="sm-sub-block">
        <div className="sm-wage-row">
          <span className="sm-sub-title">Mức lương</span>
          <span className="sm-wage-input">
            <input className="kv-input" value={sal.fixedWage} onChange={(e) => upd({ fixedWage: e.target.value })} />
            <span className="sm-suffix">/ Kỳ lương</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
}

/* ---------- Modal chính ---------- */
const defaultSalary = () => ({
  type: "",
  shiftWage: "", shiftAdvanced: false,
  shiftRows: [{ name: "Mặc định", wage: "0", sat: "+", sun: "+", off: "100%", holiday: "100%" }],
  shiftOvertime: false, shiftOtRates: ["150%", "200%", "200%", "200%", "300%"],
  hourlyWage: "", hourlyAdvanced: false,
  hourlyRows: [{ name: "Mặc định", wage: "", sat: "+", sun: "+", off: "100%", holiday: "100%" }],
  hourlyOvertime: false, hourlyOtRates: ["150%", "200%", "200%", "200%", "300%"],
  stdWage: "", stdAdvanced: false,
  stdRows: [{ name: "Mặc định", wage: "", off: "100%", holiday: "100%" }],
  stdOvertime: false, stdOtRates: ["150%", "200%", "200%", "200%", "300%"],
  fixedWage: "",
  template: "",
  bonusOn: true, bonusType: "Theo doanh thu cá nhân",
  bonusMethod: "Tính theo dịch vụ thực hiện - tư vấn bán hàng",
  bonusRows: [
    { kind: "Thực hiện dịch vụ", from: "0", value: "0 % Doanh thu" },
    { kind: "Tư vấn bán hàng", from: "0", value: "0 % Doanh thu" },
  ],
  commOn: true,
  commRows: [
    { kind: "Thực hiện dịch vụ", from: "0", table: "" },
    { kind: "Tư vấn bán hàng", from: "0", table: "" },
  ],
  allowOn: true,
  allowRows: [{ name: "", type: "", amount: "" }],
  deductOn: true,
  deductRows: [{ name: "", type: "Đi muộn", calc: "Theo số lần", amount: "0" }],
});

export default function StaffModal({ mode, staff, branches = [], onClose, onSave, notify }) {
  const isAdd = mode === "add";
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState(() => ({
    name: staff?.name || "",
    code: staff?.code || "",
    phone: staff?.phone || "",
    avatar: staff?.avatar || "",
    department: staff?.department || "",
    title: staff?.title || "",
    startDate: staff?.startDate || "",
    loginAccount: staff?.loginAccount || "",
    note: staff?.note || "",
    bankAccount: staff?.bankAccount || "",
    bankName: staff?.bankName || "",
    accountHolder: staff?.accountHolder || "",
    idCard: staff?.idCard || "",
    birthday: staff?.birthday || "",
    gender: staff?.gender || "",
    address: staff?.address || "",
    province: staff?.province || "",
    ward: staff?.ward || "",
    email: staff?.email || "",
    facebook: staff?.facebook || "",
  }));
  const [sal, setSal] = useState(() => ({ ...defaultSalary(), ...(staff?.salary || {}) }));
  const [openCards, setOpenCards] = useState({ job: true, bank: false, personal: true });
  const fileRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCard = (k) => setOpenCards((o) => ({ ...o, [k]: !o[k] }));

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notify("Mỗi ảnh không vượt quá 2Mb", "info");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("avatar", reader.result);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.name.trim()) {
      notify("Vui lòng nhập tên nhân viên", "info");
      return;
    }
    onSave({ ...form, name: form.name.trim(), salary: sal });
  };

  const sel = (value, onChange, options, placeholder) => (
    <select className="kv-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="kv-overlay" onMouseDown={onClose}>
      <div className="kv-modal sm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="kv-modal-head">
          <div>
            <div className="kv-modal-title">{isAdd ? "Thêm nhân viên" : "Cập nhật nhân viên"}</div>
            {!isAdd && <div className="sm-modal-sub">{form.name}</div>}
          </div>
          <button className="kv-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="sm-tabs">
          {["info", "salary"].map((t) => (
            <button
              key={t}
              className={`sm-tab${tab === t ? " active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "info" ? "Thông tin" : "Thiết lập lương"}
            </button>
          ))}
        </div>

        <div className="kv-modal-body sm-body">
          {tab === "info" && (
            <>
              <section className="sm-card">
                <div className="sm-card-title" style={{ marginBottom: 14 }}>Thông tin khởi tạo</div>
                <div className="sm-init-grid">
                  <div className="sm-init-form">
                    <Field label="Tên nhân viên">
                      <input className="kv-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
                    </Field>
                    <Field label="Mã nhân viên">
                      <input className="kv-input" value={form.code} onChange={(e) => set("code", e.target.value)} />
                    </Field>
                    <Field label="Số điện thoại">
                      <input className="kv-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                    </Field>
                  </div>
                  <div className="sm-avatar-box">
                    <span className="sm-avatar">
                      {form.avatar ? <img src={form.avatar} alt="" /> : <ImagePlus size={26} />}
                    </span>
                    <button type="button" className="kv-btn kv-btn-white sm-btn-sm" onClick={() => fileRef.current?.click()}>
                      Thêm ảnh
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
                    <span className="sm-avatar-hint">Mỗi ảnh không vượt quá<br />2Mb</span>
                  </div>
                </div>
              </section>

              <Card title="Thông tin công việc" open={openCards.job} onToggle={() => toggleCard("job")}>
                <div className="sm-grid-2">
                  <Field label="Phòng ban">
                    {sel(form.department, (v) => set("department", v),
                      ["Lễ tân", "Kỹ thuật viên", "Tư vấn", "Quản lý"], "Chọn Phòng ban")}
                  </Field>
                  <Field label="Chức danh">
                    {sel(form.title, (v) => set("title", v),
                      ["Nhân viên", "Chuyên viên", "Trưởng nhóm", "Quản lý"], "Chọn Chức danh")}
                  </Field>
                  <Field label="Ngày bắt đầu làm việc">
                    <DateField value={form.startDate} onChange={(v) => set("startDate", v)} />
                  </Field>
                  <Field label="Tài khoản đăng nhập">
                    {sel(form.loginAccount, (v) => set("loginAccount", v),
                      ["Tài khoản 1", "Tài khoản 2"], "Chọn Tài khoản")}
                  </Field>
                </div>
                <div className="sm-label-row">
                  <span className="sm-label">Thiết bị di động</span>
                  <Info size={14} style={{ color: "var(--muted-2)" }} />
                </div>
                <Field label="Ghi chú" span>
                  <input className="kv-input" value={form.note} onChange={(e) => set("note", e.target.value)} />
                </Field>
              </Card>

              <Card title="Thông tin ngân hàng" open={openCards.bank} onToggle={() => toggleCard("bank")}>
                <div className="sm-grid-2">
                  <Field label="Số tài khoản">
                    <input className="kv-input" value={form.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} />
                  </Field>
                  <Field label="Ngân hàng">
                    {sel(form.bankName, (v) => set("bankName", v),
                      ["Vietcombank", "Techcombank", "BIDV", "VietinBank", "MB", "ACB"], "Chọn ngân hàng")}
                  </Field>
                  <Field label="Chủ tài khoản" span>
                    <input className="kv-input" value={form.accountHolder} onChange={(e) => set("accountHolder", e.target.value)} />
                  </Field>
                </div>
              </Card>

              <Card title="Thông tin cá nhân" open={openCards.personal} onToggle={() => toggleCard("personal")}>
                <div className="sm-grid-3">
                  <Field label="Số CMND/CCCD">
                    <input className="kv-input" value={form.idCard} onChange={(e) => set("idCard", e.target.value)} />
                  </Field>
                  <Field label="Ngày sinh">
                    <DateField value={form.birthday} onChange={(v) => set("birthday", v)} />
                  </Field>
                  <div className="sm-field">
                    <span className="sm-label">Giới tính</span>
                    <div className="sm-gender">
                      {["Nam", "Nữ"].map((g) => (
                        <label className="kv-radio" key={g}>
                          <input type="radio" checked={form.gender === g} onChange={() => set("gender", g)} />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                  <Field label="Địa chỉ" span>
                    <input className="kv-input" value={form.address} onChange={(e) => set("address", e.target.value)} />
                  </Field>
                  <Field label="Tỉnh/Thành phố">
                    {sel(form.province, (v) => set("province", v), PROVINCES, "Chọn Tỉnh/Thành phố")}
                  </Field>
                  <Field label="Xã/Phường/Đặc khu">
                    {sel(form.ward, (v) => set("ward", v), WARDS_SG, "Chọn Xã/Phường/Đặc khu")}
                  </Field>
                  <Field label="Email">
                    <input className="kv-input" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </Field>
                  <Field label="Facebook">
                    <input className="kv-input" value={form.facebook} onChange={(e) => set("facebook", e.target.value)} />
                  </Field>
                </div>
              </Card>
            </>
          )}

          {tab === "salary" && (
            <>
              <section className="sm-card">
                <div className="sm-card-title" style={{ marginBottom: 4 }}>Lương chính</div>
                <div className="sm-grid-2" style={{ marginTop: 12 }}>
                  <Field label="Loại lương">
                    <select
                      className="kv-select"
                      value={sal.type}
                      onChange={(e) => setSal({ ...sal, type: e.target.value })}
                    >
                      <option value="">Chọn Loại lương</option>
                      {SALARY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  {sal.type && (
                    <div className="sm-field">
                      <span className="sm-label">&nbsp;</span>
                      <Info size={15} style={{ color: "var(--muted-2)", marginTop: 8 }} />
                    </div>
                  )}
                </div>
                <SalaryTypeConfig sal={sal} set={setSal} />
              </section>

              <section className="sm-card">
                <div className="sm-label-row" style={{ marginBottom: 12 }}>
                  <span className="sm-card-title">Mẫu lương</span>
                  <Info size={14} style={{ color: "var(--muted-2)" }} />
                </div>
                {sel(sal.template, (v) => setSal({ ...sal, template: v }), [], "Chọn mẫu lương có sẵn")}
              </section>

              <section className="sm-card">
                <div className="sm-sec-head">
                  <div>
                    <div className="sm-card-title">Thưởng</div>
                    <div className="sm-sec-desc">Thiết lập thưởng theo doanh thu cho nhân viên</div>
                  </div>
                  <Switch checked={sal.bonusOn} onChange={(v) => setSal({ ...sal, bonusOn: v })} />
                </div>
                {sal.bonusOn && (
                  <>
                    <div className="sm-grid-2" style={{ marginTop: 12 }}>
                      <Field label="Loại thưởng">
                        {sel(sal.bonusType, (v) => setSal({ ...sal, bonusType: v }),
                          ["Theo doanh thu cá nhân", "Theo doanh thu chi nhánh"])}
                      </Field>
                      <div className="sm-field">
                        <span className="sm-label">Hình thức <Info size={13} style={{ color: "var(--muted-2)", verticalAlign: -2 }} /></span>
                        {sel(sal.bonusMethod, (v) => setSal({ ...sal, bonusMethod: v }),
                          ["Tính theo dịch vụ thực hiện - tư vấn bán hàng", "Tính theo tổng doanh thu"])}
                      </div>
                    </div>
                    <table className="kv-table sm-mini-table" style={{ marginTop: 12 }}>
                      <thead>
                        <tr>
                          <th>Loại hình</th>
                          <th>Doanh thu <Info size={13} style={{ color: "var(--muted-2)", verticalAlign: -2 }} /></th>
                          <th>Thưởng</th>
                          <th style={{ width: 40 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {sal.bonusRows.map((r, i) => (
                          <tr key={i}>
                            <td>{sel(r.kind, (v) => setSal({ ...sal, bonusRows: sal.bonusRows.map((x, k) => k === i ? { ...x, kind: v } : x) }), BONUS_KINDS)}</td>
                            <td>
                              <span className="sm-range">
                                <span className="sm-range-label">Từ</span>
                                <input className="kv-input" value={r.from} onChange={(e) => setSal({ ...sal, bonusRows: sal.bonusRows.map((x, k) => k === i ? { ...x, from: e.target.value } : x) })} />
                              </span>
                            </td>
                            <td>
                              <input className="kv-input" value={r.value} onChange={(e) => setSal({ ...sal, bonusRows: sal.bonusRows.map((x, k) => k === i ? { ...x, value: e.target.value } : x) })} />
                            </td>
                            <td>
                              <button type="button" className="sm-trash" onClick={() => setSal({ ...sal, bonusRows: sal.bonusRows.filter((_, k) => k !== i) })}>
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button type="button" className="sm-link" onClick={() => setSal({ ...sal, bonusRows: [...sal.bonusRows, { kind: BONUS_KINDS[0], from: "0", value: "0 % Doanh thu" }] })}>
                      Thêm thưởng
                    </button>
                  </>
                )}
              </section>

              <section className="sm-card">
                <div className="sm-sec-head">
                  <div>
                    <div className="sm-card-title">Hoa hồng</div>
                    <div className="sm-sec-desc">Thiết lập mức hoa hồng theo sản phẩm hoặc dịch vụ</div>
                  </div>
                  <Switch checked={sal.commOn} onChange={(v) => setSal({ ...sal, commOn: v })} />
                </div>
                {sal.commOn && (
                  <>
                    <table className="kv-table sm-mini-table" style={{ marginTop: 12 }}>
                      <thead>
                        <tr>
                          <th>Loại hình</th>
                          <th>Doanh thu <Info size={13} style={{ color: "var(--muted-2)", verticalAlign: -2 }} /></th>
                          <th>Hoa hồng thụ hưởng</th>
                          <th style={{ width: 40 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {sal.commRows.map((r, i) => (
                          <tr key={i}>
                            <td>{sel(r.kind, (v) => setSal({ ...sal, commRows: sal.commRows.map((x, k) => k === i ? { ...x, kind: v } : x) }), BONUS_KINDS)}</td>
                            <td>
                              <span className="sm-range">
                                <span className="sm-range-label">Từ</span>
                                <input className="kv-input" value={r.from} onChange={(e) => setSal({ ...sal, commRows: sal.commRows.map((x, k) => k === i ? { ...x, from: e.target.value } : x) })} />
                              </span>
                            </td>
                            <td>{sel(r.table, (v) => setSal({ ...sal, commRows: sal.commRows.map((x, k) => k === i ? { ...x, table: v } : x) }), [], "Chọn Bảng hoa hồng")}</td>
                            <td>
                              <button type="button" className="sm-trash" onClick={() => setSal({ ...sal, commRows: sal.commRows.filter((_, k) => k !== i) })}>
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button type="button" className="sm-link" onClick={() => setSal({ ...sal, commRows: [...sal.commRows, { kind: BONUS_KINDS[0], from: "0", table: "" }] })}>
                      Thêm hoa hồng
                    </button>
                  </>
                )}
              </section>

              <section className="sm-card">
                <div className="sm-sec-head">
                  <div>
                    <div className="sm-card-title">Phụ cấp</div>
                    <div className="sm-sec-desc">Thiết lập khoản hỗ trợ làm việc như ăn trưa, đi lại, điện thoại, ...</div>
                  </div>
                  <Switch checked={sal.allowOn} onChange={(v) => setSal({ ...sal, allowOn: v })} />
                </div>
                {sal.allowOn && (
                  <>
                    <table className="kv-table sm-mini-table" style={{ marginTop: 12 }}>
                      <thead>
                        <tr><th>Tên phụ cấp</th><th>Loại phụ cấp</th><th>Mức phụ cấp</th><th style={{ width: 40 }} /></tr>
                      </thead>
                      <tbody>
                        {sal.allowRows.map((r, i) => (
                          <tr key={i}>
                            <td>{sel(r.name, (v) => setSal({ ...sal, allowRows: sal.allowRows.map((x, k) => k === i ? { ...x, name: v } : x) }), ["Ăn trưa", "Đi lại", "Điện thoại", "Chuyên cần"], "Chọn Loại phụ cấp")}</td>
                            <td><input className="kv-input" value={r.type} onChange={(e) => setSal({ ...sal, allowRows: sal.allowRows.map((x, k) => k === i ? { ...x, type: e.target.value } : x) })} /></td>
                            <td><input className="kv-input" value={r.amount} onChange={(e) => setSal({ ...sal, allowRows: sal.allowRows.map((x, k) => k === i ? { ...x, amount: e.target.value } : x) })} /></td>
                            <td>
                              <button type="button" className="sm-trash" onClick={() => setSal({ ...sal, allowRows: sal.allowRows.filter((_, k) => k !== i) })}>
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button type="button" className="sm-link" onClick={() => setSal({ ...sal, allowRows: [...sal.allowRows, { name: "", type: "", amount: "" }] })}>
                      Thêm phụ cấp
                    </button>
                  </>
                )}
              </section>

              <section className="sm-card">
                <div className="sm-sec-head">
                  <div>
                    <div className="sm-card-title">Giảm trừ</div>
                    <div className="sm-sec-desc">Thiết lập khoản giảm trừ như đi muộn, về sớm, vi phạm nội quy, ...</div>
                  </div>
                  <Switch checked={sal.deductOn} onChange={(v) => setSal({ ...sal, deductOn: v })} />
                </div>
                {sal.deductOn && (
                  <>
                    <table className="kv-table sm-mini-table" style={{ marginTop: 12 }}>
                      <thead>
                        <tr><th>Tên giảm trừ</th><th>Loại giảm trừ</th><th colSpan={2}>Khoản giảm trừ</th><th style={{ width: 40 }} /></tr>
                      </thead>
                      <tbody>
                        {sal.deductRows.map((r, i) => (
                          <tr key={i}>
                            <td>{sel(r.name, (v) => setSal({ ...sal, deductRows: sal.deductRows.map((x, k) => k === i ? { ...x, name: v } : x) }), ["Đi muộn", "Về sớm", "Vi phạm nội quy"], "Chọn Loại giảm trừ")}</td>
                            <td>{sel(r.type, (v) => setSal({ ...sal, deductRows: sal.deductRows.map((x, k) => k === i ? { ...x, type: v } : x) }), ["Đi muộn", "Về sớm", "Vi phạm nội quy"])}</td>
                            <td>{sel(r.calc, (v) => setSal({ ...sal, deductRows: sal.deductRows.map((x, k) => k === i ? { ...x, calc: v } : x) }), ["Theo số lần", "Theo số tiền"])}</td>
                            <td><input className="kv-input sm-w90" value={r.amount} onChange={(e) => setSal({ ...sal, deductRows: sal.deductRows.map((x, k) => k === i ? { ...x, amount: e.target.value } : x) })} /></td>
                            <td>
                              <button type="button" className="sm-trash" onClick={() => setSal({ ...sal, deductRows: sal.deductRows.filter((_, k) => k !== i) })}>
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button type="button" className="sm-link" onClick={() => setSal({ ...sal, deductRows: [...sal.deductRows, { name: "", type: "Đi muộn", calc: "Theo số lần", amount: "0" }] })}>
                      Thêm giảm trừ
                    </button>
                  </>
                )}
              </section>
            </>
          )}
        </div>

        <div className="kv-modal-foot sm-foot">
          <button className="kv-btn kv-btn-white" onClick={onClose}>Bỏ qua</button>
          {tab === "salary" && (
            <button className="kv-btn kv-btn-white" onClick={() => { save(); notify("Đã lưu và tạo mẫu lương mới", "info"); }}>
              Lưu và tạo mẫu lương mới
            </button>
          )}
          <button className="kv-btn kv-btn-primary" onClick={save}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
