import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import AdminRoute from './components/AdminRoute';

// === User Layout Components ===
import Header from './components/user/Header';
import Footer from './components/user/Footer';

// === User Pages ===
import HomePage from './pages/user/HomePage';
import ProductsPage from './pages/user/ProductsPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';
import PostsPage from './pages/user/PostsPage';
import PostDetailPage from './pages/user/PostDetailPage';
import MyOrdersPage from './pages/user/MyOrdersPage';


// === Admin Pages ===
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCategoryFormPage from './pages/admin/AdminCategoryFormPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCustomerFormPage from './pages/admin/AdminCustomerFormPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminBannerFormPage from './pages/admin/AdminBannerFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminPostFormPage from './pages/admin/AdminPostFormPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

import './style.css';

// Layout cho trang User (có Header + Footer)
function UserLayout() {
  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Layout cho trang Admin (KHÔNG có Header/Footer user)
function AdminLayout() {
  return (
    <AdminRoute>
      <Outlet />
    </AdminRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* ===== TRANG ADMIN LOGIN (không cần đăng nhập, không có header user) ===== */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* ===== TRANG ADMIN (bảo vệ bởi AdminRoute, không có Header/Footer user) ===== */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/create" element={<AdminProductFormPage />} />
              <Route path="products/edit/:id" element={<AdminProductFormPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="categories/create" element={<AdminCategoryFormPage />} />
              <Route path="categories/edit/:id" element={<AdminCategoryFormPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="customers/create" element={<AdminCustomerFormPage />} />
              <Route path="customers/edit/:id" element={<AdminCustomerFormPage />} />
              <Route path="banners" element={<AdminBannersPage />} />
              <Route path="banners/create" element={<AdminBannerFormPage />} />
              <Route path="banners/edit/:id" element={<AdminBannerFormPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="posts" element={<AdminPostsPage />} />
              <Route path="posts/create" element={<AdminPostFormPage />} />
              <Route path="posts/edit/:id" element={<AdminPostFormPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
            </Route>

            {/* ===== TRANG USER (có Header + Footer) ===== */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />

            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
