import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './Pages/HomePage'
import LoginPage from './Pages/LoginPage'
import AuthSuccess from './Pages/AuthSuccess'
import AdminHomePage from './Pages/AdminHomePage'
import CategoriesPage from './Pages/CategoriesPage'
import OrdersPage from './Pages/OrdersPage'
import CustomersPage from './Pages/CustomersPage'
import PendingOrdersPage from './Pages/PendingOrdersPage'
import MyOrdersPage from './Pages/MyOrdersPage'
import CartPage from './Pages/CartPage'
import HowToBuyPage from './Pages/HowToBuyPage'
import FavoritesPage from './Pages/FavoritesPage'
import ProductDetailsPage from './Pages/ProductDetailsPage'
import FAQ from './Pages/FAQ'
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
          path="/admin/orders" 
          element={
            <ProtectedRoute requiredRole="admin">
              <OrdersPage />
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
          path="/admin/pending-orders" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PendingOrdersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/categories" 
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
          path="/faq" 
          element={<FAQ />} 
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
