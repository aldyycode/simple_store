import {useState} from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({children}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [pageTitle, setPageTitle] = useState("Dashboard");

  const handleMenuClick = (item) => {
    setActiveMenu(item.label);
    setPageTitle(item.label);
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      {/* Backdrop mobile */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-30 bg-ink/30 dark:bg-black/60 backdrop-blur-sm transition-opacity md:hidden
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        activeMenu={activeMenu}
        onMenuClick={handleMenuClick}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onOpenMobile={() => setMobileOpen(true)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {typeof children === "function" ? children(pageTitle) : children}
          </div>
        </main>
      </div>
    </div>
  );
}
