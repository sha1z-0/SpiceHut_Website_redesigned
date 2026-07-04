import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheck, FaShoppingCart, FaStar, FaDownload, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { useCart } from "../context.cart.jsx";
import { orderAPI, profileAPI } from "../../services/api";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, emptyCart, setLoyaltyPoints } = useCart();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [rating, setRating] = useState(0);
  const [saveAddress, setSaveAddress] = useState(false);

  useEffect(() => {
    const loadOrderData = async () => {
      setLoading(true); setNotFound(false);
      const passedOrderId = location.state?.orderId;
      if (passedOrderId) {
        try {
          const order = await orderAPI.getOrder(passedOrderId);
          if (!order) { setNotFound(true); return; }
          const date = new Date(order.createdAt || Date.now());
          const items = (order.items || []).map(it => ({ ...it, name: it.name || "Item", price: it.price || 0 }));
          const computedSub = items.reduce((a, i) => a + (i.price||0)*(i.quantity||1), 0);
          const sub = typeof order.subtotal === "number" ? order.subtotal : computedSub;
          const tax = typeof order.tax === "number" ? order.tax : 0;
          const df = typeof order.deliveryFee === "number" ? order.deliveryFee : null;
          const tot = typeof order.totalAmount === "number" ? order.totalAmount : +(sub+tax+(df||0)).toFixed(2);
          setOrderData({
            orderId: order.orderId || order._id, orderDate: date.toLocaleDateString(), orderTime: date.toLocaleTimeString(),
            userName: order.userId?.name || "Valued Customer", paymentMethod: order.paymentMethod || "COD",
            deliveryAddress: order.deliveryLocation?.address || "", deliveryMethod: df === null ? "Pickup" : "Home Delivery",
            estimatedTime: order.estimatedDeliveryTime ? `${new Date(order.estimatedDeliveryTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}` : "40 minutes",
            items, subtotal: sub, tax, deliveryFee: df, total: tot,
          });
          emptyCart();
          try { const profile = await profileAPI.getProfile(); if (profile) setLoyaltyPoints(profile.loyaltyPoints||0); } catch {}
        } catch (err) { setNotFound(true); }
        finally { setLoading(false); }
        return;
      }
      // Fallback
      const userInfo = JSON.parse(localStorage.getItem("userInfo")||"null");
      const items = (cartItems||[]).map(i=>({name:i.name||"Item",price:i.price||0,quantity:i.quantity||1}));
      const sub = items.reduce((a,i)=>a+(i.price||0)*(i.quantity||1),0);
      setOrderData({
        orderId:`local_${Date.now()}`,orderDate:new Date().toLocaleDateString(),orderTime:new Date().toLocaleTimeString(),
        userName:userInfo?.name||"Guest",paymentMethod:"Cash on Delivery",deliveryAddress:"",
        deliveryMethod:"Home Delivery",estimatedTime:"40 minutes",items,subtotal:sub,tax:0,deliveryFee:0,total:sub,
      });
      emptyCart();
      setLoading(false);
    };
    loadOrderData();
  }, [location.state?.orderId]);

  if (loading) return <div className="min-h-screen bg-[#FFF8F1] flex items-center justify-center text-[#2B1D17]/60">Loading order...</div>;
  if (notFound || !orderData) return (
    <div className="min-h-screen bg-[#FFF8F1] flex items-center justify-center">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mb-4">Order not found</h2>
        <div className="flex justify-center gap-4">
          <button onClick={()=>navigate("/user/menu")} className="btn-primary">Continue Shopping</button>
          <button onClick={()=>navigate("/user/profile")} className="btn-secondary">View Profile</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF8F1]">
      <section className="relative bg-gradient-to-b from-[#2B1D17] to-[#F47A20]/10 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-scale-in">
            <FaCheck className="text-white text-3xl" />
          </div>
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Order Confirmed</span>
          <h1 className="font-serif text-4xl font-bold text-white mt-3 mb-3">Thank You, {orderData.userName}!</h1>
          <p className="text-white/70">Your order has been successfully placed and is being prepared.</p>
        </div>
      </section>

      <main className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-premium p-6">
              <h3 className="font-serif text-xl font-bold text-[#2B1D17] mb-5">Order Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-[#2B1D17]/40">Order ID</span><p className="font-semibold">{orderData.orderId}</p></div>
                <div><span className="text-[#2B1D17]/40">Date</span><p className="font-semibold">{orderData.orderDate} {orderData.orderTime}</p></div>
                <div><span className="text-[#2B1D17]/40">Payment</span><p className="font-semibold">{orderData.paymentMethod}</p></div>
                <div><span className="text-[#2B1D17]/40">Delivery</span><p className="font-semibold">{orderData.deliveryMethod}</p></div>
                {orderData.deliveryAddress && <div className="col-span-2"><span className="text-[#2B1D17]/40">Address</span><p className="font-semibold">{orderData.deliveryAddress}</p></div>}
                <div className="col-span-2"><span className="text-[#2B1D17]/40">Estimated</span><p className="font-semibold text-[#F47A20]">{orderData.estimatedTime}</p></div>
              </div>
            </div>

            <div className="card-premium p-6">
              <h3 className="font-serif text-xl font-bold text-[#2B1D17] mb-5">Items</h3>
              <div className="space-y-4">
                {orderData.items.map((item,idx)=>(
                  <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div><h4 className="font-semibold text-[#2B1D17]">{item.name}</h4><p className="text-[#2B1D17]/40 text-sm">Qty: {item.quantity}</p></div>
                    <p className="font-bold text-[#2B1D17]">${((item.price||0)*(item.quantity||1)).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#2B1D17]/60">Subtotal</span><span>${orderData.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-[#2B1D17]/60">Tax</span><span>${orderData.tax.toFixed(2)}</span></div>
                {orderData.deliveryFee > 0 && <div className="flex justify-between"><span className="text-[#2B1D17]/60">Delivery Fee</span><span>${orderData.deliveryFee.toFixed(2)}</span></div>}
                <div className="flex justify-between font-serif text-xl font-bold text-[#2B1D17] pt-3 border-t border-gray-200"><span>Total</span><span>${orderData.total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-premium p-6">
              <h3 className="font-serif text-lg font-bold text-[#2B1D17] mb-5">What's Next?</h3>
              <button onClick={()=>navigate("/user/menu")} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                <FaShoppingCart /> Continue Shopping
              </button>
            </div>

            <div className="card-premium p-6">
              <h3 className="font-serif text-lg font-bold text-[#2B1D17] mb-4">Rate Your Experience</h3>
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s=>(
                  <FaStar key={s} className={`cursor-pointer text-xl ${s<=rating?"text-[#D9A441]":"text-gray-200"}`} onClick={()=>setRating(s)} />
                ))}
              </div>
              {rating > 0 && <p className="text-sm text-[#2B1D17]/60">Thanks for your {rating}-star rating!</p>}
            </div>

            <div className="card-premium p-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#2B1D17] text-sm">Save this address</span>
                <button onClick={()=>setSaveAddress(!saveAddress)}>{saveAddress?<FaToggleOn className="text-[#F47A20] text-2xl"/>:<FaToggleOff className="text-gray-300 text-2xl"/>}</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
