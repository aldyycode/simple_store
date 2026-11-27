import supabase from "../config/supabaseClient";
import {useState, useEffect} from "react";
import {ArrowRightIcon} from "@heroicons/react/24/outline";

export default function Dashboard({title, onNavigate}) {
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [totalProductError, setTotalProductError] = useState(null);

  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [totalUsersError, setTotalUsersError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTotalProducts = async () => {
      setLoadingProducts(true);
      try {
        const {count, error} = await supabase
          .from("products")
          .select("id", {count: "exact"});

        if (!isMounted) return;

        if (error) {
          console.error("Supabase error detail:", error);
          setTotalProductError(error.message || "Gagal memuat data");
          setTotalProducts(0);
        } else {
          setTotalProductError(null);
          setTotalProducts(count ?? 0);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Network/runtime error:", err);
        setTotalProductError(err?.message || "Kesalahan jaringan");
        setTotalProducts(0);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    const fetchTotalUsers = async () => {
      setLoadingUsers(true);
      try {
        const {count, error} = await supabase
          .from("users")
          .select("id", {count: "exact"});

        if (!isMounted) return;

        if (error) {
          console.error("Supabase error detail:", error);
          setTotalUsersError(error.message || "Gagal memuat data");
          setTotalUsers(0);
        } else {
          setTotalUsersError(null);
          setTotalUsers(count ?? 0);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Network/runtime error:", err);
        setTotalUsersError(err?.message || "Kesalahan jaringan");
        setTotalUsers(0);
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    };

    fetchTotalProducts();
    fetchTotalUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ---------------------- HANDLER NAVIGASI CARD ---------------------- */
  const goTo = (page) => {
    if (onNavigate) onNavigate(page);
  };

  return (
    <section className="space-y-6">
      {/* Header halaman */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-muted dark:text-slate-400">
            Ringkasan singkat data Users & Product.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card Total Produk — bisa diklik */}
        <button
          type="button"
          onClick={() => goTo("Product")}
          className="group relative w-full rounded-xl border border-line bg-white p-5 text-left shadow-sm
            transition-all duration-200
            hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-ink/20
            dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600
            dark:focus:ring-white/20"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted dark:text-slate-400">
                Total Produk
              </p>
              <p className="mt-2 text-2xl font-semibold text-ink dark:text-white">
                {loadingProducts
                  ? "..."
                  : totalProductError
                    ? "-"
                    : totalProducts.toLocaleString("id-ID")}
              </p>
              {totalProductError && (
                <p className="mt-1 text-xs text-red-500">{totalProductError}</p>
              )}
            </div>

            {/* Ikon panah muncul saat hover */}
            <span
              className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                text-muted transition-transform duration-200
                group-hover:translate-x-0.5 group-hover:text-ink
                dark:text-slate-400 dark:group-hover:text-white"
              aria-hidden
            >
              <ArrowRightIcon className="h-4 w-4" />
            </span>
          </div>

          {/* Hint kecil di bawah */}
          <p className="mt-3 text-xs text-muted/80 dark:text-slate-500 group-hover:text-ink dark:group-hover:text-slate-300">
            Lihat semua produk →
          </p>
        </button>

        {/* Card Total Users — bisa diklik */}
        <button
          type="button"
          onClick={() => goTo("Users")}
          className="group relative w-full rounded-xl border border-line bg-white p-5 text-left shadow-sm
            transition-all duration-200
            hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-ink/20
            dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600
            dark:focus:ring-white/20"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted dark:text-slate-400">
                Total Users
              </p>
              <p className="mt-2 text-2xl font-semibold text-ink dark:text-white">
                {loadingUsers ? "..." : totalUsersError ? "-" : totalUsers}
              </p>
              {totalUsersError && (
                <p className="mt-1 text-xs text-red-500">{totalUsersError}</p>
              )}
            </div>

            <span
              className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                text-muted transition-transform duration-200
                group-hover:translate-x-0.5 group-hover:text-ink
                dark:text-slate-400 dark:group-hover:text-white"
              aria-hidden
            >
              <ArrowRightIcon className="h-4 w-4" />
            </span>
          </div>

          <p className="mt-3 text-xs text-muted/80 dark:text-slate-500 group-hover:text-ink dark:group-hover:text-slate-300">
            Lihat semua users →
          </p>
        </button>
      </div>
    </section>
  );
}
