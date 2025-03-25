import React from "react";
import { Link } from "wouter";
import { useCart } from "@/lib/context/CartContext";
import { CloseIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-gray-700">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            {items.map((item) => (
              <div key={item.id} className="border-t border-gray-100 p-4">
                <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-wrap">
                  {/* Product */}
                  <div className="col-span-6 flex items-center">
                    <button 
                      className="text-gray-400 hover:text-red-500 mr-3 md:mr-4"
                      onClick={() => removeItem(item.id)}
                    >
                      <CloseIcon />
                    </button>
                    <div className="w-16 h-16 flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="ml-3 md:ml-4">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">Vendor: {item.vendorName}</p>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="col-span-2 text-center mt-2 md:mt-0 w-1/2 md:w-auto">
                    <span className="inline-block md:hidden">Price: </span>
                    <span>${(item.salePrice || item.price).toFixed(2)}</span>
                  </div>
                  
                  {/* Quantity */}
                  <div className="col-span-2 text-center mt-2 md:mt-0 w-1/2 md:w-auto">
                    <div className="flex items-center justify-center md:inline-flex">
                      <button 
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-gray-100"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        className="w-12 h-8 border-t border-b border-gray-300 text-center"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        min="1"
                      />
                      <button 
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-gray-100"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="col-span-2 text-right mt-2 md:mt-0 w-full md:w-auto">
                    <span className="inline-block md:hidden">Total: </span>
                    <span className="font-medium text-primary-600">
                      ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Cart Actions */}
            <div className="p-4 border-t border-gray-100 flex justify-between">
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
              <Link href="/products">
                <Button variant="ghost">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <Link href="/checkout">
              <Button className="w-full bg-primary-600 hover:bg-primary-700">
                Proceed to Checkout
              </Button>
            </Link>
            
            {/* Coupon Code */}
            <div className="mt-6">
              <h3 className="font-medium mb-2">Apply Coupon Code</h3>
              <div className="flex">
                <Input placeholder="Enter coupon code" className="rounded-r-none" />
                <Button className="rounded-l-none">Apply</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
