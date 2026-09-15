import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import AdminRoute from './components/AdminRoute';
import CustomerRoute from './components/CustomerRoute';

// Portal / Customer Pages
import SplashPage from './pages/portal/SplashPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CatalogPage from './pages/portal/CatalogPage';
import ProductDetailPage from './pages/portal/ProductDetailPage';
import CartPage from './pages/portal/CartPage';
import CheckoutPage from './pages/portal/CheckoutPage';
import MyRentalsPage from './pages/portal/MyRentalsPage';
import OrderDetailPage from './pages/portal/OrderDetailPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminPricelistsPage from './pages/admin/AdminPricelistsPage';
import AdminQuotationsPage from './pages/admin/AdminQuotationsPage';
import AdminRentalsPage from './pages/admin/AdminRentalsPage';
import AdminPickupsPage from './pages/admin/AdminPickupsPage';
import AdminReturnsPage from './pages/admin/AdminReturnsPage';
import AdminDepositsPage from './pages/admin/AdminDepositsPage';
import AdminInvoicesPage from './pages/admin/AdminInvoicesPage';
import AdminMaintenancePage from './pages/admin/AdminMaintenancePage';
import AdminAIInsightsPage from './pages/admin/AdminAIInsightsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Customer & Public Portal Layout */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<SplashPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Protected Customer Routes */}
              <Route element={<CustomerRoute />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/my-rentals" element={<MyRentalsPage />} />
                <Route path="/rentals/:id" element={<OrderDetailPage />} />
              </Route>
            </Route>

            {/* Protected Admin Suite Layout */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="pricelists" element={<AdminPricelistsPage />} />
                <Route path="quotations" element={<AdminQuotationsPage />} />
                <Route path="rentals" element={<AdminRentalsPage />} />
                <Route path="pickups" element={<AdminPickupsPage />} />
                <Route path="returns" element={<AdminReturnsPage />} />
                <Route path="deposits" element={<AdminDepositsPage />} />
                <Route path="invoices" element={<AdminInvoicesPage />} />
                <Route path="maintenance" element={<AdminMaintenancePage />} />
                <Route path="ai-insights" element={<AdminAIInsightsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
