import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Menu as MenuIcon, ChevronDown, ChevronRight, ShoppingCart,
  Bell, HelpCircle, Settings, Building2, LogOut, Check,
} from "lucide-react";
import "./AppHeader.css";

const MORE_WIDTH = 96;

function defaultPage(m) {
  if (m.page) return m.page;
  const g = (m.groups || [])[0];
  return g && g.items[0] ? g.items[0].page : null;
}

function UserPanel({ user, onAccount, onStoreProfile, onLogout, notify }) {
  const [dark, setDark] = useState(false);
  return (
    <div className="akh-user-panel" onClick={(e) => e.stopPropagation()}>
      <button className="akh-user-name" onClick={onAccount}>
        {user.displayName || "Người dùng"}
      </button>
      <div className={`akh-2fa${user.twoFactor ? " on" : ""}`}>
        {user.twoFactor ? "Đã bật xác thực 2 lớp" : "Chưa bật xác thực 2 lớp"}
      </div>
      <div className="akh-sep" />
      <button className="akh-user-row" onClick={onStoreProfile}>
        <span>Hồ sơ cửa hàng</span>
        <ChevronRight size={16} />
      </button>
      <button
        className="akh-user-row akh-user-branch"
        onClick={() => notify("Danh sách chi nhánh sẽ được bổ sung sau", "info")}
      >
        <span>
          Chi nhánh trung tâm
          <small>(UTC+07:00) Asia/Ho_Chi_Minh</small>
        </span>
        <ChevronRight size={16} />
      </button>
      <div className="akh-sep" />
      <div className="akh-user-row akh-static">
        <span>Chủ đề</span>
        <button
          type="button"
          className={`akh-switch${dark ? " on" : ""}`}
          onClick={() => {
            setDark(!dark);
            notify("Chế độ tối sẽ được bổ sung sau", "info");
          }}
          aria-label="Đổi chủ đề"
        >
          <span className="akh-switch-dot" />
        </button>
      </div>
      <button className="akh-user-row" onClick={() => notify("Hiện chỉ hỗ trợ Tiếng Việt", "info")}>
        <span className="akh-muted">Ngôn ngữ</span>
        <span className="akh-row-right">Tiếng Việt <ChevronRight size={16} /></span>
      </button>
      <button className="akh-user-row" onClick={() => notify("Hiện chỉ hỗ trợ VND", "info")}>
        <span className="akh-muted">Tiền tệ</span>
        <span className="akh-row-right">VND <ChevronRight size={16} /></span>
      </button>
      <button className="akh-logout" onClick={onLogout}>
        <LogOut size={15} /> Đăng xuất
      </button>
    </div>
  );
}

/**
 * Header kiểu KiotViet: menu tự thu gọn vào dropdown "Khác" theo chiều rộng.
 */
export default function AppHeader({
  menu, page, go, isMenuActive,
  branch, branches, onBranchChange,
  settingsMenu, onOpenSettings, settingsActive,
  user, onAccount, onStoreProfile, onLogout,
  onOpenDrawer, notify,
}) {
  const [open, setOpen] = useState(null); // menuId | "more" | "branch" | "settings" | "user"
  const [visibleCount, setVisibleCount] = useState(menu.length);
  const navRef = useRef(null);
  const measureRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  useEffect(() => {
    const compute = () => {
      const nav = navRef.current;
      const meas = measureRef.current;
      if (!nav || !meas || !meas.children.length) return;
      const widths = Array.from(meas.children).map((c) => c.getBoundingClientRect().width);
      const avail = nav.clientWidth;
      let used = 0;
      let n = 0;
      for (let i = 0; i < widths.length; i++) {
        const need = widths[i] + (i < widths.length - 1 ? MORE_WIDTH : 0);
        if (used + need <= avail) {
          used += widths[i];
          n++;
        } else break;
      }
      setVisibleCount(n);
    };
    compute();
    const t = setTimeout(compute, 400);
    window.addEventListener("resize", compute);
    let ro = null;
    if (window.ResizeObserver && navRef.current) {
      ro = new ResizeObserver(compute);
      ro.observe(navRef.current);
    }
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", compute);
      if (ro) ro.disconnect();
    };
  }, [menu.length]);

  const select = (p) => {
    setOpen(null);
    if (p) go(p);
  };

  const visible = menu.slice(0, visibleCount);
  const hidden = menu.slice(visibleCount);
  const moreActive = hidden.some((m) => isMenuActive(m, page));

  return (
    <div className="akh" ref={rootRef}>
      <button className="akh-burger" onClick={onOpenDrawer} aria-label="Mở menu">
        <MenuIcon size={20} />
      </button>

      <div className="akh-logo" onClick={() => select("dashboard")}>
        <Sparkles size={20} color="#fff" />
        <span className="akh-logo-text">Lumière Spa</span>
      </div>

      <nav className="akh-nav" ref={navRef}>
        {visible.map((m) => {
          const active = isMenuActive(m, page);
          const isOpen = open === m.id;
          return (
            <div
              key={m.id}
              className={`akh-nav-item${active ? " active" : ""}${isOpen ? " open" : ""}`}
              onMouseEnter={() => m.groups && setOpen(m.id)}
              onMouseLeave={() => m.groups && setOpen(null)}
            >
              <button
                className="akh-nav-btn"
                onClick={() => (m.groups ? setOpen(isOpen ? null : m.id) : select(m.page))}
              >
                {m.label}
                {m.groups && <ChevronDown size={13} />}
              </button>
              {active && <span className="akh-nav-underline" />}
              {isOpen && m.groups && (
                <div className="akh-panel" style={{ minWidth: m.width || 220 }}>
                  {m.groups.map((g, gi) => (
                    <div key={gi} className="akh-panel-group">
                      {g.title && <div className="akh-panel-title">{g.title}</div>}
                      {g.items.map((it) => (
                        <button
                          key={it.page}
                          className={`akh-panel-item${page === it.page ? " active" : ""}`}
                          onClick={() => select(it.page)}
                        >
                          {it.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {hidden.length > 0 && (
          <div
            className={`akh-nav-item${moreActive ? " active" : ""}${open === "more" ? " open" : ""}`}
            onMouseEnter={() => setOpen("more")}
            onMouseLeave={() => setOpen(null)}
          >
            <button
              className="akh-nav-btn"
              onClick={() => setOpen(open === "more" ? null : "more")}
            >
              Khác <ChevronDown size={13} />
            </button>
            {moreActive && <span className="akh-nav-underline" />}
            {open === "more" && (
              <div className="akh-more-panel">
                {hidden.map((m) => (
                  <div key={m.id} className="akh-more-group">
                    <button className="akh-more-head" onClick={() => select(defaultPage(m))}>
                      {m.label}
                    </button>
                    {(m.groups || []).map((g, gi) => (
                      <div key={gi}>
                        {g.title && <div className="akh-panel-title">{g.title}</div>}
                        {g.items.map((it) => (
                          <button
                            key={it.page}
                            className={`akh-panel-item${page === it.page ? " active" : ""}`}
                            onClick={() => select(it.page)}
                          >
                            {it.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* thước đo ẩn để tính độ rộng từng mục menu */}
      <div className="akh-measure" ref={measureRef} aria-hidden="true">
        {menu.map((m) => (
          <span key={m.id} className="akh-nav-btn">
            {m.label}
            {m.groups && <ChevronDown size={13} />}
          </span>
        ))}
      </div>

      <div className="akh-right">
        <div className="akh-drop">
          <button
            className="akh-branch-btn"
            onClick={() => setOpen(open === "branch" ? null : "branch")}
          >
            <Building2 size={14} />
            <span className="akh-hide-md">{branches.find((b) => b.id === branch)?.name}</span>
            <ChevronDown size={14} />
          </button>
          {open === "branch" && (
            <div className="akh-dropdown">
              {branches.map((b) => (
                <button
                  key={b.id}
                  className={`akh-panel-item${branch === b.id ? " active" : ""}`}
                  onClick={() => { onBranchChange(b.id); setOpen(null); }}
                >
                  <span>{b.name}</span>
                  {branch === b.id && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="akh-pos-btn" onClick={() => select("pos")}>
          <ShoppingCart size={15} />
          <span className="akh-hide-sm">Thu ngân</span>
        </button>
        <button
          className="akh-icon-btn akh-hide-sm" title="Thông báo"
          onClick={() => notify("Chưa có thông báo mới", "info")}
        >
          <Bell size={18} />
        </button>
        <button
          className="akh-icon-btn akh-hide-sm" title="Trợ giúp"
          onClick={() => notify("Trung tâm trợ giúp sẽ được bổ sung sau", "info")}
        >
          <HelpCircle size={18} />
        </button>

        <div className="akh-drop">
          <button
            className={`akh-icon-btn${settingsActive ? " on" : ""}`}
            title="Thiết lập"
            onClick={() => setOpen(open === "settings" ? null : "settings")}
          >
            <Settings size={18} />
          </button>
          {open === "settings" && (
            <div className="akh-dropdown akh-settings-panel">
              {(settingsMenu || []).map((s) => (
                <button
                  key={s.id} className="akh-settings-item"
                  onClick={() => { setOpen(null); onOpenSettings(s.id); }}
                >
                  {s.icon && <s.icon size={17} />}
                  <span>
                    <span className="akh-settings-title">{s.title}</span>
                    <small>{s.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="akh-drop">
          <button
            className="akh-avatar"
            onClick={() => setOpen(open === "user" ? null : "user")}
            title={user.displayName || "Tài khoản"}
          >
            {(user.displayName || "U").trim().charAt(0).toUpperCase()}
          </button>
          {open === "user" && (
            <div className="akh-dropdown akh-user-dropdown">
              <UserPanel
                user={user}
                onAccount={() => { setOpen(null); onAccount(); }}
                onStoreProfile={() => { setOpen(null); onStoreProfile(); }}
                onLogout={onLogout}
                notify={notify}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
