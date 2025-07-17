import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './Pages/HomePage'
import LoginPage from './Pages/LoginPage'
import AuthSuccess from './Pages/AuthSuccess'
import AdminHomePage from './Pages/AdminPages/AdminHomePage'
import AdminProductDetailsPage from './Pages/AdminPages/AdminProductDetailsPage'
import CategoriesPage from './Pages/CategoriesPage'
import OrdersPage from './Pages/AdminPages/OrdersPage'
import OrderDetailsPage from './Pages/AdminPages/OrderDetailsPage'
import CustomersPage from './Pages/AdminPages/CustomersPage'
import UserOrdersPage from './Pages/AdminPages/UserOrdersPage'
import PendingOrdersPage from './Pages/AdminPages/PendingOrdersPage'
import EditHowToBuyPage from './Pages/AdminPages/EditHowToBuyPage'
import EditPrivacyPolicyPage from './Pages/AdminPages/EditPrivacyPolicyPage'
import EditTermsPage from './Pages/AdminPages/EditTermsPage'
import EditFAQPage from './Pages/AdminPages/EditFAQPage'
import AdminSettingsPage from './Pages/AdminPages/AdminSettingsPage'
import MyOrdersPage from './Pages/Userpages/MyOrdersPage'
import CartPage from './Pages/Userpages/CartPage'
import UserProfilePage from './Pages/Userpages/UserProfilePage'
import HowToBuyPage from './Pages/HowToBuyPage'
import FavoritesPage from './Pages/Userpages/FavoritesPage'
import ProductDetailsPage from './Pages/ProductDetailsPage'
import PaymentPage from './Pages/Userpages/PaymentPage'
import FAQ from './Pages/FAQ'
import AboutUs from './Pages/AboutUs'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import TermsAndConditions from './Pages/TermsAndConditions'
import ProtectedRoute from './Components/ProtectedRoute'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminHomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/categories" 
          element={
            <ProtectedRoute requiredRole="admin">
              <CategoriesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/category/:categoryName" 
          element={
            <ProtectedRoute requiredRole="admin">
              <CategoriesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/product/:id" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminProductDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute requiredRole="admin">
              <OrdersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/orders/:orderId" 
          element={
            <ProtectedRoute requiredRole="admin">
              <OrderDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/customers" 
          element={
            <ProtectedRoute requiredRole="admin">
              <CustomersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users/:userId/orders" 
          element={
            <ProtectedRoute requiredRole="admin">
              <UserOrdersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/pending-orders" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PendingOrdersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit-how-to-buy" 
          element={
            <ProtectedRoute requiredRole="admin">
              <EditHowToBuyPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit-privacy-policy" 
          element={
            <ProtectedRoute requiredRole="admin">
              <EditPrivacyPolicyPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit-terms" 
          element={
            <ProtectedRoute requiredRole="admin">
              <EditTermsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit-faq" 
          element={
            <ProtectedRoute requiredRole="admin">
              <EditFAQPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/categories" 
          element={<CategoriesPage />} 
        />
        <Route 
          path="/category/:categoryName" 
          element={<CategoriesPage />} 
        />
        <Route 
          path="/my-orders" 
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/how-to-buy" 
          element={<HowToBuyPage />} 
        />
        <Route 
          path="/favorites" 
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/product/:productId" 
          element={<ProductDetailsPage />} 
        />
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faq" 
          element={<FAQ />} 
        />
        <Route 
          path="/about" 
          element={<AboutUs />} 
        />
        <Route 
          path="/privacy-policy" 
          element={<PrivacyPolicy />} 
        />
        <Route 
          path="/terms" 
          element={<TermsAndConditions />} 
        />
        <Route 
          path="/refund-policy" 
          element={<TermsAndConditions />} 
        />
      </Routes>
    </div>
  )
}

export default App
