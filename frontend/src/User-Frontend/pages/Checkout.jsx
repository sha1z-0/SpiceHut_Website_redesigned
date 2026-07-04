import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaMapMarkerAlt, FaArrowLeft, FaCreditCard, FaLocationArrow, FaShoppingBag, FaPlus, FaStore, FaCheckCircle } from "react-icons/fa";
import { useCart } from "../context.cart.jsx";
import { profileAPI, utilsAPI, branchAPI } from "../../services/api";
import { validateDeliveryRange, MAX_DELIVERY_RADIUS_KM } from "../utils/distance";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, selectedBranch, setSelectedBranch } = useCart();
  const [userInfo, setUserInfo] = useState({ fullName: "", email: "", phone: "" });
  const deliveryMethod = "home";
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", addressLine1: "", city: "", postalCode: "", instructions: "", latitude: null, longitude: null });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Branch selection state
  const [allBranches, setAllBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchError, setBranchError] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("userInfo");
    if (savedUser) setUserInfo(JSON.parse(savedUser));
    (async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const [serverProfile, serverAddresses] = await Promise.all([
            profileAPI.getProfile().catch(() => null),
            profileAPI.getAddresses().catch(() => []),
          ]);
          if (serverProfile) {
            setUserInfo(prev => ({ ...prev, fullName: serverProfile.name || "", email: serverProfile.email || "", phone: serverProfile.phone || "" }));
          }
          const mappedAddrs = Array.isArray(serverAddresses) ? serverAddresses.map(a => ({ ...a, id: String(a._id) })) : [];
          setAddresses(mappedAddrs);
          if (mappedAddrs.length) {
            const def = mappedAddrs.find(a => a.isDefault) || mappedAddrs[0];
            setSelectedAddress(def.id);
          }
        } catch (err) { console.warn("Failed to load profile", err); }
      }
    })();
    // Load branches
    (async () => {
      try {
        const branches = await branchAPI.getBranches();
        setAllBranches(Array.isArray(branches) ? branches : []);
      } catch (err) { console.warn("Failed to load branches", err); }
      finally { setBranchesLoading(false); }
    })();
  }, []);

  const handleUserInfoChange = (field, value) => setUserInfo(prev => ({ ...prev, [field]: value }));

  const handleAddAddress = async () => {
    if (newAddress.label && newAddress.addressLine1 && newAddress.city && newAddress.postalCode) {
      try {
        const fullAddress = `${newAddress.addressLine1}, ${newAddress.city}, ${newAddress.postalCode}`;
        await profileAPI.addAddress({ label: newAddress.label, address: fullAddress, city: newAddress.city, postalCode: newAddress.postalCode, isDefault: false, latitude: newAddress.latitude, longitude: newAddress.longitude });
        const token = localStorage.getItem("token");
        if (token) {
          const serverAddresses = await profileAPI.getAddresses();
          const mappedAddrs = Array.isArray(serverAddresses) ? serverAddresses.map(a => ({ ...a, id: String(a._id) })) : [];
          setAddresses(mappedAddrs);
          const newAddr = mappedAddrs.find(a => a.label === newAddress.label && a.address === fullAddress);
          if (newAddr) setSelectedAddress(newAddr.id);
        }
        setNewAddress({ label: "", addressLine1: "", city: "", postalCode: "", instructions: "", latitude: null, longitude: null });
        setLocationError(null); setShowAddAddress(false);
      } catch (error) { console.error("Failed to add address:", error); }
    }
  };

  const handleUseCurrentLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) { setLocationError("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const geo = await utilsAPI.reverseGeocode(latitude, longitude);
          setNewAddress(prev => ({ ...prev, addressLine1: geo.formattedAddress || prev.addressLine1, city: geo.city || prev.city, postalCode: geo.postalCode || prev.postalCode }));
        } catch (rgErr) { setLocationError(rgErr?.response?.data?.message || "Unable to resolve location."); }
      },
      (err) => { setLocationError(err.code === 1 ? "Location denied." : "Unable to get location."); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleEditClick = (addr) => {
    setEditingAddressId(addr.id);
    const parts = (addr.address || "").split(",").map(p => p.trim());
    setEditingAddress({ label: addr.label || "", addressLine1: parts[0] || "", city: parts[1] || "", postalCode: parts[2] || "" });
  };

  const handleSaveEditedAddress = async (id) => {
    if (!editingAddress?.addressLine1 || !editingAddress?.city || !editingAddress?.postalCode) return;
    const fullAddress = `${editingAddress.addressLine1}, ${editingAddress.city}, ${editingAddress.postalCode}`;
    try {
      await profileAPI.updateAddress(id, { label: editingAddress.label, address: fullAddress, city: editingAddress.city, postalCode: editingAddress.postalCode });
      const serverAddresses = await profileAPI.getAddresses();
      const mappedAddrs = Array.isArray(serverAddresses) ? serverAddresses.map(a => ({ ...a, id: String(a._id) })) : [];
      setAddresses(mappedAddrs);
      setEditingAddressId(null); setEditingAddress(null);
    } catch (err) { console.error("Failed to update address", err); }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal;

  // Compute delivery range for the selected address + branch
  const selectedAddressObj = deliveryMethod === "home" ? addresses.find(a => a.id === selectedAddress) || null : null;
  const deliveryValidation = (() => {
    if (!selectedBranch || !selectedAddressObj) return null;
    if (typeof selectedAddressObj.latitude !== 'number' || typeof selectedAddressObj.longitude !== 'number') return null;
    return validateDeliveryRange(selectedBranch, selectedAddressObj.latitude, selectedAddressObj.longitude);
  })();

  const canProceed = () => {
    if (!userInfo.fullName || !userInfo.email || !userInfo.phone) return false;
    if (!selectedAddress) return false;
    if (!selectedBranch) return false;
    if (deliveryValidation && !deliveryValidation.valid) return false;
    return true;
  };

  const handleProceedToBilling = () => {
    if (!userInfo.fullName || !userInfo.email || !userInfo.phone) { alert("Please fill in all user information fields."); return; }
    if (!selectedAddress) { alert("Please select a delivery address."); return; }
    if (!selectedBranch) { alert("Please select your nearest branch."); return; }
    if (deliveryValidation && !deliveryValidation.valid) {
      setBranchError(deliveryValidation.message + " Please select a different branch.");
      return;
    }
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    const checkoutState = { cartItems, userInfo, deliveryMethod, selectedAddress: selectedAddressObj, total, branchId: selectedBranch._id };
    sessionStorage.setItem("checkoutState", JSON.stringify(checkoutState));
    navigate("/user/billing", { state: checkoutState });
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1]">
      {/* Hero */}
      <section className="relative bg-[#2B1D17] pt-32 pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Step 1 of 2</span>
          <h1 className="font-serif text-4xl font-bold text-white mt-3">Checkout</h1>
          <p className="text-white/60 mt-2">Complete your order details</p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#F47A20] text-white flex items-center justify-center text-sm font-bold">1</div><span className="text-white text-sm font-medium">Details</span></div>
            <div className="w-12 h-0.5 bg-white/20" />
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-sm font-bold">2</div><span className="text-white/40 text-sm">Payment</span></div>
            <div className="w-12 h-0.5 bg-white/20" />
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-sm font-bold">✓</div><span className="text-white/40 text-sm">Confirm</span></div>
          </div>
        </div>
      </section>

      <main className="py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Branch Selection */}
            <div className="card-premium p-6 sm:p-8">
              <h3 className="font-serif text-xl font-bold text-[#2B1D17] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F47A20]/10 flex items-center justify-center"><FaStore className="text-[#F47A20]" /></div>
                Select Your Branch
              </h3>
              {branchesLoading ? (
                <p className="text-[#2B1D17]/50 text-sm">Loading branches...</p>
              ) : (
                <div className="space-y-3">
                  {allBranches.map((branch) => (
                    <button
                      key={branch._id}
                      onClick={() => { setSelectedBranch(branch); setBranchError(null); }}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                        selectedBranch?._id === branch._id
                          ? "border-[#F47A20] bg-[#F47A20]/5 shadow-lg shadow-[#F47A20]/10"
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedBranch?._id === branch._id ? "border-[#F47A20] bg-[#F47A20]" : "border-gray-300"
                      }`}>
                        {selectedBranch?._id === branch._id && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#2B1D17] text-sm">{branch.name || branch.city}</div>
                        <div className="text-[#2B1D17]/50 text-xs mt-0.5 truncate">{branch.fullAddress || branch.addressLine}</div>
                      </div>
                      <span className="text-[#F47A20] text-xs font-medium bg-[#F47A20]/10 px-2.5 py-1 rounded-full whitespace-nowrap">{branch.city}</span>
                    </button>
                  ))}
                </div>
              )}
              {branchError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{branchError}</div>
              )}

              {/* Distance validation feedback */}
              {deliveryValidation && (
                <div className={`mt-4 p-4 rounded-xl text-sm ${deliveryValidation.valid ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  <div className="flex items-center gap-2">
                    {deliveryValidation.valid ? <FaCheckCircle className="text-green-500" /> : <FaCheckCircle className="text-red-500" />}
                    {deliveryValidation.message}
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="card-premium p-6 sm:p-8">
              <h3 className="font-serif text-xl font-bold text-[#2B1D17] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F47A20]/10 flex items-center justify-center"><FaUser className="text-[#F47A20]" /></div>
                User Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-sm font-medium text-[#2B1D17] mb-2">Full Name</label><input type="text" value={userInfo.fullName} onChange={(e) => handleUserInfoChange("fullName", e.target.value)} className="input-premium" /></div>
                <div><label className="block text-sm font-medium text-[#2B1D17] mb-2">Email</label><input type="email" value={userInfo.email} onChange={(e) => handleUserInfoChange("email", e.target.value)} className="input-premium" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-[#2B1D17] mb-2">Phone Number</label><input type="tel" value={userInfo.phone} onChange={(e) => handleUserInfoChange("phone", e.target.value)} className="input-premium" /></div>
              </div>
            </div>

            {/* Address */}
            <div className="card-premium p-6 sm:p-8">
              <h3 className="font-serif text-xl font-bold text-[#2B1D17] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F47A20]/10 flex items-center justify-center"><FaMapMarkerAlt className="text-[#F47A20]" /></div>
                Delivery Address
              </h3>
              <div className="space-y-3 mb-6">
                {addresses.map((addr) => (
                  <div key={addr.id} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-[#F47A20]/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedAddress(addr.id)}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-[#F47A20]" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><span className="font-semibold text-[#2B1D17]">{addr.label}</span>
                        {addr.isDefault && <span className="text-[#F47A20] text-xs bg-[#F47A20]/10 px-2 py-0.5 rounded-full font-medium">Default</span>}
                      </div>
                      <p className="text-[#2B1D17]/50 text-sm mt-0.5">{addr.address}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(addr); }} className="text-xs text-[#F47A20] hover:underline font-medium">Edit</button>
                  </div>
                ))}
              </div>

              {editingAddressId && editingAddress && (
                <div className="bg-[#FFF5EB] p-5 rounded-2xl mb-4 space-y-3 border border-[#F47A20]/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={editingAddress.label} onChange={(e) => setEditingAddress(p => ({ ...p, label: e.target.value }))} className="input-premium" placeholder="Label" />
                    <input value={editingAddress.addressLine1} onChange={(e) => setEditingAddress(p => ({ ...p, addressLine1: e.target.value }))} className="input-premium" placeholder="Address" />
                    <input value={editingAddress.city} onChange={(e) => setEditingAddress(p => ({ ...p, city: e.target.value }))} className="input-premium" placeholder="City" />
                    <input value={editingAddress.postalCode} onChange={(e) => setEditingAddress(p => ({ ...p, postalCode: e.target.value }))} className="input-premium" placeholder="Postal Code" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEditedAddress(editingAddressId)} className="btn-primary text-sm py-2">Save</button>
                    <button onClick={() => { setEditingAddressId(null); setEditingAddress(null); }} className="btn-secondary text-sm py-2">Cancel</button>
                  </div>
                </div>
              )}

              <button onClick={() => setShowAddAddress(!showAddAddress)} className="text-[#F47A20] hover:text-[#D96B1A] font-medium text-sm flex items-center gap-2 transition-colors">
                <FaPlus size={12} /> {showAddAddress ? "Cancel" : "Add New Address"}
              </button>

              {showAddAddress && (
                <div className="bg-[#FFF5EB] p-5 rounded-2xl mt-4 space-y-3 border border-[#F47A20]/20">
                  <button onClick={handleUseCurrentLocation} className="btn-secondary w-full text-sm py-2.5 flex items-center justify-center gap-2"><FaLocationArrow /> Use Current Location</button>
                  {locationError && <p className="text-red-600 text-xs">{locationError}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="Label (e.g., Home)" value={newAddress.label} onChange={(e) => setNewAddress(p => ({ ...p, label: e.target.value }))} className="input-premium" />
                    <input placeholder="Address Line 1" value={newAddress.addressLine1} onChange={(e) => setNewAddress(p => ({ ...p, addressLine1: e.target.value }))} className="input-premium" />
                    <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress(p => ({ ...p, city: e.target.value }))} className="input-premium" />
                    <input placeholder="Postal Code" value={newAddress.postalCode} onChange={(e) => setNewAddress(p => ({ ...p, postalCode: e.target.value }))} className="input-premium" />
                  </div>
                  <textarea placeholder="Delivery Instructions (optional)" value={newAddress.instructions} onChange={(e) => setNewAddress(p => ({ ...p, instructions: e.target.value }))} className="input-premium resize-none" rows={2} />
                  <button onClick={handleAddAddress} className="btn-primary w-full text-sm py-2.5">Add Address</button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="space-y-6">
            <div className="card-premium p-6 sticky top-24">
              <h3 className="font-serif text-lg font-bold text-[#2B1D17] mb-4">Order Summary</h3>
              {selectedBranch && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-[#FFF5EB] rounded-xl border border-[#F47A20]/20">
                  <FaStore className="text-[#F47A20] text-sm" />
                  <span className="text-sm font-medium text-[#2B1D17]">Selected Branch: <b className="text-[#F47A20]">{selectedBranch.name || selectedBranch.city}</b></span>
                </div>
              )}
              <div className="space-y-2 mb-4">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm"><span className="text-[#2B1D17]/60">{item.name} x{item.quantity}</span><span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span></div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-[#2B1D17]/60">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#2B1D17]/60">Delivery</span><span className="text-green-600 font-medium">Free</span></div>
                <div className="flex justify-between font-serif text-xl font-bold text-[#2B1D17] pt-3 border-t border-gray-200"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
              <button onClick={() => navigate("/user/cart")} className="btn-secondary w-full mt-4 text-sm flex items-center justify-center gap-2"><FaArrowLeft /> Back to Cart</button>
              <button onClick={handleProceedToBilling} disabled={!canProceed()} className={`btn-primary w-full mt-3 py-3.5 text-base flex items-center justify-center gap-2 ${!canProceed() ? "opacity-50 cursor-not-allowed" : ""}`}>
                <FaCreditCard /> Proceed to Billing
              </button>
              {!canProceed() && (
                <p className="text-xs text-center text-[#2B1D17]/30 mt-2">Complete all fields above to continue</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
