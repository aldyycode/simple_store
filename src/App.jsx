import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return <Layout>{(pageTitle) => <Dashboard title={pageTitle} />}</Layout>;
}
