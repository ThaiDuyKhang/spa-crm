import { useState, useCallback } from "react";
import { Info } from "lucide-react";
import PackagesPage from "./PackagesPage.jsx";

/** Adapter: trang "Gói, thẻ đã bán" kiểu KiotViet cho menu Khách hàng của app cũ. */
let toastId = 0;

export default function KiotPackagesSection() {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <>
      <PackagesPage notify={notify} />
      <div className="kv-toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className="kv-toast info">
            <Info size={17} />
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
