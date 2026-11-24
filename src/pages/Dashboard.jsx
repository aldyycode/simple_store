import StatCard from "../components/StatCard";
import {UsersIcon, ShoppingBagIcon} from "@heroicons/react/24/outline";

export default function Dashboard({title}) {
  // TODO: ganti dengan data asli dari API
  const stats = {
    totalUsers: 1248,
    totalProducts: 86,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString("id-ID")}
          icon={UsersIcon}
          accent="sky"
          trend={{value: "+12%", positive: true}}
        />

        <StatCard
          label="Total Product"
          value={stats.totalProducts.toLocaleString("id-ID")}
          icon={ShoppingBagIcon}
          accent="emerald"
          trend={{value: "+4%", positive: true}}
        />

        {/* Slot card berikutnya */}
        <div
          className="hidden lg:flex rounded-2xl border-2 border-dashed border-line
          bg-surface/40 dark:bg-slate-900/40 dark:border-slate-800
          p-5 items-center justify-center text-xs text-muted dark:text-slate-500"
        >
          Slot card berikutnya
        </div>
      </div>

      {/* AREA KONTEN KOMPONEN DI SINI */}
      <div
        className="rounded-2xl border-2 border-dashed border-line bg-surface/40
        dark:bg-slate-900/40 dark:border-slate-800 px-6 py-16 text-center"
      >
        <p className="text-sm font-medium text-ink dark:text-white">
          Area Konten
        </p>
        <p className="mt-1 text-sm text-muted dark:text-slate-400">
          Tempatkan chart, tabel, atau widget lain di sini.
        </p>
      </div>
    </section>
  );
}
