import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import CartPreview from "@/components/cart/CartPreview";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { 
  ShoppingBagIcon, 
  SearchIcon, 
  HeartIcon, 
  CartIcon, 
  UserIcon,
  HomeIcon 
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleOpenLogin = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
  };

  const handleOpenRegister = () => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top announcement bar */}
      <div className="bg-primary text-white text-center text-sm py-2 px-4">
        <p className="font-accent">Free shipping on orders over $50! Use code: FREESHIP50</p>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-1">
            <Link href="/" className="flex items-center">
              <span className="text-primary-600 text-3xl">
                <ShoppingBagIcon />
              </span>
              <span className="font-bold text-xl ml-1 text-gray-900 font-accent">SopVerse</span>
            </Link>
          </div>
          
          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block flex-grow max-w-2xl mx-6">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Search for products, brands and more..." 
                className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <SearchIcon />
              </div>
              <button type="submit" className="hidden">Search</button>
            </form>
          </div>
          
          {/* Navigation icons */}
          <div className="flex items-center space-x-4">
            <Link href="/user/wishlist" className="hover:text-primary-600 relative p-1.5">
              <HeartIcon />
            </Link>
            
            <div className="relative group">
              <Link href="/cart" className="hover:text-primary-600 relative p-1.5">
                <CartIcon />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              
              {/* Mini cart preview (shows on hover) */}
              <CartPreview />
            </div>
            
            {/* User menu */}
            <div className="relative group">
              <button className="flex items-center hover:text-primary-600 p-1.5">
                <UserIcon />
              </button>
              
              {/* User dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50 border border-gray-100">
                {!isAuthenticated ? (
                  <div>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); handleOpenLogin(); }}>Sign In</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); handleOpenRegister(); }}>Register</a>
                    <div className="border-t border-gray-100 my-1"></div>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); handleOpenRegister(); }}>Become a Vendor</a>
                  </div>
                ) : (
                  <div>
                    <Link href="/user/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</Link>
                    <Link href="/user/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                    <Link href="/user/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wishlist</Link>
                    
                    {(user?.role === "vendor" || user?.role === "admin") && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link href="/vendor/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Vendor Dashboard</Link>
                      </>
                    )}
                    
                    {user?.role === "admin" && (
                      <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</Link>
                    )}
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    <a 
                      href="#" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => { 
                        e.preventDefault(); 
                        logout(); 
                      }}
                    >
                      Sign Out
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile search - visible only on mobile */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <SearchIcon />
            </div>
            <button type="submit" className="hidden">Search</button>
          </form>
        </div>
      </div>
      
      {/* Main navigation */}
      <nav className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-6 overflow-x-auto py-3 text-sm font-medium scrollbar-none">
            <li>
              <Link 
                href="/" 
                className={`whitespace-nowrap hover:text-primary-600 flex items-center ${location === "/" ? "text-primary-600" : ""}`}
              >
                <span className="mr-1"><HomeIcon /></span> Hom
              </Link>
            </li>
            <li>
              <Link 
                href="/products" 
                className={`whitespace-nowrap hover:text-primary-600 ${location === "/products" ? "text-primary-600" : ""}`}
              >
                All Categories
              </Link>
            </li>
            <li>
              <Link 
                href="/products?categoryId=1" 
                className={`whitespace-nowrap hover:text-primary-600 ${location === "/products?categoryId=1" ? "text-primary-600" : ""}`}
              >
                Electronics
              </Link>
            </li>
            <li>
              <Link 
                href="/products?categoryId=2" 
                className={`whitespace-nowrap hover:text-primary-600 ${location === "/products?categoryId=2" ? "text-primary-600" : ""}`}
              >
                Fashion
              </Link>
            </li>
            <li>
              <Link 
                href="/products?categoryId=3" 
                className={`whitespace-nowrap hover:text-primary-600 ${location === "/products?categoryId=3" ? "text-primary-600" : ""}`}
              >
                Home & Garden
              </Link>
            </li>
            <li>
              <Link 
                href="/products?categoryId=4" 
                className={`whitespace-nowrap hover:text-primary-600 ${location === "/products?categoryId=4" ? "text-primary-600" : ""}`}
              >
                Beauty
              </Link>
            </li>
            <li>
              <Link 
                href="/products?categoryId=5" 
                className={`whitespace-nowrap hover:text-primary-600 ${location === "/products?categoryId=5" ? "text-primary-600" : ""}`}
              >
                Sports
              </Link>
            </li>
            <li>
              <Link 
                href="/products?categoryId=6" 
                className={`whitespace-nowrap hover:text-primary-600 ${location === "/products?categoryId=6" ? "text-primary-600" : ""}`}
              >
                Toys
              </Link>
            </li>
            <li>
              <Link 
                href="/products?sale=true" 
                className={`whitespace-nowrap text-primary-600 ${location === "/products?sale=true" ? "font-bold" : ""}`}
              >
                Sale
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Login/Register Modals */}
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={handleCloseModals} 
          onRegisterClick={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }} 
        />
      )}
      
      {showRegisterModal && (
        <RegisterModal 
          isOpen={showRegisterModal} 
          onClose={handleCloseModals} 
          onLoginClick={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </header>
  );
};

export default Header;
