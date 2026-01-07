import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout, DashboardLayout } from "@/components/layout";
import LandingPage from "@/pages/LandingPage";
import BrowsePage from "@/pages/BrowsePage";
import CartPage from "@/pages/CartPage";
import DiscoverFashionPage from "@/pages/DiscoverFashionPage";
import CheckoutPage from "@/pages/CheckoutPage";
import ItemDetailPage from "@/pages/ItemDetailPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import WardrobePage from "@/pages/dashboard/WardrobePage";
import WishlistPage from "@/pages/dashboard/WishlistPage";
import OrdersPage from "@/pages/dashboard/OrdersPage";
import RentalsPage from "@/pages/dashboard/RentalsPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Pages (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Public Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/discover" element={<DiscoverFashionPage />} />
            <Route path="/items/:id" element={<ItemDetailPage />} />
            <Route path="/how-it-works" element={<Navigate to="/#how-it-works" replace />} />
          </Route>

          {/* Protected Routes (require authentication) */}
          <Route element={<ProtectedRoute />}>
            {/* Checkout */}
            <Route element={<PublicLayout />}>
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="wardrobe" element={<WardrobePage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="rentals" element={<RentalsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
