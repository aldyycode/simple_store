// src/components/ShortcutHelp.jsx
import {useEffect} from "react";
import {createPortal} from "react-dom";
import {motion, AnimatePresence} from "framer-motion";
import {XMarkIcon, CommandLineIcon} from "@heroicons/react/24/outline";
import {SHORTCUTS} from "../config/shortcuts";

export default function ShortcutHelp({open, onClose}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sh-backdrop"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm dark:bg-black/60"
          />

          {/* Panel */}
          <motion.div
            key="sh-panel"
            initial={{opacity: 0, y: 12, scale: 0.98}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: 12, scale: 0.98}}
            transition={{type: "spring", stiffness: 300, damping: 28}}
            className="fixed left-1/2 top-1/2 z-[71] w-[92vw] max-w-md
              -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line
              bg-white p-5 shadow-2xl dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg
                  bg-ink/5 text-ink dark:bg-white/10 dark:text-white"
                >
                  <CommandLineIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink dark:text-white">
                    Shortcut Keyboard
                  </h3>
                  <p className="text-xs text-muted dark:text-slate-400">
                    Tekan <Kbd>?</Kbd> untuk membuka bantuan ini.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink
                  dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Tutup"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            <ul className="space-y-2">
              {SHORTCUTS.map((sc) => (
                <li
                  key={sc.target}
                  className="flex items-center justify-between rounded-lg border border-line
                    px-3 py-2 text-sm dark:border-slate-800"
                >
                  <span className="text-ink dark:text-white">{sc.target}</span>
                  <span className="flex items-center gap-1">
                    {sc.keys.map((k, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <Kbd>{k}</Kbd>
                        {i < sc.keys.length - 1 && (
                          <span className="text-muted dark:text-slate-500">
                            +
                          </span>
                        )}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-center text-xs text-muted dark:text-slate-500">
              Shortcut dinonaktifkan saat mengetik di kolom input.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* Komponen kecil untuk tampilan tombol keyboard */
function Kbd({children}) {
  return (
    <kbd
      className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border
      border-line bg-surface px-1.5 text-[11px] font-medium text-ink shadow-sm
      dark:border-slate-700 dark:bg-slate-800 dark:text-white"
    >
      {children}
    </kbd>
  );
}
