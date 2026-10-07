import React, { useState, useMemo, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  LayoutDashboard,
  Users,
  Wallet,
  MessageSquare,
  UserCog,
  Building2,
  Search,
  Plus,
  ChevronDown,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  Phone,
  Mail,
  MoreHorizontal,
  Send,
  X,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Filter,
  Tag,
  Pencil,
  Trash2,
  Percent,
  ShoppingCart,
  Package,
  Receipt,
  Minus,
  Banknote,
  Bell,
  Settings,
  Info,
  Menu,
  HelpCircle,
  Store,
  ShieldCheck,
  ArrowLeftRight,
  BarChart3,
  FileText,
  Printer,
  Stethoscope,
  MapPin,
  HardDrive,
  Lock,
  History as HistoryIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Check,
  Award,
  Upload,
  Download,
  UploadCloud,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

// [Tích hợp 2026-10-05] Trang Khách hàng kiểu KiotViet — chỉ thêm import, toàn bộ code cũ bên dưới giữ nguyên
import KiotCustomersSection from "./components/KiotCustomersSection.jsx";
import KiotPackagesSection from "./components/KiotPackagesSection.jsx";
import KiotLocationsSection from "./components/KiotLocationsSection.jsx";
import KiotInvoicesSection from "./components/KiotInvoicesSection.jsx";
import KiotProductsSection from "./components/KiotProductsSection.jsx";
import KiotPriceSetupSection from "./components/KiotPriceSetupSection.jsx";
// [Tích hợp 2026-10-06] Trang Danh sách nhân viên kiểu KiotViet — chỉ thêm import, toàn bộ code cũ bên dưới giữ nguyên
import KiotStaffSection from "./components/KiotStaffSection.jsx";
// [Tích hợp 2026-10-05] header kiểu KiotViet + trang Tài khoản + Hồ sơ cửa hàng
import AppHeader from "./components/AppHeader.jsx";
import AccountPage from "./components/AccountPage.jsx";
import StoreProfilePage from "./components/StoreProfilePage.jsx";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const COLORS = {
  forest: "#1664EA",
  forestLight: "#2E77F0",
  page: "#F2F5FA",
  card: "#FFFFFF",
  copper: "#1664EA",
  copperDeep: "#0F4DBC",
  ink: "#1A2333",
  muted: "#6B7686",
  border: "#E4E9F1",
  success: "#1E9A57",
  warning: "#D98A1A",
  danger: "#D4453A",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`;

const RESPONSIVE_CSS = `
.rs-menu-item{cursor:pointer;transition:background .12s}
.rs-menu-item:hover{background:${COLORS.forest}14}
.rs-topright{margin-left:auto}
.rs-nav-narrow{display:none !important}
.rs-show-lg{display:none !important}
@media (max-width:1500px){
  .rs-hide-md{display:none !important}
}
@media (max-width:1200px){
  .rs-nav-wide{display:none !important}
  .rs-nav-narrow{display:flex !important}
}
@media (max-width:1100px){
  .rs-row-lg{flex-direction:column !important;align-items:stretch !important}
  .rs-row-lg > *{width:100% !important;max-width:100% !important;min-width:0 !important;box-sizing:border-box !important;flex:none !important}
  .rs-hide-lg{display:none !important}
  .rs-show-lg{display:block !important}
}
@media (max-width:820px){
  .rs-row{flex-direction:column !important;align-items:stretch !important;height:auto !important}
  .rs-row > *{width:100% !important;max-width:100% !important;min-width:0 !important;box-sizing:border-box !important;flex:none !important;height:auto !important}
  .rs-row > .rs-inbox-list{max-height:340px !important}
  .rs-row > .rs-inbox-thread{min-height:460px !important}
  .rs-topbar{padding:0 12px !important;gap:10px !important}
  .rs-branch-label{display:inline-block;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}
  .rs-listrow{flex-wrap:wrap !important}
  .rs-listrow > :nth-child(2){flex:1 1 150px !important;min-width:150px !important}
}
@media (max-width:700px){
  [style*="grid-template-columns"]:not([data-keep]){grid-template-columns:minmax(0,1fr) !important}
  .rs-hide-sm{display:none !important}
  .rs-main{padding:14px 12px !important}
}
@media (max-width:520px){
  .rs-logo-text{display:none}
  .rs-branch-label{max-width:84px}
}
`;

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const BRANCHES = [
  { id: "all", name: "Tất cả chi nhánh" },
  { id: "q1", name: "Chi nhánh Quận 1" },
  { id: "q7", name: "Chi nhánh Quận 7" },
  { id: "dn", name: "Chi nhánh Đà Nẵng" },
];

const STAFF = [
  { id: 1, name: "Thảo Nguyên", role: "Chuyên viên chăm sóc da", branch: "q1", load: 4, rating: 4.9, avatarColor: "#B7855A", commissionRate: 12 },
  { id: 2, name: "Minh Khôi", role: "Kỹ thuật viên massage", branch: "q1", load: 6, rating: 4.7, avatarColor: "#3F7A5C", commissionRate: 10 },
  { id: 3, name: "Hải Yến", role: "Tư vấn khách hàng", branch: "q7", load: 3, rating: 4.8, avatarColor: "#1B3A32", commissionRate: 8 },
  { id: 4, name: "Đức Anh", role: "Kỹ thuật viên spa", branch: "q7", load: 5, rating: 4.6, avatarColor: "#C08A3E", commissionRate: 10 },
  { id: 5, name: "Lan Chi", role: "Chuyên viên chăm sóc da", branch: "dn", load: 2, rating: 5.0, avatarColor: "#8F6741", commissionRate: 15 },
  { id: 6, name: "Quang Huy", role: "Tư vấn khách hàng", branch: "dn", load: 4, rating: 4.5, avatarColor: "#6B756F", commissionRate: 8 },
];

const CUSTOMERS = [
  { id: 1, name: "Ngọc Bích", phone: "090 123 4567", branch: "q1", tier: "Vàng", spend: 12500000, lastVisit: "3 ngày trước", tags: ["Chăm sóc da", "Nhạy cảm với hương liệu"] },
  { id: 2, name: "Anh Thư", phone: "091 234 5678", branch: "q1", tier: "Bạc", spend: 4200000, lastVisit: "2 tuần trước", tags: ["Massage"] },
  { id: 3, name: "Bảo Trân", phone: "093 345 6789", branch: "q7", tier: "Kim cương", spend: 28900000, lastVisit: "Hôm qua", tags: ["VIP", "Trị liệu chuyên sâu"] },
  { id: 4, name: "Hữu Phát", phone: "094 456 7890", branch: "q7", tier: "Bạc", spend: 3100000, lastVisit: "1 tháng trước", tags: ["Khách mới"] },
  { id: 5, name: "Thùy Linh", phone: "096 567 8901", branch: "dn", tier: "Vàng", spend: 9800000, lastVisit: "5 ngày trước", tags: ["Chăm sóc da"] },
  { id: 6, name: "Gia Bảo", phone: "097 678 9012", branch: "dn", tier: "Bạc", spend: 2600000, lastVisit: "3 tuần trước", tags: ["Massage", "Khách mới"] },
  { id: 7, name: "Kim Ngân", phone: "098 789 0123", branch: "q1", tier: "Kim cương", spend: 34200000, lastVisit: "Hôm nay", tags: ["VIP"] },
];

const TIER_COLOR = {
  "Kim cương": COLORS.forest,
  "Vàng": COLORS.copper,
  "Bạc": COLORS.muted,
};

const CHANNEL_META = {
  messenger: { label: "Messenger", short: "FB", bg: "#E7EEFB", fg: "#3B5EA6" },
  telegram: { label: "Telegram", short: "TG", bg: "#E4F3FB", fg: "#2E8FBF" },
  whatsapp: { label: "WhatsApp", short: "WA", bg: "#E5F5EA", fg: "#3F9151" },
};

const CONVERSATIONS = [
  { id: 1, customer: "Ngọc Bích", channel: "messenger", branch: "q1", preview: "Cho em hỏi lịch trống thứ 7 tuần này ạ", time: "2 phút", unread: true, assignedTo: 1 },
  { id: 2, customer: "Số 090 555 22xx", channel: "whatsapp", branch: "q7", preview: "I'd like to reschedule my appointment", time: "8 phút", unread: true, assignedTo: null },
  { id: 3, customer: "Bảo Trân", channel: "messenger", branch: "q7", preview: "Dạ em cảm ơn chị nhiều ạ ❤️", time: "25 phút", unread: false, assignedTo: 3 },
  { id: 4, customer: "@giabao_tg", channel: "telegram", branch: "dn", preview: "Bên mình có gói combo massage + chăm sóc da không ạ?", time: "1 giờ", unread: true, assignedTo: null },
  { id: 5, customer: "Anh Thư", channel: "messenger", branch: "q1", preview: "Ok em, hẹn gặp lại nhé", time: "3 giờ", unread: false, assignedTo: 2 },
  { id: 6, customer: "Thùy Linh", channel: "whatsapp", branch: "dn", preview: "Cảm ơn shop, sản phẩm dùng rất hợp da", time: "Hôm qua", unread: false, assignedTo: 5 },
];

const TRANSACTIONS = [
  { id: 1, type: "in", label: "Dịch vụ chăm sóc da - Ngọc Bích", branch: "q1", amount: 850000, date: "24/09" },
  { id: 2, type: "in", label: "Combo massage đôi - Bảo Trân", branch: "q7", amount: 1900000, date: "24/09" },
  { id: 3, type: "out", label: "Nhập tinh dầu & mỹ phẩm", branch: "q1", amount: 4200000, date: "23/09" },
  { id: 4, type: "in", label: "Gói liệu trình 10 buổi - Kim Ngân", branch: "q1", amount: 6500000, date: "23/09" },
  { id: 5, type: "out", label: "Lương nhân viên kỹ thuật - đợt 2", branch: "dn", amount: 18000000, date: "22/09" },
  { id: 6, type: "in", label: "Dịch vụ massage - Anh Thư", branch: "q1", amount: 420000, date: "22/09" },
  { id: 7, type: "out", label: "Thuê mặt bằng tháng 9", branch: "q7", amount: 22000000, date: "21/09" },
];

const SERVICE_CATEGORIES = [
  { id: "skincare", name: "Chăm sóc da" },
  { id: "massage", name: "Massage" },
  { id: "combo", name: "Gói combo" },
];

const SERVICES = [
  { id: 1, name: "Chăm sóc da chuyên sâu", categoryId: "skincare", price: 850000, duration: 60 },
  { id: 2, name: "Trị liệu mụn chuyên sâu", categoryId: "skincare", price: 950000, duration: 90 },
  { id: 3, name: "Massage đá nóng", categoryId: "massage", price: 650000, duration: 75 },
  { id: 4, name: "Massage Thái toàn thân", categoryId: "massage", price: 550000, duration: 60 },
  { id: 5, name: "Combo massage + chăm sóc da", categoryId: "combo", price: 1400000, duration: 120 },
];

const DISCOUNTS = [
  { id: 1, code: "SPA10", type: "percent", value: 10, description: "Giảm 10% cho mọi dịch vụ" },
  { id: 2, code: "VIP200K", type: "fixed", value: 200000, description: "Giảm 200.000đ cho khách VIP" },
  { id: 3, code: "SUMMER20", type: "percent", value: 20, description: "Ưu đãi hè - giảm 20%" },
];

const CUSTOMER_SERVICES = [
  { customerId: 1, serviceId: 1, price: 850000, discountId: null },
  { customerId: 1, serviceId: 2, price: 950000, discountId: 1 },
  { customerId: 2, serviceId: 4, price: 550000, discountId: null },
  { customerId: 3, serviceId: 5, price: 1400000, discountId: 2 },
  { customerId: 3, serviceId: 3, price: 650000, discountId: null },
  { customerId: 5, serviceId: 1, price: 850000, discountId: null },
  { customerId: 7, serviceId: 5, price: 1400000, discountId: 3 },
];

const PRODUCTS = [
  { id: 1, name: "Dầu gội dưỡng ẩm Argan", price: 220000, cost: 140000, stock: 18, lowStock: 5 },
  { id: 2, name: "Kem dưỡng da ban đêm", price: 450000, cost: 280000, stock: 6, lowStock: 5 },
  { id: 3, name: "Tinh dầu massage Lavender", price: 150000, cost: 90000, stock: 32, lowStock: 10 },
  { id: 4, name: "Mặt nạ collagen (hộp 5 miếng)", price: 320000, cost: 190000, stock: 3, lowStock: 5 },
  { id: 5, name: "Sáp tẩy lông chân mày", price: 95000, cost: 50000, stock: 40, lowStock: 10 },
];

const CAL_START_HOUR = 8;
const CAL_END_HOUR = 20;
const CAL_ROW_HEIGHT = 56;

const APPOINTMENTS = [
  { id: 1, customerId: 1, staffId: 1, branch: "q1", serviceId: 1, start: "09:00", duration: 60, status: "confirmed" },
  { id: 2, customerId: 7, staffId: 1, branch: "q1", serviceId: 2, start: "10:30", duration: 90, status: "in_progress" },
  { id: 3, customerId: 2, staffId: 2, branch: "q1", serviceId: 4, start: "09:30", duration: 60, status: "done" },
  { id: 4, customerId: 1, staffId: 2, branch: "q1", serviceId: 3, start: "14:00", duration: 75, status: "confirmed" },
  { id: 5, customerId: 3, staffId: 3, branch: "q7", serviceId: 5, start: "11:00", duration: 120, status: "confirmed" },
  { id: 6, customerId: 4, staffId: 4, branch: "q7", serviceId: 4, start: "15:30", duration: 90, status: "cancelled" },
  { id: 7, customerId: 5, staffId: 5, branch: "dn", serviceId: 1, start: "10:00", duration: 60, status: "done" },
  { id: 8, customerId: 6, staffId: 6, branch: "dn", serviceId: 3, start: "16:00", duration: 60, status: "confirmed" },
];

const ORDERS = [
  {
    id: 1,
    customerId: 1,
    branch: "q1",
    date: "24/09",
    items: [
      { type: "service", refId: 1, name: "Chăm sóc da chuyên sâu", price: 850000, discountId: null, staffId: 1 },
      { type: "product", refId: 1, name: "Dầu gội dưỡng ẩm Argan", price: 220000, qty: 1 },
    ],
  },
  {
    id: 2,
    customerId: 3,
    branch: "q7",
    date: "24/09",
    items: [{ type: "service", refId: 5, name: "Combo massage + chăm sóc da", price: 1400000, discountId: 2, staffId: 3 }],
  },
  {
    id: 3,
    customerId: 7,
    branch: "q1",
    date: "23/09",
    items: [
      { type: "service", refId: 2, name: "Trị liệu mụn chuyên sâu", price: 950000, discountId: 3, staffId: 1 },
      { type: "product", refId: 4, name: "Mặt nạ collagen (hộp 5 miếng)", price: 320000, qty: 2 },
    ],
  },
  {
    id: 4,
    customerId: 5,
    branch: "dn",
    date: "23/09",
    items: [{ type: "service", refId: 1, name: "Chăm sóc da chuyên sâu", price: 850000, discountId: null, staffId: 5 }],
  },
];

const orderTotal = (order, discounts) =>
  order.items.reduce((sum, it) => {
    if (it.type === "product") return sum + it.price * it.qty;
    const discount = discounts.find((d) => d.id === it.discountId);
    return sum + finalPrice(it.price, discount);
  }, 0);

const finalPrice = (price, discount) => {
  if (!discount) return price;
  const v = discount.type === "percent" ? price - (price * discount.value) / 100 : price - discount.value;
  return Math.max(0, v);
};

const LOCATION_GROUPS = [
  { id: 1, name: "Phòng riêng" },
  { id: 2, name: "Khu massage" },
];

const LOCATIONS = [
  { id: 1, branch: "q1", name: "Giường 1", note: "", groupId: null, status: "active", order: 1 },
  { id: 2, branch: "q1", name: "Giường 2", note: "", groupId: null, status: "active", order: 2 },
  { id: 3, branch: "q1", name: "Giường 3", note: "", groupId: null, status: "active", order: 3 },
  { id: 4, branch: "q7", name: "Giường 1", note: "", groupId: null, status: "active", order: 1 },
  { id: 5, branch: "q7", name: "Giường 2", note: "", groupId: null, status: "active", order: 2 },
  { id: 6, branch: "q7", name: "Phòng VIP 1", note: "Có phòng tắm riêng", groupId: 1, status: "active", order: 3 },
  { id: 7, branch: "dn", name: "Giường 1", note: "", groupId: 2, status: "active", order: 1 },
  { id: 8, branch: "dn", name: "Giường 2", note: "", groupId: 2, status: "active", order: 2 },
  { id: 9, branch: "dn", name: "Giường 3", note: "Đang sửa chữa", groupId: 2, status: "inactive", order: 3 },
];

const REVENUE_TREND = [
  { day: "T2", revenue: 8.4 },
  { day: "T3", revenue: 9.1 },
  { day: "T4", revenue: 7.8 },
  { day: "T5", revenue: 10.3 },
  { day: "T6", revenue: 12.6 },
  { day: "T7", revenue: 15.2 },
  { day: "CN", revenue: 13.4 },
];

const BRANCH_REVENUE = [
  { branch: "Quận 1", revenue: 142 },
  { branch: "Quận 7", revenue: 98 },
  { branch: "Đà Nẵng", revenue: 76 },
];

// Lượng khách hàng / Doanh thu thuần — theo giờ, theo ngày, theo thứ
const CUSTOMER_FLOW = {
  hour: [
    { label: "09:00", value: 1 },
    { label: "10:00", value: 1 },
    { label: "11:00", value: 2 },
    { label: "12:00", value: 4 },
    { label: "13:00", value: 3 },
    { label: "14:00", value: 2 },
  ],
  day: [
    { label: "20/09", value: 6 },
    { label: "21/09", value: 8 },
    { label: "22/09", value: 5 },
    { label: "23/09", value: 9 },
    { label: "24/09", value: 7 },
    { label: "25/09", value: 8 },
  ],
  weekday: [
    { label: "T2", value: 5 },
    { label: "T3", value: 6 },
    { label: "T4", value: 4 },
    { label: "T5", value: 7 },
    { label: "T6", value: 8 },
    { label: "T7", value: 10 },
    { label: "CN", value: 9 },
  ],
};

const REVENUE_FLOW = {
  hour: [
    { label: "09:00", value: 0 },
    { label: "10:00", value: 0 },
    { label: "11:00", value: 100 },
    { label: "12:00", value: 0 },
    { label: "13:00", value: 680 },
    { label: "14:00", value: 40 },
  ],
  day: [
    { label: "20/09", value: 420 },
    { label: "21/09", value: 650 },
    { label: "22/09", value: 380 },
    { label: "23/09", value: 820 },
    { label: "24/09", value: 710 },
    { label: "25/09", value: 820 },
  ],
  weekday: REVENUE_TREND.map((d) => ({ label: d.day, value: Math.round(d.revenue * 100) })),
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
const money = (n) =>
  n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

function Avatar({ name, color, size = 36 }) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color || COLORS.copper,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function ChannelBadge({ channel }) {
  const m = CHANNEL_META[channel];
  return (
    <span
      style={{
        background: m.bg,
        color: m.fg,
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 6,
        letterSpacing: 0.2,
      }}
    >
      {m.short}
    </span>
  );
}

function TierPill({ tier }) {
  return (
    <span
      style={{
        color: TIER_COLOR[tier],
        border: `1px solid ${TIER_COLOR[tier]}55`,
        background: `${TIER_COLOR[tier]}14`,
        fontSize: 12,
        fontWeight: 600,
        padding: "2px 9px",
        borderRadius: 999,
      }}
    >
      {tier}
    </span>
  );
}

function Card({ children, style, ...rest }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

function GaugeArc({ percent, size = 92, color = COLORS.forest, caption }) {
  const r = size / 2 - 9;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - Math.min(100, Math.max(0, percent)) / 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path d={`M 9 ${size / 2} A ${r} ${r} 0 0 1 ${size - 9} ${size / 2}`} fill="none" stroke={COLORS.page} strokeWidth="9" strokeLinecap="round" />
        <path
          d={`M 9 ${size / 2} A ${r} ${r} 0 0 1 ${size - 9} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="16" fontWeight="800" fill={COLORS.ink}>
          {percent}%
        </text>
      </svg>
      {caption && <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: -2 }}>{caption}</div>}
    </div>
  );
}

function Donut({ segments, size = 74 }) {
  let acc = 0;
  const stops = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const from = acc;
      acc += s.value;
      return `${s.color} ${from}% ${acc}%`;
    });
  const bg = stops.length ? `conic-gradient(${stops.join(", ")})` : COLORS.page;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0 }} />;
}

function Modal({ title, onClose, width = 480, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,30,25,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.card,
          borderRadius: 14,
          width,
          maxWidth: "92vw",
          maxHeight: "86vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: `1px solid ${COLORS.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 18 }}>{title}</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}>
            <X size={18} color={COLORS.muted} />
          </button>
        </div>
        <div style={{ padding: 20, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
function LegendDot({ color, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
      <span style={{ color: COLORS.muted, whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ marginLeft: "auto", fontWeight: 700, color: COLORS.ink }}>{value}</span>
    </div>
  );
}

function FlowTabs({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 16, borderBottom: `1px solid ${COLORS.border}` }}>
      {[
        { id: "hour", label: "Theo giờ" },
        { id: "day", label: "Theo ngày" },
        { id: "weekday", label: "Theo thứ" },
      ].map((t) => (
        <div
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            paddingBottom: 9,
            fontSize: 13,
            fontWeight: value === t.id ? 700 : 500,
            color: value === t.id ? COLORS.forest : COLORS.muted,
            borderBottom: value === t.id ? `2px solid ${COLORS.forest}` : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}

function DashboardPage({ branch, customers, orders, appointments, discounts, services, products, setPage }) {
  const [custFlowTab, setCustFlowTab] = useState("hour");
  const [revFlowTab, setRevFlowTab] = useState("hour");
  const [sellerTab, setSellerTab] = useState("services");

  const branchOrders = orders.filter((o) => branch === "all" || o.branch === branch);
  const branchAppointments = appointments.filter((a) => branch === "all" || a.branch === branch);
  const branchCustomers = customers.filter((c) => branch === "all" || c.branch === branch);

  const totalAppointments = branchAppointments.length;
  const doneAppointments = branchAppointments.filter((a) => a.status === "done").length;
  const completionPct = totalAppointments > 0 ? Math.round((doneAppointments / totalAppointments) * 100) : 0;

  const returningCustomers = new Set(branchAppointments.map((a) => a.customerId)).size;
  const walkInOrders = branchOrders.filter((o) => !o.customerId).length;
  const newCustomers = 0;
  const todayCustomers = returningCustomers + walkInOrders + newCustomers;

  const tongThu = branchOrders.reduce((sum, o) => sum + orderTotal(o, discounts), 0);
  const tongChi = TRANSACTIONS.filter((t) => t.type === "out" && (branch === "all" || t.branch === branch)).reduce(
    (s, t) => s + t.amount,
    0
  );
  const maxThuChi = Math.max(tongThu, tongChi, 1);

  const staleCustomers = branchCustomers.filter((c) => c.lastVisit.includes("tuần trước") || c.lastVisit.includes("tháng trước")).length;

  const upcoming = branchAppointments
    .filter((a) => a.status === "confirmed")
    .sort((a, b) => parseTime(a.start) - parseTime(b.start));
  const nextAppt = upcoming[0];
  const nextApptCustomer = nextAppt && customers.find((c) => c.id === nextAppt.customerId);
  const nextApptService = nextAppt && services.find((s) => s.id === nextAppt.serviceId);

  const serviceCounts = {};
  const productCounts = {};
  branchOrders.forEach((o) =>
    o.items.forEach((it) => {
      if (it.type === "service") serviceCounts[it.refId] = (serviceCounts[it.refId] || 0) + 1;
      else productCounts[it.refId] = (productCounts[it.refId] || 0) + (it.qty || 1);
    })
  );
  const topServices = Object.entries(serviceCounts)
    .map(([id, count]) => ({ item: services.find((s) => s.id === Number(id)), count }))
    .filter((x) => x.item)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topProducts = Object.entries(productCounts)
    .map(([id, count]) => ({ item: products.find((p) => p.id === Number(id)), count }))
    .filter((x) => x.item)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topRows = sellerTab === "services" ? topServices : topProducts;
  const codePrefix = sellerTab === "services" ? "DV" : "SP";

  const recentOrders = branchOrders.slice(0, 4);

  return (
    <div className="rs-row-lg" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ color: COLORS.muted, fontSize: 13 }}>Lịch hẹn hôm nay</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <div style={{ fontWeight: 800, fontSize: 30 }}>{totalAppointments}</div>
              <GaugeArc percent={completionPct} caption={`Hoàn thành: ${doneAppointments} lịch`} />
            </div>
          </Card>

          <Card style={{ padding: 18 }}>
            <div style={{ color: COLORS.muted, fontSize: 13 }}>Khách hàng hôm nay</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 30 }}>{todayCustomers}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10 }}>
                  <LegendDot color={COLORS.forest} label="Khách mới" value={newCustomers} />
                  <LegendDot color={COLORS.copper} label="Khách cũ quay lại" value={returningCustomers} />
                  <LegendDot color={COLORS.warning} label="Khách lẻ" value={walkInOrders} />
                </div>
              </div>
              <Donut
                segments={[
                  { color: COLORS.copper, value: todayCustomers ? (returningCustomers / todayCustomers) * 100 : 0 },
                  { color: COLORS.warning, value: todayCustomers ? (walkInOrders / todayCustomers) * 100 : 0 },
                ]}
              />
            </div>
          </Card>

          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.muted, fontSize: 13 }}>
              Thu chi hôm nay <Info size={13} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 24 }}>{money(tongThu)}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10 }}>
                  <LegendDot color={COLORS.forest} label="Tổng thu" value={money(tongThu)} />
                  <LegendDot color={COLORS.danger} label="Tổng chi" value={money(tongChi)} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 60, flexShrink: 0 }}>
                <div style={{ width: 16, borderRadius: 4, background: COLORS.forest, height: `${Math.max(6, (tongThu / maxThuChi) * 56)}px` }} />
                <div style={{ width: 16, borderRadius: 4, background: COLORS.danger, height: `${Math.max(6, (tongChi / maxThuChi) * 56)}px` }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Flow charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Lượng khách hàng</div>
              <span style={{ fontSize: 12.5, color: COLORS.muted }}>Tháng này</span>
            </div>
            <div style={{ fontSize: 12.5, color: COLORS.muted, marginBottom: 10 }}>
              {CUSTOMER_FLOW[custFlowTab].reduce((s, d) => s + d.value, 0)} lượt khách
            </div>
            <FlowTabs value={custFlowTab} onChange={setCustFlowTab} />
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={CUSTOMER_FLOW[custFlowTab]} margin={{ top: 14, left: -10 }}>
                <CartesianGrid stroke={COLORS.border} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11.5, fill: COLORS.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11.5, fill: COLORS.muted }} axisLine={false} tickLine={false} width={26} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13 }} formatter={(v) => [v, "Lượt khách"]} />
                <Line type="monotone" dataKey="value" stroke={COLORS.forest} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Doanh thu thuần</div>
              <span style={{ fontSize: 12.5, color: COLORS.muted }}>Tháng này</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, background: `${COLORS.forest}14`, color: COLORS.forest, padding: "2px 8px", borderRadius: 999 }}>
                {money(tongThu)}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, background: `${COLORS.success}14`, color: COLORS.success, padding: "2px 8px", borderRadius: 999 }}>
                {branchOrders.length} hoá đơn
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, background: `${COLORS.warning}14`, color: COLORS.warning, padding: "2px 8px", borderRadius: 999 }}>
                0 trả hàng
              </span>
            </div>
            <FlowTabs value={revFlowTab} onChange={setRevFlowTab} />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={REVENUE_FLOW[revFlowTab]} margin={{ top: 14, left: -10 }}>
                <CartesianGrid stroke={COLORS.border} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11.5, fill: COLORS.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11.5, fill: COLORS.muted }} axisLine={false} tickLine={false} width={34} tickFormatter={(v) => `${v}n`} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13 }}
                  formatter={(v) => [`${(v * 1000).toLocaleString("vi-VN")}đ`, "Doanh thu thuần"]}
                />
                <Bar dataKey="value" fill={COLORS.forest} radius={[5, 5, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top sellers */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 0" }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Top 5 hàng hoá bán chạy</div>
            <span style={{ fontSize: 12.5, color: COLORS.muted }}>Tháng này</span>
          </div>
          <div style={{ display: "flex", gap: 18, padding: "12px 20px 0", borderBottom: `1px solid ${COLORS.border}` }}>
            {[
              { id: "services", label: "Dịch vụ" },
              { id: "products", label: "Sản phẩm" },
            ].map((t) => (
              <div
                key={t.id}
                onClick={() => setSellerTab(t.id)}
                style={{
                  paddingBottom: 9,
                  fontSize: 13,
                  fontWeight: sellerTab === t.id ? 700 : 500,
                  color: sellerTab === t.id ? COLORS.forest : COLORS.muted,
                  borderBottom: sellerTab === t.id ? `2px solid ${COLORS.forest}` : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                {t.label}
              </div>
            ))}
          </div>
          <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ ...thStyle, width: 36 }}></th>
                <th style={thStyle}>Mã</th>
                <th style={thStyle}>Tên</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {topRows.map((row, i) => (
                <tr key={row.item.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={{ ...tdStyle, color: COLORS.muted }}>{i + 1}.</td>
                  <td style={{ ...tdStyle, color: COLORS.forest, fontWeight: 600 }}>
                    {codePrefix}
                    {String(row.item.id).padStart(6, "0")}
                  </td>
                  <td style={tdStyle}>{row.item.name}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{row.count}</td>
                </tr>
              ))}
              {topRows.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: COLORS.muted, padding: "24px 0" }}>
                    Chưa có dữ liệu bán hàng trong kỳ này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </Card>
      </div>

      {/* Right rail */}
      <div style={{ width: 272, display: "flex", flexDirection: "column", gap: 14, flexShrink: 0 }}>
        <div data-keep="1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            onClick={() => setPage("pos")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: "14px 6px",
              cursor: "pointer",
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${COLORS.forest}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingCart size={16} color={COLORS.forest} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>Bán hàng</span>
          </button>
          <button
            onClick={() => setPage("appointments")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: "14px 6px",
              cursor: "pointer",
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${COLORS.forest}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={16} color={COLORS.forest} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>Thêm lịch hẹn</span>
          </button>
        </div>

        <Card style={{ padding: 16, background: `linear-gradient(135deg, ${COLORS.forest}, ${COLORS.forestLight})`, color: "#fff", border: "none" }}>
          <div style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 4 }}>Mẹo nhỏ</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 }}>
            Gửi mã giảm giá cho khách lâu chưa quay lại để tăng tỉ lệ giữ chân khách hàng.
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 10 }}>Nhắc việc</div>
          <div style={{ fontSize: 12.5, color: COLORS.muted, marginBottom: 8 }}>Chăm sóc khách hàng</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.page, borderRadius: 9, padding: "10px 12px" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${COLORS.warning}1F`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Users size={14} color={COLORS.warning} />
            </div>
            <span style={{ fontSize: 12.5 }}>
              Có <b>{staleCustomers}</b> khách hàng lâu chưa quay lại
            </span>
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 10 }}>Lịch hẹn chưa tới</div>
          {nextAppt ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={nextApptCustomer?.name || "?"} size={30} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {nextApptCustomer?.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: COLORS.muted }}>
                    {nextAppt.start} · {nextApptService?.name}
                  </div>
                </div>
              </div>
              {upcoming.length > 1 && (
                <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 8 }}>+{upcoming.length - 1} lịch hẹn khác</div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0" }}>
              <Calendar size={26} color={COLORS.border} />
              <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 8 }}>Chưa có lịch hẹn</div>
              <button
                onClick={() => setPage("appointments")}
                style={{ border: "none", background: "none", color: COLORS.forest, fontWeight: 600, fontSize: 12.5, cursor: "pointer", marginTop: 4 }}
              >
                + Thêm lịch hẹn
              </button>
            </div>
          )}
        </Card>

        <Card style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 10 }}>Hoạt động gần đây</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentOrders.map((o) => {
              const cust = customers.find((c) => c.id === o.customerId);
              const firstStaffId = o.items.find((it) => it.staffId)?.staffId;
              const staffM = STAFF.find((s) => s.id === firstStaffId);
              return (
                <div key={o.id} style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${COLORS.forest}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Receipt size={13} color={COLORS.forest} />
                  </div>
                  <div style={{ fontSize: 12.5 }}>
                    <b>{staffM?.name || "Quầy bán hàng"}</b> vừa bán đơn hàng giá trị{" "}
                    <b>{money(orderTotal(o, discounts))}</b>
                    <div style={{ color: COLORS.muted, fontSize: 11.5, marginTop: 1 }}>
                      {cust?.name || "Khách lẻ"} · {o.date}
                    </div>
                  </div>
                </div>
              );
            })}
            {recentOrders.length === 0 && <div style={{ fontSize: 12.5, color: COLORS.muted }}>Chưa có hoạt động nào.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function CustomersPage({
  branch,
  customers,
  services,
  discounts,
  customerServices,
  onAssignService,
  onUnassignService,
  onSaveCustomer,
  onDeleteCustomer,
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [addServiceId, setAddServiceId] = useState("");
  const [modalCustomer, setModalCustomer] = useState(null); // "new" | customer object | null

  const filtered = useMemo(() => {
    return customers
      .filter((c) => branch === "all" || c.branch === branch)
      .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query));
  }, [query, branch, customers]);

  return (
    <div className="rs-row" style={{ display: "flex", gap: 16 }}>
      <Card style={{ flex: 1, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 16, borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} color={COLORS.muted} style={{ position: "absolute", left: 10, top: 9 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc số điện thoại"
              style={{
                width: "100%",
                padding: "8px 10px 8px 32px",
                borderRadius: 9,
                border: `1px solid ${COLORS.border}`,
                fontSize: 14,
                fontFamily: "Manrope, sans-serif",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={() => setModalCustomer("new")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: COLORS.forest,
              color: "#fff",
              border: "none",
              padding: "9px 14px",
              borderRadius: 9,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={15} /> Thêm khách hàng
          </button>
        </div>

        <div>
          {filtered.map((c, i) => (
            <div
              key={c.id}
              className="rs-listrow"
              onClick={() => setSelected(c)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "13px 16px",
                borderTop: i === 0 ? "none" : `1px solid ${COLORS.border}`,
                cursor: "pointer",
                background: selected?.id === c.id ? COLORS.page : "transparent",
              }}
            >
              <Avatar name={c.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14.5 }}>{c.name}</span>
                  <TierPill tier={c.tier} />
                </div>
                <div style={{ color: COLORS.muted, fontSize: 13 }}>{c.phone} · Ghé thăm {c.lastVisit}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{money(c.spend)}</div>
                <div style={{ color: COLORS.muted, fontSize: 12.5 }}>tổng chi tiêu</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalCustomer(c);
                  }}
                  style={{ border: "none", background: "none", cursor: "pointer", display: "flex", padding: 6 }}
                >
                  <Pencil size={15} color={COLORS.muted} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selected?.id === c.id) setSelected(null);
                    onDeleteCustomer(c.id);
                  }}
                  style={{ border: "none", background: "none", cursor: "pointer", display: "flex", padding: 6 }}
                >
                  <Trash2 size={15} color={COLORS.danger} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: 14 }}>
              Không tìm thấy khách hàng phù hợp.
            </div>
          )}
        </div>
      </Card>

      {selected && (
        <Card style={{ width: 300, padding: 20, height: "fit-content" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Avatar name={selected.name} size={48} />
            <button onClick={() => setSelected(null)} style={{ border: "none", background: "none", cursor: "pointer" }}>
              <X size={18} color={COLORS.muted} />
            </button>
          </div>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 20, marginTop: 10 }}>{selected.name}</div>
          <div style={{ marginTop: 4 }}>
            <TierPill tier={selected.tier} />
          </div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5 }}>
            <div style={{ display: "flex", gap: 8, color: COLORS.muted }}>
              <Phone size={15} /> {selected.phone}
            </div>
            <div style={{ display: "flex", gap: 8, color: COLORS.muted }}>
              <Building2 size={15} /> {BRANCHES.find((b) => b.id === selected.branch)?.name}
            </div>
            <div style={{ display: "flex", gap: 8, color: COLORS.muted }}>
              <Clock size={15} /> Ghé thăm {selected.lastVisit}
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 12.5, color: COLORS.muted, marginBottom: 8 }}>Ghi chú chăm sóc</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {selected.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 12,
                    background: COLORS.page,
                    padding: "4px 9px",
                    borderRadius: 999,
                    color: COLORS.ink,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.muted, fontSize: 12.5 }}>Tổng chi tiêu</div>
            <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 22 }}>{money(selected.spend)}</div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, color: COLORS.muted }}>Dịch vụ đang sử dụng</span>
              <button
                onClick={() => setModalCustomer(selected)}
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, color: COLORS.copper, fontWeight: 600 }}
              >
                Sửa giá / mã giảm giá
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {customerServices
                .filter((cs) => cs.customerId === selected.id)
                .map((cs) => {
                  const svc = services.find((s) => s.id === cs.serviceId);
                  const discount = discounts.find((d) => d.id === cs.discountId);
                  if (!svc) return null;
                  return (
                    <div
                      key={svc.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: COLORS.page,
                        borderRadius: 8,
                        padding: "6px 10px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13 }}>{svc.name}</div>
                        <div style={{ fontSize: 11.5, color: COLORS.muted }}>
                          {discount ? (
                            <>
                              <span style={{ textDecoration: "line-through" }}>{money(cs.price)}</span>{" "}
                              {money(finalPrice(cs.price, discount))} · {discount.code}
                            </>
                          ) : (
                            money(cs.price)
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onUnassignService(selected.id, svc.id)}
                        style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}
                      >
                        <X size={13} color={COLORS.muted} />
                      </button>
                    </div>
                  );
                })}
              {customerServices.filter((cs) => cs.customerId === selected.id).length === 0 && (
                <div style={{ fontSize: 13, color: COLORS.muted }}>Chưa sử dụng dịch vụ nào.</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <select
                value={addServiceId}
                onChange={(e) => setAddServiceId(e.target.value)}
                style={{
                  flex: 1,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  padding: "7px 8px",
                  fontSize: 12.5,
                  fontFamily: "Manrope, sans-serif",
                  color: COLORS.ink,
                }}
              >
                <option value="">Chọn dịch vụ...</option>
                {services
                  .filter((s) => !customerServices.some((cs) => cs.customerId === selected.id && cs.serviceId === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => {
                  if (!addServiceId) return;
                  const svc = services.find((s) => s.id === Number(addServiceId));
                  onAssignService(selected.id, Number(addServiceId), svc.price, null);
                  setAddServiceId("");
                }}
                style={{
                  border: "none",
                  background: COLORS.forest,
                  color: "#fff",
                  borderRadius: 8,
                  padding: "0 12px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Thêm
              </button>
            </div>
          </div>
        </Card>
      )}

      {modalCustomer && (
        <CustomerFormModal
          customer={modalCustomer === "new" ? null : modalCustomer}
          services={services}
          discounts={discounts}
          customerServices={customerServices}
          onSave={(id, fields, rows) => {
            const savedId = onSaveCustomer(id, fields, rows);
            if (selected && id === selected.id) setSelected({ ...selected, ...fields });
          }}
          onClose={() => setModalCustomer(null)}
        />
      )}
    </div>
  );
}

const labelStyle = { fontSize: 12.5, color: COLORS.muted, marginBottom: 5 };
const inputStyle = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "8px 9px",
  fontSize: 13,
  fontFamily: "Manrope, sans-serif",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
};

function CustomerFormModal({ customer, services, discounts, customerServices, onSave, onClose }) {
  const isEdit = !!customer;
  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [branchVal, setBranchVal] = useState(customer?.branch || BRANCHES[1].id);
  const [tier, setTier] = useState(customer?.tier || "Bạc");
  const [rows, setRows] = useState(
    isEdit
      ? customerServices
          .filter((cs) => cs.customerId === customer.id)
          .map((cs) => ({ serviceId: cs.serviceId, price: cs.price, discountId: cs.discountId || "" }))
      : []
  );

  const addRow = () => setRows((r) => [...r, { serviceId: "", price: "", discountId: "" }]);
  const updateRow = (idx, patch) => setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx));
  const handleServiceChange = (idx, serviceId) => {
    const svc = services.find((s) => s.id === Number(serviceId));
    updateRow(idx, { serviceId: serviceId ? Number(serviceId) : "", price: svc ? svc.price : "" });
  };

  const submit = () => {
    if (!name.trim()) return;
    const validRows = rows
      .filter((r) => r.serviceId)
      .map((r) => ({
        serviceId: Number(r.serviceId),
        price: Number(r.price) || 0,
        discountId: r.discountId ? Number(r.discountId) : null,
      }));
    onSave(customer?.id ?? null, { name: name.trim(), phone: phone.trim(), branch: branchVal, tier }, validRows);
    onClose();
  };

  return (
    <Modal title={isEdit ? "Sửa thông tin khách hàng" : "Thêm khách hàng mới"} onClose={onClose} width={640}>
      <div data-keep="1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={labelStyle}>Họ tên</div>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <div style={labelStyle}>Số điện thoại</div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <div style={labelStyle}>Chi nhánh</div>
          <select value={branchVal} onChange={(e) => setBranchVal(e.target.value)} style={inputStyle}>
            {BRANCHES.filter((b) => b.id !== "all").map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>Hạng khách hàng</div>
          <select value={tier} onChange={(e) => setTier(e.target.value)} style={inputStyle}>
            {["Bạc", "Vàng", "Kim cương"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>Dịch vụ, giá & mã giảm giá</div>
          <button
            onClick={addRow}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "none",
              background: COLORS.page,
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            <Plus size={13} /> Thêm dòng
          </button>
        </div>

        {rows.length === 0 && (
          <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>Chưa có dịch vụ nào được gán.</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row, idx) => {
            const discount = discounts.find((d) => d.id === Number(row.discountId));
            const final = finalPrice(Number(row.price) || 0, discount);
            return (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.3fr 0.9fr auto", gap: 6, alignItems: "center" }}>
                <select value={row.serviceId} onChange={(e) => handleServiceChange(idx, e.target.value)} style={inputStyle}>
                  <option value="">Chọn dịch vụ...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={row.price}
                  onChange={(e) => updateRow(idx, { price: e.target.value })}
                  placeholder="Giá"
                  style={inputStyle}
                />
                <select value={row.discountId} onChange={(e) => updateRow(idx, { discountId: e.target.value })} style={inputStyle}>
                  <option value="">Không giảm giá</option>
                  {discounts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} (-{d.type === "percent" ? d.value + "%" : money(d.value)})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 12.5, fontWeight: 600, textAlign: "right" }}>{row.price ? money(final) : "—"}</div>
                <button onClick={() => removeRow(idx)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}>
                  <X size={15} color={COLORS.danger} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
        <button
          onClick={onClose}
          style={{ border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 9, padding: "9px 16px", fontSize: 13.5, cursor: "pointer" }}
        >
          Huỷ
        </button>
        <button
          onClick={submit}
          style={{ border: "none", background: COLORS.forest, color: "#fff", borderRadius: 9, padding: "9px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
        >
          Lưu thông tin
        </button>
      </div>
    </Modal>
  );
}

function FinancePage({ branch }) {
  const filtered = TRANSACTIONS.filter((t) => branch === "all" || t.branch === branch);
  const totalIn = filtered.filter((t) => t.type === "in").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === "out").reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ color: COLORS.muted, fontSize: 13 }}>Tổng thu</div>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 24, color: COLORS.success, marginTop: 6 }}>
            {money(totalIn)}
          </div>
        </Card>
        <Card style={{ padding: 18 }}>
          <div style={{ color: COLORS.muted, fontSize: 13 }}>Tổng chi</div>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 24, color: COLORS.danger, marginTop: 6 }}>
            {money(totalOut)}
          </div>
        </Card>
        <Card style={{ padding: 18 }}>
          <div style={{ color: COLORS.muted, fontSize: 13 }}>Lợi nhuận ròng</div>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 24, color: COLORS.ink, marginTop: 6 }}>
            {money(totalIn - totalOut)}
          </div>
        </Card>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 18 }}>Giao dịch gần đây</div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: `1px solid ${COLORS.border}`,
              padding: "7px 12px",
              borderRadius: 9,
              fontSize: 13,
              color: COLORS.ink,
              cursor: "pointer",
            }}
          >
            <Filter size={14} /> Lọc
          </button>
        </div>
        <div>
          {filtered.map((t, i) => (
            <div
              key={t.id}
              className="rs-listrow"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 16px",
                borderTop: i === 0 ? "none" : `1px solid ${COLORS.border}`,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: t.type === "in" ? "#E7F3EC" : "#F7E9E5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {t.type === "in" ? (
                  <TrendingUp size={16} color={COLORS.success} />
                ) : (
                  <TrendingDown size={16} color={COLORS.danger} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</div>
                <div style={{ color: COLORS.muted, fontSize: 12.5 }}>
                  {BRANCHES.find((b) => b.id === t.branch)?.name} · {t.date}
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, color: t.type === "in" ? COLORS.success : COLORS.danger }}>
                {t.type === "in" ? "+" : "-"}
                {money(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function InboxPage({ branch }) {
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id);
  const [assignments, setAssignments] = useState(
    Object.fromEntries(CONVERSATIONS.map((c) => [c.id, c.assignedTo]))
  );

  const filtered = CONVERSATIONS.filter((c) => branch === "all" || c.branch === branch);
  const active = filtered.find((c) => c.id === selectedId) || filtered[0];

  return (
    <div className="rs-row" style={{ display: "flex", gap: 14, height: 560 }}>
      <Card className="rs-inbox-list" style={{ width: 320, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 14, borderBottom: `1px solid ${COLORS.border}`, fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 17 }}>
          Hộp thoại hợp nhất
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.map((c, i) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              style={{
                display: "flex",
                gap: 10,
                padding: "12px 14px",
                borderTop: i === 0 ? "none" : `1px solid ${COLORS.border}`,
                cursor: "pointer",
                background: active?.id === c.id ? COLORS.page : "transparent",
              }}
            >
              <Avatar name={c.customer} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.customer}
                  </span>
                  <span style={{ color: COLORS.muted, fontSize: 11.5, flexShrink: 0 }}>{c.time}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <ChannelBadge channel={c.channel} />
                  <span
                    style={{
                      fontSize: 12.5,
                      color: c.unread ? COLORS.ink : COLORS.muted,
                      fontWeight: c.unread ? 600 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.preview}
                  </span>
                </div>
              </div>
              {c.unread && (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.copper, flexShrink: 0, marginTop: 4 }} />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="rs-inbox-thread" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        {active && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                padding: 14,
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={active.customer} size={34} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{active.customer}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ChannelBadge channel={active.channel} />
                    <span style={{ color: COLORS.muted, fontSize: 12.5 }}>
                      {BRANCHES.find((b) => b.id === active.branch)?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, color: COLORS.muted }}>Phân công:</span>
                <select
                  value={assignments[active.id] ?? ""}
                  onChange={(e) =>
                    setAssignments((prev) => ({ ...prev, [active.id]: e.target.value ? Number(e.target.value) : null }))
                  }
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 13,
                    fontFamily: "Manrope, sans-serif",
                    color: COLORS.ink,
                  }}
                >
                  <option value="">Chưa phân công</option>
                  {STAFF.filter((s) => active.branch === "all" || s.branch === active.branch).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
              <div style={{ alignSelf: "flex-start", maxWidth: "70%" }}>
                <div style={{ background: COLORS.page, padding: "10px 14px", borderRadius: "4px 14px 14px 14px", fontSize: 14 }}>
                  {active.preview}
                </div>
                <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 4 }}>{active.time} trước</div>
              </div>
              {assignments[active.id] && (
                <div style={{ alignSelf: "flex-end", maxWidth: "70%" }}>
                  <div
                    style={{
                      background: COLORS.forest,
                      color: "#fff",
                      padding: "10px 14px",
                      borderRadius: "14px 4px 14px 14px",
                      fontSize: 14,
                    }}
                  >
                    Dạ chào chị, em kiểm tra lịch và phản hồi ngay ạ.
                  </div>
                  <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 4, textAlign: "right" }}>
                    {STAFF.find((s) => s.id === assignments[active.id])?.name}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, padding: 14, borderTop: `1px solid ${COLORS.border}` }}>
              <input
                placeholder="Nhập tin nhắn trả lời..."
                style={{
                  flex: 1,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 9,
                  padding: "10px 12px",
                  fontSize: 14,
                  fontFamily: "Manrope, sans-serif",
                  outline: "none",
                }}
              />
              <button
                style={{
                  background: COLORS.copper,
                  border: "none",
                  color: "#fff",
                  borderRadius: 9,
                  padding: "0 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                <Send size={15} /> Gửi
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

const parseTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
};

const STATUS_META = {
  confirmed: { label: "Đã đặt", bg: `${COLORS.copper}1A`, border: COLORS.copper, text: COLORS.copperDeep },
  in_progress: { label: "Đang phục vụ", bg: COLORS.forest, border: COLORS.forest, text: "#fff" },
  done: { label: "Hoàn thành", bg: `${COLORS.success}1A`, border: COLORS.success, text: COLORS.success },
  cancelled: { label: "Đã huỷ", bg: COLORS.page, border: COLORS.border, text: COLORS.muted },
};

function AppointmentsPage({ branch, customers, services, appointments, onAddAppointment, onUpdateAppointment, onDeleteAppointment }) {
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState(null);

  const staffList = STAFF.filter((s) => s.branch === branch);
  const dayAppointments = appointments.filter((a) => a.branch === branch);
  const hours = [];
  for (let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) hours.push(h);
  const gridHeight = (CAL_END_HOUR - CAL_START_HOUR) * CAL_ROW_HEIGHT;

  if (branch === "all") {
    return (
      <Card style={{ padding: 40, textAlign: "center", color: COLORS.muted, fontSize: 14 }}>
        Vui lòng chọn một chi nhánh cụ thể ở sidebar để xem lịch hẹn theo từng nhân viên.
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: COLORS.muted, fontSize: 13.5 }}>Lịch hẹn hôm nay · {staffList.length} nhân viên</div>
        <button
          onClick={() => setFormOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: COLORS.copper,
            color: "#fff",
            border: "none",
            padding: "9px 14px",
            borderRadius: 9,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={15} /> Thêm lịch hẹn
        </button>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex" }}>
          <div style={{ width: 56, flexShrink: 0, borderRight: `1px solid ${COLORS.border}` }}>
            <div style={{ height: 52, borderBottom: `1px solid ${COLORS.border}` }} />
            <div style={{ position: "relative", height: gridHeight }}>
              {hours.map((h) => (
                <div
                  key={h}
                  style={{
                    position: "absolute",
                    top: (h - CAL_START_HOUR) * CAL_ROW_HEIGHT - 7,
                    right: 8,
                    fontSize: 11.5,
                    color: COLORS.muted,
                  }}
                >
                  {h}:00
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flex: 1, overflowX: "auto" }}>
            {staffList.map((s) => {
              const apps = dayAppointments.filter((a) => a.staffId === s.id);
              return (
                <div key={s.id} style={{ flex: 1, minWidth: 160, borderRight: `1px solid ${COLORS.border}` }}>
                  <div
                    style={{
                      height: 52,
                      borderBottom: `1px solid ${COLORS.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "0 10px",
                    }}
                  >
                    <Avatar name={s.name} color={s.avatarColor} size={28} />
                    <span style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.name}
                    </span>
                  </div>
                  <div style={{ position: "relative", height: gridHeight }}>
                    {hours.slice(0, -1).map((h) => (
                      <div
                        key={h}
                        style={{
                          position: "absolute",
                          top: (h - CAL_START_HOUR) * CAL_ROW_HEIGHT,
                          left: 0,
                          right: 0,
                          height: CAL_ROW_HEIGHT,
                          borderBottom: `1px solid ${COLORS.page}`,
                        }}
                      />
                    ))}
                    {apps.map((a) => {
                      const svc = services.find((sv) => sv.id === a.serviceId);
                      const cust = customers.find((c) => c.id === a.customerId);
                      const meta = STATUS_META[a.status];
                      const top = (parseTime(a.start) - CAL_START_HOUR) * CAL_ROW_HEIGHT;
                      const height = (a.duration / 60) * CAL_ROW_HEIGHT - 3;
                      return (
                        <div
                          key={a.id}
                          onClick={() => setViewing(a)}
                          style={{
                            position: "absolute",
                            top,
                            left: 4,
                            right: 4,
                            height,
                            background: meta.bg,
                            border: `1px solid ${meta.border}`,
                            borderRadius: 7,
                            padding: "5px 7px",
                            cursor: "pointer",
                            overflow: "hidden",
                            opacity: a.status === "cancelled" ? 0.7 : 1,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: meta.text,
                              textDecoration: a.status === "cancelled" ? "line-through" : "none",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {cust?.name}
                          </div>
                          <div
                            style={{
                              fontSize: 10.5,
                              color: meta.text,
                              opacity: 0.85,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {svc?.name} · {a.start}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 12.5, color: COLORS.muted }}>
        {Object.entries(STATUS_META).map(([key, m]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: m.border, display: "inline-block" }} />
            {m.label}
          </div>
        ))}
      </div>

      {formOpen && (
        <AppointmentFormModal
          branch={branch}
          customers={customers}
          services={services}
          staffList={staffList}
          onSave={(data) => {
            onAddAppointment(data);
            setFormOpen(false);
          }}
          onClose={() => setFormOpen(false)}
        />
      )}

      {viewing && (
        <Modal title="Chi tiết lịch hẹn" onClose={() => setViewing(null)} width={420}>
          {(() => {
            const svc = services.find((sv) => sv.id === viewing.serviceId);
            const cust = customers.find((c) => c.id === viewing.customerId);
            const staffM = STAFF.find((s) => s.id === viewing.staffId);
            return (
              <div>
                <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 18 }}>{cust?.name}</div>
                <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>
                  {svc?.name} · {viewing.start} ({viewing.duration} phút) · {staffM?.name}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
                  {["confirmed", "in_progress", "done", "cancelled"].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateAppointment(viewing.id, { status: st });
                        setViewing({ ...viewing, status: st });
                      }}
                      style={{
                        border: viewing.status === st ? "none" : `1px solid ${COLORS.border}`,
                        background: viewing.status === st ? COLORS.forest : "#fff",
                        color: viewing.status === st ? "#fff" : COLORS.ink,
                        borderRadius: 8,
                        padding: "7px 11px",
                        fontSize: 12.5,
                        cursor: "pointer",
                      }}
                    >
                      {STATUS_META[st].label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                  <button
                    onClick={() => {
                      onDeleteAppointment(viewing.id);
                      setViewing(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      border: "none",
                      background: "none",
                      color: COLORS.danger,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    <Trash2 size={14} /> Xoá lịch hẹn
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}

function AppointmentFormModal({ branch, customers, services, staffList, onSave, onClose }) {
  const [customerId, setCustomerId] = useState(customers.filter((c) => c.branch === branch)[0]?.id || "");
  const [staffId, setStaffId] = useState(staffList[0]?.id || "");
  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [start, setStart] = useState("09:00");
  const [duration, setDuration] = useState(60);

  const submit = () => {
    if (!customerId || !staffId || !serviceId) return;
    onSave({
      customerId: Number(customerId),
      staffId: Number(staffId),
      serviceId: Number(serviceId),
      branch,
      start,
      duration: Number(duration),
      status: "confirmed",
    });
  };

  return (
    <Modal title="Thêm lịch hẹn mới" onClose={onClose} width={440}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={labelStyle}>Khách hàng</div>
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={inputStyle}>
            {customers.filter((c) => c.branch === branch).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>Dịch vụ</div>
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} style={inputStyle}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>Nhân viên thực hiện</div>
          <select value={staffId} onChange={(e) => setStaffId(e.target.value)} style={inputStyle}>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div data-keep="1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={labelStyle}>Giờ bắt đầu</div>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={labelStyle}>Thời lượng (phút)</div>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <button onClick={onClose} style={{ border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 9, padding: "9px 16px", fontSize: 13.5, cursor: "pointer" }}>
          Huỷ
        </button>
        <button onClick={submit} style={{ border: "none", background: COLORS.forest, color: "#fff", borderRadius: 9, padding: "9px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
          Đặt lịch
        </button>
      </div>
    </Modal>
  );
}

function ServicesPage({
  categories,
  services,
  customers,
  discounts,
  customerServices,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onAddService,
  onUpdateService,
  onDeleteService,
  onAssignService,
  onUnassignService,
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const emptyForm = { name: "", categoryId: categories[0]?.id || "", price: "", duration: "" };
  const [form, setForm] = useState(null); // null = form closed, {editingId, ...fields} = open
  const [viewingService, setViewingService] = useState(null); // service whose customer-list modal is open
  const [addCustomerId, setAddCustomerId] = useState("");

  const filteredServices = services.filter((s) => activeCategory === "all" || s.categoryId === activeCategory);

  const openAddForm = () => setForm({ editingId: null, ...emptyForm });
  const openEditForm = (s) =>
    setForm({ editingId: s.id, name: s.name, categoryId: s.categoryId || "", price: s.price, duration: s.duration });

  const submitForm = () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      categoryId: form.categoryId || null,
      price: Number(form.price) || 0,
      duration: Number(form.duration) || 0,
    };
    if (form.editingId) {
      onUpdateService(form.editingId, payload);
    } else {
      onAddService(payload);
    }
    setForm(null);
  };

  return (
    <div className="rs-row" style={{ display: "flex", gap: 14 }}>
      {/* Categories */}
      <Card style={{ width: 250, padding: 16, height: "fit-content" }}>
        <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 12 }}>Danh mục dịch vụ</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            onClick={() => setActiveCategory("all")}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 10px",
              borderRadius: 8,
              cursor: "pointer",
              background: activeCategory === "all" ? COLORS.page : "transparent",
              fontSize: 13.5,
              fontWeight: activeCategory === "all" ? 600 : 500,
            }}
          >
            Tất cả dịch vụ
            <span style={{ color: COLORS.muted }}>{services.length}</span>
          </div>

          {categories.map((c) => {
            const count = services.filter((s) => s.categoryId === c.id).length;
            const isEditing = editingCategoryId === c.id;
            return (
              <div
                key={c.id}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: activeCategory === c.id ? COLORS.page : "transparent",
                  fontSize: 13.5,
                }}
              >
                {isEditing ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      style={{
                        flex: 1,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 6,
                        padding: "4px 6px",
                        fontSize: 13,
                        fontFamily: "Manrope, sans-serif",
                      }}
                    />
                    <button
                      onClick={() => {
                        onRenameCategory(c.id, editingCategoryName.trim() || c.name);
                        setEditingCategoryId(null);
                      }}
                      style={{ border: "none", background: "none", cursor: "pointer" }}
                    >
                      <CheckCircle2 size={16} color={COLORS.success} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span onClick={() => setActiveCategory(c.id)} style={{ cursor: "pointer", flex: 1, fontWeight: activeCategory === c.id ? 600 : 500 }}>
                      {c.name}
                    </span>
                    <span style={{ color: COLORS.muted, marginRight: 8 }}>{count}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          setEditingCategoryId(c.id);
                          setEditingCategoryName(c.name);
                        }}
                        style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}
                      >
                        <Pencil size={13} color={COLORS.muted} />
                      </button>
                      <button
                        onClick={() => {
                          if (activeCategory === c.id) setActiveCategory("all");
                          onDeleteCategory(c.id);
                        }}
                        style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}
                      >
                        <Trash2 size={13} color={COLORS.danger} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Danh mục mới"
            style={{
              flex: 1,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "7px 9px",
              fontSize: 13,
              fontFamily: "Manrope, sans-serif",
              outline: "none",
            }}
          />
          <button
            onClick={() => {
              if (!newCategory.trim()) return;
              onAddCategory(newCategory.trim());
              setNewCategory("");
            }}
            style={{ border: "none", background: COLORS.forest, color: "#fff", borderRadius: 8, padding: "0 10px", cursor: "pointer" }}
          >
            <Plus size={15} />
          </button>
        </div>
      </Card>

      {/* Services list */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 18 }}>
            {activeCategory === "all" ? "Tất cả dịch vụ" : categories.find((c) => c.id === activeCategory)?.name}
          </div>
          <button
            onClick={openAddForm}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: COLORS.copper,
              color: "#fff",
              border: "none",
              padding: "9px 14px",
              borderRadius: 9,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={15} /> Thêm dịch vụ
          </button>
        </div>

        {form && (
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>
              {form.editingId ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.3fr 1fr 1fr auto", gap: 8 }}>
              <input
                placeholder="Tên dịch vụ"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
              />
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} style={inputStyle}>
                <option value="">Chưa phân loại</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="Giá (đ)"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Phút"
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={submitForm}
                  style={{ border: "none", background: COLORS.forest, color: "#fff", borderRadius: 8, padding: "0 12px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                >
                  Lưu
                </button>
                <button
                  onClick={() => setForm(null)}
                  style={{ border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 8, padding: "0 10px", cursor: "pointer" }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </Card>
        )}

        <Card style={{ padding: 0, overflow: "hidden" }}>
          {filteredServices.map((s, i) => {
            const cat = categories.find((c) => c.id === s.categoryId);
            const users = customerServices.filter((cs) => cs.serviceId === s.id);
            return (
              <div key={s.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.border}` }}>
                <div className="rs-listrow" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: COLORS.page,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Tag size={16} color={COLORS.copper} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5 }}>{s.name}</div>
                    <div style={{ color: COLORS.muted, fontSize: 12.5 }}>
                      {cat ? cat.name : "Chưa phân loại"} · {s.duration} phút
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{money(s.price)}</div>
                  <button
                    onClick={() => setViewingService(s)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      border: `1px solid ${COLORS.border}`,
                      background: "#fff",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 12.5,
                      cursor: "pointer",
                      color: COLORS.ink,
                    }}
                  >
                    <Users size={13} /> {users.length}
                  </button>
                  <button onClick={() => openEditForm(s)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}>
                    <Pencil size={15} color={COLORS.muted} />
                  </button>
                  <button onClick={() => onDeleteService(s.id)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}>
                    <Trash2 size={15} color={COLORS.danger} />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredServices.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: 14 }}>
              Chưa có dịch vụ nào trong danh mục này.
            </div>
          )}
        </Card>
      </div>

      {viewingService && (
        <ServiceCustomersModal
          service={viewingService}
          customers={customers}
          discounts={discounts}
          customerServices={customerServices}
          addCustomerId={addCustomerId}
          setAddCustomerId={setAddCustomerId}
          onAssignService={onAssignService}
          onUnassignService={onUnassignService}
          onClose={() => {
            setViewingService(null);
            setAddCustomerId("");
          }}
        />
      )}
    </div>
  );
}

function ServiceCustomersModal({
  service,
  customers,
  discounts,
  customerServices,
  addCustomerId,
  setAddCustomerId,
  onAssignService,
  onUnassignService,
  onClose,
}) {
  const rows = customerServices.filter((cs) => cs.serviceId === service.id);
  const available = customers.filter((c) => !rows.some((r) => r.customerId === c.id));

  return (
    <Modal title={`Khách hàng đang dùng "${service.name}"`} onClose={onClose} width={600}>
      <div style={{ maxHeight: 320, overflowY: "auto", overflowX: "auto", border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: COLORS.page, textAlign: "left" }}>
              <th style={thStyle}>Khách hàng</th>
              <th style={thStyle}>Chi nhánh</th>
              <th style={thStyle}>Giá áp dụng</th>
              <th style={thStyle}>Mã giảm giá</th>
              <th style={{ ...thStyle, textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const cust = customers.find((c) => c.id === r.customerId);
              const discount = discounts.find((d) => d.id === r.discountId);
              if (!cust) return null;
              return (
                <tr key={cust.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar name={cust.name} size={26} />
                      {cust.name}
                    </div>
                  </td>
                  <td style={tdStyle}>{BRANCHES.find((b) => b.id === cust.branch)?.name}</td>
                  <td style={tdStyle}>{money(finalPrice(r.price, discount))}</td>
                  <td style={tdStyle}>{discount ? discount.code : "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button
                      onClick={() => onUnassignService(cust.id, service.id)}
                      style={{ border: "none", background: "none", cursor: "pointer", display: "inline-flex" }}
                    >
                      <X size={14} color={COLORS.muted} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: COLORS.muted }}>
                  Chưa có khách hàng nào dùng dịch vụ này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
        <select value={addCustomerId} onChange={(e) => setAddCustomerId(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
          <option value="">Chọn khách hàng...</option>
          {available.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            if (!addCustomerId) return;
            onAssignService(Number(addCustomerId), service.id, service.price, null);
            setAddCustomerId("");
          }}
          style={{
            border: "none",
            background: COLORS.forest,
            color: "#fff",
            borderRadius: 8,
            padding: "0 14px",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Thêm khách hàng
        </button>
      </div>
    </Modal>
  );
}

const thStyle = { padding: "9px 12px", fontSize: 12, color: COLORS.muted, fontWeight: 600 };
const tdStyle = { padding: "9px 12px" };

function POSPage({ branch, customers, services, products, discounts, onCheckout }) {
  const [tab, setTab] = useState("services");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState("");

  if (branch === "all") {
    return (
      <Card style={{ padding: 40, textAlign: "center", color: COLORS.muted, fontSize: 14 }}>
        Vui lòng chọn một chi nhánh cụ thể ở sidebar để tạo hoá đơn bán hàng.
      </Card>
    );
  }

  const branchStaff = STAFF.filter((s) => s.branch === branch);
  const branchCustomers = customers.filter((c) => branch === "all" || c.branch === branch);

  const catalog =
    tab === "services"
      ? services.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
      : products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const addService = (s) => {
    setCart((prev) => [
      ...prev,
      { key: Date.now() + Math.random(), type: "service", refId: s.id, name: s.name, price: s.price, discountId: null, staffId: branchStaff[0]?.id || null },
    ]);
  };

  const addProduct = (p) => {
    setCart((prev) => {
      const existing = prev.find((it) => it.type === "product" && it.refId === p.id);
      if (existing) {
        return prev.map((it) => (it === existing ? { ...it, qty: Math.min(it.qty + 1, p.stock) } : it));
      }
      if (p.stock <= 0) return prev;
      return [...prev, { key: Date.now() + Math.random(), type: "product", refId: p.id, name: p.name, price: p.price, qty: 1, maxStock: p.stock }];
    });
  };

  const updateLine = (key, patch) => setCart((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  const removeLine = (key) => setCart((prev) => prev.filter((it) => it.key !== key));

  const total = cart.reduce((sum, it) => {
    if (it.type === "product") return sum + it.price * it.qty;
    const discount = discounts.find((d) => d.id === it.discountId);
    return sum + finalPrice(it.price, discount);
  }, 0);

  const checkout = () => {
    if (cart.length === 0) return;
    onCheckout({
      customerId: customerId ? Number(customerId) : null,
      branch,
      date: "Hôm nay",
      items: cart.map(({ key, maxStock, ...rest }) => rest),
    });
    setCart([]);
    setCustomerId("");
  };

  return (
    <div className="rs-row" style={{ display: "flex", gap: 14, height: 600 }}>
      <Card style={{ flex: 1.4, padding: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {[
            { id: "services", label: "Dịch vụ" },
            { id: "products", label: "Sản phẩm" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                border: "none",
                background: tab === t.id ? COLORS.forest : COLORS.page,
                color: tab === t.id ? "#fff" : COLORS.ink,
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
          <div style={{ position: "relative", flex: 1, minWidth: 140 }}>
            <Search size={15} color={COLORS.muted} style={{ position: "absolute", left: 9, top: 9 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              style={{ ...inputStyle, paddingLeft: 30 }}
            />
          </div>
        </div>

        <div data-keep="1" style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, alignContent: "start" }}>
          {catalog.map((item) => {
            const isProduct = tab === "products";
            const outOfStock = isProduct && item.stock <= 0;
            return (
              <div
                key={item.id}
                onClick={() => !outOfStock && (isProduct ? addProduct(item) : addService(item))}
                style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: 12,
                  cursor: outOfStock ? "not-allowed" : "pointer",
                  opacity: outOfStock ? 0.5 : 1,
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: COLORS.page,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isProduct ? <Package size={14} color={COLORS.copper} /> : <Tag size={14} color={COLORS.copper} />}
                  </div>
                  {isProduct && (
                    <span style={{ fontSize: 11, color: outOfStock ? COLORS.danger : COLORS.muted }}>
                      {outOfStock ? "Hết hàng" : `Còn ${item.stock}`}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 8 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: COLORS.copperDeep, fontWeight: 600, marginTop: 2 }}>{money(item.price)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card style={{ width: 340, padding: 16, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>Hoá đơn</div>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }}>
          <option value="">Khách lẻ</option>
          {branchCustomers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {cart.map((it) => {
            const discount = it.type === "service" ? discounts.find((d) => d.id === it.discountId) : null;
            return (
              <div key={it.key} style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</span>
                  <button onClick={() => removeLine(it.key)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}>
                    <X size={13} color={COLORS.muted} />
                  </button>
                </div>
                {it.type === "service" ? (
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <select
                      value={it.staffId || ""}
                      onChange={(e) => updateLine(it.key, { staffId: Number(e.target.value) })}
                      style={{ ...inputStyle, fontSize: 12, padding: "6px 7px", flex: 1 }}
                    >
                      {branchStaff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={it.discountId || ""}
                      onChange={(e) => updateLine(it.key, { discountId: e.target.value ? Number(e.target.value) : null })}
                      style={{ ...inputStyle, fontSize: 12, padding: "6px 7px", flex: 1 }}
                    >
                      <option value="">Không giảm giá</option>
                      {discounts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <button
                      onClick={() => updateLine(it.key, { qty: Math.max(1, it.qty - 1) })}
                      style={{ border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 6, width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Minus size={11} />
                    </button>
                    <span style={{ fontSize: 12.5, minWidth: 18, textAlign: "center" }}>{it.qty}</span>
                    <button
                      onClick={() => updateLine(it.key, { qty: Math.min(it.maxStock ?? 99, it.qty + 1) })}
                      style={{ border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 6, width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                )}
                <div style={{ textAlign: "right", fontSize: 13, fontWeight: 600, marginTop: 6 }}>
                  {money(it.type === "product" ? it.price * it.qty : finalPrice(it.price, discount))}
                </div>
              </div>
            );
          })}
          {cart.length === 0 && <div style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", marginTop: 20 }}>Giỏ hàng trống.</div>}
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12, marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700 }}>
            <span>Tổng cộng</span>
            <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700 }}>{money(total)}</span>
          </div>
          <button
            onClick={checkout}
            disabled={cart.length === 0}
            style={{
              width: "100%",
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              border: "none",
              background: cart.length === 0 ? COLORS.border : COLORS.forest,
              color: "#fff",
              borderRadius: 9,
              padding: "12px 0",
              fontSize: 14,
              fontWeight: 700,
              cursor: cart.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            <Banknote size={17} /> Thanh toán
          </button>
        </div>
      </Card>
    </div>
  );
}

function StaffPage({ branch, orders, discounts }) {
  const filtered = STAFF.filter((s) => branch === "all" || s.branch === branch);

  const commissionFor = (staffId) =>
    orders.reduce((sum, o) => {
      const lines = o.items.filter((it) => it.type === "service" && it.staffId === staffId);
      const staffMember = STAFF.find((s) => s.id === staffId);
      const rate = (staffMember?.commissionRate || 0) / 100;
      const lineTotal = lines.reduce((s2, it) => {
        const discount = discounts.find((d) => d.id === it.discountId);
        return s2 + finalPrice(it.price, discount);
      }, 0);
      return sum + lineTotal * rate;
    }, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {filtered.map((s) => (
        <Card key={s.id} style={{ padding: 18 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar name={s.name} color={s.avatarColor} size={44} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
              <div style={{ color: COLORS.muted, fontSize: 13 }}>{s.role}</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 13 }}>
            <div>
              <div style={{ color: COLORS.muted }}>Chi nhánh</div>
              <div style={{ fontWeight: 500, marginTop: 2 }}>
                {BRANCHES.find((b) => b.id === s.branch)?.name}
              </div>
            </div>
            <div>
              <div style={{ color: COLORS.muted }}>Đánh giá</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontWeight: 500 }}>
                <Star size={13} color={COLORS.copper} fill={COLORS.copper} /> {s.rating}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
              background: COLORS.page,
              borderRadius: 9,
              padding: "9px 12px",
            }}
          >
            <div>
              <div style={{ color: COLORS.muted, fontSize: 11.5 }}>Hoa hồng ({s.commissionRate}%)</div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: COLORS.success }}>{money(commissionFor(s.id))}</div>
            </div>
            <Percent size={16} color={COLORS.success} />
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: COLORS.muted, marginBottom: 6 }}>
              <span>Khối lượng công việc</span>
              <span>{s.load}/8 khách</span>
            </div>
            <div style={{ height: 6, background: COLORS.page, borderRadius: 4 }}>
              <div
                style={{
                  width: `${(s.load / 8) * 100}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: s.load >= 6 ? COLORS.warning : COLORS.success,
                }}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function BranchesPage({ customers }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {BRANCHES.filter((b) => b.id !== "all").map((b, i) => {
        const rev = BRANCH_REVENUE[i];
        const staffCount = STAFF.filter((s) => s.branch === b.id).length;
        const custCount = customers.filter((c) => c.branch === b.id).length;
        return (
          <Card key={b.id} style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: COLORS.forest,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Building2 size={19} color="#fff" />
              </div>
              <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 17 }}>{b.name}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
              <div>
                <div style={{ color: COLORS.muted, fontSize: 12.5 }}>Doanh thu tháng</div>
                <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 20, marginTop: 2 }}>
                  {rev.revenue} triệu đ
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: COLORS.muted, fontSize: 12.5 }}>Nhân viên</div>
                <div style={{ fontWeight: 600, fontSize: 16, marginTop: 2 }}>{staffCount}</div>
              </div>
            </div>
            <div style={{ marginTop: 10, color: COLORS.muted, fontSize: 13 }}>
              {custCount} khách hàng đang theo dõi
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function DiscountsPage({ discounts, customerServices, onAddDiscount, onUpdateDiscount, onDeleteDiscount }) {
  const emptyForm = { code: "", type: "percent", value: "", description: "" };
  const [form, setForm] = useState(null);

  const openAddForm = () => setForm({ editingId: null, ...emptyForm });
  const openEditForm = (d) => setForm({ editingId: d.id, code: d.code, type: d.type, value: d.value, description: d.description });

  const submitForm = () => {
    if (!form.code.trim()) return;
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value) || 0,
      description: form.description.trim(),
    };
    if (form.editingId) {
      onUpdateDiscount(form.editingId, payload);
    } else {
      onAddDiscount(payload);
    }
    setForm(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 18 }}>Danh sách mã giảm giá</div>
        <button
          onClick={openAddForm}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: COLORS.copper,
            color: "#fff",
            border: "none",
            padding: "9px 14px",
            borderRadius: 9,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={15} /> Thêm mã giảm giá
        </button>
      </div>

      {form && (
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>
            {form.editingId ? "Sửa mã giảm giá" : "Thêm mã giảm giá mới"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.6fr auto", gap: 8 }}>
            <input
              placeholder="Mã (VD: SPA10)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              style={inputStyle}
            />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
              <option value="percent">Giảm theo %</option>
              <option value="fixed">Giảm số tiền cố định</option>
            </select>
            <input
              placeholder={form.type === "percent" ? "VD: 10" : "VD: 200000"}
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Mô tả"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={submitForm}
                style={{ border: "none", background: COLORS.forest, color: "#fff", borderRadius: 8, padding: "0 12px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                Lưu
              </button>
              <button
                onClick={() => setForm(null)}
                style={{ border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 8, padding: "0 10px", cursor: "pointer" }}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </Card>
      )}

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {discounts.map((d, i) => {
          const usage = customerServices.filter((cs) => cs.discountId === d.id).length;
          return (
            <div
              key={d.id}
              className="rs-listrow"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderTop: i === 0 ? "none" : `1px solid ${COLORS.border}`,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: COLORS.page,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Percent size={16} color={COLORS.copper} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{d.code}</div>
                <div style={{ color: COLORS.muted, fontSize: 12.5 }}>{d.description || "Không có mô tả"}</div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.success }}>
                -{d.type === "percent" ? `${d.value}%` : money(d.value)}
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.muted, minWidth: 90, textAlign: "right" }}>
                {usage} lượt dùng
              </div>
              <button onClick={() => openEditForm(d)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}>
                <Pencil size={15} color={COLORS.muted} />
              </button>
              <button onClick={() => onDeleteDiscount(d.id)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}>
                <Trash2 size={15} color={COLORS.danger} />
              </button>
            </div>
          );
        })}
        {discounts.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: 14 }}>
            Chưa có mã giảm giá nào.
          </div>
        )}
      </Card>
    </div>
  );
}

function InvoicesInventoryPage({
  branch,
  customers,
  discounts,
  orders,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  initialTab = "invoices",
}) {
  const [tab, setTab] = useState(initialTab);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [form, setForm] = useState(null);

  const filteredOrders = orders.filter((o) => branch === "all" || o.branch === branch);

  const openAddForm = () => setForm({ editingId: null, name: "", price: "", cost: "", stock: "", lowStock: "" });
  const openEditForm = (p) =>
    setForm({ editingId: p.id, name: p.name, price: p.price, cost: p.cost, stock: p.stock, lowStock: p.lowStock });

  const submitForm = () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      price: Number(form.price) || 0,
      cost: Number(form.cost) || 0,
      stock: Number(form.stock) || 0,
      lowStock: Number(form.lowStock) || 5,
    };
    if (form.editingId) onUpdateProduct(form.editingId, payload);
    else onAddProduct(payload);
    setForm(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {tab === "invoices" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {filteredOrders.map((o, i) => {
            const cust = customers.find((c) => c.id === o.customerId);
            return (
              <div
                key={o.id}
                className="rs-listrow"
                onClick={() => setViewingOrder(o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 16px",
                  borderTop: i === 0 ? "none" : `1px solid ${COLORS.border}`,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: COLORS.page,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Receipt size={16} color={COLORS.copper} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Hoá đơn #{o.id} · {cust?.name || "Khách lẻ"}</div>
                  <div style={{ color: COLORS.muted, fontSize: 12.5 }}>
                    {BRANCHES.find((b) => b.id === o.branch)?.name} · {o.date} · {o.items.length} mục
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{money(orderTotal(o, discounts))}</div>
              </div>
            );
          })}
          {filteredOrders.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: 14 }}>
              Chưa có hoá đơn nào.
            </div>
          )}
        </Card>
      )}

      {tab === "inventory" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={openAddForm}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: COLORS.copper,
                color: "#fff",
                border: "none",
                padding: "9px 14px",
                borderRadius: 9,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={15} /> Thêm sản phẩm
            </button>
          </div>

          {form && (
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>
                {form.editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto", gap: 8 }}>
                <input placeholder="Tên sản phẩm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                <input placeholder="Giá bán" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} />
                <input placeholder="Giá vốn" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} style={inputStyle} />
                <input placeholder="Tồn kho" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={inputStyle} />
                <input placeholder="Ngưỡng cảnh báo" type="number" value={form.lowStock} onChange={(e) => setForm({ ...form, lowStock: e.target.value })} style={inputStyle} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={submitForm} style={{ border: "none", background: COLORS.forest, color: "#fff", borderRadius: 8, padding: "0 12px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    Lưu
                  </button>
                  <button onClick={() => setForm(null)} style={{ border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 8, padding: "0 10px", cursor: "pointer" }}>
                    <X size={15} />
                  </button>
                </div>
              </div>
            </Card>
          )}

          <Card style={{ padding: 0, overflow: "hidden" }}>
            {products.map((p, i) => {
              const low = p.stock <= p.lowStock;
              return (
                <div
                  key={p.id}
                  className="rs-listrow"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 16px",
                    borderTop: i === 0 ? "none" : `1px solid ${COLORS.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: low ? `${COLORS.danger}1A` : COLORS.page,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Package size={16} color={low ? COLORS.danger : COLORS.copper} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ color: COLORS.muted, fontSize: 12.5 }}>
                      Giá vốn {money(p.cost)} · Giá bán {money(p.price)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: low ? COLORS.danger : COLORS.ink }}>{p.stock} còn lại</div>
                    {low && <div style={{ fontSize: 11, color: COLORS.danger }}>Sắp hết hàng</div>}
                  </div>
                  <button onClick={() => openEditForm(p)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}>
                    <Pencil size={15} color={COLORS.muted} />
                  </button>
                  <button onClick={() => onDeleteProduct(p.id)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}>
                    <Trash2 size={15} color={COLORS.danger} />
                  </button>
                </div>
              );
            })}
            {products.length === 0 && (
              <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: 14 }}>
                Chưa có sản phẩm nào.
              </div>
            )}
          </Card>
        </>
      )}

      {viewingOrder && (
        <Modal title={`Chi tiết hoá đơn #${viewingOrder.id}`} onClose={() => setViewingOrder(null)} width={520}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {viewingOrder.items.map((it, idx) => {
              const discount = it.type === "service" ? discounts.find((d) => d.id === it.discountId) : null;
              const staffM = it.staffId ? STAFF.find((s) => s.id === it.staffId) : null;
              const lineTotal = it.type === "product" ? it.price * it.qty : finalPrice(it.price, discount);
              return (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{it.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>
                      {it.type === "product" ? `SL: ${it.qty}` : staffM ? `NV: ${staffM.name}` : ""}
                      {discount ? ` · ${discount.code}` : ""}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{money(lineTotal)}</div>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, fontSize: 15, fontWeight: 700 }}>
              <span>Tổng cộng</span>
              <span>{money(orderTotal(viewingOrder, discounts))}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------
const MENU = [
  { id: "dashboard", label: "Tổng quan", page: "dashboard" },
  { id: "position", label: "Vị trí", page: "position" },
  {
    id: "goods",
    label: "Hàng hoá",
    width: 250,
    groups: [
      {
        items: [
          { label: "Danh sách hàng hoá", page: "services" },
          { label: "Thiết lập giá", page: "price-setup" },
          { label: "Hoá đơn đầu vào", page: "purchase-invoices" },
        ],
      },
      {
        title: "Kho hàng",
        items: [
          { label: "Kiểm kho", page: "inventory" },
          { label: "Xuất huỷ", page: "write-off" },
          { label: "Xuất dùng", page: "stock-use" },
        ],
      },
      {
        title: "Nhập hàng",
        items: [
          { label: "Nhà cung cấp", page: "suppliers" },
          { label: "Nhập hàng", page: "purchase" },
          { label: "Trả hàng nhập", page: "purchase-return" },
        ],
      },
    ],
  },
  {
    id: "orders",
    label: "Đơn hàng",
    width: 220,
    groups: [{ items: [{ label: "Hoá đơn", page: "invoices" }, { label: "Trả hàng", page: "returns" }] }],
  },
  {
    id: "customers",
    label: "Khách hàng",
    width: 340,
    groups: [
      { items: [{ label: "Khách hàng", page: "customers" }, { label: "Gói & thẻ đã bán", page: "sold-packages" }] },
      {
        title: "CSKH & Marketing",
        items: [
          { label: "Voucher", page: "discounts" },
          { label: "Khuyến mại", page: "promotions" },
          { label: "Tin nhắn Zalo/Email/Wechat/Telegram", page: "messaging" },
        ],
      },
    ],
  },
  {
    id: "staff",
    label: "Nhân viên",
    width: 250,
    groups: [
      {
        items: [
          { label: "Danh sách nhân viên", page: "staff" },
          { label: "Lịch làm việc", page: "work-schedule" },
          { label: "Bảng chấm công", page: "timesheet" },
          { label: "Bảng lương", page: "payroll" },
          { label: "Bảng hoa hồng", page: "commission" },
          { label: "Thiết lập nhân viên", page: "staff-settings" },
        ],
      },
    ],
  },
  { id: "cashbook", label: "Sổ quỹ", page: "finance" },
  {
    id: "analytics",
    label: "Phân tích",
    width: 460,
    groups: [
      {
        title: "Báo cáo",
        columns: 2,
        items: [
          { label: "Cuối ngày", page: "report-eod" },
          { label: "Bán hàng", page: "report-sales" },
          { label: "Tài chính", page: "report-finance" },
          { label: "Hàng hoá", page: "report-goods" },
          { label: "Nhà cung cấp", page: "report-suppliers" },
          { label: "Khách hàng", page: "report-customers" },
          { label: "Gói & thẻ đã bán", page: "report-packages" },
          { label: "Đánh giá dịch vụ", page: "report-ratings" },
          { label: "Nhân viên", page: "report-staff" },
          { label: "Kênh bán", page: "report-channels" },
        ],
      },
    ],
  },
  {
    id: "tax",
    label: "Thuế & Kế toán",
    width: 230,
    groups: [{ items: [{ label: "Thuế & kế toán", page: "tax" }, { label: "Hoá đơn điện tử", page: "e-invoice" }] }],
  },
];

const isMenuActive = (m, page) =>
  m.page === page || (m.groups || []).some((g) => g.items.some((it) => it.page === page));

const PAGE_META = (() => {
  const meta = {
    appointments: { title: "Lịch hẹn", trail: ["Lịch hẹn"] },
    pos: { title: "Bán hàng", trail: ["Thu ngân", "Bán hàng"] },
    inbox: { title: "Hội thoại", trail: ["Hội thoại"] },
    branches: { title: "Chi nhánh", trail: ["Thiết lập", "Chi nhánh"] },
    settings: { title: "Thiết lập", trail: ["Thiết lập"] },
  };
  const dedupe = (arr) => arr.filter((x, i) => x !== arr[i - 1]);
  MENU.forEach((m) => {
    if (m.page && !meta[m.page]) meta[m.page] = { title: m.label, trail: [m.label] };
    (m.groups || []).forEach((g) =>
      g.items.forEach((it) => {
        if (!meta[it.page]) {
          meta[it.page] = { title: it.label, trail: dedupe([m.label, ...(g.title ? [g.title] : []), it.label]) };
        }
      })
    );
  });
  return meta;
})();

// [Tích hợp 2026-10-05] thêm "sold-packages" (trang Gói, thẻ đã bán kiểu KiotViet)
const IMPLEMENTED_PAGES = new Set([
  "dashboard",
  "position",
  "appointments",
  "pos",
  "customers",
  "sold-packages",
  "services",
  "price-setup",
  "invoices",
  "inventory",
  "discounts",
  "finance",
  "inbox",
  "staff",
  "commission",
  "branches",
  "settings",
  "account",
  "store-profile",
]);

const SETTINGS_DROPDOWN = [
  { id: "goods", title: "Hàng hoá", sub: "Thông tin, Nhập hàng", icon: Package },
  { id: "orders", title: "Đơn hàng", sub: "Hoá đơn", icon: ArrowLeftRight },
  { id: "customers", title: "Khách hàng", sub: "Voucher, Khuyến mại, Zalo/SMS/Email", icon: UserCog },
  { id: "online-booking", title: "Tiện ích", sub: "Đặt lịch online, Đánh giá dịch vụ, Tích điểm", icon: Star },
  { id: "store-info", title: "Cửa hàng", sub: "Thông tin, Người dùng, Chi nhánh, Bảo mật", icon: Store },
  { id: "lock-book", title: "Dữ liệu và Lịch sử thao tác", sub: "Khóa sổ, Lịch sử thao tác, Xóa dữ liệu", icon: ShieldCheck },
];

const SETTINGS_GROUPS = [
  {
    title: "Quản lý",
    items: [
      { id: "goods", label: "Hàng hoá", icon: Package },
      { id: "orders", label: "Đơn hàng", icon: ArrowLeftRight },
      { id: "customers", label: "Khách hàng", icon: UserCog },
      { id: "reports", label: "Báo cáo", icon: BarChart3 },
    ],
  },
  {
    title: null,
    items: [
      { id: "tax", label: "Thuế & Kế toán", icon: FileText },
      { id: "e-invoice", label: "Hoá đơn điện tử", icon: FileText },
      { id: "purchase-invoice", label: "Hoá đơn đầu vào", icon: Receipt },
      { id: "appointments-setting", label: "Lịch hẹn", icon: Calendar },
      { id: "print-templates", label: "Quản lý mẫu in", icon: Printer, external: true },
    ],
  },
  {
    title: "Tiện ích",
    items: [
      { id: "online-booking", label: "Đặt lịch online", icon: Calendar },
      { id: "loyalty", label: "Tích điểm", icon: Award },
      { id: "service-rating", label: "Đánh giá dịch vụ", icon: Star },
      { id: "clinic", label: "Phòng khám", icon: Stethoscope },
    ],
  },
  {
    title: "Cửa hàng",
    items: [
      { id: "store-info", label: "Thông tin cửa hàng", icon: Store },
      { id: "users", label: "Tài khoản người dùng", icon: Users },
      { id: "branches", label: "Quản lý chi nhánh", icon: MapPin },
      { id: "store-security", label: "Bảo mật cửa hàng", icon: ShieldCheck },
      { id: "hardware", label: "Driver cho phần cứng", icon: HardDrive, external: true },
    ],
  },
  {
    title: "Dữ liệu",
    items: [
      { id: "lock-book", label: "Khoá sổ", icon: Lock },
      { id: "audit-log", label: "Lịch sử thao tác", icon: HistoryIcon },
      { id: "wipe-data", label: "Xoá dữ liệu hệ thống", icon: Trash2 },
    ],
  },
];

const GOODS_ANCHORS = [
  { id: "set-goods-info", label: "Thông tin hàng hoá" },
  { id: "set-goods-import", label: "Nhập hàng" },
  { id: "set-goods-other", label: "Khác" },
];

function MenuPanel({ menu, anchor, page, onSelect }) {
  const hasColumns = menu.groups.some((g) => g.columns);
  const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
  const width = Math.min(menu.width || 250, vw - 16);
  const left = Math.max(8, Math.min(anchor.left, vw - width - 8));
  return (
    <div
      style={{
        position: "fixed",
        top: anchor.bottom,
        left,
        width,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 14px 34px rgba(15,35,80,0.22)",
        padding: "8px 0",
        zIndex: 50,
        maxHeight: "calc(100vh - 80px)",
        overflowY: "auto",
      }}
    >
      {menu.groups.map((g, gi) => (
        <div key={gi}>
          {gi > 0 && <div style={{ height: 1, background: COLORS.border, margin: "6px 12px" }} />}
          {g.title && (
            <div style={{ padding: "8px 20px 4px", fontSize: 12, fontWeight: 700, color: COLORS.muted }}>{g.title}</div>
          )}
          <div
            data-keep="1"
            style={
              g.columns
                ? {
                    display: "grid",
                    gridAutoFlow: "column",
                    gridTemplateRows: `repeat(${Math.ceil(g.items.length / g.columns)}, auto)`,
                    gridTemplateColumns: `repeat(${g.columns}, 1fr)`,
                  }
                : undefined
            }
          >
            {g.items.map((it) => (
              <div
                key={it.page}
                className="rs-menu-item"
                onClick={() => onSelect(it.page)}
                style={{
                  padding: "11px 20px",
                  fontSize: 14,
                  color: page === it.page ? COLORS.forest : COLORS.ink,
                  fontWeight: page === it.page ? 700 : 500,
                }}
              >
                {it.label}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsMenuPanel({ anchor, onSelect }) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
  const width = Math.min(360, vw - 16);
  const right = Math.max(8, vw - anchor.right - 8);
  return (
    <div
      style={{
        position: "fixed",
        top: anchor.bottom + 6,
        right,
        width,
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 14px 34px rgba(15,35,80,0.22)",
        padding: 10,
        zIndex: 50,
        maxHeight: "calc(100vh - 90px)",
        overflowY: "auto",
      }}
    >
      {SETTINGS_DROPDOWN.map((it) => (
        <div
          key={it.id}
          className="rs-menu-item"
          onClick={() => onSelect(it.id)}
          style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 12px", borderRadius: 10 }}
        >
          <it.icon size={20} color={COLORS.muted} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{it.title}</div>
            <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 2 }}>{it.sub}</div>
          </div>
        </div>
      ))}
      <div style={{ height: 1, background: COLORS.border, margin: "8px 4px 10px" }} />
      <button
        onClick={() => onSelect(null)}
        style={{
          width: "100%",
          border: "none",
          background: `${COLORS.forest}14`,
          color: COLORS.forest,
          fontWeight: 700,
          fontSize: 14,
          borderRadius: 10,
          padding: "12px 0",
          cursor: "pointer",
        }}
      >
        Xem tất cả thiết lập
      </button>
    </div>
  );
}

function MobileDrawer({ page, unreadCount, onGo, onSettings, onClose }) {
  const [expanded, setExpanded] = useState(() => {
    const m = MENU.find((x) => x.groups && isMenuActive(x, page));
    return m ? m.id : null;
  });
  const quick = [
    { id: "pos", label: "Thu ngân", icon: ShoppingCart },
    { id: "appointments", label: "Lịch hẹn", icon: Calendar },
    { id: "account", label: "Tài khoản", icon: UserCog },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(10,20,40,0.45)" }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "min(320px, 86vw)",
          background: "#fff",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: COLORS.forest,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 17 }}>
            <Sparkles size={20} /> Lumière Spa
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", color: "#fff", cursor: "pointer", display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        <div data-keep="1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: 12 }}>
          {quick.map((q) => (
            <button
              key={q.id}
              onClick={() => onGo(q.id)}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                background: page === q.id ? `${COLORS.forest}14` : COLORS.page,
                color: COLORS.forest,
                border: "none",
                borderRadius: 10,
                padding: "11px 4px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <q.icon size={18} />
              {q.label}
              {q.badge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 8,
                    background: COLORS.danger,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 999,
                    padding: "0 5px",
                    lineHeight: "15px",
                  }}
                >
                  {q.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}` }}>
          {MENU.map((m) => {
            const active = isMenuActive(m, page);
            const open = expanded === m.id;
            return (
              <div key={m.id}>
                <div
                  onClick={() => (m.groups ? setExpanded(open ? null : m.id) : onGo(m.page))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "13px 18px",
                    fontSize: 14.5,
                    fontWeight: active ? 700 : 600,
                    color: active ? COLORS.forest : COLORS.ink,
                    cursor: "pointer",
                    background: active && !m.groups ? `${COLORS.forest}10` : "transparent",
                  }}
                >
                  {m.label}
                  {m.groups && (
                    <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                  )}
                </div>
                {m.groups && open && (
                  <div style={{ background: COLORS.page, padding: "4px 0 8px" }}>
                    {m.groups.map((g, gi) => (
                      <div key={gi}>
                        {g.title && (
                          <div style={{ padding: "8px 28px 4px", fontSize: 12, fontWeight: 700, color: COLORS.muted }}>{g.title}</div>
                        )}
                        {g.items.map((it) => (
                          <div
                            key={it.page}
                            onClick={() => onGo(it.page)}
                            style={{
                              padding: "10px 28px",
                              fontSize: 14,
                              cursor: "pointer",
                              color: page === it.page ? COLORS.forest : COLORS.ink,
                              fontWeight: page === it.page ? 700 : 500,
                            }}
                          >
                            {it.label}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div
            onClick={() => onSettings(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 18px",
              fontSize: 14.5,
              fontWeight: 600,
              cursor: "pointer",
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            <Settings size={17} /> Thiết lập
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        border: "none",
        padding: 0,
        cursor: "pointer",
        background: checked ? COLORS.forest : "#C5CCD9",
        position: "relative",
        flexShrink: 0,
        transition: "background .15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .15s",
        }}
      />
    </button>
  );
}

function SettingSection({ id, title, children }) {
  return (
    <Card id={id} style={{ padding: "16px 20px 4px", marginBottom: 14, scrollMarginTop: 76 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{title}</div>
      {children}
    </Card>
  );
}

function SettingRow({ title, desc, right, children }) {
  return (
    <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "14px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
          {desc && <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 3 }}>{desc}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function RadioRow({ checked, onSelect, title, desc }) {
  return (
    <div onClick={onSelect} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0 8px 14px", cursor: "pointer" }}>
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `2px solid ${checked ? COLORS.forest : "#B6BFCE"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        {checked && <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.forest }} />}
      </span>
      <div>
        <div style={{ fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

function CheckboxItem({ checked, onChange, label }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          border: `2px solid ${checked ? COLORS.forest : "#B6BFCE"}`,
          background: checked ? COLORS.forest : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {checked && <Check size={12} color="#fff" strokeWidth={3} />}
      </span>
      {label}
    </div>
  );
}

function GoodsSettings() {
  const [s, setS] = useState({ attributes: true, units: true, barcode: true, costMethod: "fixed", allowNegative: true, lockTime: true });
  const [locked, setLocked] = useState({ invoice: true, returns: true, purchase: false, purchaseReturn: false, transfer: false, writeOff: false });
  const set = (k) => (v) => setS((p) => ({ ...p, [k]: v }));
  const setLock = (k) => (v) => setLocked((p) => ({ ...p, [k]: v }));
  return (
    <div>
      <SettingSection id="set-goods-info" title="Thông tin hàng hoá">
        <SettingRow
          title="Thuộc tính"
          desc="Phân loại hàng hoá theo đặc điểm riêng như màu sắc, kích cỡ, chất liệu..."
          right={<Toggle checked={s.attributes} onChange={set("attributes")} />}
        />
        <SettingRow
          title="Đơn vị tính"
          desc="Quản lý hàng hoá theo đơn vị khác nhau như chiếc, lốc, thùng..."
          right={<Toggle checked={s.units} onChange={set("units")} />}
        />
        <SettingRow
          title="Quản lý theo mã vạch"
          desc="Quản lý hàng hoá bằng mã vạch chuẩn hoặc mã vạch do cửa hàng tạo ra."
          right={<Toggle checked={s.barcode} onChange={set("barcode")} />}
        />
        <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "14px 0 8px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Phương pháp tính giá vốn</div>
          <RadioRow
            checked={s.costMethod === "average"}
            onSelect={() => set("costMethod")("average")}
            title="Giá vốn trung bình"
            desc="Giá vốn được tính trung bình từ các lần nhập hàng, trả hàng nhập, nhận hàng chuyển, khách trả hàng"
          />
          <RadioRow
            checked={s.costMethod === "fixed"}
            onSelect={() => set("costMethod")("fixed")}
            title="Giá vốn cố định"
            desc="Giá vốn không bị ảnh hưởng từ các lần nhập hàng, trả hàng nhập, nhận hàng chuyển, khách trả hàng"
          />
        </div>
      </SettingSection>

      <SettingSection id="set-goods-import" title="Nhập hàng">
        <SettingRow
          title="Quản lý chi phí nhập hàng"
          desc="Cho phép tạo và quản lý khoản nhập hàng ngoài như phí dịch vụ, phí lưu kho..."
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, whiteSpace: "nowrap" }}>
              Chưa có chi phí nhập hàng <ChevronRight size={16} color={COLORS.muted} />
            </div>
          }
        />
      </SettingSection>

      <SettingSection id="set-goods-other" title="Khác">
        <SettingRow
          title="Cho phép giao dịch dù hàng hoá đã hết tồn kho"
          desc="Khi hết tồn kho, hệ thống vẫn cho phép thực hiện giao dịch Chuyển hàng, Trả hàng nhập, Xuất huỷ và ghi nhận giá trị tồn kho âm. Sau khi Nhập hàng cần điều chỉnh lại thời gian về trước khi có giao dịch dẫn đến tồn kho âm."
          right={<Toggle checked={s.allowNegative} onChange={set("allowNegative")} />}
        />
        <SettingRow
          title="Không cho phép thay đổi thời gian giao dịch"
          desc="Không cho phép thay đổi thời gian giao dịch trên phiếu kiểm kho, chuyển hàng, xuất huỷ, nhập hàng, trả hàng nhập, thu/chi."
          right={<Toggle checked={s.lockTime} onChange={set("lockTime")} />}
        >
          {s.lockTime && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 44px", paddingTop: 14 }}>
              <CheckboxItem checked={locked.invoice} onChange={setLock("invoice")} label="Hoá đơn" />
              <CheckboxItem checked={locked.returns} onChange={setLock("returns")} label="Trả hàng" />
              <CheckboxItem checked={locked.purchase} onChange={setLock("purchase")} label="Nhập hàng" />
              <CheckboxItem checked={locked.purchaseReturn} onChange={setLock("purchaseReturn")} label="Trả hàng nhập" />
              <CheckboxItem checked={locked.transfer} onChange={setLock("transfer")} label="Chuyển hàng" />
              <CheckboxItem checked={locked.writeOff} onChange={setLock("writeOff")} label="Xuất huỷ" />
            </div>
          )}
        </SettingRow>
      </SettingSection>
    </div>
  );
}

function SettingsPage({ section, onSection, customers }) {
  const [query, setQuery] = useState("");
  const [anchor, setAnchor] = useState(GOODS_ANCHORS[0].id);
  const q = query.trim().toLowerCase();
  const allItems = SETTINGS_GROUPS.flatMap((g) => g.items);
  const current = allItems.find((it) => it.id === section) || allItems[0];
  const visibleGroups = SETTINGS_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((it) => !q || it.label.toLowerCase().includes(q)),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 26 }}>Thiết lập</div>
        <div style={{ position: "relative", width: "min(300px, 100%)" }}>
          <Search size={15} color={COLORS.muted} style={{ position: "absolute", left: 11, top: 12 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm thiết lập"
            style={{ ...inputStyle, padding: "10px 10px 10px 34px", borderRadius: 10, background: "#fff", fontSize: 13.5 }}
          />
        </div>
      </div>

      <div className="rs-show-lg" style={{ marginBottom: 12 }}>
        <select
          value={current.id}
          onChange={(e) => onSection(e.target.value)}
          style={{ ...inputStyle, background: "#fff", padding: "11px 12px", fontSize: 14 }}
        >
          {SETTINGS_GROUPS.map((g, gi) => (
            <optgroup key={gi} label={g.title || "Quản lý"}>
              {g.items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="rs-row-lg" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <aside className="rs-hide-lg" style={{ width: 250, flexShrink: 0 }}>
          <Card style={{ padding: "10px 12px 6px" }}>
            {visibleGroups.map((g, gi) => (
              <div key={gi} style={{ marginBottom: 6 }}>
                {g.title ? (
                  <div style={{ padding: "10px 10px 6px", fontSize: 13, fontWeight: 700 }}>{g.title}</div>
                ) : gi > 0 ? (
                  <div style={{ height: 1, background: COLORS.border, margin: "8px 4px 10px" }} />
                ) : null}
                {g.items.map((it) => {
                  const active = it.id === current.id;
                  return (
                    <div
                      key={it.id}
                      className="rs-menu-item"
                      onClick={() => onSection(it.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 10px",
                        borderRadius: 9,
                        fontSize: 14,
                        background: active ? `${COLORS.forest}14` : undefined,
                        color: active ? COLORS.forest : COLORS.ink,
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      <it.icon size={17} />
                      <span style={{ flex: 1 }}>{it.label}</span>
                      {it.external && <ExternalLink size={15} color={COLORS.muted} />}
                    </div>
                  );
                })}
              </div>
            ))}
            {visibleGroups.length === 0 && (
              <div style={{ padding: 12, fontSize: 13, color: COLORS.muted }}>Không tìm thấy thiết lập phù hợp.</div>
            )}
          </Card>
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          {current.id === "goods" && <GoodsSettings />}
          {current.id === "branches" && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Quản lý chi nhánh</div>
              <BranchesPage customers={customers} />
            </div>
          )}
          {current.id !== "goods" && current.id !== "branches" && (
            <Card style={{ padding: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{current.label}</div>
              <div style={{ color: COLORS.muted, fontSize: 13.5, marginTop: 8 }}>
                Các thiết lập cho mục này sẽ được bổ sung ở bước tiếp theo.
              </div>
            </Card>
          )}
        </div>

        {current.id === "goods" && (
          <aside className="rs-hide-lg" style={{ width: 190, flexShrink: 0, position: "sticky", top: 76 }}>
            <Card style={{ padding: "8px 0" }}>
              {GOODS_ANCHORS.map((a) => (
                <div
                  key={a.id}
                  onClick={() => {
                    setAnchor(a.id);
                    const el = document.getElementById(a.id);
                    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  style={{
                    padding: "9px 16px",
                    fontSize: 13.5,
                    cursor: "pointer",
                    color: anchor === a.id ? COLORS.forest : COLORS.ink,
                    fontWeight: anchor === a.id ? 600 : 500,
                    borderLeft: `3px solid ${anchor === a.id ? COLORS.forest : "transparent"}`,
                  }}
                >
                  {a.label}
                </div>
              ))}
            </Card>
          </aside>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vị trí / phòng (danh sách, tạo/sửa, nhập file excel, xuất file)
// ---------------------------------------------------------------------------
let locIdSeq = Date.now();
const nextLocId = () => ++locIdSeq;

const normText = (t) =>
  String(t == null ? "" : t)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();

const LOC_STATUS = { active: "Đang hoạt động", inactive: "Ngừng hoạt động" };
const LOC_HEADERS = ["Tên vị trí/phòng", "Ghi chú", "Nhóm", "Trạng thái", "Số thứ tự"];
const LOC_HEADER_ALIASES = {
  name: ["ten vi tri/phong", "ten vi tri phong", "ten vi tri", "ten phong", "ten"],
  note: ["ghi chu"],
  group: ["nhom"],
  status: ["trang thai"],
  order: ["so thu tu", "stt", "thu tu"],
  branch: ["chi nhanh"],
};
const LOC_MAX_FILE = 10 * 1024 * 1024;

const parseLocStatus = (v) => (/^(ngung|khong|0$|inactive|false)/.test(normText(v)) ? "inactive" : "active");

const fmtFileSize = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

const dateStamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
};

// Đọc bảng dữ liệu (mảng 2 chiều từ sheet excel) -> danh sách vị trí/phòng mới.
// Trùng tên trong cùng chi nhánh = cập nhật, chưa có = thêm mới. Dòng lỗi được bỏ qua và báo lại.
function parseLocationsSheet(rows, ctx) {
  const header = (rows[0] || []).map((h) => normText(h));
  if (!rows.length || header.every((h) => !h)) return { error: "File không có dữ liệu." };
  const col = {};
  Object.keys(LOC_HEADER_ALIASES).forEach((k) => {
    const i = header.findIndex((h) => LOC_HEADER_ALIASES[k].includes(h));
    if (i >= 0) col[k] = i;
  });
  if (col.name === undefined) {
    return { error: 'Không tìm thấy cột "Tên vị trí/phòng". Vui lòng dùng file excel mẫu.' };
  }
  const allBranch = ctx.branch === "all";
  if (allBranch && col.branch === undefined) {
    return {
      error: 'Đang chọn "Tất cả chi nhánh": file cần có cột "Chi nhánh" (hoặc hãy chọn một chi nhánh cụ thể trước khi nhập file).',
    };
  }

  const groups = ctx.groups.map((g) => ({ ...g }));
  const working = ctx.locations.map((l) => ({ ...l }));
  const summary = { added: 0, updated: 0, failed: 0, errors: [] };
  const seen = new Map();
  const fail = (row, message) => {
    summary.failed += 1;
    summary.errors.push({ row, message });
  };

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const rowNo = i + 1;
    if (r.every((c) => String(c == null ? "" : c).trim() === "")) continue;
    const cell = (k) => (col[k] === undefined || r[col[k]] == null ? "" : String(r[col[k]]).trim());

    const name = cell("name");
    if (!name) {
      fail(rowNo, "Thiếu tên vị trí/phòng");
      continue;
    }
    if (name.length > 100) {
      fail(rowNo, "Tên vị trí/phòng quá dài (tối đa 100 ký tự)");
      continue;
    }

    let branchId = ctx.branch;
    if (allBranch) {
      const raw = normText(cell("branch"));
      const b = raw && ctx.branches.find((x) => x.id === raw || normText(x.name) === raw || normText(x.name).includes(raw));
      if (!b) {
        fail(rowNo, `Không tìm thấy chi nhánh "${cell("branch")}"`);
        continue;
      }
      branchId = b.id;
    }

    const key = `${branchId}|${normText(name)}`;
    if (seen.has(key)) {
      fail(rowNo, `Trùng tên với dòng ${seen.get(key)} trong file`);
      continue;
    }

    let orderVal = null;
    const rawOrder = cell("order");
    if (rawOrder !== "") {
      const n = Number(rawOrder.replace(",", "."));
      if (!Number.isInteger(n) || n < 0) {
        fail(rowNo, `Số thứ tự không hợp lệ: "${rawOrder}"`);
        continue;
      }
      orderVal = n;
    }

    let groupId = null;
    const groupName = cell("group");
    if (groupName) {
      let g = groups.find((x) => normText(x.name) === normText(groupName));
      if (!g) {
        g = { id: nextLocId(), name: groupName };
        groups.push(g);
      }
      groupId = g.id;
    }

    const status = parseLocStatus(cell("status"));
    const note = cell("note");
    seen.set(key, rowNo);

    const idx = working.findIndex((l) => l.branch === branchId && normText(l.name) === normText(name));
    if (idx >= 0) {
      working[idx] = { ...working[idx], name, note, groupId, status, order: orderVal != null ? orderVal : working[idx].order };
      summary.updated += 1;
    } else {
      const maxOrder = working.filter((l) => l.branch === branchId).reduce((m, l) => Math.max(m, l.order), 0);
      working.push({ id: nextLocId(), branch: branchId, name, note, groupId, status, order: orderVal != null ? orderVal : maxOrder + 1 });
      summary.added += 1;
    }
  }

  if (summary.added + summary.updated + summary.failed === 0) return { error: "File không có dòng dữ liệu nào." };
  return { locations: working, groups, summary };
}

function buildLocationsWorkbook(list, groups, showBranch) {
  const head = showBranch ? [...LOC_HEADERS, "Chi nhánh"] : LOC_HEADERS;
  const body = list.map((l) => {
    const g = groups.find((x) => x.id === l.groupId);
    const row = [l.name, l.note || "", g ? g.name : "", LOC_STATUS[l.status], l.order];
    if (showBranch) row.push((BRANCHES.find((b) => b.id === l.branch) || {}).name || l.branch);
    return row;
  });
  const ws = XLSX.utils.aoa_to_sheet([head, ...body]);
  ws["!cols"] = head.map((h) => ({ wch: h === "Tên vị trí/phòng" || h === "Ghi chú" ? 30 : 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Vị trí phòng");
  return wb;
}

function buildLocationTemplate(showBranch) {
  const head = showBranch ? [...LOC_HEADERS, "Chi nhánh"] : LOC_HEADERS;
  const sample = [
    ["Giường 4", "", "", LOC_STATUS.active, 4],
    ["Phòng VIP 2", "Có phòng tắm riêng", "Phòng riêng", LOC_STATUS.active, 5],
  ];
  if (showBranch) sample.forEach((r) => r.push("Chi nhánh Quận 1"));
  const ws = XLSX.utils.aoa_to_sheet([head, ...sample]);
  ws["!cols"] = head.map((h) => ({ wch: h === "Tên vị trí/phòng" || h === "Ghi chú" ? 30 : 20 }));
  const guideLines = [
    ["Hướng dẫn nhập file"],
    ['- Cột "Tên vị trí/phòng" là bắt buộc.'],
    ["- Nếu trùng tên trong cùng chi nhánh, hệ thống sẽ cập nhật vị trí/phòng đó."],
    ['- "Trạng thái": Đang hoạt động hoặc Ngừng hoạt động (bỏ trống = Đang hoạt động).'],
    ['- "Nhóm" chưa có sẽ được tạo tự động.'],
    ['- "Số thứ tự" bỏ trống sẽ tự động tăng tiếp theo.'],
  ];
  if (showBranch) guideLines.push(['- Cột "Chi nhánh": ghi đúng tên chi nhánh.']);
  const guide = XLSX.utils.aoa_to_sheet(guideLines);
  guide["!cols"] = [{ wch: 80 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Vị trí phòng");
  XLSX.utils.book_append_sheet(wb, guide, "Hướng dẫn");
  return wb;
}

const downloadWorkbook = (wb, filename) => XLSX.writeFile(wb, filename);

const readFileAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("read failed"));
    reader.readAsArrayBuffer(file);
  });

const CHEVRON_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B7686' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")";
const kvInput = { ...inputStyle, padding: "10px 12px", borderRadius: 10, fontSize: 14, background: "#fff" };
const kvSelect = (active) => ({
  ...inputStyle,
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  backgroundColor: "#fff",
  backgroundImage: CHEVRON_BG,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  padding: "10px 34px 10px 12px",
  borderRadius: 10,
  fontSize: 14,
  color: COLORS.ink,
  border: `1px solid ${active ? COLORS.forest : COLORS.border}`,
});
const kvBtnPrimary = { border: "none", background: COLORS.forest, color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const kvBtnGhost = { border: "none", background: "#EEF1F6", color: COLORS.ink, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const kvBtnOutline = { border: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.ink, borderRadius: 10, padding: "9px 14px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const kvLabel = { fontSize: 12.5, color: COLORS.muted, marginBottom: 6 };
const kvLink = { border: "none", background: "none", padding: 0, color: COLORS.forest, fontSize: 12.5, fontWeight: 600, cursor: "pointer" };
const kvError = { color: COLORS.danger, fontSize: 12, marginTop: 5 };

function FormModal({ title, onClose, width = 600, footer, children, zIndex = 70, closeOnEscape = true }) {
  useEffect(() => {
    if (!closeOnEscape) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, closeOnEscape]);
  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,30,50,0.5)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 12px",
        overflowY: "auto",
        zIndex,
      }}
    >
      <div style={{ background: "#fff", borderRadius: 14, width, maxWidth: "100%", boxShadow: "0 20px 50px rgba(10,20,40,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px" }}>
          <div style={{ fontWeight: 700, fontSize: 19 }}>{title}</div>
          <button onClick={onClose} aria-label="Đóng" style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", padding: 4 }}>
            <X size={20} color={COLORS.ink} />
          </button>
        </div>
        <div style={{ padding: "8px 20px 18px" }}>{children}</div>
        {footer && (
          <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [message]);
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 28,
        transform: "translateX(-50%)",
        background: COLORS.ink,
        color: "#fff",
        padding: "10px 18px",
        borderRadius: 10,
        fontSize: 13.5,
        zIndex: 90,
        maxWidth: "90vw",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      {message}
    </div>
  );
}

function GroupFormModal({ groups, onCreate, onClose }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    const t = name.trim();
    if (!t) return setError("Vui lòng nhập tên nhóm");
    if (groups.some((g) => normText(g.name) === normText(t))) return setError("Tên nhóm đã tồn tại");
    onCreate(t);
  };
  return (
    <FormModal
      title="Tạo nhóm vị trí/phòng"
      width={440}
      zIndex={80}
      onClose={onClose}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <button style={kvBtnGhost} onClick={onClose}>
            Bỏ qua
          </button>
          <button style={kvBtnPrimary} onClick={submit}>
            Lưu
          </button>
        </>
      }
    >
      <div style={kvLabel}>Tên nhóm</div>
      <input
        autoFocus
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Bắt buộc"
        style={{ ...kvInput, borderColor: error ? COLORS.danger : COLORS.border }}
      />
      {error && <div style={kvError}>{error}</div>}
    </FormModal>
  );
}

function LocationFormModal({ location, branch, locations, groups, onSave, onDelete, onCreateGroup, onClose }) {
  const isEdit = !!location;
  const branches = BRANCHES.filter((b) => b.id !== "all");
  const [name, setName] = useState(location ? location.name : "");
  const [branchId, setBranchId] = useState(location ? location.branch : branch !== "all" ? branch : branches[0].id);
  const [groupId, setGroupId] = useState(location && location.groupId ? String(location.groupId) : "");
  const [orderInput, setOrderInput] = useState(location ? String(location.order) : null);
  const [note, setNote] = useState(location ? location.note || "" : "");
  const [status, setStatus] = useState(location ? location.status : "active");
  const [errors, setErrors] = useState({});
  const [showGroup, setShowGroup] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const nextOrder = locations.filter((l) => l.branch === branchId).reduce((m, l) => Math.max(m, l.order), 0) + 1;
  const orderValue = orderInput == null ? String(nextOrder) : orderInput;

  const submit = () => {
    const errs = {};
    const trimmed = name.trim();
    if (!trimmed) errs.name = "Vui lòng nhập tên vị trí/phòng";
    else if (trimmed.length > 100) errs.name = "Tên tối đa 100 ký tự";
    else if (
      locations.some(
        (l) => (!location || l.id !== location.id) && l.branch === branchId && normText(l.name) === normText(trimmed)
      )
    ) {
      errs.name = "Tên vị trí/phòng đã tồn tại trong chi nhánh này";
    }
    const ord = Number(orderValue);
    if (orderValue === "" || !Number.isInteger(ord) || ord < 0) errs.order = "Số thứ tự không hợp lệ";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const g = groups.find((x) => String(x.id) === groupId);
    onSave({
      id: location ? location.id : nextLocId(),
      branch: branchId,
      name: trimmed,
      note: note.trim(),
      groupId: g ? g.id : null,
      status,
      order: ord,
    });
  };

  return (
    <>
      <FormModal
        title={isEdit ? "Cập nhật vị trí/phòng" : "Tạo vị trí/phòng"}
        onClose={onClose}
        closeOnEscape={!showGroup}
        footer={
          <>
            {isEdit && (
              <button
                onClick={() => (confirmDelete ? onDelete(location.id) : setConfirmDelete(true))}
                style={{ border: "none", background: "none", color: COLORS.danger, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Trash2 size={15} /> {confirmDelete ? "Bấm lần nữa để xoá" : "Xoá"}
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button style={kvBtnGhost} onClick={onClose}>
              Bỏ qua
            </button>
            <button style={kvBtnPrimary} onClick={submit}>
              Lưu
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={kvLabel}>Tên vị trí/phòng</div>
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: undefined }));
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Bắt buộc"
              style={{ ...kvInput, borderColor: errors.name ? COLORS.danger : COLORS.border }}
            />
            {errors.name && <div style={kvError}>{errors.name}</div>}
          </div>

          {branch === "all" && (
            <div>
              <div style={kvLabel}>Chi nhánh</div>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)} style={kvSelect(false)}>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div data-keep="1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ ...kvLabel, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Nhóm</span>
                <button style={kvLink} onClick={() => setShowGroup(true)}>
                  Tạo mới
                </button>
              </div>
              <select value={groupId} onChange={(e) => setGroupId(e.target.value)} style={kvSelect(false)}>
                <option value="">Chọn nhóm</option>
                {groups.map((g) => (
                  <option key={g.id} value={String(g.id)}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div style={kvLabel}>Số thứ tự</div>
              <input
                value={orderValue}
                onChange={(e) => {
                  setOrderInput(e.target.value);
                  setErrors((p) => ({ ...p, order: undefined }));
                }}
                inputMode="numeric"
                style={{ ...kvInput, textAlign: "right", borderColor: errors.order ? COLORS.danger : COLORS.border }}
              />
              {errors.order && <div style={kvError}>{errors.order}</div>}
            </div>
          </div>

          {isEdit && (
            <div>
              <div style={kvLabel}>Trạng thái</div>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={kvSelect(false)}>
                <option value="active">{LOC_STATUS.active}</option>
                <option value="inactive">{LOC_STATUS.inactive}</option>
              </select>
            </div>
          )}

          <div>
            <div style={kvLabel}>Ghi chú</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú"
              rows={3}
              style={{ ...kvInput, resize: "vertical", fontFamily: "Manrope, sans-serif" }}
            />
          </div>
        </div>
      </FormModal>

      {showGroup && (
        <GroupFormModal
          groups={groups}
          onClose={() => setShowGroup(false)}
          onCreate={(n) => {
            const g = onCreateGroup(n);
            setGroupId(String(g.id));
            setShowGroup(false);
          }}
        />
      )}
    </>
  );
}

function ImportLocationsModal({ branch, locations, groups, onApply, onClose }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const showBranch = branch === "all";

  const pick = (f) => {
    if (!f) return;
    if (!/\.(xls|xlsx)$/i.test(f.name)) {
      setFile(null);
      return setError("Chỉ hỗ trợ file định dạng xls, xlsx.");
    }
    if (f.size > LOC_MAX_FILE) {
      setFile(null);
      return setError("File vượt quá dung lượng tối đa 10 MB.");
    }
    setError("");
    setFile(f);
  };

  const run = async () => {
    if (!file) return setError("Vui lòng chọn file dữ liệu.");
    setBusy(true);
    setError("");
    try {
      const buf = await readFileAsArrayBuffer(file);
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", blankrows: false });
      const res = parseLocationsSheet(rows, {
        branch,
        branches: BRANCHES.filter((b) => b.id !== "all"),
        locations,
        groups,
      });
      if (res.error) {
        setError(res.error);
      } else {
        onApply(res.locations, res.groups);
        setResult(res.summary);
      }
    } catch (e) {
      setError("Không đọc được file. Vui lòng kiểm tra lại định dạng hoặc dùng file excel mẫu.");
    }
    setBusy(false);
  };

  const downloadTemplate = () => {
    try {
      downloadWorkbook(buildLocationTemplate(showBranch), "Mau_nhap_vi_tri_phong.xlsx");
    } catch (e) {
      setError("Không thể tải file mẫu.");
    }
  };

  if (result) {
    const ok = result.added + result.updated > 0;
    return (
      <FormModal
        title="Nhập vị trí/phòng từ file excel"
        onClose={onClose}
        footer={
          <>
            <div style={{ flex: 1 }} />
            <button style={kvBtnPrimary} onClick={onClose}>
              Đóng
            </button>
          </>
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {ok ? <CheckCircle2 size={24} color={COLORS.success} /> : <Info size={24} color={COLORS.danger} />}
          <div style={{ fontWeight: 700, fontSize: 16 }}>{ok ? "Nhập file hoàn tất" : "Không có dòng nào được nhập"}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, background: `${COLORS.success}14`, color: COLORS.success, padding: "4px 10px", borderRadius: 999 }}>
            Thêm mới: {result.added}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, background: `${COLORS.forest}14`, color: COLORS.forest, padding: "4px 10px", borderRadius: 999 }}>
            Cập nhật: {result.updated}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, background: `${COLORS.danger}14`, color: COLORS.danger, padding: "4px 10px", borderRadius: 999 }}>
            Lỗi: {result.failed}
          </span>
        </div>
        {result.errors.length > 0 && (
          <div style={{ marginTop: 14, maxHeight: 180, overflowY: "auto", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 12px" }}>
            {result.errors.map((er, i) => (
              <div key={i} style={{ fontSize: 13, padding: "4px 0", color: COLORS.ink }}>
                <b>Dòng {er.row}:</b> {er.message}
              </div>
            ))}
          </div>
        )}
      </FormModal>
    );
  }

  return (
    <FormModal
      title="Nhập vị trí/phòng từ file excel"
      onClose={onClose}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <button style={kvBtnGhost} onClick={onClose}>
            Bỏ qua
          </button>
          <button style={{ ...kvBtnPrimary, opacity: busy ? 0.7 : 1 }} onClick={run} disabled={busy}>
            {busy ? "Đang xử lý..." : "Thực hiện"}
          </button>
        </>
      }
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files && e.dataTransfer.files[0]);
        }}
        style={{
          border: `1.5px dashed ${dragging ? COLORS.forest : "#C9D2E0"}`,
          background: dragging ? `${COLORS.forest}0D` : "#fff",
          borderRadius: 12,
          padding: "26px 16px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `${COLORS.forest}12`,
            margin: "0 auto 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UploadCloud size={30} color={COLORS.forest} />
        </div>
        <div style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.55 }}>
          Nhấn chọn hoặc kéo thả file dữ liệu vào đây.
          <br />
          Định dạng file xls, xlsx (Tối đa 10 MB)
        </div>

        {file && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 14,
              background: COLORS.page,
              borderRadius: 9,
              padding: "7px 10px",
              maxWidth: "100%",
              fontSize: 13,
            }}
          >
            <FileSpreadsheet size={16} color={COLORS.success} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
            <span style={{ color: COLORS.muted, flexShrink: 0 }}>{fmtFileSize(file.size)}</span>
            <button
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              aria-label="Bỏ file"
              style={{ border: "none", background: "none", cursor: "pointer", display: "flex", padding: 0 }}
            >
              <X size={14} color={COLORS.muted} />
            </button>
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <input
            ref={inputRef}
            type="file"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            style={{ display: "none" }}
            onChange={(e) => pick(e.target.files && e.target.files[0])}
          />
          <button
            onClick={() => inputRef.current && inputRef.current.click()}
            style={{ border: `1px solid ${COLORS.forest}`, background: "#fff", color: COLORS.forest, borderRadius: 8, padding: "7px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
          >
            {file ? "Chọn file khác" : "Chọn file dữ liệu"}
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <button style={{ ...kvLink, fontSize: 13.5 }} onClick={downloadTemplate}>
            Tải file excel mẫu
          </button>
        </div>
      </div>
      {error && <div style={{ ...kvError, fontSize: 13, marginTop: 10 }}>{error}</div>}
    </FormModal>
  );
}

function LocationsPage({ branch, locations, setLocations, groups, setGroups }) {
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [sort, setSort] = useState({ key: "order", dir: "desc" });
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [editing, setEditing] = useState(null); // null | "new" | location
  const [importOpen, setImportOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [toast, setToast] = useState("");
  const showBranch = branch === "all";

  const groupName = (id) => (groups.find((g) => g.id === id) || {}).name || "";
  const branchName = (id) => (BRANCHES.find((b) => b.id === id) || {}).name || id;

  const filtered = locations
    .filter((l) => branch === "all" || l.branch === branch)
    .filter((l) => !query.trim() || normText(l.name).includes(normText(query)))
    .filter((l) => groupFilter === "all" || String(l.groupId) === groupFilter)
    .filter((l) => statusFilter === "all" || l.status === statusFilter);

  const sortVal = (l) => {
    switch (sort.key) {
      case "name":
        return normText(l.name);
      case "note":
        return normText(l.note);
      case "group":
        return normText(groupName(l.groupId));
      case "status":
        return l.status;
      case "branch":
        return normText(branchName(l.branch));
      default:
        return l.order;
    }
  };
  const sorted = [...filtered].sort((a, b) => {
    const va = sortVal(a);
    const vb = sortVal(b);
    let c = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb), "vi");
    if (c === 0) c = String(a.name).localeCompare(String(b.name), "vi");
    return sort.dir === "asc" ? c : -c;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(pageNo, totalPages);
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key) => setSort((p) => (p.key === key ? { key, dir: p.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const createGroup = (name) => {
    const g = { id: nextLocId(), name };
    setGroups((prev) => [...prev, g]);
    return g;
  };
  const saveLocation = (loc) => {
    const exists = locations.some((l) => l.id === loc.id);
    setLocations((prev) => (exists ? prev.map((l) => (l.id === loc.id ? loc : l)) : [...prev, loc]));
    setEditing(null);
    setToast(exists ? "Đã cập nhật vị trí/phòng" : "Đã thêm vị trí/phòng");
  };
  const deleteLocation = (id) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
    setEditing(null);
    setToast("Đã xoá vị trí/phòng");
  };
  const exportFile = () => {
    if (sorted.length === 0) return setToast("Không có dữ liệu để xuất");
    try {
      downloadWorkbook(buildLocationsWorkbook(sorted, groups, showBranch), `Danh_sach_vi_tri_phong_${dateStamp()}.xlsx`);
      setToast(`Đã xuất ${sorted.length} vị trí/phòng ra file excel`);
    } catch (e) {
      setToast("Không thể xuất file. Vui lòng thử lại.");
    }
  };

  const thStyle2 = { padding: "12px 16px", fontSize: 12.5, fontWeight: 700, color: COLORS.ink, whiteSpace: "nowrap", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", userSelect: "none" };
  const Th = ({ label, k, align }) => (
    <th onClick={() => toggleSort(k)} style={{ ...thStyle2, textAlign: align || "left" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label}
        {sort.key === k ? (
          sort.dir === "asc" ? <ArrowUp size={13} color={COLORS.forest} /> : <ArrowDown size={13} color={COLORS.forest} />
        ) : (
          <ChevronsUpDown size={13} color="#B6BFCE" />
        )}
      </span>
    </th>
  );
  const tdStyle2 = { padding: "13px 16px", fontSize: 14, borderTop: `1px solid ${COLORS.border}` };

  const pageButtons = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) pageButtons.push(p);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 26 }}>Vị trí/phòng</div>
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 330 }}>
          <Search size={15} color={COLORS.muted} style={{ position: "absolute", left: 11, top: 12 }} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPageNo(1);
            }}
            placeholder="Tìm tên vị trí/phòng"
            style={{ ...kvInput, padding: "10px 10px 10px 34px", fontSize: 13.5 }}
          />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={{ ...kvBtnPrimary, padding: "9px 14px", fontSize: 13.5 }} onClick={() => setEditing("new")}>
            <Plus size={16} /> Vị trí/phòng
          </button>
          <button style={kvBtnOutline} onClick={() => setImportOpen(true)}>
            <Upload size={15} /> Nhập file
          </button>
          <button style={kvBtnOutline} onClick={exportFile}>
            <Download size={15} /> Xuất file
          </button>
        </div>
      </div>

      <div className="rs-row-lg" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <aside style={{ width: 250, flexShrink: 0 }}>
          <Card style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Nhóm</div>
              <button style={kvLink} onClick={() => setGroupOpen(true)}>
                Tạo mới
              </button>
            </div>
            <select
              value={groupFilter}
              onChange={(e) => {
                setGroupFilter(e.target.value);
                setPageNo(1);
              }}
              style={kvSelect(groupFilter !== "all")}
            >
              <option value="all">Tất cả</option>
              {groups.map((g) => (
                <option key={g.id} value={String(g.id)}>
                  {g.name}
                </option>
              ))}
            </select>

            <div style={{ fontWeight: 700, fontSize: 14, margin: "20px 0 8px" }}>Trạng thái</div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNo(1);
              }}
              style={kvSelect(statusFilter !== "all")}
            >
              <option value="all">Tất cả</option>
              <option value="active">{LOC_STATUS.active}</option>
              <option value="inactive">{LOC_STATUS.inactive}</option>
            </select>
          </Card>
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: showBranch ? 760 : 620 }}>
                <thead>
                  <tr>
                    <Th label="Tên vị trí/phòng" k="name" />
                    <Th label="Ghi chú" k="note" />
                    {showBranch && <Th label="Chi nhánh" k="branch" />}
                    <Th label="Nhóm" k="group" />
                    <Th label="Trạng thái" k="status" />
                    <Th label="Số thứ tự" k="order" align="right" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id} className="rs-menu-item" onClick={() => setEditing(l)}>
                      <td style={tdStyle2}>{l.name}</td>
                      <td style={{ ...tdStyle2, color: COLORS.muted }}>{l.note}</td>
                      {showBranch && <td style={tdStyle2}>{branchName(l.branch)}</td>}
                      <td style={tdStyle2}>{groupName(l.groupId) || "---"}</td>
                      <td style={{ ...tdStyle2, color: l.status === "inactive" ? COLORS.warning : COLORS.ink }}>{LOC_STATUS[l.status]}</td>
                      <td style={{ ...tdStyle2, textAlign: "right" }}>{l.order}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={showBranch ? 6 : 5} style={{ ...tdStyle2, textAlign: "center", color: COLORS.muted, padding: "28px 16px" }}>
                        Không tìm thấy vị trí/phòng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: COLORS.muted }}>
              Hiển thị
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageNo(1);
                }}
                style={{ ...kvSelect(false), width: "auto", padding: "4px 28px 4px 10px", fontSize: 12.5, borderRadius: 8, backgroundPosition: "right 8px center" }}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} bản ghi
                  </option>
                ))}
              </select>
              <span>· Tổng {sorted.length}</span>
            </div>
            {totalPages > 1 && (
              <div style={{ display: "flex", gap: 4 }}>
                <button disabled={page === 1} onClick={() => setPageNo(page - 1)} style={{ ...kvBtnOutline, padding: "5px 10px", opacity: page === 1 ? 0.5 : 1, display: "flex", alignItems: "center" }}>
                  <ChevronLeft size={14} />
                </button>
                {pageButtons.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPageNo(p)}
                    style={{ ...kvBtnOutline, padding: "5px 11px", background: p === page ? COLORS.forest : "#fff", color: p === page ? "#fff" : COLORS.ink, borderColor: p === page ? COLORS.forest : COLORS.border }}
                  >
                    {p}
                  </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPageNo(page + 1)} style={{ ...kvBtnOutline, padding: "5px 10px", opacity: page === totalPages ? 0.5 : 1, display: "flex", alignItems: "center" }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <LocationFormModal
          key={editing === "new" ? "new" : editing.id}
          location={editing === "new" ? null : editing}
          branch={branch}
          locations={locations}
          groups={groups}
          onSave={saveLocation}
          onDelete={deleteLocation}
          onCreateGroup={createGroup}
          onClose={() => setEditing(null)}
        />
      )}
      {importOpen && (
        <ImportLocationsModal
          branch={branch}
          locations={locations}
          groups={groups}
          onApply={(nextLocations, nextGroups) => {
            setLocations(nextLocations);
            setGroups(nextGroups);
          }}
          onClose={() => setImportOpen(false)}
        />
      )}
      {groupOpen && (
        <GroupFormModal
          groups={groups}
          onClose={() => setGroupOpen(false)}
          onCreate={(n) => {
            createGroup(n);
            setGroupOpen(false);
            setToast("Đã tạo nhóm vị trí/phòng");
          }}
        />
      )}
      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}

function PlaceholderPage({ title, trail }) {
  return (
    <Card style={{ padding: "48px 24px", textAlign: "center" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `${COLORS.forest}14`,
          margin: "0 auto 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Clock size={24} color={COLORS.forest} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
      <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 6 }}>{trail.join(" › ")}</div>
      <div style={{ color: COLORS.muted, fontSize: 13.5, marginTop: 14 }}>
        Menu đã sẵn sàng — nội dung chức năng này sẽ được bổ sung ở bước tiếp theo.
      </div>
    </Card>
  );
}

export default function SpaCRM() {
  const [page, setPage] = useState("dashboard");
  const [branch, setBranch] = useState("all");
  // [Tích hợp 2026-10-06] danh sách chi nhánh có thể thêm/xoá/sửa từ trang Hồ sơ cửa hàng
  // (đồng bộ vào BRANCHES tĩnh để các trang cũ hiển thị đúng)
  const [branches, setBranches] = useState(BRANCHES);
  const syncBranches = () => setBranches([...BRANCHES]);
  const addBranch = ({ name, address, phone }) => {
    BRANCHES.push({ id: "b" + Date.now(), name, address: address || "", phone: phone || "" });
    syncBranches();
  };
  const updateBranch = (id, patch) => {
    const b = BRANCHES.find((x) => x.id === id);
    if (b) Object.assign(b, patch);
    syncBranches();
  };
  const deleteBranch = (id) => {
    if (id === "all") return;
    const i = BRANCHES.findIndex((x) => x.id === id);
    if (i >= 0) BRANCHES.splice(i, 1);
    if (branch === id) setBranch("all");
    syncBranches();
  };
  const [openMenu, setOpenMenu] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState({ left: 0, right: 0, bottom: 60 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState("goods");
  // [Tích hợp 2026-10-05] mã hóa đơn cần focus khi nhảy từ tab Lịch sử giao dịch của trang Vị trí
  const [invoiceFocus, setInvoiceFocus] = useState(null);
  // [Tích hợp 2026-10-05] thông tin người dùng đăng nhập (dropdown user + trang Tài khoản)
  const [user, setUser] = useState(() => {
    const defaults = {
      displayName: "Hồng",
      username: "0838089339",
      role: "Admin",
      email: "",
      phone: "0888456792",
      note: "",
      twoFactor: false,
    };
    try {
      if (typeof localStorage !== "undefined")
        return { ...defaults, ...JSON.parse(localStorage.getItem("spa-user") || "{}") };
    } catch {}
    return defaults;
  });
  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem("spa-user", JSON.stringify(user));
    } catch {}
  }, [user]);
  const updateUser = (patch) => setUser((u) => ({ ...u, ...patch }));
  // [Tích hợp 2026-10-05] toast dùng chung cho header + trang Tài khoản/Hồ sơ cửa hàng
  const [globalToast, setGlobalToast] = useState("");
  const notify = (msg) => setGlobalToast(msg);
  const closeTimer = useRef(null);

  const [categories, setCategories] = useState(SERVICE_CATEGORIES);
  const [services, setServices] = useState(SERVICES);
  const [customerServices, setCustomerServices] = useState(CUSTOMER_SERVICES);
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [discounts, setDiscounts] = useState(DISCOUNTS);
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [products, setProducts] = useState(PRODUCTS);
  const [orders, setOrders] = useState(ORDERS);
  const [locations, setLocations] = useState(LOCATIONS);
  const [locationGroups, setLocationGroups] = useState(LOCATION_GROUPS);

  useEffect(() => {
    const onDown = (e) => {
      if (!e.target || !e.target.closest || !e.target.closest("[data-menu-wrap]")) setOpenMenu(null);
    };
    const onResize = () => setOpenMenu(null);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };
  const openAt = (id, el) => {
    cancelClose();
    const r = el.getBoundingClientRect();
    setMenuAnchor({ left: r.left, right: r.right, bottom: r.bottom });
    setOpenMenu(id);
  };
  const toggleAt = (id, el) => (openMenu === id ? setOpenMenu(null) : openAt(id, el));
  const go = (p) => {
    setPage(p);
    setOpenMenu(null);
    setDrawerOpen(false);
    if (typeof window !== "undefined" && window.scrollTo) window.scrollTo(0, 0);
  };
  const openSettings = (section) => {
    if (section) setSettingsSection(section);
    go("settings");
  };

  const addCategory = (name) => {
    const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    setCategories((prev) => [...prev, { id, name }]);
  };
  const renameCategory = (id, name) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setServices((prev) => prev.map((s) => (s.categoryId === id ? { ...s, categoryId: null } : s)));
  };

  const addService = (data) => setServices((prev) => [...prev, { id: Date.now(), ...data }]);
  const updateService = (id, data) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  const deleteService = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setCustomerServices((prev) => prev.filter((cs) => cs.serviceId !== id));
  };

  const assignService = (customerId, serviceId, price, discountId = null) =>
    setCustomerServices((prev) =>
      prev.some((cs) => cs.customerId === customerId && cs.serviceId === serviceId)
        ? prev
        : [...prev, { customerId, serviceId, price, discountId }]
    );
  const unassignService = (customerId, serviceId) =>
    setCustomerServices((prev) => prev.filter((cs) => !(cs.customerId === customerId && cs.serviceId === serviceId)));

  const saveCustomer = (id, fields, serviceRows) => {
    let finalId = id;
    if (id) {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...fields } : c)));
    } else {
      finalId = Date.now();
      setCustomers((prev) => [
        ...prev,
        { id: finalId, spend: 0, lastVisit: "Chưa ghé thăm", tags: [], ...fields },
      ]);
    }
    setCustomerServices((prev) => [
      ...prev.filter((cs) => cs.customerId !== finalId),
      ...serviceRows.map((r) => ({ customerId: finalId, ...r })),
    ]);
    return finalId;
  };
  const deleteCustomer = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setCustomerServices((prev) => prev.filter((cs) => cs.customerId !== id));
  };

  const addDiscount = (data) => setDiscounts((prev) => [...prev, { id: Date.now(), ...data }]);
  const updateDiscount = (id, data) =>
    setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
  const deleteDiscount = (id) => {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
    setCustomerServices((prev) => prev.map((cs) => (cs.discountId === id ? { ...cs, discountId: null } : cs)));
  };

  const addAppointment = (data) => setAppointments((prev) => [...prev, { id: Date.now(), ...data }]);
  const updateAppointment = (id, patch) =>
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const deleteAppointment = (id) => setAppointments((prev) => prev.filter((a) => a.id !== id));

  const addProduct = (data) => setProducts((prev) => [...prev, { id: Date.now(), ...data }]);
  const updateProduct = (id, data) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  const deleteProduct = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const checkout = (order) => {
    setOrders((prev) => [{ id: Date.now(), ...order }, ...prev]);
    setProducts((prev) =>
      prev.map((p) => {
        const line = order.items.find((it) => it.type === "product" && it.refId === p.id);
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
      })
    );
  };

  const unreadCount = CONVERSATIONS.filter((c) => c.unread).length;

  const meta = PAGE_META[page] || { title: page, trail: [page] };

  return (
    <div style={{ fontFamily: "Manrope, sans-serif", color: COLORS.ink, background: COLORS.page, minHeight: "100vh", overflowX: "clip" }}>
      <style>{FONT_IMPORT + RESPONSIVE_CSS}</style>

      {/* [Tích hợp 2026-10-05] Header kiểu KiotViet: menu tự thu gọn vào dropdown "Khác" theo chiều rộng màn hình */}
      <AppHeader
        menu={MENU}
        page={page}
        go={go}
        isMenuActive={isMenuActive}
        branch={branch}
        branches={branches}
        onBranchChange={setBranch}
        settingsMenu={SETTINGS_DROPDOWN}
        onOpenSettings={openSettings}
        settingsActive={page === "settings"}
        user={user}
        onAccount={() => go("account")}
        onStoreProfile={() => go("store-profile")}
        onLogout={() => notify("Đã đăng xuất (bản demo)", "info")}
        onOpenDrawer={() => setDrawerOpen(true)}
        notify={notify}
      />

      {drawerOpen && (
        <MobileDrawer
          page={page}
          unreadCount={unreadCount}
          onGo={go}
          onSettings={openSettings}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {/* [Tích hợp 2026-10-05] trang invoices có header riêng kiểu KiotViet nên ẩn header chung */}
      <div className="rs-main" style={{ padding: "22px 26px" }}>

        {page === "dashboard" && (
          <DashboardPage
            branch={branch}
            customers={customers}
            orders={orders}
            appointments={appointments}
            discounts={discounts}
            services={services}
            products={products}
            setPage={setPage}
          />
        )}
          {page === "appointments" && (
            <AppointmentsPage
              branch={branch}
              customers={customers}
              services={services}
              appointments={appointments}
              onAddAppointment={addAppointment}
              onUpdateAppointment={updateAppointment}
              onDeleteAppointment={deleteAppointment}
            />
          )}
          {page === "pos" && (
            <POSPage
              branch={branch}
              customers={customers}
              services={services}
              products={products}
              discounts={discounts}
              onCheckout={checkout}
            />
          )}
          {/* [Tích hợp 2026-10-05] Trang Khách hàng kiểu KiotViet (CustomersPage cũ vẫn giữ nguyên trong file, không xóa) */}
          {page === "customers" && (
            <KiotCustomersSection
              customers={customers}
              onSaveCustomer={saveCustomer}
              onDeleteCustomer={deleteCustomer}
              services={services}
              products={products}
              orders={orders}
              locations={locations}
              customerServices={customerServices}
              onOpenInvoice={(code) => {
                setInvoiceFocus(code);
                go("invoices");
              }}
              onOpenVoucher={() => go("finance")}
              go={go}
            />
          )}
          {page === "sold-packages" && <KiotPackagesSection />}
          {/* [Tích hợp 2026-10-05] Trang Hàng hóa kiểu KiotViet (ServicesPage cũ vẫn giữ nguyên trong file, không xóa) */}
          {page === "services" && (
            <KiotProductsSection
              services={services}
              products={products}
              categories={categories}
              setCategories={setCategories}
              addService={addService}
              updateService={updateService}
              deleteService={deleteService}
              addProduct={addProduct}
              updateProduct={updateProduct}
              deleteProduct={deleteProduct}
              orders={orders}
              customers={customers}
              discounts={discounts}
              locations={locations}
              onOpenInvoice={(code) => {
                setInvoiceFocus(code);
                go("invoices");
              }}
            />
          )}
          {false && (
            <ServicesPage
              categories={categories}
              services={services}
              customers={customers}
              discounts={discounts}
              customerServices={customerServices}
              onAddCategory={addCategory}
              onRenameCategory={renameCategory}
              onDeleteCategory={deleteCategory}
              onAddService={addService}
              onUpdateService={updateService}
              onDeleteService={deleteService}
              onAssignService={assignService}
              onUnassignService={unassignService}
            />
          )}
          {/* [Tích hợp 2026-10-05] Trang Thiết lập giá kiểu KiotViet */}
          {page === "price-setup" && (
            <KiotPriceSetupSection
              services={services}
              products={products}
              categories={categories}
              updateService={updateService}
              updateProduct={updateProduct}
            />
          )}
          {page === "discounts" && (
            <DiscountsPage
              discounts={discounts}
              customerServices={customerServices}
              onAddDiscount={addDiscount}
              onUpdateDiscount={updateDiscount}
              onDeleteDiscount={deleteDiscount}
            />
          )}
          {/* [Tích hợp 2026-10-05] Trang Hóa đơn kiểu KiotViet (tab invoices của InvoicesInventoryPage cũ vẫn giữ nguyên trong file, không xóa) */}
          {page === "invoices" && (
            <KiotInvoicesSection
              orders={orders}
              customers={customers}
              services={services}
              products={products}
              discounts={discounts}
              locations={locations}
              focusCode={invoiceFocus}
              onClearFocus={() => setInvoiceFocus(null)}
              go={go}
            />
          )}
          {page === "inventory" && (
            <InvoicesInventoryPage
              key="inventory"
              initialTab="inventory"
              branch={branch}
              customers={customers}
              discounts={discounts}
              orders={orders}
              products={products}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
            />
          )}
          {page === "finance" && <FinancePage branch={branch} />}
          {page === "inbox" && <InboxPage branch={branch} />}
          {/* [Tích hợp 2026-10-06] Trang Danh sách nhân viên kiểu KiotViet (StaffPage cũ vẫn giữ nguyên trong file, không xóa) */}
          {page === "staff" && (
            <KiotStaffSection staff={STAFF} branches={branches} notify={notify} />
          )}
          {page === "commission" && <StaffPage branch={branch} orders={orders} discounts={discounts} />}
          {page === "branches" && <BranchesPage customers={customers} />}
          {/* [Tích hợp 2026-10-05] Trang Vị trí/phòng kiểu KiotViet (LocationsPage cũ vẫn giữ nguyên trong file, không xóa) */}
          {page === "position" && (
            <KiotLocationsSection
              branch={branch}
              locations={locations}
              setLocations={setLocations}
              groups={locationGroups}
              setGroups={setLocationGroups}
              orders={orders}
              customers={customers}
              services={services}
              products={products}
              discounts={discounts}
              onOpenInvoice={(code) => {
                setInvoiceFocus(code);
                go("invoices");
              }}
            />
          )}
          {page === "settings" && <SettingsPage section={settingsSection} onSection={setSettingsSection} customers={customers} />}
          {/* [Tích hợp 2026-10-05] Trang Tài khoản (click tên người dùng) */}
          {page === "account" && (
            <AccountPage user={user} onUpdateUser={updateUser} notify={notify} />
          )}
          {/* [Tích hợp 2026-10-05] Trang Hồ sơ cửa hàng */}
          {page === "store-profile" && (
            <StoreProfilePage
              notify={notify}
              branches={branches}
              onAddBranch={addBranch}
              onUpdateBranch={updateBranch}
              onDeleteBranch={deleteBranch}
            />
          )}
          {!IMPLEMENTED_PAGES.has(page) && <PlaceholderPage title={meta.title} trail={meta.trail} />}
        </div>
        {/* [Tích hợp 2026-10-05] toast dùng chung */}
        {globalToast && <Toast message={globalToast} onDone={() => setGlobalToast("")} />}
      </div>
  );
}

