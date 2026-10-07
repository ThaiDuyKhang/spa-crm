// Constants dùng chung cho trang Khách hàng kiểu KiotViet.
// (Dữ liệu khách hàng thật lấy từ state của app cũ — xem KiotCustomersSection.jsx)
export const CUSTOMER_GROUPS = ["Tất cả", "Khách lẻ", "Khách VIP", "Khách thân thiết", "Khách mới"];
export const CUSTOMER_SOURCES = ["Khách đến trực tiếp", "Facebook", "Zalo", "Giới thiệu", "Website", "Khác"];
export const CUSTOMER_TYPES = ["Tất cả", "Cá nhân", "Công ty"];
export const GENDERS = ["Tất cả", "Nam", "Nữ", "Khác"];
export const STATUSES = ["Đang hoạt động", "Ngừng hoạt động", "Tất cả"];

export const PROVINCES = [
  "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng", "Bình Dương",
  "Đồng Nai", "Khánh Hòa", "Lâm Đồng", "Bà Rịa - Vũng Tàu", "Huế", "Quảng Nam",
];

export const WARDS_SG = [
  "Phường Bến Nghé", "Phường Bến Thành", "Phường Tân Định", "Phường Đa Kao",
  "Phường 5", "Phường 12", "Phường Tân Thuận Đông", "Xã An Phú",
];

export function formatMoney(n) {
  return new Intl.NumberFormat("vi-VN").format(n || 0);
}
