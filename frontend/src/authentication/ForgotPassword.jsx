import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiPhone, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { authAPI } from "../services/api";
import PasswordInput from "../User-Frontend/components/PasswordInput";
import { validatePassword } from "../User-Frontend/utils/passwordUtils";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [otpMethod, setOtpMethod] = useState('email');
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault(); setIsLoading(true); setError(""); setSuccess("");
    try { await authAPI.verifyUser({ email, phone }); setIsVerified(true); setSuccess("Verified! Set your new password."); }
    catch (err) { setError(err.response?.data?.message || "Verification failed."); }
    finally { setIsLoading(false); }
  };

  const handleSendOtp = async () => {
    if (!email) return setError('Please provide your email.'); setSendingOtp(true); setError(''); setSuccess('');
    try { await authAPI.resendVerification({ email, phone, otpMethod }); setSuccess(`Code sent via ${otpMethod.toUpperCase()}.`); }
    catch (err) { setError(err.response?.data?.message || err.message || 'Failed to send code.'); }
    finally { setSendingOtp(false); }
  };

  const handlePasswordChange = (e) => { setPassword(e.target.value); setPasswordErrors(validatePassword(e.target.value)); };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (validatePassword(password).length > 0) { setError("Password must meet all requirements."); return; }
    setIsLoading(true); setError(""); setSuccess("");
    try { await authAPI.resetPassword({ email, phone, newPassword: password }); setSuccess("Password reset! Redirecting to login..."); setTimeout(() => { window.location.href = "/login"; }, 2500); }
    catch (err) { setError(err.response?.data?.message || "Reset failed."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex w-1/2 relative bg-[#2B1D17] overflow-hidden">
        <img src="/media/home.jpg" alt="Spice Hut" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2B1D17]/90 via-[#2B1D17]/70 to-[#F47A20]/40" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <h1 className="font-serif text-6xl font-bold text-white leading-tight">Reset <span className="text-[#F47A20]">Password</span></h1>
          <div className="section-divider mt-4" />
          <p className="text-white/50 mt-6 max-w-sm leading-relaxed">We'll help you get back into your account securely.</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center bg-[#FFF8F1] p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8"><h1 className="font-serif text-4xl font-bold text-[#2B1D17]">Spice<span className="text-[#F47A20]">Hut</span></h1></div>
          <div className="card-premium p-8 sm:p-10 !shadow-card-hover">
            <h2 className="font-serif text-2xl font-bold text-[#2B1D17] text-center mb-6">Forgot Password</h2>

            {error && (<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"><FiAlertCircle className="h-5 w-5 text-red-500" /><span className="text-red-700 text-sm">{error}</span></div>)}
            {success && (<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"><FiCheckCircle className="h-5 w-5 text-green-500" /><span className="text-green-700 text-sm">{success}</span></div>)}

            {!isVerified ? (
              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#2B1D17] mb-2">Email</label>
                  <div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium pl-12" required /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B1D17] mb-2">Phone</label>
                  <div className="relative"><FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input type="tel" placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-premium pl-12" required /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B1D17] mb-2">Verification method</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2"><input type="radio" checked={otpMethod === 'email'} onChange={() => setOtpMethod('email')} className="accent-[#F47A20]" /><span className="text-sm">Email</span></label>
                    <label className="flex items-center gap-2"><input type="radio" checked={otpMethod === 'sms'} onChange={() => setOtpMethod('sms')} className="accent-[#F47A20]" /><span className="text-sm">SMS</span></label>
                  </div>
                </div>
                <button type="button" onClick={handleSendOtp} disabled={sendingOtp} className="btn-secondary w-full py-3 text-sm">{sendingOtp ? "Sending..." : "Send verification code"}</button>
                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5">{isLoading ? "Verifying..." : "Verify Identity"}</button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div><label className="block text-sm font-medium text-[#2B1D17] mb-2">New Password</label><PasswordInput value={password} onChange={handlePasswordChange} placeholder="New password" errors={passwordErrors} name="password" required /></div>
                <div><label className="block text-sm font-medium text-[#2B1D17] mb-2">Confirm Password</label><PasswordInput id="confirm" name="confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" showStrengthMeter={false} required /></div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5">{isLoading ? "Resetting..." : "Reset Password"}</button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <Link to="/login" className="text-sm text-[#F47A20] hover:text-[#D96B1A] font-semibold transition-colors">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
