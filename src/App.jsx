import {useState} from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product";
import ProductForm from "./pages/ProductForm";
import ProductEdit from "./pages/ProductEdit";
// import Users from "./pages/Users"; // nanti jika sudah ada

export default function App() {
  // view = { name: 'list' | 'add' | 'edit', id: number|null }
  const [view, setView] = useState({name: "list", id: null});

  const resetView = () => setView({name: "list", id: null});

  return (
    <Layout>
      {(pageTitle, navigate) => {
        if (pageTitle === "Product") {
          if (view.name === "add") return <ProductForm onBack={resetView} />;
          if (view.name === "edit")
            return <ProductEdit productId={view.id} onBack={resetView} />;
          return (
            <Product
              onAdd={() => setView({name: "add", id: null})}
              onEdit={(p) => setView({name: "edit", id: p.id})}
            />
          );
        }

        if (pageTitle === "Users") {
          // return <Users />; // ganti saat halaman Users sudah dibuat
          return (
            <div
              className="rounded-2xl border-2 border-dashed border-line p-16 text-center
              dark:border-slate-800"
            >
              <p className="text-sm text-muted dark:text-slate-400">
                Halaman Users belum dibuat.
              </p>
            </div>
          );
        }

        return (
          <Dashboard
            title={pageTitle}
            onNavigate={(target) => {
              navigate(target); // ubah judul + active menu
              resetView(); // reset view produk (add/edit → list)
            }}
          />
        );
      }}
    </Layout>
  );
}
