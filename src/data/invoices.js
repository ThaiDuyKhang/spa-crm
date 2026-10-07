// Dữ liệu hóa đơn dịch vụ — dùng cho trang Hóa đơn kiểu KiotViet
// và tab "Lịch sử giao dịch" của trang Vị trí/phòng.
import { formatMoney } from "./customers.js";

function seeded(n) {
  let s = n;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const STAFF_POOL = ["Trâm", "Hải Yến", "Minh Khôi", "Lan Chi", "Đức Anh"];
const BRANCH_NAMES = { all: "trung tâm", q1: "Quận 1", q7: "Quận 7", dn: "Đà Nẵng" };

function fmtDateTime(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function summarize(items) {
  const totalQty = items.reduce((s, it) => s + (it.qty || 0), 0);
  const totalAmount = items.reduce((s, it) => s + it.price * (it.qty || 0), 0);
  const totalDiscount = items.reduce((s, it) => s + (it.discount || 0), 0);
  const amountDue = totalAmount - totalDiscount;
  return { totalQty, totalAmount, totalDiscount, amountDue, paid: amountDue };
}

function toInvoiceShape(o) {
  const s = summarize(o.items);
  return { ...o, ...s };
}

// Cache theo key để 2 adapter (Vị trí, Hóa đơn) dùng chung 1 dataset
let cache = { key: "", data: [] };

export function buildInvoices({ customers = [], services = [], products = [], orders = [], locations = [], count = 60 }) {
  const key = [orders.length, customers.length, services.length, products.length, locations.length, count].join("-");
  if (cache.key === key) return cache.data;

  const rand = seeded(20260723);
  const custList = customers.length ? customers : [{ id: 0, name: "Khách lẻ", phone: "" }];
  const now = Date.now();
  const list = [];

  for (let i = 0; i < count; i++) {
    const c = custList[Math.floor(rand() * custList.length)];
    const items = [];

    // 1-2 dịch vụ
    const svcCount = 1 + (rand() < 0.35 ? 1 : 0);
    for (let k = 0; k < svcCount && services.length; k++) {
      const sv = services[Math.floor(rand() * services.length)];
      const discount = rand() < 0.18 ? Math.round(sv.price * 0.1) : 0;
      items.push({
        type: "service",
        refId: sv.id,
        sku: "SP" + String(28 + Math.floor(rand() * 900)).padStart(6, "0"),
        name: sv.name,
        qty: 1,
        price: sv.price,
        discount,
        staffConsult: rand() < 0.5 ? "" : STAFF_POOL[Math.floor(rand() * STAFF_POOL.length)],
        staffService: STAFF_POOL[Math.floor(rand() * STAFF_POOL.length)],
      });
    }
    // thỉnh thoảng thêm sản phẩm bán lẻ
    if (rand() < 0.3 && products.length) {
      const p = products[Math.floor(rand() * products.length)];
      const qty = 1 + Math.floor(rand() * 2);
      items.push({
        type: "product",
        refId: p.id,
        sku: "SP" + String(100 + Math.floor(rand() * 900)).padStart(6, "0"),
        name: p.name,
        qty,
        price: p.price,
        discount: 0,
        staffConsult: "",
        staffService: "",
      });
    }
    if (items.length === 0) continue;

    const daysAgo = Math.floor(rand() * 75);
    const ts = now - daysAgo * 86400000 - Math.floor(rand() * 12) * 3600000;
    const d = new Date(ts);
    d.setHours(8 + Math.floor(rand() * 12), Math.floor(rand() * 60), 0, 0);

    const loc = locations.length ? locations[i % locations.length] : null;
    const branch = c.branch || ["q1", "q7", "dn"][Math.floor(rand() * 3)];

    list.push({
      code: "", // gán sau khi sort
      time: fmtDateTime(d),
      ts: d.getTime(),
      customerId: c.id,
      customerName: c.name,
      customerPhone: (c.phone || "").replace(/\s/g, ""),
      branch,
      branchName: BRANCH_NAMES[branch] || branch,
      cashier: "Chưa xác định",
      creator: "Trâm(DEL)",
      channel: "Khách đến trực tiếp",
      priceList: "Bảng giá chung",
      status: rand() < 0.92 ? "Hoàn thành" : "Đã hủy",
      note: "",
      locationId: loc ? loc.id : null,
      locationName: loc ? loc.name : "",
      items,
      payments: [],
    });
  }

  // Đơn từ POS (orders cũ) -> hóa đơn
  orders.forEach((o, idx) => {
    const c = custList.find((x) => x.id === o.customerId) || { id: o.customerId, name: "Khách lẻ", phone: "" };
    const items = (o.items || []).map((it, k) => ({
      type: it.type,
      refId: it.refId,
      sku: "SP" + String(500 + idx * 10 + k).padStart(6, "0"),
      name: it.name,
      qty: it.qty || 1,
      price: it.price,
      discount: 0,
      staffConsult: "",
      staffService: STAFF_POOL[(idx + k) % STAFF_POOL.length],
    }));
    const d = new Date(now - idx * 86400000);
    d.setHours(10, 30, 0, 0);
    const loc = locations.length ? locations[idx % locations.length] : null;
    list.push({
      code: "",
      time: fmtDateTime(d),
      ts: d.getTime(),
      customerId: c.id,
      customerName: c.name,
      customerPhone: (c.phone || "").replace(/\s/g, ""),
      branch: o.branch || "q1",
      branchName: BRANCH_NAMES[o.branch] || o.branch,
      cashier: "Chưa xác định",
      creator: "Trâm(DEL)",
      channel: "Khách đến trực tiếp",
      priceList: "Bảng giá chung",
      status: "Hoàn thành",
      note: "",
      locationId: loc ? loc.id : null,
      locationName: loc ? loc.name : "",
      items,
      payments: [],
    });
  });

  // sort mới nhất trước, gán mã HD000xxx
  list.sort((a, b) => b.ts - a.ts);
  const total = list.length;
  list.forEach((inv, i) => {
    inv.code = "HD" + String(100 + total - i).padStart(6, "0");
    const s = summarize(inv.items);
    Object.assign(inv, s);
    inv.payments = [{ time: inv.time, method: "Tiền mặt", amount: s.amountDue, creator: inv.creator }];
  });

  cache = { key, data: list.map(toInvoiceShape) };
  return cache.data;
}

export function invoicesByLocation(invoices, locationId) {
  return invoices
    .filter((inv) => inv.locationId != null && String(inv.locationId) === String(locationId))
    .sort((a, b) => b.ts - a.ts);
}

// Hóa đơn của 1 khách hàng (customerId là id số của app cũ)
export function invoicesByCustomer(invoices, customerId) {
  return invoices
    .filter((inv) => String(inv.customerId) === String(customerId))
    .sort((a, b) => b.ts - a.ts);
}

// Phiếu thu tự động sinh từ thanh toán của hóa đơn (mã TTHDxxxxxx)
export function vouchersByCustomer(invoices, customerId) {
  return invoicesByCustomer(invoices, customerId)
    .flatMap((inv) =>
      (inv.payments || []).map((p) => ({
        code: "TTHD" + String(inv.code).replace(/^HD/, ""),
        time: p.time,
        ts: inv.ts,
        type: "Thanh toán",
        amount: -Math.abs(p.amount || 0),
        method: p.method,
        invoiceCode: inv.code,
      }))
    )
    .sort((a, b) => b.ts - a.ts);
}

export { formatMoney };
