import {useState, useEffect, useRef} from "react";
import {
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const STOCK_OPTIONS = [
  {value: "all", label: "Semua Stock"},
  {value: "out", label: "Habis (0)"},
  {value: "low", label: "Menipis (<10)"},
  {value: "available", label: "Tersedia (≥10)"},
];

const SORT_OPTIONS = [
  {value: "default", label: "Default"},
  {value: "price-asc", label: "Harga: Termurah → Termahal"},
  {value: "price-desc", label: "Harga: Termahal → Termurah"},
];

export default function ProductFilter({filters, onChange}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const panelRef = useRef(null);

  // Sync draft saat filter berubah dari luar
  useEffect(() => setDraft(filters), [filters]);

  // Klik luar → tutup panel
  useEffect(() => {
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const activeCount =
    (filters.stock !== "all" ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.sort !== "default" ? 1 : 0);

  const apply = () => {
    onChange(draft);
    setOpen(false);
  };

  const reset = () => {
    const cleared = {
      stock: "all",
      minPrice: "",
      maxPrice: "",
      sort: "default",
    };
    setDraft(cleared);
    onChange(cleared);
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Tombol Filter */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition
          ${
            activeCount > 0
              ? "border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-ink"
              : "border-line bg-white text-muted hover:text-ink hover:bg-surface dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
      >
        <FunnelIcon className="h-4 w-4" />
        Filter
        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-semibold dark:bg-ink/20">
            {activeCount}
          </span>
        )}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Panel Dropdown */}
      {open && (
        <div
          className="absolute right-0 z-30 mt-2 w-[320px] origin-top-right animate-fade-in
          rounded-2xl border border-line bg-white p-4 shadow-lg
          dark:bg-slate-900 dark:border-slate-800"
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink dark:text-white">
              Filter Produk
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted hover:bg-surface dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Stock */}
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted dark:text-slate-400">
              Stock
            </label>
            <select
              value={draft.stock}
              onChange={(e) => setDraft({...draft, stock: e.target.value})}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm
                text-ink focus:outline-none focus:ring-2 focus:ring-ink/20
                dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              {STOCK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rentang Harga */}
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted dark:text-slate-400">
              Rentang Harga (Rp)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={draft.minPrice}
                onChange={(e) => setDraft({...draft, minPrice: e.target.value})}
                className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm
                  text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20
                  dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
              />
              <span className="text-muted dark:text-slate-500">–</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={draft.maxPrice}
                onChange={(e) => setDraft({...draft, maxPrice: e.target.value})}
                className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm
                  text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20
                  dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Urutan Harga */}
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-muted dark:text-slate-400">
              Urutkan Harga
            </label>
            <select
              value={draft.sort}
              onChange={(e) => setDraft({...draft, sort: e.target.value})}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm
                text-ink focus:outline-none focus:ring-2 focus:ring-ink/20
                dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={reset}
              className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted
                hover:bg-surface dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Reset
            </button>
            <button
              onClick={apply}
              className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white
                hover:bg-ink/90 dark:bg-white dark:text-ink dark:hover:bg-white/90"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
