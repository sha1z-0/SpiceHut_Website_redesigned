import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../context.cart";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const cartCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const cartCountLabel = cartCount > 99 ? "99+" : cartCount.toString();
  const authed = isAuthenticated();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignIn = () => {
    const currentPath = location.pathname + location.search;
    navigate(`/login?returnTo=${encodeURIComponent(currentPath)}`);
  };

  const handleProfilePage = () => {
    setShowDropdown(false);
    navigate("/user/profile");
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
    setShowDropdown(false);
    navigate("/user/home");
  };

  const navLinks = [
    { label: "Home", path: "/user/home" },
    { label: "Menu", path: "/user/menu" },
    { label: "About Us", path: "/user/about-us" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className={`mx-auto max-w-7xl rounded-full transition-all duration-500 ${scrolled ? "glass-dark shadow-lg" : "glass"}`}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            {/* Left: Brand + Mobile Menu */}
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden text-white hover:text-[#F47A20] transition p-1" aria-label="Menu">
                {showMobileMenu ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
              <button onClick={() => navigate("/user/home")} className="font-serif text-lg sm:text-xl font-bold text-white leading-tight tracking-tight hover:text-[#F47A20] transition-colors">
                Spice Hut
              </button>
            </div>

            {/* Center: Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button key={link.path} onClick={() => navigate(link.path)}
                  className="relative px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors group">
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#F47A20] rounded-full transition-all duration-300 group-hover:w-4/5" />
                </button>
              ))}
            </nav>

            {/* Right: Cart + Auth */}
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/user/cart")}
                className="relative text-white hover:text-[#F47A20] transition p-2 rounded-full hover:bg-white/10" aria-label="Cart">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#F47A20] text-white text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg shadow-[#F47A20]/30">{cartCountLabel}</span>
                )}
              </button>

              {authed ? (
                /* Authenticated: Profile dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setShowDropdown(!showDropdown)}
                    className="text-white hover:text-[#F47A20] transition p-2 rounded-full hover:bg-white/10" aria-label="Profile">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in z-50">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <p className="text-sm font-semibold text-[#2B1D17] truncate font-serif">{user?.name || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button onClick={handleProfilePage} className="w-full text-left px-5 py-3 text-sm text-[#2B1D17] hover:bg-[#FFF5EB] transition-colors flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Your Profile
                      </button>
                      <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 border-t border-gray-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest: Sign In button */
                <button onClick={handleSignIn}
                  className="btn-primary !py-2 !px-5 text-sm !shadow-none ml-1">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden mt-3 mx-4">
            <nav className="glass rounded-2xl p-4 animate-scale-in">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button key={link.path} onClick={() => { navigate(link.path); setShowMobileMenu(false); }}
                    className="w-full text-left px-4 py-3 text-white hover:text-[#F47A20] hover:bg-white/5 rounded-xl transition-all text-base font-medium">{link.label}</button>
                ))}
                <div className="border-t border-white/10 my-2" />
                <button onClick={() => { navigate("/user/cart"); setShowMobileMenu(false); }}
                  className="w-full text-left px-4 py-3 text-white hover:text-[#F47A20] hover:bg-white/5 rounded-xl transition-all text-base font-medium flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Cart ({cartCount})
                </button>
                {!authed && (
                  <button onClick={() => { handleSignIn(); setShowMobileMenu(false); }}
                    className="btn-primary w-full justify-center !py-3 mt-1 text-sm">
                    Sign In
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
