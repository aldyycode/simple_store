import {useState} from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product";
import ProductForm from "./pages/ProductForm";
import ProductEdit from "./pages/ProductEdit";

export default function App() {
  const [view, setView] = useState({name: "list", id: null});

  return (
    <Layout>
      {(pageTitle) => {
        if (pageTitle === "Product") {
          if (view.name === "add") {
            return (
              <ProductForm onBack={() => setView({name: "list", id: null})} />
            );
          }
          if (view.name === "edit") {
            return (
              <ProductEdit
                productId={view.id}
                onBack={() => setView({name: "list", id: null})}
              />
            );
          }
          return (
            <Product
              onAdd={() => setView({name: "add", id: null})}
              onEdit={(product) => setView({name: "edit", id: product.id})}
            />
          );
        }
        return <Dashboard title={pageTitle} />;
      }}
    </Layout>
  );
}
