import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Shop from "../pages/Shop";
import ProductDetails from "../pages/ProductDetails";
import Login from "../auth/Login";
import Register from "../auth/Register";
import NotFound from "../auth/NotFound";
import ProtectedRoute from "../components/ProtectedRoute";
import Profile from "../pages/Profile";
import AdminDashboard from "../auth/AdminDashboard";
import CollectionsPage from "../pages/AllJewellery";
import Checkout from "../pages/Checkout";
import OrderConfirmation from "../pages/OrderConfirmation";
import OrdersPage from "../pages/allOrders";
import Wishlist from "../pages/Wishlist";
import About from "../pages/About";
import OurStory from "../pages/OurStory";
import Faq from "../pages/Footer/faqs";
import Sustainability from "../pages/Footer/Sustainability";
import CareGuide from "../pages/Footer/CareGuide";
import ShippingReturns from "../pages/Footer/ShippingReturns";
import Contact from "../pages/Footer/Contact";
import TermsConditions from "../pages/Footer/TermsConditions";
import ForgotPassword from "../auth/ForgotPassword";
import ResetPassword from "../auth/ResetPassword";
const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/all-jewellery" element={<CollectionsPage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/about" element={<About />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/faqs" element={<Faq />} />
        <Route path="/sustainability" element={<Sustainability />} />
        <Route path="/care-guide" element={<CareGuide />} />
        <Route path="/shipping-returns" element={<ShippingReturns />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation/:orderId"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth routes without header/footer */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
