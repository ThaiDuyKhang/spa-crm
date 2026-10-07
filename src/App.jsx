import SpaCRM from "./spa-crm-dashboard.jsx";

// App shell: toàn bộ giao diện nằm trong spa-crm-dashboard.jsx (code gốc của Khang).
// Trang Khách hàng kiểu KiotViet được gắn vào menu "Khách hàng" của app cũ
// qua KiotCustomersSection / KiotPackagesSection (xem cuối file spa-crm-dashboard.jsx).
export default function App() {
  return <SpaCRM />;
}
