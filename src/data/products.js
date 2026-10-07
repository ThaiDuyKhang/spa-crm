// Helpers dùng chung cho trang Hàng hóa / Thiết lập giá (kiểu KiotViet)

export const KIND_LABEL = { service: "Dịch vụ", product: "Hàng hóa" };

export function initialsCode(name) {
  const s = (name || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return s.map((w) => w[0]).join("");
}

/**
 * Gộp services (Dịch vụ) + products (Hàng hóa) của app cũ thành danh sách
 * hàng hóa thống nhất cho các trang kiểu KiotViet.
 * Mỗi item: { kind, id, code, name, categoryId, price, cost, stock, duration,
 *              unit, brand, status, allowSale, description, note, _raw }
 */
export function buildProductItems(services, products) {
  const used = new Set();
  const uniqueCode = (base) => {
    let code = base || "hh";
    let i = 2;
    while (used.has(code)) code = `${base}-${i++}`;
    used.add(code);
    return code;
  };
  const list = [];
  (services || []).forEach((s) => {
    const code = s.code ? uniqueCode(String(s.code)) : uniqueCode(initialsCode(s.name) || "dv");
    list.push({
      kind: "service", id: s.id, code,
      name: s.name, categoryId: s.categoryId ?? null,
      price: Number(s.price) || 0, cost: 0, stock: null,
      duration: Number(s.duration) || 0, brand: s.brand || "",
      status: s.status || "active", allowSale: s.allowSale !== false,
      description: s.description || "", note: s.note || "",
      _raw: s,
    });
  });
  (products || []).forEach((p) => {
    const code = p.code ? uniqueCode(String(p.code)) : uniqueCode(initialsCode(p.name) || "hh");
    list.push({
      kind: "product", id: p.id, code,
      name: p.name, categoryId: p.categoryId ?? null,
      price: Number(p.price) || 0, cost: Number(p.cost) || 0, stock: Number(p.stock) || 0,
      duration: null, unit: p.unit || "Cái", brand: p.brand || "",
      status: p.status || "active", allowSale: p.allowSale !== false,
      description: p.description || "", note: p.note || "",
      _raw: p,
    });
  });
  return list;
}

export const itemKey = (it) => `${it.kind}:${it.id}`;

export function formatMoney(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("vi-VN");
}
