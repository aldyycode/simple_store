import {useState, useEffect, useMemo} from "react";
import supabase from "../config/supabaseClient";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import ProductFilter from "../components/ProductFilter";
import ProductDetailDrawer from "../components/ProductDetailDrawer";

const PAGE_SIZE = 5;

const DEFAULT_FILTERS = {
  stock: "all", // all | out | low | available
  minPrice: "",
  maxPrice: "",
  sort: "default", // default | price-asc | price-desc
};

export default function Product({onAdd, onEdit}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  // Detail drawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const isDark = () => document.documentElement.classList.contains("dark");

  const swalTheme = {
    background: isDark() ? "#0f172a" : "#ffffff",
    color: isDark() ? "#E5E7EB" : "#0F172A",
    customClass: {popup: "rounded-2xl"},
  };

  /* ----------------------------- FETCH ----------------------------- */
  const fetchProducts = async () => {
    setLoading(true);
    const {data, error} = await supabase
      .from("products")
      .select("*")
      .order("id", {ascending: true});

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data",
        text: error.message,
        ...swalTheme,
      });
      setProducts([]);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ----------------------------- HELPERS ----------------------------- */
  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(n) || 0);

  const stockBadge = (stock) => {
    const s = Number(stock) || 0;
    if (s === 0)
      return "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400";
    if (s < 10)
      return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
    return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
  };

  /* ------------------------ FILTER + SORT (multi) ------------------------ */
  const filtered = useMemo(() => {
    let result = [...products];

    // 1) Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => (p.name || "").toLowerCase().includes(q));
    }

    // 2) Stock
    if (filters.stock !== "all") {
      result = result.filter((p) => {
        const s = Number(p.stock) || 0;
        if (filters.stock === "out") return s === 0;
        if (filters.stock === "low") return s > 0 && s < 10;
        if (filters.stock === "available") return s >= 10;
        return true;
      });
    }

    // 3) Rentang harga
    const min = filters.minPrice !== "" ? Number(filters.minPrice) : null;
    const max = filters.maxPrice !== "" ? Number(filters.maxPrice) : null;
    if (min !== null) result = result.filter((p) => Number(p.price) >= min);
    if (max !== null) result = result.filter((p) => Number(p.price) <= max);

    // 4) Urutkan
    if (filters.sort === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (filters.sort === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, search, filters]);

  /* --------------------------- PAGINATION --------------------------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  // Reset halaman saat search / filter berubah
  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  /* ----------------------------- ACTIONS ----------------------------- */
  const handleAdd = () => {
    if (onAdd) onAdd();
    else
      Swal.fire({
        icon: "info",
        title: "Tambah Produk",
        text: "Navigasi ke halaman tambah produk.",
        ...swalTheme,
      });
  };

  const handleDetail = (product) => {
    setSelected(product);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    // beri jeda agar animasi keluar selesai sebelum clear
    setTimeout(() => setSelected(null), 300);
  };

  const handleEdit = (product) => {
    closeDetail();
    if (onEdit) onEdit(product);
    else
      Swal.fire({
        icon: "info",
        title: "Edit Produk",
        text: `Edit: ${product.name}`,
        confirmButtonColor: "#0F172A",
        ...swalTheme,
      });
  };

  const handleDelete = async (product) => {
    closeDetail();
    const res = await Swal.fire({
      title: "Hapus produk?",
      text: `"${product.name}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: isDark() ? "#334155" : "#E2E8F0",
      ...swalTheme,
    });
    if (!res.isConfirmed) return;

    const {error} = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus",
        text: error.message,
        ...swalTheme,
      });
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    Swal.fire({
      icon: "success",
      title: "Terhapus",
      timer: 1200,
      showConfirmButton: false,
      ...swalTheme,
    });
  };

  const handleZoom = (product) => {
    Swal.fire({
      imageUrl: product.image || product.image_url,
      imageAlt: product.name,
      title: product.name,
      width: "min(92vw, 820px)",
      showConfirmButton: false,
      showCloseButton: true,
      padding: 0,
      backdrop: "rgba(0,0,0,.75)",
      ...swalTheme,
    });
  };

  /* ------------------------------ RENDER ------------------------------ */
  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink dark:text-white">
            Product
          </h2>
          <p className="text-sm text-muted dark:text-slate-400">
            Kelola data produk: {filtered.length} item
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg
            bg-ink px-4 py-2.5 text-sm font-medium text-white
            hover:bg-ink/90 transition
            dark:bg-white dark:text-ink dark:hover:bg-white/90"
        >
          <PlusIcon className="h-4 w-4" />
          Tambah Produk
        </button>
      </div>

      {/* TOOLBAR: Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full rounded-lg border border-line bg-white pl-9 pr-3 py-2 text-sm
              text-ink placeholder:text-muted
              focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/30
              dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500
              dark:focus:ring-white/10 dark:focus:border-slate-600"
          />
        </div>

        <ProductFilter filters={filters} onChange={setFilters} />
      </div>

      {/* TABEL */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-left dark:bg-slate-900/60 dark:border-slate-800">
                <th className="px-4 py-3 font-medium text-muted dark:text-slate-400">
                  Product
                </th>
                <th className="px-4 py-3 font-medium text-muted dark:text-slate-400">
                  Price
                </th>
                <th className="px-4 py-3 font-medium text-muted dark:text-slate-400">
                  Stock
                </th>
                <th className="px-4 py-3 font-medium text-muted dark:text-slate-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-slate-800">
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-muted dark:text-slate-400"
                  >
                    Memuat data...
                  </td>
                </tr>
              )}

              {!loading && paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-muted dark:text-slate-400"
                  >
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              )}

              {!loading &&
                paginated.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-surface/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleZoom(p)}
                          title="Lihat gambar"
                          className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg
                            border border-line dark:border-slate-800
                            focus:outline-none focus:ring-2 focus:ring-ink/20"
                        >
                          <img
                            src={p.image || p.image_url}
                            alt={p.name}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                            loading="lazy"
                          />
                          <span
                            className="absolute inset-0 flex items-center justify-center
                            bg-black/0 text-white opacity-0 transition
                            group-hover:bg-black/40 group-hover:opacity-100"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </span>
                        </button>

                        <div className="min-w-0">
                          <p className="font-medium text-ink dark:text-white truncate">
                            {p.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-ink dark:text-white whitespace-nowrap">
                      {formatRupiah(p.price)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${stockBadge(p.stock)}`}
                      >
                        {Number(p.stock) === 0 ? "Habis" : `${p.stock} pcs`}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDetail(p)}
                          title="Detail"
                          className="rounded-md p-2 text-muted hover:bg-surface hover:text-ink transition
                            dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(p)}
                          title="Edit"
                          className="rounded-md p-2 text-muted hover:bg-sky-50 hover:text-sky-600 transition
                            dark:text-slate-400 dark:hover:bg-sky-500/10 dark:hover:text-sky-400"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          title="Delete"
                          className="rounded-md p-2 text-muted hover:bg-rose-50 hover:text-rose-600 transition
                            dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between
          border-t border-line px-4 py-3 text-xs text-muted
          dark:border-slate-800 dark:text-slate-400"
        >
          <span>
            Menampilkan{" "}
            <b className="text-ink dark:text-white">
              {filtered.length === 0 ? 0 : startIdx + 1}–
              {Math.min(startIdx + PAGE_SIZE, filtered.length)}
            </b>{" "}
            dari <b className="text-ink dark:text-white">{filtered.length}</b>{" "}
            produk
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1 || loading}
              className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1
                hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed
                dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              Prev
            </button>

            {Array.from({length: totalPages}).map((_, i) => {
              const n = i + 1;
              const visible =
                totalPages <= 5 ||
                n === 1 ||
                n === totalPages ||
                Math.abs(n - safePage) <= 1;
              if (!visible) {
                if (n === 2 && safePage > 3)
                  return (
                    <span key={`l-${n}`} className="px-1">
                      …
                    </span>
                  );
                if (n === totalPages - 1 && safePage < totalPages - 2)
                  return (
                    <span key={`r-${n}`} className="px-1">
                      …
                    </span>
                  );
                return null;
              }
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-md border px-2.5 py-1 transition
                    ${
                      n === safePage
                        ? "border-line bg-surface text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        : "border-line hover:bg-surface dark:border-slate-800 dark:hover:bg-slate-800"
                    }`}
                >
                  {n}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages || loading}
              className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1
                hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed
                dark:border-slate-800 dark:hover:bg-slate-800"
            >
              Next
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer di akhir, sebelum </section> */}
      <ProductDetailDrawer
        open={detailOpen}
        product={selected}
        onClose={closeDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onZoom={handleZoom}
        formatRupiah={formatRupiah}
        stockBadge={stockBadge}
      />
    </section>
  );
}
