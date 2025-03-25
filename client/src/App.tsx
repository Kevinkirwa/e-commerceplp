import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetails from "@/pages/product-details";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import UserDashboard from "@/pages/user/dashboard";
import UserOrders from "@/pages/user/orders";
import UserWishlist from "@/pages/user/wishlist";
import UserProfile from "@/pages/user/profile";
import VendorDashboard from "@/pages/vendor/dashboard";
import VendorProducts from "@/pages/vendor/products";
import VendorOrders from "@/pages/vendor/orders";
import VendorRegistration from "@/pages/vendor/register";
import VendorPendingApproval from "@/pages/vendor/pending-approval";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminVendors from "@/pages/admin/vendors";
import AdminProducts from "@/pages/admin/products";
import AdminCategories from "@/pages/admin/categories";
import { useAuth } from "@/lib/context/AuthContext";
import Chat from "@/components/chat/Chat"; // Import the Chat component


function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <NotFound />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} exact />
      <Route path="/products/:slug" component={ProductDetails} />
      <Route path="/products" component={Products} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout">
        {() => (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* User Routes */}
      <Route path="/user/dashboard">
        {() => (
          <ProtectedRoute roles={["customer", "vendor", "admin"]}>
            <UserDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/user/orders">
        {() => (
          <ProtectedRoute roles={["customer", "vendor", "admin"]}>
            <UserOrders />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/user/wishlist">
        {() => (
          <ProtectedRoute roles={["customer", "vendor", "admin"]}>
            <UserWishlist />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/user/profile">
        {() => (
          <ProtectedRoute roles={["customer", "vendor", "admin"]}>
            <UserProfile />
          </ProtectedRoute>
        )}
      </Route>

      {/* Vendor Routes */}
      <Route path="/vendor/dashboard">
        {() => (
          <ProtectedRoute roles={["vendor", "admin"]}>
            <VendorDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/vendor/products">
        {() => (
          <ProtectedRoute roles={["vendor", "admin"]}>
            <VendorProducts />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/vendor/orders">
        {() => (
          <ProtectedRoute roles={["vendor", "admin"]}>
            <VendorOrders />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/vendor/register">
        {() => (
          <ProtectedRoute roles={["customer", "admin"]}>
            <VendorRegistration />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/vendor/pending-approval" component={VendorPendingApproval} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        {() => (
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/vendors">
        {() => (
          <ProtectedRoute roles={["admin"]}>
            <AdminVendors />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/products">
        {() => (
          <ProtectedRoute roles={["admin"]}>
            <AdminProducts />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/categories">
        {() => (
          <ProtectedRoute roles={["admin"]}>
            <AdminCategories />
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Router />
      </main>
      <Footer />
      <Chat /> {/* Added Chat component */}
      <Toaster />
    </div>
  );
}

export default App;