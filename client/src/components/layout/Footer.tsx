import React from "react";
import { Link } from "wouter";
import { 
  ShoppingBagIcon, 
  MapPinIcon, 
  PhoneIcon, 
  MailIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon
} from "@/components/ui/icons";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-1 mb-4">
              <span className="text-primary-400 text-3xl">
                <ShoppingBagIcon />
              </span>
              <span className="font-bold text-xl text-white font-accent">ShopVerse</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your one-stop shop for all your needs with thousands of vendors in one place.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FacebookIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <TwitterIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <InstagramIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <YoutubeIcon />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white">Shop</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white">Categories</Link></li>
              <li><Link href="/#vendors" className="text-gray-400 hover:text-white">Vendors</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/user/dashboard" className="text-gray-400 hover:text-white">My Account</Link></li>
              <li><Link href="/user/orders" className="text-gray-400 hover:text-white">Track Orders</Link></li>
              <li><Link href="/user/wishlist" className="text-gray-400 hover:text-white">Wishlist</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white">Returns & Refunds</Link></li>
              <li><Link href="/faqs" className="text-gray-400 hover:text-white">FAQs</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mt-1 mr-2 text-gray-400"><MapPinIcon /></span>
                <span className="text-gray-400">123 Commerce St, Nairobi, Kenya</span>
              </li>
              <li className="flex items-start">
                <span className="mt-1 mr-2 text-gray-400"><PhoneIcon /></span>
                <span className="text-gray-400">+254 712 345 678</span>
              </li>
              <li className="flex items-start">
                <span className="mt-1 mr-2 text-gray-400"><MailIcon /></span>
                <span className="text-gray-400">support@shopverse.com</span>
              </li>
            </ul>
            
            <h3 className="font-semibold text-lg mt-6 mb-3">We Accept</h3>
            <div className="flex space-x-3">
              <div className="bg-white rounded p-1">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png" alt="M-Pesa" className="h-6" />
              </div>
              <div className="bg-white rounded p-1">
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg" alt="PayPal" className="h-6" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between">
            <p className="text-gray-400 text-sm">&copy; 2023 ShopVerse. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <ul className="flex flex-wrap space-x-4 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
