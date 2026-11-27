import {useState} from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product";
import ProductForm from "./pages/ProductForm";

export default function App() {
  const [view, setView] = useState("list"); // 'list' | 'add'

  return (
    <Layout>
      {(pageTitle) => {
        if (pageTitle === "Product") {
          return view === "add" ? (
            <ProductForm onBack={() => setView("list")} />
          ) : (
            <Product onAdd={() => setView("add")} />
          );
        }
        return <Dashboard title={pageTitle} />;
      }}
    </Layout>
  );
}
