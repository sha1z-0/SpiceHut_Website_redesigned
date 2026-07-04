import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt, FaGift, FaStar, FaArrowRight, FaShoppingBag } from "react-icons/fa";
import { useCart } from "../context.cart.jsx";
import { profileAPI } from "../../services/api";
import { useEffect } from "react";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, emptyCart, loyaltyPoints, setLoyaltyPoints } = useCart();

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token || loyaltyPoints > 0) return;
      try {
        const profile = await profileAPI.getProfile();
        if (profile && typeof profile.loyaltyPoints !== "undefined") setLoyaltyPoints(profile.loyaltyPoints || 0);
      } catch (err) {}
    })();
  }, []);

  const incrementQuantity = (item) => updateQuantity(item.name, item.category, item.quantity + 1, item.spiceLevel);
  const decrementQuantity = (item) => { if (item.quantity > 1) updateQuantity(item.name, item.category, item.quantity - 1, item.spiceLevel); };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = 0;
  const deliveryFee = 0;
  const total = subtotal + tax + deliveryFee;
  const pointsToEarn = Math.floor(subtotal);

  return (
    <div className="min-h-screen bg-[#FFF8F1] flex flex-col">
      {/* Hero */}
      <section className="relative bg-[#2B1D17] pt-32 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Review</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3">Your Cart</h1>
          <p className="text-white/60 text-lg mt-2">Review your order and proceed to checkout</p>
        </div>
      </section>

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#FFF5EB] flex items-center justify-center">
                <FaShoppingBag className="text-4xl text-[#F47A20]/30" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mb-3">Your cart is empty</h2>
              <p className="text-[#2B1D17]/50 mb-8 max-w-sm mx-auto">Looks like you haven't added anything yet. Browse our menu to find something delicious!</p>
              <button onClick={() => navigate("/user/menu")} className="btn-primary px-10 py-4">
                Browse Menu <FaArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={`${item.name}-${item.category}-${item.spiceLevel || "none"}`} className="card-premium p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-start group">
                    <div className="flex-1">
                      <h3 className="font-serif text-lg font-bold text-[#2B1D17]">{item.name}</h3>
                      <p className="text-[#2B1D17]/40 text-sm">{item.category}</p>
                      {item.spiceLevel && (
                        <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-[#F47A20]/10 text-[#F47A20] font-medium">
                          🌶 {item.spiceLevel}
                        </span>
                      )}
                      <div className="flex gap-1.5 mt-2">
                        {item.tags && item.tags.includes("GF") && <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">GF</span>}
                        {item.tags && item.tags.includes("LF") && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">LF</span>}
                      </div>

                      <div className="flex items-center gap-2 mt-5">
                        <button onClick={() => decrementQuantity(item)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#2B1D17] font-medium transition-colors">−</button>
                        <span className="w-8 text-center font-semibold text-[#2B1D17]">{item.quantity}</span>
                        <button onClick={() => incrementQuantity(item)} className="w-9 h-9 rounded-full bg-[#F47A20] hover:bg-[#D96B1A] flex items-center justify-center text-white font-medium transition-colors">+</button>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-3 w-full sm:w-auto">
                      <div className="text-right">
                        <p className="text-[#2B1D17]/40 text-xs">${item.price.toFixed(2)} each</p>
                        <p className="font-serif text-xl font-bold text-[#2B1D17]">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.name, item.category, item.spiceLevel)}
                        className="text-gray-300 hover:text-[#B3261E] transition-colors p-2 rounded-full hover:bg-red-50">
                        <FaTrashAlt size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button onClick={emptyCart} className="btn-secondary !text-[#B3261E] !border-[#B3261E]/30 hover:!bg-[#B3261E] hover:!text-white flex-1 text-sm">Empty Cart</button>
                  <button onClick={() => navigate("/user/menu")} className="btn-secondary flex-1 text-sm">Continue Shopping</button>
                </div>
              </div>

              {/* Right: Summary */}
              <div className="space-y-6">
                <div className="card-premium p-6 sticky top-24">
                  <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-[#F47A20]/10 flex items-center justify-center">
                      <FaGift className="text-[#F47A20]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2B1D17] text-sm">Loyalty Points</h3>
                      <p className="text-[#D9A441] font-bold text-lg">{loyaltyPoints} pts</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#2B1D17]/60 mb-3">
                    You'll earn <span className="font-bold text-[#F47A20]">{pointsToEarn} points</span> on this order
                  </p>
                  <div className="bg-[#FFF5EB] rounded-xl p-4 text-center text-sm text-[#2B1D17]/60">
                    <p className="font-semibold text-[#2B1D17] mb-1">1 point per $1 spent</p>
                    <p>100 points = $1 discount</p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                    <div className="flex justify-between text-sm text-[#2B1D17]/60"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm text-[#2B1D17]/60"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm text-[#2B1D17]/60"><span>Delivery Fee</span><span className="text-green-600">{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span></div>
                    <div className="flex justify-between font-serif text-xl font-bold text-[#2B1D17] pt-3 border-t border-gray-200">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button onClick={() => navigate("/user/checkout")} disabled={cartItems.length === 0}
                    className={`btn-primary w-full mt-6 py-4 text-base ${
                      cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}>
                    Proceed to Checkout <FaArrowRight size={14} />
                  </button>
                  <p className="text-xs text-center text-[#2B1D17]/30 mt-3">Secure checkout • SSL encrypted</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
