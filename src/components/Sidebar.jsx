import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

const MENU = [
  {label: "Dashboard", icon: HomeIcon},
  {label: "Users", icon: UsersIcon},
  {label: "Product", icon: ShoppingBagIcon},
];

export default function Sidebar({
  collapsed,
  mobileOpen,
  activeMenu,
  onMenuClick,
  onCloseMobile,
}) {
  const width = collapsed ? "md:w-[72px]" : "md:w-64";

  const handleLogout = async () => {
    const isDark = document.documentElement.classList.contains("dark");
    const res = await Swal.fire({
      title: "Keluar dari akun?",
      text: "Anda akan diarahkan ke halaman login.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
      confirmButtonColor: "#0F172A",
      cancelButtonColor: isDark ? "#334155" : "#E2E8F0",
      background: isDark ? "#0f172a" : "#ffffff",
      color: isDark ? "#E5E7EB" : "#0F172A",
      customClass: {popup: "rounded-2xl"},
    });
    if (res.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "Berhasil logout",
        timer: 1200,
        showConfirmButton: false,
        background: isDark ? "#0f172a" : "#ffffff",
        color: isDark ? "#E5E7EB" : "#0F172A",
      });
    }
  };

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-40
        flex flex-col
        bg-surface border-r border-line
        dark:bg-slate-900 dark:border-slate-800
        transform transition-all duration-300 ease-in-out
        w-64 ${width}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-line dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-white text-sm font-semibold dark:bg-white dark:text-ink">
            A
          </div>
          <span
            className={`text-sm font-semibold text-ink whitespace-nowrap transition-opacity dark:text-white
              ${collapsed ? "md:opacity-0 md:w-0" : "opacity-100"}`}
          >
            Admin Panel
          </span>
        </div>
        <button
          onClick={onCloseMobile}
          className="md:hidden rounded-md p-1.5 text-muted hover:bg-line dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Tutup sidebar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {MENU.map((item) => {
            const Icon = item.icon;
            const active = activeMenu === item.label;
            return (
              <li key={item.label}>
                <button
                  onClick={() => onMenuClick(item)}
                  title={collapsed ? item.label : undefined}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                    ${
                      active
                        ? "bg-white text-ink shadow-sm ring-1 ring-line dark:bg-slate-800 dark:text-white dark:ring-slate-700"
                        : "text-muted hover:bg-white hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span
                    className={`whitespace-nowrap transition-opacity
                      ${collapsed ? "md:opacity-0 md:w-0 md:overflow-hidden" : "opacity-100"}`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profil / Logout */}
      <div className="border-t border-line dark:border-slate-800 p-3">
        <div
          className={`flex items-center gap-3 rounded-lg px-2 py-2
            ${collapsed ? "md:justify-center" : ""}`}
        >
          <div className="h-9 w-9 shrink-0 rounded-full bg-ink/10 flex items-center justify-center text-xs font-semibold text-ink dark:bg-slate-700 dark:text-slate-200">
            US
          </div>
          <div className={`min-w-0 flex-1 ${collapsed ? "md:hidden" : ""}`}>
            <p className="truncate text-sm font-medium text-ink dark:text-white">
              User Name
            </p>
            <p className="truncate text-xs text-muted dark:text-slate-400">
              user@mail.com
            </p>
          </div>
          <button
            onClick={handleLogout}
            className={`shrink-0 rounded-md p-1.5 text-muted hover:bg-line hover:text-ink transition
              dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white
              ${collapsed ? "md:hidden" : ""}`}
            title="Logout"
            aria-label="Logout"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
