import {useEffect} from "react";
import {createPortal} from "react-dom";
import {motion, AnimatePresence} from "framer-motion";
import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

export default function UserDetailDrawer({
  open,
  user,
  onClose,
  onEdit,
  onDelete,
  onZoom,
  getPhoto,
  getInitials,
}) {
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

  const photo = user ? getPhoto?.(user) : "";

  return createPortal(
    <AnimatePresence>
      {open && user && (
        <>
          <motion.div
            key="u-backdrop"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm dark:bg-black/60"
          />

          <motion.aside
            key="u-panel"
            initial={{x: "100%"}}
            animate={{x: 0}}
            exit={{x: "100%"}}
            transition={{type: "spring", stiffness: 320, damping: 32}}
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col
              bg-white shadow-2xl dark:bg-slate-900
              border-l border-line dark:border-slate-800"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b border-line px-5 py-4
              dark:border-slate-800"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted dark:text-slate-400">
                  Detail User
                </p>
                <h3 className="truncate text-base font-semibold text-ink dark:text-white">
                  {user.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-muted hover:bg-surface hover:text-ink
                  dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Tutup"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Foto profil bulat — klik zoom */}
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => onZoom?.(user)}
                  className="group relative h-28 w-28 overflow-hidden rounded-full
                    border-4 border-white shadow-lg ring-1 ring-line
                    dark:border-slate-800 dark:ring-slate-700 bg-ink/5 dark:bg-slate-800
                    focus:outline-none focus:ring-2 focus:ring-ink/30"
                  title="Perbesar foto"
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={user.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-ink dark:text-white">
                      {getInitials?.(user.name)}
                    </span>
                  )}
                  <span
                    className="absolute inset-0 flex items-center justify-center
                    bg-black/0 text-white opacity-0 transition
                    group-hover:bg-black/40 group-hover:opacity-100"
                  >
                    <ArrowsPointingOutIcon className="h-5 w-5" />
                  </span>
                </button>
                <div className="text-center">
                  <p className="text-sm font-semibold text-ink dark:text-white">
                    {user.name}
                  </p>
                </div>
              </div>

              {/* Info grid */}
              <div
                className="rounded-xl border border-line p-3 text-sm
                dark:border-slate-800"
              >
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted dark:text-slate-400">Email</span>
                  <span className="font-medium text-ink dark:text-white truncate max-w-[60%]">
                    {user.email || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-line py-1 dark:border-slate-800">
                  <span className="text-muted dark:text-slate-400">
                    Password
                  </span>
                  <span className="font-mono text-xs text-muted dark:text-slate-300">
                    ••••••••
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="border-t border-line px-5 py-4 flex items-center gap-2
              dark:border-slate-800"
            >
              <button
                onClick={() => onDelete?.(user)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg
                  border border-line px-3 py-2 text-sm text-rose-600
                  hover:bg-rose-50 transition
                  dark:border-slate-800 dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                <TrashIcon className="h-4 w-4" />
                Hapus
              </button>
              <button
                onClick={() => onEdit?.(user)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg
                  bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-ink/90 transition
                  dark:bg-white dark:text-ink dark:hover:bg-white/90"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
