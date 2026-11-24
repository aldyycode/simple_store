import StatCard from "../components/StatCard";
import {UsersIcon, ShoppingBagIcon} from "@heroicons/react/24/outline";
import supabase from "../config/supabaseClient";

export default function Dashboard({title}) {
  // TODO: ganti dengan data asli dari API
  const stats = {
    totalUsers: 1248,
    totalProducts: 86,
  };

  console.log(supabase);
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
      </div>
    </section>
  );
}
