import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
