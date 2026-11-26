// import StatCard from "../components/StatCard";
// import {UsersIcon, ShoppingBagIcon} from "@heroicons/react/24/outline";
import supabase from "../config/supabaseClient";

// IMPORT HOOK
import {useState, useEffect} from "react";

export default function Dashboard({title}) {
  // TODO: ganti dengan data asli dari API
  // const stats = {
  //   totalUsers: 1248,
  //   totalProducts: 86,
  // };

  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [totalProductError, setTotalProductError] = useState(null);

  // MENAMPILKAN DATA TOTAL PRODUK DAN USER
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
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    };

    fetchTotalProducts();

    return () => {
      isMounted = false;
    };
  }, []);

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
        {/* Card Total Produk */}
        <div className="rounded-xl border border-line bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
      </div>
    </section>
  );
}
