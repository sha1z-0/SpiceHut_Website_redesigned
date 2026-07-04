import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { FiMail, FiUser, FiAlertCircle, FiPhone } from "react-icons/fi";
import { FaLocationArrow } from "react-icons/fa";
import { authAPI } from "../services/api";
import PasswordInput from "../User-Frontend/components/PasswordInput";
import { validatePassword } from "../User-Frontend/utils/passwordUtils";
import OtpModal from './components/OtpModal';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || null;
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [otpMethod, setOtpMethod] = useState('email');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [modalEmail, setModalEmail] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalOtpMethod, setModalOtpMethod] = useState('email');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", addressLine1: "", city: "", postalCode: "", instructions: "", latitude: null, longitude: null });
  const [locationError, setLocationError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "password") setPasswordErrors(validatePassword(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (validatePassword(formData.password).length > 0) return setError("Please ensure your password meets all requirements.");
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      await authAPI.userSignup({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, otpMethod, role: "user" });
      setModalEmail(formData.email);
      setModalPhone(formData.phone);
      setModalOtpMethod(otpMethod);
      setShowOtpModal(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to register");
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (!formData.email) return setResendMessage("Please enter your email above.");
    setResendLoading(true); setResendMessage("");
    try { await authAPI.resendVerification({ email: formData.email }); setResendMessage("Verification code sent."); }
    catch (err) { setResendMessage(err.response?.data?.message || err.message || "Failed to resend"); }
    finally { setResendLoading(false); }
  };

  const handleUseCurrentLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) { setLocationError("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const { utilsAPI } = await import("../services/api");
          const geo = await utilsAPI.reverseGeocode(latitude, longitude);
          setNewAddress(prev => ({ ...prev, addressLine1: geo.formattedAddress || prev.addressLine1, city: geo.city || prev.city, postalCode: geo.postalCode || prev.postalCode }));
        } catch (rgErr) { setLocationError(rgErr?.response?.data?.message || rgErr?.message || "Unable to resolve location."); }
      },
      (err) => { setLocationError(err.code === 1 ? "Location access denied." : "Unable to get location."); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleSaveNewAddress = () => {
    if (!newAddress.label || !newAddress.addressLine1 || !newAddress.city || !newAddress.postalCode) { alert("Please fill all required fields."); return; }
    localStorage.setItem("pendingAddress", JSON.stringify(newAddress));
    setNewAddress({ label: "", addressLine1: "", city: "", postalCode: "", instructions: "", latitude: null, longitude: null });
    setLocationError(""); setShowAddAddress(false);
    alert("Address saved! It will be added after registration.");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Cinematic */}
      <div className="hidden lg:flex w-1/2 relative bg-[#2B1D17] overflow-hidden">
        <img src="/media/home.jpg" alt="Spice Hut" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2B1D17]/90 via-[#2B1D17]/70 to-[#F47A20]/40" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-8">
            <h1 className="font-serif text-6xl font-bold text-white leading-tight">
              Join <span className="text-[#F47A20]">Spice Hut</span>
            </h1>
            <div className="section-divider mt-4" />
          </div>
          <h2 className="font-serif text-3xl text-white/80 italic leading-snug max-w-md">
            "Start your flavor journey today."
          </h2>
          <p className="text-white/50 mt-6 max-w-sm leading-relaxed">
            Create an account to order your favorite dishes, earn loyalty points, and enjoy exclusive offers.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center bg-[#FFF8F1] p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-serif text-4xl font-bold text-[#2B1D17]">Spice<span className="text-[#F47A20]">Hut</span></h1>
          </div>

          <div className="card-premium p-8 sm:p-10 !shadow-card-hover">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#F47A20] to-[#D9A441] flex items-center justify-center">
                <FiUser className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2B1D17]">Create Account</h2>
              <p className="text-[#2B1D17]/50 text-sm mt-1">Start your flavor journey</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2B1D17] mb-2">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} className="input-premium pl-12" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2B1D17] mb-2">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} className="input-premium pl-12" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2B1D17] mb-2">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="phone" type="tel" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} className="input-premium pl-12" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2B1D17] mb-2">Verification Method</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="otpMethod" value="email" checked={otpMethod === 'email'} onChange={() => setOtpMethod('email')} className="accent-[#F47A20]" />
                    <span className="text-sm text-[#2B1D17]">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="otpMethod" value="sms" checked={otpMethod === 'sms'} onChange={() => setOtpMethod('sms')} className="accent-[#F47A20]" />
                    <span className="text-sm text-[#2B1D17]">SMS</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2B1D17] mb-2">Password</label>
                <PasswordInput value={formData.password} onChange={(e) => handleChange(e)} placeholder="Password" errors={passwordErrors} name="password" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2B1D17] mb-2">Confirm Password</label>
                <PasswordInput id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" showStrengthMeter={false} required />
              </div>

              <button type="button" onClick={() => setShowAddAddress(!showAddAddress)} className="btn-secondary w-full text-sm">
                {showAddAddress ? "Hide Address Form" : "+ Add Delivery Address"}
              </button>

              {showAddAddress && (
                <div className="bg-[#FFF5EB] p-5 rounded-2xl space-y-3 border border-[#F47A20]/20">
                  <input type="text" placeholder="Label (e.g., Home, Work)" value={newAddress.label} onChange={(e) => setNewAddress(p => ({ ...p, label: e.target.value }))} className="input-premium" />
                  <button type="button" onClick={handleUseCurrentLocation} className="btn-secondary w-full text-sm py-2.5 flex items-center justify-center gap-2"><FaLocationArrow /> Use Current Location</button>
                  {locationError && <p className="text-red-600 text-xs">{locationError}</p>}
                  <input type="text" placeholder="Address Line 1" value={newAddress.addressLine1} onChange={(e) => setNewAddress(p => ({ ...p, addressLine1: e.target.value }))} className="input-premium" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress(p => ({ ...p, city: e.target.value }))} className="input-premium" />
                    <input type="text" placeholder="Postal Code" value={newAddress.postalCode} onChange={(e) => setNewAddress(p => ({ ...p, postalCode: e.target.value }))} className="input-premium" />
                  </div>
                  <textarea placeholder="Delivery Instructions (optional)" value={newAddress.instructions} onChange={(e) => setNewAddress(p => ({ ...p, instructions: e.target.value }))} className="input-premium resize-none" rows={2} />
                  <button type="button" onClick={handleSaveNewAddress} className="btn-primary w-full text-sm py-2.5">Save Address</button>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-5 text-center space-y-3">
              <button type="button" onClick={handleResend} disabled={resendLoading} className="text-sm text-[#2B1D17]/50 hover:text-[#F47A20] transition-colors">
                {resendLoading ? "Sending..." : "Resend verification code"}
              </button>
              {resendMessage && <p className="text-xs text-green-600">{resendMessage}</p>}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-[#2B1D17]/50">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-[#F47A20] hover:text-[#D96B1A] transition-colors">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <OtpModal email={modalEmail} phone={modalPhone} otpMethod={modalOtpMethod}
          onClose={() => setShowOtpModal(false)}
          onVerified={() => { setShowOtpModal(false); navigate(returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login'); }} />
      )}
    </div>
  );
}
