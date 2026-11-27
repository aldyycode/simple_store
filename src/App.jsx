import {useState} from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product";
import ProductForm from "./pages/ProductForm";
import ProductEdit from "./pages/ProductEdit";
import Users from "./pages/Users";

export default function App() {
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
          // Nanti bisa tambah UserForm / UserEdit
          return (
            <Users
              onAdd={() => {
                /* navigasi ke form tambah user */
              }}
              onEdit={(u) => {
                /* navigasi ke form edit user */
              }}
            />
          );
        }

        return (
          <Dashboard
            title={pageTitle}
            onNavigate={(target) => {
              navigate(target);
              resetView();
            }}
          />
        );
      }}
    </Layout>
  );
}
