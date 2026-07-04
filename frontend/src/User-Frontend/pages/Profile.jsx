import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaClock, FaGift, FaTrash, FaStar, FaMapMarkerAlt, FaRedo, FaLocationArrow, FaHistory, FaEdit, FaCheck, FaPlus, FaLock, FaShieldAlt } from "react-icons/fa";
import { useCart } from "../context.cart.jsx";
import { profileAPI, orderAPI, utilsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext.jsx";
import PasswordInput from "../components/PasswordInput";
import { validatePassword } from "../utils/passwordUtils";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Profile = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getProfile: fetchAuthProfile } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showAddresses, setShowAddresses] = useState(true);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(null);
  const [otpMethodForChange, setOtpMethodForChange] = useState('sms');
  const [sendingChangeOtp, setSendingChangeOtp] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", addressLine1: "", city: "", postalCode: "", instructions: "", latitude: null, longitude: null });
  const [locationError, setLocationError] = useState(null);
  const [loyaltyPoints, setLoyaltyPointsState] = useState(0);
  const nextRewardPoints = 100;
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const serverProfile = await profileAPI.getProfile();
        if (serverProfile && serverProfile._id) {
          const mapped = {
            firstName: serverProfile.name?.split(" ")?.[0] || serverProfile.name || "",
            lastName: serverProfile.name?.split(" ")?.slice(1).join(" ") || "",
            email: serverProfile.email || "",
            phone: serverProfile.phone || "",
            memberSince: serverProfile.createdAt ? new Date(serverProfile.createdAt).toLocaleDateString() : "—",
          };
          setProfile(mapped);
          setLoyaltyPointsState(serverProfile.loyaltyPoints || 0);
          setIsLoggedIn(true);
          localStorage.setItem("userInfo", JSON.stringify({ fullName: `${mapped.firstName} ${mapped.lastName}`.trim(), email: mapped.email, _id: serverProfile._id }));
          const pendingAddr = localStorage.getItem("pendingAddress");
          Promise.all([
            profileAPI.getAddresses().catch(() => []),
            pendingAddr ? (async () => {
              try { const ad = JSON.parse(pendingAddr); const fa = `${ad.addressLine1}, ${ad.city}, ${ad.postalCode}`; await profileAPI.addAddress({ label: ad.label, address: fa, city: ad.city, postalCode: ad.postalCode, isDefault: false, latitude: ad.latitude, longitude: ad.longitude }); localStorage.removeItem("pendingAddress"); return profileAPI.getAddresses(); } catch { return null; }
            })() : Promise.resolve(null)
          ]).then(([initial, updated]) => setAddresses(((updated || initial) || []).map(a => ({ ...a, id: String(a._id) }))));
        } else { setIsLoggedIn(false); setProfile(null); }
      } catch (err) { setError("Failed to load profile"); setIsLoggedIn(false); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleEditToggle = async () => {
    if (isEditing) { try { await handleSaveProfile(); } catch { return; } }
    setIsEditing(prev => !prev);
  };

  const handleProfileChange = (e) => { const { name, value } = e.target; setProfile(prev => ({ ...prev, [name]: value })); };

  const handleSaveProfile = async () => {
    setError(null); setLoading(true);
    try {
      const payload = { name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(), email: profile.email, phone: profile.phone };
      await profileAPI.updateProfile(payload);
      localStorage.setItem("userInfo", JSON.stringify({ fullName: payload.name, email: payload.email }));
      setProfile(prev => ({ ...prev, memberSince: prev.memberSince }));
    } catch (err) { setError(err?.response?.data?.message || "Failed to update profile"); }
    finally { setLoading(false); }
  };

  const handleNewPasswordChange = (e) => { setNewPassword(e.target.value); setPasswordErrors(validatePassword(e.target.value)); };

  const handleChangePassword = async () => {
    setPasswordChangeError(null); setPasswordChangeSuccess(null);
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordChangeError("Please provide and confirm your new password."); return; }
    if (newPassword !== confirmPassword) { setPasswordChangeError("Passwords do not match."); return; }
    if (validatePassword(newPassword).length > 0) { setPasswordChangeError("Please ensure your password meets all requirements."); return; }
    setPasswordChangeLoading(true);
    try { await profileAPI.changePassword({ currentPassword, newPassword }); setPasswordChangeSuccess("Password updated successfully."); setNewPassword(""); setConfirmPassword(""); setCurrentPassword(""); setPasswordErrors([]); setShowChangePassword(false); }
    catch (err) { setPasswordChangeError(err?.response?.data?.message || "Failed to update password."); }
    finally { setPasswordChangeLoading(false); }
  };

  const handleSetDefaultAddress = (id) => {
    (async () => {
      try { const addr = addresses.find(a => a.id === id); if (!addr) return; await profileAPI.updateAddress(id, { label: addr.label, address: addr.address, isDefault: true }); const srv = await profileAPI.getAddresses(); setAddresses(srv.map(a => ({ ...a, id: a._id }))); }
      catch (err) { alert("Unable to set default address."); }
    })();
  };

  const handleDeleteAddress = (id) => {
    (async () => { try { await profileAPI.deleteAddress(id); const srv = await profileAPI.getAddresses(); setAddresses(srv.map(a => ({ ...a, id: a._id }))); } catch { alert("Unable to delete address."); } })();
  };

  const handleUseCurrentLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) { setLocationError("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try { const { latitude, longitude } = pos.coords; const geo = await utilsAPI.reverseGeocode(latitude, longitude); setNewAddress(prev => ({ ...prev, addressLine1: geo.formattedAddress || prev.addressLine1, city: geo.city || prev.city, postalCode: geo.postalCode || prev.postalCode })); }
        catch (rgErr) { setLocationError(rgErr?.response?.data?.message || "Unable to resolve location."); }
      },
      (err) => { setLocationError(err.code === 1 ? "Location access denied." : "Unable to get location."); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleSaveNewAddress = async () => {
    if (!newAddress.label || !newAddress.addressLine1 || !newAddress.city || !newAddress.postalCode) { alert("Please fill in all required fields."); return; }
    const fullAddress = `${newAddress.addressLine1}, ${newAddress.city}, ${newAddress.postalCode}`;
    try { const added = await profileAPI.addAddress({ label: newAddress.label, address: fullAddress, city: newAddress.city, postalCode: newAddress.postalCode, isDefault: false, latitude: newAddress.latitude, longitude: newAddress.longitude }); setAddresses(prev => [...prev, { ...added.address, id: added.address._id }]); setNewAddress({ label: "", addressLine1: "", city: "", postalCode: "", instructions: "", latitude: null, longitude: null }); setLocationError(null); setShowAddAddress(false); }
    catch (err) { alert("Failed to add address."); }
  };

  const handleEditClick = (addr) => { setEditingAddressId(addr.id); const parts = (addr.address || "").split(",").map(p => p.trim()); setEditingAddress({ label: addr.label || "", addressLine1: parts[0] || "", city: parts[1] || "", postalCode: parts[2] || "" }); };
  const handleCancelEdit = () => { setEditingAddressId(null); setEditingAddress(null); };

  const handleSaveEditedAddress = async (id) => {
    if (!editingAddress?.addressLine1 || !editingAddress?.city || !editingAddress?.postalCode) { alert("Please fill all required fields."); return; }
    const fullAddress = `${editingAddress.addressLine1}, ${editingAddress.city}, ${editingAddress.postalCode}`;
    try { await profileAPI.updateAddress(id, { label: editingAddress.label, address: fullAddress, city: editingAddress.city, postalCode: editingAddress.postalCode }); const srv = await profileAPI.getAddresses(); setAddresses(srv.map(a => ({ ...a, id: a._id }))); setEditingAddressId(null); setEditingAddress(null); }
    catch (err) { alert("Failed to update address."); }
  };

  const handleToggleOrderHistory = async () => {
    const newShow = !showOrderHistory; setShowOrderHistory(newShow);
    if (newShow && !ordersLoaded && !ordersLoading) {
      setOrdersLoading(true);
      try { const serverOrders = await orderAPI.getUserOrders(); setOrderHistory(serverOrders || []); setOrdersLoaded(true); }
      catch { setOrderHistory([]); }
      finally { setOrdersLoading(false); }
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FFF8F1] flex items-center justify-center text-[#2B1D17]/60">Loading profile...</div>;
  if (!isLoggedIn) return (
    <div className="min-h-screen bg-[#FFF8F1] flex items-center justify-center">
      <div className="text-center card-premium p-10 max-w-md">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#F47A20]/10 flex items-center justify-center"><FaUser className="text-2xl text-[#F47A20]" /></div>
        <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mb-3">Not signed in</h2>
        <p className="text-[#2B1D17]/50 mb-8">Please sign in to view your profile.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate("/login")} className="btn-primary px-8">Sign In</button>
          <button onClick={() => navigate("/register")} className="btn-secondary px-8">Register</button>
        </div>
      </div>
    </div>
  );

  const pointsProgress = loyaltyPoints === 0 ? 0 : (loyaltyPoints % 100) || 100;
  const tierLabel = loyaltyPoints >= 500 ? "Gold" : loyaltyPoints >= 200 ? "Silver" : "Classic";
  const tierColor = loyaltyPoints >= 500 ? "text-[#D9A441]" : loyaltyPoints >= 200 ? "text-gray-400" : "text-[#F47A20]";
  const ringProgress = pointsProgress;

  return (
    <div className="min-h-screen bg-[#FFF8F1]">
      {/* Hero Header */}
      <section className="relative bg-[#2B1D17] pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#F47A20] to-[#D9A441] flex items-center justify-center shadow-xl shadow-[#F47A20]/30">
              <span className="font-serif text-3xl font-bold text-white">{profile.firstName?.[0] || "U"}</span>
            </div>
            <div className="text-center sm:text-left">
              <span className={`text-xs font-semibold uppercase tracking-widest ${tierColor}`}>{tierLabel} Member</span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">{profile.firstName} {profile.lastName}</h1>
              <p className="text-white/50 text-sm mt-1">{profile.email} • Member since {profile.memberSince}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-[88px] z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-3">
            {[ { id: 'profile', label: 'Profile', icon: <FaUser /> }, { id: 'loyalty', label: 'Loyalty', icon: <FaGift /> }, { id: 'addresses', label: 'Addresses', icon: <FaMapMarkerAlt /> }, { id: 'orders', label: 'Order History', icon: <FaHistory /> }, { id: 'security', label: 'Security', icon: <FaLock /> } ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id ? "bg-[#F47A20] text-white shadow-lg shadow-[#F47A20]/20" : "text-[#2B1D17]/50 hover:text-[#2B1D17] hover:bg-gray-100"
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card-premium p-6 sm:p-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl font-bold text-[#2B1D17] flex items-center gap-2"><FaUser className="text-[#F47A20]" /> Personal Information</h2>
              <button onClick={handleEditToggle} className={`text-sm py-2 px-5 rounded-full font-medium transition-all ${isEditing ? "bg-green-500 text-white" : "btn-secondary"}`}>
                {isEditing ? <><FaCheck className="inline mr-1" /> Save</> : <><FaEdit className="inline mr-1" /> Edit</>}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div><label className="block text-sm font-medium text-[#2B1D17] mb-2">First Name</label>{isEditing ? <input type="text" name="firstName" value={profile.firstName} onChange={handleProfileChange} className="input-premium" /> : <p className="input-premium bg-gray-50 cursor-default">{profile.firstName || "—"}</p>}</div>
              <div><label className="block text-sm font-medium text-[#2B1D17] mb-2">Last Name</label>{isEditing ? <input type="text" name="lastName" value={profile.lastName} onChange={handleProfileChange} className="input-premium" /> : <p className="input-premium bg-gray-50 cursor-default">{profile.lastName || "—"}</p>}</div>
              <div><label className="block text-sm font-medium text-[#2B1D17] mb-2 flex items-center gap-1"><FaEnvelope className="text-[#2B1D17]/40" /> Email</label>{isEditing ? <input type="email" name="email" value={profile.email} onChange={handleProfileChange} className="input-premium" /> : <p className="input-premium bg-gray-50 cursor-default">{profile.email}</p>}</div>
              <div><label className="block text-sm font-medium text-[#2B1D17] mb-2 flex items-center gap-1"><FaPhone className="text-[#2B1D17]/40" /> Phone</label>{isEditing ? <input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} className="input-premium" /> : <p className="input-premium bg-gray-50 cursor-default">{profile.phone || "—"}</p>}</div>
              <div><label className="block text-sm font-medium text-[#2B1D17] mb-2 flex items-center gap-1"><FaClock className="text-[#2B1D17]/40" /> Member Since</label><p className="input-premium bg-gray-50 cursor-default">{profile.memberSince}</p></div>
            </div>
          </div>
        )}

        {/* Loyalty Tab */}
        {activeTab === 'loyalty' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Premium Loyalty Hero Card */}
            <div className="card-premium p-6 sm:p-8 bg-gradient-to-br from-[#2B1D17] via-[#2B1D17] to-[#3a2518] !text-white !border-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#D9A441]/5 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[#F47A20]/8 blur-3xl" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
                <div className="relative">
                  <div
                    className="w-28 h-28 rounded-full p-2 transition-all duration-1000"
                    style={{
                      background: `conic-gradient(#F47A20 ${ringProgress}%, rgba(255,255,255,0.12) ${ringProgress}% 100%)`,
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-[#2B1D17] flex items-center justify-center shadow-inner">
                      <div className="w-14 h-14 rounded-full bg-[#2B1D17]/40 border border-white/5" />
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-serif text-3xl font-bold text-white">{loyaltyPoints}</span>
                    <span className="text-[10px] text-white/60 uppercase">points</span>
                  </div>
                </div>
                <div className="text-center lg:text-left flex-1">
                  <div className="inline-flex items-center gap-2 bg-[#D9A441]/20 rounded-full px-4 py-1 mb-3">
                    <FaStar className="text-[#D9A441] text-xs" /><span className={`text-xs font-semibold ${tierColor}`}>{tierLabel} Tier</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold mb-2">Spice Hut Rewards</h2>
                  <p className="text-white/60 text-sm max-w-md">
                    {loyaltyPoints >= 100
                      ? `You can redeem your points for $${Math.floor(loyaltyPoints / 100)}.00 off your next order!`
                      : `Earn ${100 - loyaltyPoints} more points to unlock a $1.00 discount on your next order.`
                    }
                  </p>
                  <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#F47A20] to-[#D9A441] rounded-full transition-all duration-700" style={{ width: `${pointsProgress}%` }} />
                  </div>
                  <p className="text-white/40 text-xs mt-2">{100 - pointsProgress} points to next reward</p>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[{icon: FaStar, title:"Earn 1pt per $1", desc:"Every dollar you spend earns you a point"}, {icon: FaGift, title:"100pts = $1 Off", desc:"Redeem points for instant discounts"}, {icon: FaShieldAlt, title:"Points Never Expire", desc:"Your rewards stay with you forever"}].map((item, i) => (
                <div key={i} className="card-premium p-5 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#F47A20]/10 flex items-center justify-center"><item.icon className="text-[#F47A20] text-lg" /></div>
                  <h3 className="font-serif text-sm font-bold text-[#2B1D17] mb-1">{item.title}</h3>
                  <p className="text-[#2B1D17]/50 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="card-premium p-6 sm:p-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl font-bold text-[#2B1D17] flex items-center gap-2"><FaMapMarkerAlt className="text-[#F47A20]" /> Saved Addresses ({addresses.length})</h2>
              <button onClick={() => setShowAddAddress(!showAddAddress)} className="btn-primary text-sm py-2.5 flex items-center gap-2"><FaPlus /> New Address</button>
            </div>

            {showAddAddress && (
              <div className="bg-[#FFF5EB] p-5 rounded-2xl mb-6 space-y-3 border border-[#F47A20]/20">
                <button onClick={handleUseCurrentLocation} className="btn-secondary w-full text-sm py-2.5 flex items-center justify-center gap-2"><FaLocationArrow /> Use Current Location</button>
                {locationError && <p className="text-red-600 text-xs">{locationError}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Label (e.g., Home)" value={newAddress.label} onChange={(e) => setNewAddress(p => ({ ...p, label: e.target.value }))} className="input-premium" />
                  <input placeholder="Address Line 1" value={newAddress.addressLine1} onChange={(e) => setNewAddress(p => ({ ...p, addressLine1: e.target.value }))} className="input-premium" />
                  <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress(p => ({ ...p, city: e.target.value }))} className="input-premium" />
                  <input placeholder="Postal Code" value={newAddress.postalCode} onChange={(e) => setNewAddress(p => ({ ...p, postalCode: e.target.value }))} className="input-premium" />
                </div>
                <textarea placeholder="Delivery Instructions (optional)" value={newAddress.instructions} onChange={(e) => setNewAddress(p => ({ ...p, instructions: e.target.value }))} className="input-premium resize-none" rows={2} />
                <button onClick={handleSaveNewAddress} className="btn-primary w-full text-sm py-2.5">Add Address</button>
              </div>
            )}

            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="card-premium !shadow-none border border-gray-100 p-4 sm:p-5 hover:border-[#F47A20]/30 transition-colors">
                  {editingAddressId === addr.id && editingAddress ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input value={editingAddress.label} onChange={(e) => setEditingAddress(p => ({ ...p, label: e.target.value }))} className="input-premium" placeholder="Label" />
                        <input value={editingAddress.addressLine1} onChange={(e) => setEditingAddress(p => ({ ...p, addressLine1: e.target.value }))} className="input-premium" placeholder="Address" />
                        <input value={editingAddress.city} onChange={(e) => setEditingAddress(p => ({ ...p, city: e.target.value }))} className="input-premium" placeholder="City" />
                        <input value={editingAddress.postalCode} onChange={(e) => setEditingAddress(p => ({ ...p, postalCode: e.target.value }))} className="input-premium" placeholder="Postal Code" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEditedAddress(addr.id)} className="btn-primary text-xs py-2 px-4">Save</button>
                        <button onClick={handleCancelEdit} className="btn-secondary text-xs py-2 px-4">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#F47A20]/10 flex items-center justify-center flex-shrink-0 mt-0.5"><FaMapMarkerAlt className="text-[#F47A20]" /></div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#2B1D17]">{addr.label}</span>
                            {addr.isDefault && <span className="bg-[#F47A20]/10 text-[#F47A20] text-[10px] px-2 py-0.5 rounded-full font-medium">Default</span>}
                          </div>
                          <p className="text-[#2B1D17]/50 text-sm mt-0.5 break-words">{addr.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!addr.isDefault && <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-xs text-[#F47A20] hover:underline font-medium whitespace-nowrap">Set Default</button>}
                        <button onClick={() => handleEditClick(addr)} className="text-xs text-[#2B1D17]/50 hover:text-[#F47A20] px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">Edit</button>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-[#2B1D17]/20 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"><FaTrash size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order History Tab */}
        {activeTab === 'orders' && (
          <div className="card-premium p-6 sm:p-8 animate-fade-in-up">
            <h2 className="font-serif text-2xl font-bold text-[#2B1D17] flex items-center gap-2 mb-6"><FaHistory className="text-[#F47A20]" /> Order History ({orderHistory.length})</h2>
            {ordersLoading ? (
              <div className="text-center py-12"><div className="w-10 h-10 mx-auto rounded-full border-2 border-[#F47A20] border-b-transparent animate-spin" /><p className="text-[#2B1D17]/40 mt-4">Loading orders...</p></div>
            ) : isLoggedIn ? (
              orderHistory.length > 0 ? (
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <div key={order.orderId || order._id} className="card-premium !shadow-none border border-gray-100 p-4 sm:p-5 hover:border-[#F47A20]/20 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-serif text-sm font-bold text-[#2B1D17]">{order.orderId}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-[#F47A20]/10 text-[#F47A20]'
                            }`}>{order.status || 'incoming'}</span>
                          </div>
                          <p className="text-[#2B1D17]/50 text-xs mb-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="text-[#2B1D17]/50 text-xs truncate">{(order.items || []).map(i => i.name).join(", ")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-serif text-lg font-bold text-[#2B1D17] whitespace-nowrap">${(order.totalAmount || 0).toFixed(2)}</p>
                          <button onClick={() => { (order.items || []).forEach(i => addToCart({ menuItemId: i.menuItemId || null, name: i.name, price: i.price, category: i.category || "Menu", spiceLevel: i.spiceLevel, specialInstructions: i.specialInstructions || "" }, i.quantity || 1)); navigate("/user/cart"); }}
                            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                            <FaRedo size={10} /> Reorder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-[#2B1D17]/50 text-center py-12">No orders yet. Start ordering to see your history!</p>
            ) : <p className="text-[#2B1D17]/50 text-center py-12">Please log in to view your order history.</p>}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="card-premium p-6 sm:p-8 animate-fade-in-up">
            <h2 className="font-serif text-2xl font-bold text-[#2B1D17] flex items-center gap-2 mb-6"><FaLock className="text-[#F47A20]" /> Change Password</h2>
            {passwordChangeError && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{passwordChangeError}</div>}
            {passwordChangeSuccess && <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{passwordChangeSuccess}</div>}
            <div className="space-y-4 max-w-md">
              <div className="relative">
                <label className="block text-sm font-medium text-[#2B1D17] mb-2">Current Password</label>
                <div className="relative">
                  <input type={showCurrentPassword ? "text" : "password"} placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-premium pr-10" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2B1D17] mb-2">Verification Method</label>
                <div className="flex items-center gap-6 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={otpMethodForChange === 'sms'} onChange={() => setOtpMethodForChange('sms')} className="accent-[#F47A20]" /><span className="text-sm">SMS</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={otpMethodForChange === 'email'} onChange={() => setOtpMethodForChange('email')} className="accent-[#F47A20]" /><span className="text-sm">Email</span></label>
                </div>
                <button type="button" onClick={async () => { setSendingChangeOtp(true); try { await (await import("../../services/api")).authAPI.resendVerification({ email: profile?.email, phone: profile?.phone, otpMethod: otpMethodForChange }); setPasswordChangeSuccess('Verification code sent'); } catch (err) { setPasswordChangeError(err?.response?.data?.message || 'Failed to send'); } finally { setSendingChangeOtp(false); } }}
                  disabled={sendingChangeOtp} className="btn-secondary w-full text-sm py-2.5">{sendingChangeOtp ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-[#2B1D17] mb-2">New Password</label>
                <PasswordInput value={newPassword} onChange={handleNewPasswordChange} placeholder="New password" errors={passwordErrors} name="password" required />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-[#2B1D17] mb-2">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-premium pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button onClick={handleChangePassword} disabled={passwordChangeLoading} className="btn-primary w-full py-3">
                {passwordChangeLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
