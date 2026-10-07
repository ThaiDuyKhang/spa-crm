import { useMemo, useState } from "react";
import {
  UserRound, Star, IdCard, Pencil, Trash2, Lock, LockOpen, Printer,
  Download, FileDown, CircleDollarSign, SlidersHorizontal,
} from "lucide-react";
import { formatMoney } from "../data/customers.js";
import "./CustomerDetail.css";

const TABS = [
  { key: "overview", label: "Tổng quan" },
  { key: "history", label: "Lịch sử bán/trả hàng" },
  { key: "services", label: "Lịch làm dịch vụ" },
  { key: "debt", label: "Công nợ" },
  { key: "packages", label: "Gói dịch vụ, liệu trình" },
  { key: "cards", label: "Thẻ tài khoản" },
];

const BRANCH_NAMES = {
  all: "Tất cả chi nhánh",
  q1: "Chi nhánh Quận 1",
  q7: "Chi nhánh Quận 7",
  dn: "Chi nhánh Đà Nẵng",
};

const onlyDate = (time) => String(time || "").split(" ")[0];

function InfoCell({ label, value }) {
  const empty = value === "" || value == null;
  return (
    <div className="cd-info-cell">
      <div className="cd-info-label">{label}</div>
      <div className={`cd-info-value${empty ? " empty" : ""}`}>{empty ? "Chưa có" : value}</div>
    </div>
  );
}

function EmptyRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="cd-empty">Chưa có dữ liệu</td>
    </tr>
  );
}

/* ================= Tab: Tổng quan (hình 1) ================= */
function OverviewTab({ customer, invoices, branchName, createdDate, onEdit, onDelete, onToggleActive, notify }) {
  const totalSold = invoices.reduce((s, inv) => s + (inv.amountDue || 0), 0);
  const latest = invoices[0];
  const latestSummary = latest
    ? latest.items.map((it) => `${it.name} x ${it.qty}`).join(", ")
    : "";

  return (
    <div className="cd-overview">
      <div className="cd-ov-head">
        <div className="cd-ov-id">
          <div className="cd-avatar"><UserRound size={40} strokeWidth={1.6} /></div>
          <div>
            <div className="cd-ov-name">{customer.fullName || customer.name}</div>
            <div className="cd-ov-sub">
              <span><IdCard size={14} /> {customer.id}</span>
              <span><Star size={14} /> {customer.source || "Khách đến trực tiếp"}</span>
            </div>
          </div>
        </div>
        <div className="cd-ov-right">
          <div>{branchName}</div>
          <div className="cd-muted">Ngày tạo: {createdDate}</div>
        </div>
      </div>

      <div className="cd-stats">
        <span>Tổng bán: <b>{formatMoney(totalSold)}</b></span>
        <span>Ghé thăm: <b>{invoices.length}</b></span>
        <span>Số dư thẻ: <b>0</b></span>
        <span>Nợ: <b>0</b></span>
      </div>

      <div className="cd-ov-grid">
        <InfoCell label="Số điện thoại" value={(customer.phone || "").replace(/\s/g, "")} />
        <InfoCell label="Sinh nhật" value={customer.birthday ? customer.birthday : "--/--/----"} />
        <InfoCell label="Giới tính" value={customer.gender} />
        <InfoCell label="Email" value={customer.email} />
        <InfoCell label="Facebook" value={customer.facebook} />
      </div>
      <div className="cd-ov-address">
        <div className="cd-info-label">Địa chỉ</div>
        <div className={`cd-info-value${customer.address ? "" : " empty"}`}>
          {customer.address || "Chưa có"}
        </div>
      </div>

      <div className="cd-activity">
        <div className="cd-activity-title">Hoạt động gần nhất</div>
        {latest ? (
          <div className="cd-activity-row">
            <div>
              <div>{latestSummary}</div>
              <div className="cd-muted">{onlyDate(latest.time)}</div>
            </div>
            <div className="cd-activity-right">
              <span>{latest.cashier || "Chưa xác định"}</span>
              <b>{formatMoney(latest.amountDue)}</b>
            </div>
          </div>
        ) : (
          <div className="cd-muted">Chưa có hoạt động nào</div>
        )}
      </div>

      <div className="cd-ov-foot">
        <button className="kv-btn kv-btn-ghost cd-danger" onClick={onDelete}>
          <Trash2 size={15} /> Xóa
        </button>
        <div className="cd-ov-actions">
          <button className="kv-btn kv-btn-primary" onClick={onEdit}>
            <Pencil size={15} /> Chỉnh sửa
          </button>
          <button className="kv-btn kv-btn-white" onClick={onToggleActive}>
            {customer.status === "Ngừng hoạt động" ? <LockOpen size={15} /> : <Lock size={15} />}
            {customer.status === "Ngừng hoạt động" ? "Kích hoạt" : "Ngừng hoạt động"}
          </button>
          <button className="kv-btn kv-btn-white" onClick={() => notify("Đang chuẩn bị in tem mã...")}>
            <Printer size={15} /> In tem mã
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Tab: Lịch sử bán/trả hàng ================= */
function HistoryTab({ invoices, onOpenInvoice, notify }) {
  return (
    <div>
      <table className="kv-table cd-table">
        <thead>
          <tr>
            <th>Mã hóa đơn</th>
            <th>Thời gian</th>
            <th>Thu ngân</th>
            <th style={{ textAlign: "right" }}>Tổng cộng</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.code}>
              <td>
                <button className="cd-link" onClick={() => onOpenInvoice(inv.code)}>
                  {inv.code}
                </button>
              </td>
              <td>{inv.time}</td>
              <td>{inv.cashier || "Chưa xác định"}</td>
              <td style={{ textAlign: "right" }}>{formatMoney(inv.amountDue)}</td>
            </tr>
          ))}
          {invoices.length === 0 && <EmptyRow colSpan={4} />}
        </tbody>
      </table>
      <button className="kv-btn kv-btn-white cd-export" onClick={() => notify("Xuất file lịch sử bán hàng đang phát triển")}>
        <Download size={15} /> Xuất file
      </button>
    </div>
  );
}

/* ================= Tab: Lịch làm dịch vụ (hình 3) ================= */
function ServicesTab({ invoices, onOpenInvoice }) {
  const rows = invoices.flatMap((inv) =>
    inv.items
      .filter((it) => it.type === "service")
      .map((it, k) => ({ inv, it, key: `${inv.code}-${k}` }))
  );
  return (
    <table className="kv-table cd-table">
      <thead>
        <tr>
          <th>Ngày thực hiện</th>
          <th>Tên dịch vụ</th>
          <th>Nhân viên thực hiện</th>
          <th>Trạng thái</th>
          <th>Hình ảnh</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ inv, it, key }) => (
          <tr key={key}>
            <td>
              <div>B{String(inv.code).replace(/^HD/, "")} {onlyDate(inv.time)}</div>
              <button className="cd-link" onClick={() => onOpenInvoice(inv.code)}>
                {inv.code}
              </button>
              <div className="cd-muted">Chi nhánh {inv.branchName || ""}</div>
            </td>
            <td>{it.name}</td>
            <td>{it.staffService || ""}</td>
            <td>Đã xong</td>
            <td />
          </tr>
        ))}
        {rows.length === 0 && <EmptyRow colSpan={5} />}
      </tbody>
    </table>
  );
}

/* ================= Tab: Công nợ (hình 4) ================= */
function DebtTab({ invoices, onOpenInvoice, onOpenVoucher, notify }) {
  // gộp phiếu thu + hóa đơn, tính dư nợ chạy
  const rows = useMemo(() => {
    const list = [];
    let balance = 0;
    const sorted = [...invoices].sort((a, b) => a.ts - b.ts); // cũ -> mới để tính dư nợ
    sorted.forEach((inv) => {
      balance += inv.amountDue || 0;
      const sale = { kind: "sale", code: inv.code, time: inv.time, label: "Bán hàng", amount: inv.amountDue || 0, balance, inv };
      balance -= inv.amountDue || 0;
      const pay = { kind: "pay", code: "TTHD" + String(inv.code).replace(/^HD/, ""), time: inv.time, label: "Thanh toán", amount: -(inv.amountDue || 0), balance, inv };
      list.push(pay, sale); // hiển thị phiếu thu trước như mẫu
    });
    return list.reverse();
  }, [invoices]);

  return (
    <div>
      <table className="kv-table cd-table">
        <thead>
          <tr>
            <th>Mã phiếu</th>
            <th>Thời gian</th>
            <th>Loại</th>
            <th style={{ textAlign: "right" }}>Số tiền</th>
            <th style={{ textAlign: "right" }}>Dư nợ khách hàng</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.code}-${i}`}>
              <td>
                <button
                  className="cd-link"
                  onClick={() => (r.kind === "pay" ? onOpenVoucher(r) : onOpenInvoice(r.code))}
                >
                  {r.code}
                </button>
              </td>
              <td>{r.time}</td>
              <td>{r.label}</td>
              <td style={{ textAlign: "right" }}>{formatMoney(r.amount)}</td>
              <td style={{ textAlign: "right" }}>{formatMoney(r.balance)}</td>
            </tr>
          ))}
          {rows.length === 0 && <EmptyRow colSpan={5} />}
        </tbody>
      </table>
      <div className="cd-debt-foot">
        <div>
          <button className="kv-btn kv-btn-white" onClick={() => notify("Xuất file giao dịch đang phát triển")}>
            <FileDown size={15} /> Xuất file giao dịch
          </button>{" "}
          <button className="kv-btn kv-btn-white" onClick={() => notify("Xuất file công nợ đang phát triển")}>
            <FileDown size={15} /> Xuất file công nợ
          </button>
        </div>
        <div>
          <button className="kv-btn kv-btn-primary" onClick={() => notify("Điều chỉnh công nợ đang phát triển")}>
            <SlidersHorizontal size={15} /> Điều chỉnh
          </button>{" "}
          <button className="kv-btn kv-btn-white" onClick={() => notify("Thanh toán công nợ đang phát triển")}>
            <CircleDollarSign size={15} /> Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Tab: Gói dịch vụ, liệu trình (hình 6) ================= */
function PackagesTab({ packages }) {
  return (
    <table className="kv-table cd-table">
      <thead>
        <tr>
          <th>Tên gói</th>
          <th>Mã gói</th>
          <th>Tổng</th>
          <th>Còn lại</th>
          <th>Giá trị còn lại</th>
          <th>Ngày hết hạn</th>
        </tr>
      </thead>
      <tbody>
        {packages.map((p, i) => (
          <tr key={i}>
            <td>{p.name}</td>
            <td>{p.code}</td>
            <td>{formatMoney(p.total)}</td>
            <td>{formatMoney(p.remaining)}</td>
            <td>{formatMoney(p.remainingValue)}</td>
            <td>{p.expiry || "—"}</td>
          </tr>
        ))}
        {packages.length === 0 && <EmptyRow colSpan={6} />}
      </tbody>
    </table>
  );
}

/* ================= Tab: Thẻ tài khoản (hình 7) ================= */
function CardsTab() {
  return (
    <table className="kv-table cd-table">
      <thead>
        <tr>
          <th>Tên thẻ</th>
          <th>Mã thẻ</th>
          <th>Giá trị thẻ</th>
          <th>Còn lại</th>
          <th>Ngày hết hạn</th>
        </tr>
      </thead>
      <tbody>
        <EmptyRow colSpan={5} />
      </tbody>
    </table>
  );
}

/* ================= Chi tiết khách hàng xổ xuống ================= */
export default function CustomerDetail({
  customer, invoices, packages,
  onOpenInvoice, onOpenVoucher, onEdit, onDelete, onToggleActive, notify,
}) {
  const [tab, setTab] = useState("overview");
  const branchName = BRANCH_NAMES[customer.branch] || customer.branch || "—";
  const createdDate = invoices.length
    ? onlyDate([...invoices].sort((a, b) => a.ts - b.ts)[0].time)
    : "—";

  return (
    <div className="cd-wrap">
      <div className="cd-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`cd-tab${tab === t.key ? " active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="cd-tab-body">
        {tab === "overview" && (
          <OverviewTab
            customer={customer}
            invoices={invoices}
            branchName={branchName}
            createdDate={createdDate}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            notify={notify}
          />
        )}
        {tab === "history" && (
          <HistoryTab invoices={invoices} onOpenInvoice={onOpenInvoice} notify={notify} />
        )}
        {tab === "services" && (
          <ServicesTab invoices={invoices} onOpenInvoice={onOpenInvoice} />
        )}
        {tab === "debt" && (
          <DebtTab
            invoices={invoices}
            onOpenInvoice={onOpenInvoice}
            onOpenVoucher={onOpenVoucher}
            notify={notify}
          />
        )}
        {tab === "packages" && <PackagesTab packages={packages} />}
        {tab === "cards" && <CardsTab />}
      </div>
    </div>
  );
}
