import {useEffect} from "react";
import {createPortal} from "react-dom";
import {motion, AnimatePresence} from "framer-motion";
import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

export default function ProductDetailDrawer({
  open,
  product,
  onClose,
  onEdit,
  onDelete,
  onZoom,
  formatRupiah,
  stockBadge,
}) {
  // ESC + scroll lock
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

  const stock = Number(product?.stock) || 0;

  // Render ke document.body agar tidak terpotong stacking context parent
  return createPortal(
    <AnimatePresence>
      {open && product && (
        <>
          {/* Backdrop — z-[60] agar di atas header (z-20) & sidebar (z-40) */}
          <motion.div
            key="backdrop"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm dark:bg-black/60"
          />

          {/* Panel — z-[61] agar di atas backdrop */}
          <motion.aside
            key="panel"
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
                  Detail Produk
                </p>
                <h3 className="truncate text-base font-semibold text-ink dark:text-white">
                  {product.name}
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
              {/* Gambar (klik → zoom) */}
              <button
                type="button"
                onClick={() => onZoom?.(product)}
                className="group relative block w-full overflow-hidden rounded-2xl border border-line
                  dark:border-slate-800"
              >
                <img
                  src={product.image || product.image_url}
                  alt={product.name}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span
                  className="absolute inset-0 flex items-center justify-center
                  bg-black/0 text-white opacity-0 transition
                  group-hover:bg-black/40 group-hover:opacity-100"
                >
                  <ArrowsPointingOutIcon className="h-6 w-6" />
                </span>
              </button>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl border border-line bg-surface/40 p-3
                  dark:bg-slate-800/40 dark:border-slate-800"
                >
                  <p className="text-xs text-muted dark:text-slate-400">
                    Harga
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink dark:text-white">
                    {formatRupiah?.(product.price)}
                  </p>
                </div>
                <div
                  className="rounded-xl border border-line bg-surface/40 p-3
                  dark:bg-slate-800/40 dark:border-slate-800"
                >
                  <p className="text-xs text-muted dark:text-slate-400">
                    Stock
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${stockBadge?.(product.stock) || ""}`}
                  >
                    {stock === 0 ? "Habis" : `${stock} pcs`}
                  </span>
                </div>
              </div>

              {/* Meta */}
              <div
                className="rounded-xl border border-line p-3 text-sm
                dark:border-slate-800"
              >
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted dark:text-slate-400">
                    ID Produk
                  </span>
                  <span className="font-medium text-ink dark:text-white">
                    #{product.id}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-line py-1 dark:border-slate-800">
                  <span className="text-muted dark:text-slate-400">Status</span>
                  <span
                    className={`font-medium ${
                      stock === 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {stock === 0 ? "Tidak tersedia" : "Tersedia"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div
              className="border-t border-line px-5 py-4 flex items-center gap-2
              dark:border-slate-800"
            >
              <button
                onClick={() => onDelete?.(product)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg
                  border border-line px-3 py-2 text-sm text-rose-600
                  hover:bg-rose-50 transition
                  dark:border-slate-800 dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                <TrashIcon className="h-4 w-4" />
                Hapus
              </button>
              <button
                onClick={() => onEdit?.(product)}
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
