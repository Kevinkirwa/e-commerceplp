import React from "react";
import { Link } from "wouter";
import { useCart } from "@/lib/context/CartContext";
import { CloseIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

const CartPreview: React.FC = () => {
  const { items, totalPrice, removeItem } = useCart();

  // Take only the first 3 items to show in the preview
  const previewItems = items.slice(0, 3);
  const hasMoreItems = items.length > 3;

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 px-3 hidden group-hover:block z-50 border border-gray-100">
      <div className="text-sm font-semibold py-2 border-b border-gray-100">
        Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </div>
      
      {items.length === 0 ? (
        <div className="py-4 text-center text-gray-500 text-sm">
          Your cart is empty
        </div>
      ) : (
        <>
          {/* Cart items preview */}
          <div className="max-h-64 overflow-y-auto py-2">
            {previewItems.map((item) => (
              <div key={item.id} className="flex gap-2 py-2">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-14 h-14 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-xs font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × ${(item.salePrice || item.price).toFixed(2)}
                  </p>
                </div>
                <button 
                  className="text-gray-400 hover:text-red-500"
                  onClick={() => removeItem(item.id)}
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
            
            {hasMoreItems && (
              <div className="text-xs text-center text-gray-500 py-1">
                ...and {items.length - 3} more {items.length - 3 === 1 ? 'item' : 'items'}
              </div>
            )}
          </div>
          
          {/* Cart total */}
          <div className="border-t border-gray-100 pt-2 pb-1">
            <div className="flex justify-between text-sm font-medium">
              <span>Subtotal:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Cart actions */}
          <div className="pt-2 pb-1 flex gap-2">
            <Link href="/cart" className="bg-gray-100 text-gray-800 text-xs rounded py-2 px-3 flex-1 text-center font-medium hover:bg-gray-200 transition">
              View Cart
            </Link>
            <Link href="/checkout" className="bg-primary-600 text-white text-xs rounded py-2 px-3 flex-1 text-center font-medium hover:bg-primary-700 transition">
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPreview;
