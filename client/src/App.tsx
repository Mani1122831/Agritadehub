import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { VoiceFloatingButton } from './components/voice/VoiceFloatingButton';

// Public Pages
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { FarmersPage } from './pages/public/FarmersPage';
import { SellersPage } from './pages/public/SellersPage';
import { BulkBuyersPage } from './pages/public/BulkBuyersPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { VoiceAgentPage } from './pages/VoiceAgentPage';
import { LogisticsPage } from './pages/LogisticsPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Cart & Checkout
import { CartPage } from './pages/checkout/CartPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { OrderDetailsPage } from './pages/orders/OrderDetailsPage';

// Dashboards
import { FarmerDashboard } from './pages/dashboards/FarmerDashboard';
import { SellerDashboard } from './pages/dashboards/SellerDashboard';
import { BulkBuyerDashboard } from './pages/dashboards/BulkBuyerDashboard';
import { ConsumerDashboard } from './pages/dashboards/ConsumerDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans w-full max-w-full">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/farmers" element={<FarmersPage />} />
                <Route path="/sellers" element={<SellersPage />} />
                <Route path="/bulk-buyers" element={<BulkBuyersPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/ai" element={<AiInsightsPage />} />
                <Route path="/voice-agent" element={<VoiceAgentPage />} />
                <Route path="/logistics" element={<LogisticsPage />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Checkout & Orders */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailsPage />} />

                {/* Dashboards */}
                <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/buyer/dashboard" element={<BulkBuyerDashboard />} />
                <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <VoiceFloatingButton />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
