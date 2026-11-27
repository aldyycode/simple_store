import {useEffect, useRef, useState} from "react";
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  SunIcon,
  MoonIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import {useTheme} from "../context/ThemeContext";

export default function Header({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
  pageTitle,
  onShowHelp,
}) {
  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const {theme, toggleTheme} = useTheme();

  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setOpenNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setOpenProfile(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center justify-between
      border-b border-line bg-surface/80 backdrop-blur px-4 sm:px-6
      dark:bg-slate-900/80 dark:border-slate-800"
    >
      {/* Kiri */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden rounded-md p-2 text-muted hover:bg-line hover:text-ink
            dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Buka sidebar"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <button
          onClick={onToggleCollapse}
          className="hidden md:inline-flex rounded-md p-2 text-muted hover:bg-line hover:text-ink
            dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Collapse sidebar"
        >
          <ChevronLeftIcon
            className={`h-5 w-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>

        <div className="min-w-0">
          <p className="text-xs text-muted leading-tight dark:text-slate-400">
            Admin / {pageTitle}
          </p>
          <h1 className="truncate text-base font-semibold text-ink leading-tight dark:text-white">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShowHelp}
          className="rounded-md p-2 text-muted hover:bg-line hover:text-ink transition
    dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Bantuan shortcut"
          title="Shortcut keyboard (?)"
        ></button>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted hover:bg-line hover:text-ink transition
            dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Toggle tema"
          title={theme === "dark" ? "Mode terang" : "Mode gelap"}
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>

        {/* Notifikasi */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setOpenNotif((v) => !v);
              setOpenProfile(false);
            }}
            className="relative rounded-md p-2 text-muted hover:bg-line hover:text-ink
              dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Notifikasi"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-surface dark:ring-slate-900" />
          </button>

          <div
            className={`absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-line
              bg-white shadow-lg transition-all duration-150
              dark:bg-slate-900 dark:border-slate-800
              ${openNotif ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
          >
            <div
              className="border-b border-line px-4 py-3 text-sm font-semibold text-ink
              dark:border-slate-800 dark:text-white"
            >
              Notifikasi
            </div>
            <div className="px-4 py-8 text-center text-sm text-muted dark:text-slate-400">
              Belum ada notifikasi.
            </div>
          </div>
        </div>

        {/* Profil */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setOpenProfile((v) => !v);
              setOpenNotif(false);
            }}
            className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-line
              dark:hover:bg-slate-800"
            aria-label="Menu profil"
          >
            <div
              className="h-8 w-8 rounded-full bg-ink text-white text-xs font-semibold flex items-center justify-center
              dark:bg-white dark:text-ink"
            >
              US
            </div>
            <ChevronDownIcon className="h-4 w-4 text-muted dark:text-slate-400" />
          </button>

          <div
            className={`absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-line
              bg-white shadow-lg transition-all duration-150
              dark:bg-slate-900 dark:border-slate-800
              ${openProfile ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
          >
            <div className="px-4 py-3 border-b border-line dark:border-slate-800">
              <p className="text-sm font-medium text-ink dark:text-white">
                User Name
              </p>
              <p className="text-xs text-muted truncate dark:text-slate-400">
                user@mail.com
              </p>
            </div>
            <ul className="py-1 text-sm text-muted dark:text-slate-400">
              <li>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-surface hover:text-ink
                  dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  Profile
                </button>
              </li>
              <li>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-surface hover:text-ink
                  dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  Settings
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
