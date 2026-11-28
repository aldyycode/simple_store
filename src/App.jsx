import {useState} from "react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product";
import ProductForm from "./pages/ProductForm";
import ProductEdit from "./pages/ProductEdit";
import Users from "./pages/Users";
import UserForm from "./pages/UserForm";
import UserEdit from "./pages/UserEdit";

export default function App() {
  const [productView, setProductView] = useState({name: "list", id: null});
  const [userView, setUserView] = useState({name: "list", id: null});

  const resetProduct = () => setProductView({name: "list", id: null});
  const resetUser = () => setUserView({name: "list", id: null});

  return (
    <ProtectedRoute>
      <Layout>
        {(pageTitle, navigate) => {
          if (pageTitle === "Product") {
            if (productView.name === "add")
              return <ProductForm onBack={resetProduct} />;
            if (productView.name === "edit")
              return (
                <ProductEdit productId={productView.id} onBack={resetProduct} />
              );
            return (
              <Product
                onAdd={() => setProductView({name: "add", id: null})}
                onEdit={(p) => setProductView({name: "edit", id: p.id})}
              />
            );
          }

          if (pageTitle === "Users") {
            if (userView.name === "add") return <UserForm onBack={resetUser} />;
            if (userView.name === "edit")
              return <UserEdit userId={userView.id} onBack={resetUser} />;
            return (
              <Users
                onAdd={() => setUserView({name: "add", id: null})}
                onEdit={(u) => setUserView({name: "edit", id: u.id})}
              />
            );
          }

          return (
            <Dashboard
              title={pageTitle}
              onNavigate={(target) => {
                navigate(target);
                resetProduct();
                resetUser();
              }}
            />
          );
        }}
      </Layout>
    </ProtectedRoute>
  );
}
