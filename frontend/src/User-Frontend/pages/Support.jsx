import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { branchAPI } from '../../services/api';
import { MdPhone, MdEmail, MdLocationOn, MdChat, MdSend, MdCheckCircle, MdHelp, MdRestaurant, MdCreditCard, MdLocalShipping, MdExpandMore, MdExpandLess } from "react-icons/md";

const faqCategories = [
  {
    icon: MdRestaurant, title: "Menu & Orders",
    questions: [
      { question: "How do I modify my order after placing it?", answer: "You can modify your order within 5 minutes of placing it by calling our support line or using live chat." },
      { question: "Do you have vegetarian and vegan options?", answer: "Yes! We have a wide variety of vegetarian and vegan dishes clearly marked on our menu with dietary badges." },
      { question: "Can I customize the spice level of my dishes?", answer: "You can request mild, medium, or spicy when placing your order. Just add a note in the special instructions." },
    ],
  },
  {
    icon: MdLocalShipping, title: "Delivery & Pickup",
    questions: [
      { question: "What are your delivery hours?", answer: "We deliver Monday through Sunday from 11AM to 11PM." },
      { question: "How much is delivery?", answer: "Delivery is always free!" },
      { question: "How long does delivery take?", answer: "Most deliveries arrive within 25-35 minutes. During peak hours, it may take up to 45 minutes." },
    ],
  },
  {
    icon: MdCreditCard, title: "Payment & Loyalty",
    questions: [
      { question: "What payment methods do you accept?", answer: "We accept all major credit cards, debit cards, digital wallets, and cash on delivery." },
      { question: "How do loyalty points work?", answer: "Earn 1 point for every $1 spent. 100 points = $1 discount. Points never expire." },
      { question: "Can I get a refund if I'm not satisfied?", answer: "Yes! Contact us within 2 hours and we'll make it right." },
    ],
  },
];

export default function SupportPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", category: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isVisitUsExpanded, setIsVisitUsExpanded] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false); setIsSubmitted(true);
    setTimeout(() => { setIsSubmitted(false); setFormData({ name: "", email: "", phone: "", category: "", subject: "", message: "" }); }, 3000);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { const data = await branchAPI.getBranches(); if (mounted) setBranches(Array.isArray(data) ? data : []); }
      catch (err) { if (mounted) setBranches([]); }
      finally { if (mounted) setBranchesLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F1]">
      <section className="relative bg-[#2B1D17] pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Help Center</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">Support Center</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">We're here to help! Get answers or reach out to our friendly support team.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: FAQ */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#2B1D17] mb-6">Get in Touch</h2>
            </div>

            {/* Visit Us */}
            <div className="card-premium !p-0 overflow-hidden">
              <button className="w-full p-6 text-left flex items-center justify-between hover:bg-[#FFF5EB] transition-colors"
                onClick={() => setIsVisitUsExpanded(!isVisitUsExpanded)}>
                <h3 className="flex items-center gap-3 text-lg font-semibold text-[#2B1D17]"><MdLocationOn className="text-[#F47A20] text-xl" /> Visit Us</h3>
                {isVisitUsExpanded ? <MdExpandLess className="text-[#F47A20] text-xl" /> : <MdExpandMore className="text-[#F47A20] text-xl" />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isVisitUsExpanded ? "max-h-96" : "max-h-0"}`}>
                <div className="p-6 border-t border-gray-100 space-y-1">
                  {branchesLoading ? <p className="text-sm text-[#2B1D17]/40">Loading...</p>
                  : branches.length === 0 ? <p className="text-sm text-[#2B1D17]/40">No locations available.</p>
                  : branches.map((b) => (
                    <Link key={b._id} to={`/user/contact?branchId=${encodeURIComponent(b._id)}`}
                      className="block py-2.5 px-4 text-[#F47A20] hover:bg-[#FFF5EB] rounded-xl transition-colors font-medium text-sm">
                      {b.city || b.name} → {b.addressLine}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ */}
            <h2 className="font-serif text-3xl font-bold text-[#2B1D17] mb-6 mt-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqCategories.map((category) => (
                <div key={category.title} className="card-premium !p-0 overflow-hidden">
                  <div className="p-6 bg-[#FFF5EB] flex items-center gap-3">
                    <category.icon className="text-[#F47A20] text-xl" />
                    <h3 className="font-serif text-lg font-bold text-[#2B1D17]">{category.title}</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {category.questions.map((faq, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                        <button className="flex items-center justify-between w-full text-left py-2 hover:text-[#F47A20] transition-colors group"
                          onClick={() => setExpandedFaq(expandedFaq === `${category.title}-${index}` ? null : `${category.title}-${index}`)}>
                          <span className="font-medium text-[#2B1D17] text-sm group-hover:text-[#F47A20]">{faq.question}</span>
                          <MdHelp className="text-[#D9A441] flex-shrink-0 ml-3" />
                        </button>
                        {expandedFaq === `${category.title}-${index}` && (
                          <div className="mt-3 text-[#2B1D17]/60 text-sm animate-slide-up bg-[#FFF5EB] rounded-xl p-4">{faq.answer}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-1">
            <div className="card-premium p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                <MdChat className="text-[#F47A20] text-xl" />
                <h3 className="font-serif text-lg font-bold text-[#2B1D17]">Send us a Message</h3>
              </div>
              {isSubmitted ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MdCheckCircle className="text-3xl text-green-600" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#2B1D17] mb-2">Message Sent!</h3>
                  <p className="text-[#2B1D17]/60 text-sm">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required className="input-premium" placeholder="Full Name" />
                  <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} required className="input-premium" placeholder="Email" />
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="input-premium" placeholder="Phone (Optional)" />
                  <select value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="input-premium">
                    <option value="">Select category</option>
                    <option value="order">Order Issue</option>
                    <option value="delivery">Delivery Problem</option>
                    <option value="payment">Payment Question</option>
                    <option value="menu">Menu Inquiry</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                  <input value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} required className="input-premium" placeholder="Subject" />
                  <textarea value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))} required rows={4} className="input-premium resize-none" placeholder="Describe your question or concern..." />
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                    {isSubmitting ? "Sending..." : <><MdSend /> Send Message</>}
                  </button>
                  <p className="text-xs text-center text-[#2B1D17]/30">We typically respond within 24 hours.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
