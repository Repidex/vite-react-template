import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TopHeader from "../components/TopHeader";

const MainLayout = () => {
  const location = useLocation();

  return (
    <>
      <TopHeader />
      <Header />
      <Outlet />
      {location.pathname !== '/admin-panel' && <Footer />}
    </>
  );
};

export default MainLayout;

