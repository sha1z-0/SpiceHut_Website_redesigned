import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { FaUser, FaArrowLeft, FaCheck, FaMoneyBillWave } from "react-icons/fa";
import { useCart } from "../context.cart.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { orderAPI, profileAPI } from "../../services/api";

export default function Billing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { cartItems, loyaltyPoints, setLoyaltyPoints, applyInstantRedemption } = useCart();
  const passedData = location.state || {};

  // Auth gate: redirect guest users to login, preserving the return path
  if (!isAuthenticated()) {
    // Persist checkout state so it survives the round-trip through login
    if (Object.keys(passedData).length > 0) {
      sessionStorage.setItem("checkoutState", JSON.stringify(passedData));
    }
    const returnPath = location.pathname + location.search;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnPath)}`} replace />;
  }

  // Recover state from sessionStorage if lost during login redirect
  const resolvedData = Object.keys(passedData).length > 0
    ? passedData
    : (() => { try { const s = sessionStorage.getItem("checkoutState"); return s ? JSON.parse(s) : {}; } catch { return {}; } })();

  const passedCartItems = resolvedData.cartItems || cartItems;
  const passedUserInfo = resolvedData.userInfo || {};
  const passedDeliveryMethod = resolvedData.deliveryMethod || "home";
  const passedSelectedAddress = resolvedData.selectedAddress || null;
  const passedBranchId = resolvedData.branchId || null;
  const displayItems = passedCartItems;
  const [billingInfo, setBillingInfo] = useState({ fullName: "", email: "", phone: "", address: "", city: "", postalCode: "" });
  const [applyLoyaltyDiscount, setApplyLoyaltyDiscount] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [instantDiscount, setInstantDiscount] = useState(0);

  useEffect(() => {
    const loadBillingInfo = async () => {
      const token = localStorage.getItem("token");
      let initial = {
        fullName: passedUserInfo?.fullName || "", email: passedUserInfo?.email || "", phone: passedUserInfo?.phone || "",
        address: passedSelectedAddress?.address || "", city: passedSelectedAddress?.city || "", postalCode: passedSelectedAddress?.postalCode || "",
      };
      if (token) {
        try {
          const profile = await profileAPI.getProfile();
          if (profile) {
            initial.fullName = profile.fullName || profile.name || initial.fullName;
            initial.email = profile.email || initial.email;
            initial.phone = profile.phone || initial.phone;
          }
        } catch {}
      }
      setBillingInfo(initial);
    };
    loadBillingInfo();
  }, [passedData]);

  const subtotal = displayItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const tax = 0; const deliveryFee = 0;
  const maxPointsBySubtotal = Math.floor(subtotal) * 100;
  const maxPointsAllowed = Math.min(loyaltyPoints, maxPointsBySubtotal);
  const loyaltyDiscount = applyLoyaltyDiscount ? pointsToUse / 100 : 0;
  const instantEligible = loyaltyPoints < 100 && subtotal >= 100 && loyaltyPoints + Math.floor(subtotal) >= 100;
  const total = subtotal + tax + deliveryFee - loyaltyDiscount - instantDiscount;

  const handleApplyLoyaltyDiscount = () => {
    if (loyaltyPoints >= 100) {
      let pts = pointsToUse;
      if (pts < 100) pts = Math.min(100, maxPointsAllowed);
      setPointsToUse(Math.floor(pts / 100) * 100);
      setApplyLoyaltyDiscount(!applyLoyaltyDiscount);
    }
  };

  const handleApplyInstantRedemption = () => {
    instantEligible && instantDiscount === 0 ? setInstantDiscount(applyInstantRedemption(subtotal)) : setInstantDiscount(0);
  };

  const validateForm = () => {
    if (!billingInfo.fullName || !billingInfo.email || !billingInfo.phone) { alert("Please fill in all required fields."); return false; }
    if ((passedDeliveryMethod === "home" || passedDeliveryMethod === "homeDelivery") && (!billingInfo.address || !billingInfo.city || !billingInfo.postalCode)) { alert("Please fill in address fields."); return false; }
    return true;
  };

  const handleConfirmOrder = async () => {
    if (!validateForm()) return;
    const pointsUsed = applyLoyaltyDiscount ? pointsToUse : 0;
    try {
      const token = localStorage.getItem("token");
      let customerId = null;
      try {
        if (token) { const base64 = token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"); const decoded = JSON.parse(window.atob(base64)); customerId = decoded.id || decoded._id || null; }
      } catch {}
      const orderItems = displayItems.map(i => ({ menuItemId: i.menuItemId || null, name: i.name, quantity: i.quantity, price: i.price, specialInstructions: i.specialInstructions || "", spiceLevel: i.spiceLevel || undefined }));
      let deliveryCoords = null;
      if (passedSelectedAddress?.latitude && passedSelectedAddress?.longitude) deliveryCoords = { latitude: passedSelectedAddress.latitude, longitude: passedSelectedAddress.longitude };
      const isDelivery = passedDeliveryMethod === "home" || passedDeliveryMethod === "homeDelivery";
      const totalAmount = +(subtotal + tax + (isDelivery ? deliveryFee : 0) - pointsUsed / 100 - instantDiscount).toFixed(2);
      const created = await orderAPI.createOrder({
        userId: customerId, items: orderItems, subtotal, tax,
        branchId: passedBranchId || null,
        deliveryFee: isDelivery ? deliveryFee : null, totalAmount, pointsUsed,
        paymentMethod: "COD", specialInstructions: "",
        deliveryLocation: isDelivery ? { latitude: deliveryCoords?.latitude ?? null, longitude: deliveryCoords?.longitude ?? null, address: billingInfo.address||"", city: billingInfo.city||"", postalCode: billingInfo.postalCode||"" } : null,
        orderType: isDelivery ? "homeDelivery" : "pickup",
      });
      if (customerId) { try { const p = await profileAPI.getProfile(); if (p) setLoyaltyPoints(p.loyaltyPoints||0); } catch {} }
      navigate("/user/order-confirmation", { state: { orderId: created?._id || created?.orderId || null } });
    } catch (err) { alert("Failed to create order. Please try again."); }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1]">
      <section className="relative bg-[#2B1D17] pt-32 pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Step 2 of 2</span>
          <h1 className="font-serif text-4xl font-bold text-white mt-3">Order Review</h1>
          <p className="text-white/60 mt-2">Review and confirm your order</p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-green-500/80 text-white flex items-center justify-center text-sm font-bold">✓</div><span className="text-white/40 text-sm">Details</span></div>
            <div className="w-12 h-0.5 bg-[#F47A20]" />
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#F47A20] text-white flex items-center justify-center text-sm font-bold">2</div><span className="text-white text-sm font-medium">Payment</span></div>
          </div>
        </div>
      </section>

      <main className="py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-premium p-6 sm:p-8">
              <h3 className="font-serif text-xl font-bold text-[#2B1D17] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F47A20]/10 flex items-center justify-center"><FaUser className="text-[#F47A20]" /></div>
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-sm font-medium text-[#2B1D17] mb-2">Full Name</label><input type="text" value={billingInfo.fullName} onChange={(e) => setBillingInfo(p=>({...p,fullName:e.target.value}))} className="input-premium" /></div>
                <div><label className="block text-sm font-medium text-[#2B1D17] mb-2">Email</label><input type="email" value={billingInfo.email} onChange={(e) => setBillingInfo(p=>({...p,email:e.target.value}))} className="input-premium" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-[#2B1D17] mb-2">Phone</label><input type="tel" value={billingInfo.phone} onChange={(e) => setBillingInfo(p=>({...p,phone:e.target.value}))} className="input-premium" /></div>
                {(passedDeliveryMethod === "home" || passedDeliveryMethod === "homeDelivery") && (<>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-[#2B1D17] mb-2">Address</label><input type="text" value={billingInfo.address} onChange={(e) => setBillingInfo(p=>({...p,address:e.target.value}))} className="input-premium" /></div>
                  <div><label className="block text-sm font-medium text-[#2B1D17] mb-2">City</label><input type="text" value={billingInfo.city} onChange={(e) => setBillingInfo(p=>({...p,city:e.target.value}))} className="input-premium" /></div>
                  <div><label className="block text-sm font-medium text-[#2B1D17] mb-2">Postal Code</label><input type="text" value={billingInfo.postalCode} onChange={(e) => setBillingInfo(p=>({...p,postalCode:e.target.value}))} className="input-premium" /></div>
                </>)}
              </div>
            </div>

            <div className="card-premium p-6 sm:p-8">
              <h3 className="font-serif text-xl font-bold text-[#2B1D17] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F47A20]/10 flex items-center justify-center"><FaMoneyBillWave className="text-[#F47A20]" /></div>
                Payment Method
              </h3>
              <div className="bg-[#FFF5EB] rounded-2xl p-5 border border-[#F47A20]/20">
                <p className="font-serif text-lg font-bold text-[#2B1D17]">Cash on Delivery</p>
                <p className="text-[#2B1D17]/50 text-sm mt-2">Pay with cash when your order is delivered or picked up.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-premium p-6 sticky top-24">
              <h3 className="font-serif text-lg font-bold text-[#2B1D17] mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {displayItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm"><span className="text-[#2B1D17]/60">{item.name} x{item.quantity}</span><span className="font-medium">${(item.price*item.quantity).toFixed(2)}</span></div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-[#2B1D17]/60">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {(passedDeliveryMethod==="home"||passedDeliveryMethod==="homeDelivery") && <div className="flex justify-between text-sm"><span className="text-[#2B1D17]/60">Delivery Fee</span><span className="text-green-600">Free</span></div>}
                {applyLoyaltyDiscount && <div className="flex justify-between text-sm text-green-600"><span>Loyalty Discount</span><span>-${loyaltyDiscount.toFixed(2)}</span></div>}
                {instantDiscount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Instant Redemption</span><span>-${instantDiscount.toFixed(2)}</span></div>}
                <div className="flex justify-between font-serif text-xl font-bold text-[#2B1D17] pt-3 border-t border-gray-200"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                {loyaltyPoints < 100 ? (
                  instantEligible ? (<>
                    <p className="text-sm text-[#2B1D17]/60 mb-3">With this order you can redeem for a discount!</p>
                    <button onClick={handleApplyInstantRedemption} className={`btn-secondary w-full text-sm py-2.5 ${instantDiscount>0?"!border-red-500 !text-red-500":""}`}>
                      {instantDiscount>0?"Remove Discount":"Apply Instant Discount"}
                    </button>
                  </>) : (
                    <p className="text-sm text-[#2B1D17]/40">You have {loyaltyPoints} points. Earn {100-loyaltyPoints} more for $1 off.</p>
                  )
                ) : (<>
                  <p className="text-sm text-[#2B1D17]/60 mb-3">You have <b className="text-[#D9A441]">{loyaltyPoints}</b> points</p>
                  <div className="flex gap-2 mb-2">
                    <input type="number" min={100} step={100} max={maxPointsAllowed} value={pointsToUse}
                      onChange={(e) => { let v = parseInt(e.target.value||"0",10); if(isNaN(v))v=0; v=Math.floor(v/100)*100; if(v>maxPointsAllowed)v=maxPointsAllowed; setPointsToUse(v); }}
                      className="input-premium flex-1" />
                    <button onClick={() => { setPointsToUse(maxPointsAllowed); setApplyLoyaltyDiscount(true); }} className="btn-secondary text-xs py-2 px-3">Max</button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleApplyLoyaltyDiscount} className={`btn-primary flex-1 text-xs py-2.5 ${applyLoyaltyDiscount?"!bg-red-600":""}`}>
                      {applyLoyaltyDiscount ? `Remove $${loyaltyDiscount.toFixed(2)}` : `Apply $${(pointsToUse/100).toFixed(2)}`}
                    </button>
                    <button onClick={() => { setPointsToUse(0); setApplyLoyaltyDiscount(false); }} className="btn-secondary text-xs py-2">Clear</button>
                  </div>
                </>)}
              </div>
            </div>

            <button onClick={() => navigate("/user/checkout")} className="btn-secondary w-full text-sm py-3 flex items-center justify-center gap-2"><FaArrowLeft /> Back to Checkout</button>
            <button onClick={handleConfirmOrder} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"><FaCheck /> Confirm Order</button>
          </div>
        </div>
      </main>
    </div>
  );
}
