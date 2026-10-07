# Lumière Spa CRM

Dashboard CRM đa chi nhánh cho chuỗi spa **Lumière Spa** (Quận 1, Quận 7, Đà Nẵng),
xây dựng theo quy trình và UX/UI của KiotViet Salon.

- **Frontend trước, backend sau**: hiện tại dùng dữ liệu mẫu trong code.
- Stack: React + Vite, `lucide-react`, `recharts` (biểu đồ), `xlsx` (xuất/nhập Excel),
  CSS thuần + inline styles.

## Chạy dev

```bash
npm install
npm run dev
```

Mở http://localhost:5173

## Build

```bash
npm run build
```

## Cấu trúc

```
src/
  App.jsx                     # Render <SpaCRM />
  main.jsx
  index.css                   # Design tokens + class kv-* (trang Khách hàng kiểu KiotViet)
  spa-crm-dashboard.jsx       # CODE GỐC của Khang — toàn bộ app cũ, giữ nguyên.
                              # Chỉ sửa 4 điểm render (đánh dấu [Tích hợp 2026-10-05]):
                              # import section mới, IMPLEMENTED_PAGES += sold-packages,
                              # ẩn header chung ở trang customers/sold-packages,
                              # route customers/sold-packages -> trang KiotViet mới
  data/
    customers.js              # Constants cho trang Khách hàng (nhóm, tỉnh/TP, ...)
    invoices.js               # Sinh dataset hóa đơn (gắn vị trí/phòng, dùng chung Vị trí + Hóa đơn)
  components/
    KiotCustomersSection.jsx  # Adapter: data KH cũ -> trang Khách hàng kiểu KiotViet
    KiotPackagesSection.jsx   # Adapter: trang "Gói, thẻ đã bán" kiểu KiotViet
    KiotLocationsSection.jsx  # Adapter: state vị trí/phòng cũ -> trang Vị trí kiểu KiotViet (CRUD + Excel)
    KiotInvoicesSection.jsx   # Adapter: trang Hóa đơn kiểu KiotViet
    LocationsPage.jsx         # Trang Vị trí/phòng kiểu KiotViet (click dòng -> sổ chi tiết + nút chức năng)
    LocationModal.jsx         # Modal thêm/sửa vị trí-phòng
    InvoicesPage.jsx          # Trang Hóa đơn kiểu KiotViet (dòng xổ chi tiết: Tổng quan/Dịch vụ/Lịch sử TT)
    CustomersPage.jsx         # Trang Khách hàng kiểu KiotViet (bộ lọc, bảng, phân trang, dropdown tab)
    CustomerModal.jsx         # Modal "Thêm khách hàng" (validate tên bắt buộc)
    PackagesPage.jsx          # Trang "Gói, thẻ đã bán" (empty state)
```

## Các trang (từ code cũ, giữ nguyên)

Tổng quan (dashboard + biểu đồ), Vị trí (sơ đồ phòng, xuất/nhập Excel),
Lịch hẹn (theo nhân viên), Thu ngân (POS), Khách hàng **(đã thay bằng bản KiotViet mới)**,
Hàng hoá/Dịch vụ, Hoá đơn & Kho, Khuyến mại/Voucher, Sổ quỹ, Hội thoại (Inbox),
Nhân viên & Hoa hồng, Chi nhánh, Thiết lập.

Menu **Khách hàng** gồm: Khách hàng (bản KiotViet mới: bộ lọc đầy đủ, bảng, modal
thêm mới, dropdown chuyển sang Gói/thẻ đã bán, Voucher, Khuyến mại, Tin nhắn),
Gói, thẻ đã bán (bản KiotViet mới).

## TODO tiếp theo

- Kết nối backend (thay state mẫu bằng API)
- Code-split để giảm bundle (hiện ~1.1MB do recharts + xlsx)
