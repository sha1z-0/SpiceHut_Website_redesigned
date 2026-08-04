import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { contentAPI, branchAPI } from '../../services/api';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';

export default function Contact() {
  const [contactContent, setContactContent] = useState(null);
  const [branchInfo, setBranchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try { const data = await contentAPI.getContent(); setContactContent(data?.contact || null); }
      catch (err) { setContactContent(null); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const branchId = params.get('branchId');
    if (!branchId) return;
    (async () => {
      try { const branch = await branchAPI.getBranch(branchId); if (branch) setBranchInfo(branch); }
      catch (err) { console.warn('Branch not found', err); }
    })();
  }, [location.search]);

  const defaultAddress = "2616-18 Street NE Calgary Alberta T2E 7R1";
  const defaultPhone = "403-371-3331";

  const activeContent = contactContent || {
    title: "Contact Us",
    address: defaultAddress,
    phone: defaultPhone,
    email: "info@spicehutcanada.com",
    hours: {
      "Monday - Thursday": "11:00 AM - 10:00 PM",
      "Friday - Saturday": "11:00 AM - 11:00 PM",
      "Sunday": "12:00 PM - 10:00 PM"
    }
  };

  const params = new URLSearchParams(location.search);
  const branchIdParam = params.get('branchId');
  const displayPhone = branchIdParam ? (branchInfo?.phone || defaultPhone) : defaultPhone;
  const displayAddress = branchIdParam ? (branchInfo?.fullAddress || defaultAddress) : defaultAddress;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#2B1D17]/60">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FFF8F1]">
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 z-0">
          <img src="/media/home.jpg" alt="Spice Hut Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A100D]/95 via-[#1A100D]/90 to-[#1A100D]/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A100D]/80 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Get In Touch</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">{activeContent.title}</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">We're here to serve you the best culinary experience.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info Card */}
          <div className="card-premium p-8">
            <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mb-6">Contact Information</h2>
            <div className="space-y-6">
              {displayAddress && (
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#F47A20]/10 flex items-center justify-center flex-shrink-0"><FaMapMarkerAlt className="text-[#F47A20]" /></div>
                  <div><h3 className="font-semibold text-[#2B1D17] text-sm">Address</h3><p className="text-[#2B1D17]/60 text-sm">{displayAddress}</p></div>
                </div>
              )}
              {displayPhone && (
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#F47A20]/10 flex items-center justify-center flex-shrink-0"><FaPhone className="text-[#F47A20]" /></div>
                  <div><h3 className="font-semibold text-[#2B1D17] text-sm">Phone</h3><p className="text-[#2B1D17]/60 text-sm">{displayPhone}</p></div>
                </div>
              )}
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#F47A20]/10 flex items-center justify-center flex-shrink-0"><FaEnvelope className="text-[#F47A20]" /></div>
                <div><h3 className="font-semibold text-[#2B1D17] text-sm">Email</h3><p className="text-[#2B1D17]/60 text-sm">{activeContent.email}</p></div>
              </div>
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#F47A20]/10 flex items-center justify-center flex-shrink-0"><FaClock className="text-[#F47A20]" /></div>
                <div>
                  <h3 className="font-semibold text-[#2B1D17] text-sm mb-2">Hours</h3>
                  <div className="space-y-1 text-xs">
                    {Object.entries(activeContent.hours || {}).map(([day, hours]) => (
                      <div key={day} className="flex justify-between gap-8 text-[#2B1D17]/60"><span className="capitalize">{day}</span><span>{hours}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="card-premium p-8">
            <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mb-6">Send us a Message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Your Name" className="input-premium" />
              <input type="email" placeholder="Your Email" className="input-premium" />
              <textarea rows="4" placeholder="Your Message" className="input-premium resize-none" />
              <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                <FaPaperPlane /> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
