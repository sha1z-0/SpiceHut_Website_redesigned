import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import PasswordInput from "../User-Frontend/components/PasswordInput";
import { authAPI } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: authLogin, isAuthenticated } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const returnTo = searchParams.get("returnTo") || null;

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated()) {
      const role = JSON.parse(atob(localStorage.getItem("token")?.split(".")[1] || "e30=")).role;
      if (role === "admin") navigate("/admin", { replace: true });
      else navigate(returnTo || "/user/home", { replace: true });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await authLogin(email, password);
      if (result.success && result.user) {
        if (result.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate(returnTo || "/user/home", { replace: true });
        }
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return setResendMessage("Please enter your email above.");
    setResendLoading(true); setResendMessage("");
    try { await authAPI.resendVerification({ email }); setResendMessage("Verification code sent."); }
    catch (err) { setResendMessage(err.response?.data?.message || err.message || "Failed to resend"); }
    finally { setResendLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 relative bg-[#2B1D17] overflow-hidden">
        <img src="/media/home.jpg" alt="Spice Hut Cuisine" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2B1D17]/90 via-[#2B1D17]/70 to-[#F47A20]/40" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-8">
            <h1 className="font-serif text-6xl font-bold text-white leading-tight">Spice<span className="text-[#F47A20]">Hut</span></h1>
            <div className="section-divider mt-4" />
          </div>
          <h2 className="font-serif text-3xl text-white/80 italic leading-snug max-w-md">
            {returnTo ? "Sign in to complete your order." : "\"Authentic flavors, from our kitchen to your table.\""}
          </h2>
          {returnTo && (
            <p className="text-white/50 mt-4 max-w-sm leading-relaxed text-sm">
              Your cart and selections have been saved. Sign in to continue where you left off.
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#FFF8F1] p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-serif text-4xl font-bold text-[#2B1D17]">Spice<span className="text-[#F47A20]">Hut</span></h1>
          </div>
          <div className="card-premium p-8 sm:p-10 !shadow-card-hover">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#F47A20] to-[#D9A441] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2B1D17]">
                {returnTo ? "Sign in to continue" : "Welcome Back"}
              </h2>
              <p className="text-[#2B1D17]/50 text-sm mt-1">
                {returnTo ? "Your selections are saved" : "Sign in to your account"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#2B1D17] mb-2">Email Address</label>
                <input id="email" type="email" placeholder="Enter your email" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="input-premium" required />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#2B1D17] mb-2">Password</label>
                <PasswordInput id="password" name="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" showStrengthMeter={false} required />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="mt-5 text-center space-y-3">
              <Link to="/forgot-password" className="text-sm text-[#F47A20] hover:text-[#D96B1A] transition-colors font-medium">Forgot Password?</Link>
              <button type="button" onClick={handleResend} disabled={resendLoading}
                className="block mx-auto text-sm text-[#2B1D17]/50 hover:text-[#F47A20] transition-colors">
                {resendLoading ? "Sending..." : "Resend verification code"}
              </button>
              {resendMessage && <p className="text-xs text-green-600">{resendMessage}</p>}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-[#2B1D17]/50">
                Don't have an account? <Link to={`/register${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
                  className="font-semibold text-[#F47A20] hover:text-[#D96B1A] transition-colors">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
