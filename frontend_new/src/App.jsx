import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import { RequireAuth, RequireRole } from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import ProductDetailPage from './pages/ProductDetailPage';
import StoresPage from './pages/StoresPage';
import ShadeAIPage from './pages/ShadeAIPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackingPage from './pages/TrackingPage';
import CustomerDashboard from './pages/CustomerDashboard';
import ShopkeeperDashboard from './pages/ShopkeeperDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GlobalChatbot from './components/common/GlobalChatbot';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/shade-ai" element={<ShadeAIPage />} />

            {/* Auth Required */}
            <Route element={<RequireAuth />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/track/:orderId" element={<TrackingPage />} />
            </Route>

            {/* Role-Based Dashboards */}
            <Route element={<RequireRole role="customer" />}>
              <Route path="/dashboard" element={<CustomerDashboard />} />
            </Route>
            <Route element={<RequireRole role="shopkeeper" />}>
              <Route path="/shop-dashboard" element={<ShopkeeperDashboard />} />
            </Route>
            <Route element={<RequireRole role="delivery" />}>
              <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
            </Route>
            <Route element={<RequireRole role="admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
        <GlobalChatbot />
      </Router>
    </QueryClientProvider>
  );
}
