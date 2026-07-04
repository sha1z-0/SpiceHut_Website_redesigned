import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#1A100D] text-white">
      {/* ============ DESKTOP MAIN FOOTER ============ */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <h3 className="font-serif text-2xl font-bold text-[#D9A441] mb-4">
                Spice Hut
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Authentic East Indian cuisine served across Canada. Fresh ingredients,
                family recipes, and flavors that tell a story.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-[#F47A20] hover:text-white transition-all duration-300" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-[#F47A20] hover:text-white transition-all duration-300" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-[#F47A20] hover:text-white transition-all duration-300" aria-label="Twitter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-[#D9A441] mb-4">
                Quick Links
              </h4>
              <div className="flex flex-col gap-2.5">
                <Link to="/user/home" className="text-white/60 hover:text-[#F47A20] transition-colors text-sm">Home</Link>
                <Link to="/user/menu" className="text-white/60 hover:text-[#F47A20] transition-colors text-sm">Menu</Link>
                <Link to="/user/about-us" className="text-white/60 hover:text-[#F47A20] transition-colors text-sm">About Us</Link>
                <Link to="/user/contact" className="text-white/60 hover:text-[#F47A20] transition-colors text-sm">Contact</Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-[#D9A441] mb-4">
                Support
              </h4>
              <div className="flex flex-col gap-2.5">
                <Link to="/user/support" className="text-white/60 hover:text-[#F47A20] transition-colors text-sm">Help Center</Link>
                <Link to="/user/policies" className="text-white/60 hover:text-[#F47A20] transition-colors text-sm">Policies</Link>
                <Link to="/user/contact" className="text-white/60 hover:text-[#F47A20] transition-colors text-sm">Contact Us</Link>
                <Link to="/user/profile" className="text-white/60 hover:text-[#F47A20] transition-colors text-sm">My Account</Link>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-[#D9A441] mb-4">
                Stay Updated
              </h4>
              <p className="text-white/60 text-sm mb-4">
                Get exclusive offers and new menu alerts.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F47A20] transition-colors"
                />
                <button className="btn-primary px-4 py-2.5 text-sm">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MOBILE FOOTER ============ */}
      <div className="md:hidden space-y-0">
        {/* Brand block */}
        <div className="px-5 pt-8 pb-5 border-b border-white/5">
          <h3 className="font-serif text-xl font-bold text-[#D9A441] mb-2">Spice Hut</h3>
          <p className="text-white/50 text-xs leading-relaxed mb-4">
            Authentic East Indian cuisine served across Canada. Fresh ingredients, family recipes, and flavors that tell a story.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-[#F47A20] hover:text-white transition-all" aria-label="Facebook">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-[#F47A20] hover:text-white transition-all" aria-label="Instagram">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-[#F47A20] hover:text-white transition-all" aria-label="Twitter">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links accordion */}
        <details className="footer-accordion group px-5 py-4 border-b border-white/5">
          <summary className="flex items-center justify-between">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#D9A441]">Quick Links</h4>
            <svg className="chevron-icon w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="flex flex-col gap-2.5 mt-3">
            <Link to="/user/home" className="text-white/50 hover:text-[#F47A20] transition-colors text-sm">Home</Link>
            <Link to="/user/menu" className="text-white/50 hover:text-[#F47A20] transition-colors text-sm">Menu</Link>
            <Link to="/user/about-us" className="text-white/50 hover:text-[#F47A20] transition-colors text-sm">About Us</Link>
            <Link to="/user/contact" className="text-white/50 hover:text-[#F47A20] transition-colors text-sm">Contact</Link>
          </div>
        </details>

        {/* Support accordion */}
        <details className="footer-accordion group px-5 py-4 border-b border-white/5">
          <summary className="flex items-center justify-between">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#D9A441]">Support</h4>
            <svg className="chevron-icon w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="flex flex-col gap-2.5 mt-3">
            <Link to="/user/support" className="text-white/50 hover:text-[#F47A20] transition-colors text-sm">Help Center</Link>
            <Link to="/user/policies" className="text-white/50 hover:text-[#F47A20] transition-colors text-sm">Policies</Link>
            <Link to="/user/contact" className="text-white/50 hover:text-[#F47A20] transition-colors text-sm">Contact Us</Link>
            <Link to="/user/profile" className="text-white/50 hover:text-[#F47A20] transition-colors text-sm">My Account</Link>
          </div>
        </details>

        {/* Newsletter — always visible */}
        <div className="px-5 py-5 border-b border-white/5">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-[#D9A441] mb-2">Stay Updated</h4>
          <p className="text-white/50 text-xs mb-3">Get exclusive offers and new menu alerts.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Your email"
              className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#F47A20] transition-colors" />
            <button className="btn-primary px-4 py-2.5 text-xs min-h-[44px]">Join</button>
          </div>
        </div>
      </div>

      {/* ============ DESKTOP BOTTOM BAR ============ */}
      <div className="hidden md:block border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} Spice Hut. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/user/policies" className="text-white/40 hover:text-white/70 transition-colors text-xs">Privacy Policy</Link>
              <Link to="/user/policies" className="text-white/40 hover:text-white/70 transition-colors text-xs">Terms of Service</Link>
              <Link to="/user/policies" className="text-white/40 hover:text-white/70 transition-colors text-xs">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MOBILE BOTTOM BAR ============ */}
      <div className="md:hidden border-t border-white/5">
        <div className="px-5 py-4 flex flex-col items-center gap-2">
          <p className="text-white/30 text-xs">&copy; {new Date().getFullYear()} Spice Hut. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/user/policies" className="text-white/30 hover:text-white/60 transition-colors text-[11px]">Privacy Policy</Link>
            <Link to="/user/policies" className="text-white/30 hover:text-white/60 transition-colors text-[11px]">Terms</Link>
            <Link to="/user/policies" className="text-white/30 hover:text-white/60 transition-colors text-[11px]">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
