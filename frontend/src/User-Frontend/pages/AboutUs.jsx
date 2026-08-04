import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '../../services/api';
import { FaUtensils, FaFire, FaLeaf, FaAward, FaArrowRight, FaHeart, FaCertificate } from 'react-icons/fa';

export default function AboutUs() {
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await contentAPI.getContent();
        if (data?.about) setAboutContent(data.about);
        else setAboutContent(null);
      } catch (err) {
        setAboutContent(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const defaultContent = {
    title: "Crafting Authentic East Indian Flavors",
    subtitle: "A journey of passion, ancient spice traditions, and culinary craftsmanship",
    content: "At Spice Hut Indian Cuisine, we believe every meal should be a celebration of flavor, heritage, and warmth. Born out of a deep reverence for centuries-old Indian recipes, our kitchen slow-simmers authentic gravies, hand-grinds whole aromatic spices, and roasts fresh meats in traditional clay tandoors at 900°F. From our signature creamy Butter Chicken to fluffy garlic naans, we bring the true essence of Indian hospitality to communities across Canada.",
    mission: "To deliver authentic, wholesome, and unforgettable East Indian dining experiences across Canada—crafted with fresh ingredients, traditional cooking techniques, and genuine warmth.",
    vision: "To be Canada's most cherished Indian restaurant brand, uniting people and cultures through the timeless joy of legendary Indian cuisine."
  };

  const active = aboutContent || defaultContent;

  const pillars = [
    {
      icon: FaLeaf,
      title: "Hand-Ground Spices",
      desc: "We import whole spices directly and roast them in-house daily to preserve essential oils, rich aromas, and authentic flavor profiles."
    },
    {
      icon: FaFire,
      title: "Traditional Clay Tandoor",
      desc: "Our naan breads and tandoori kababs are seared in traditional 900°F clay ovens for authentic smoky char and tender perfection."
    },
    {
      icon: FaUtensils,
      title: "Slow-Simmered Gravies",
      desc: "Silky, aromatic curry bases simmered slowly for hours with fresh ginger, garlic, cashew paste, and real cream."
    },
    {
      icon: FaAward,
      title: "100% Fresh & Quality Sourced",
      desc: "We use only premium quality meats and garden-fresh vegetables with absolutely zero artificial colors, fillers, or preservatives."
    }
  ];

  const milestones = [
    { year: "2018", title: "The First Flame", desc: "Opened our flagship restaurant with a commitment to authentic family recipes." },
    { year: "2020", title: "Recipe Masterclass", desc: "Perfected our signature Butter Chicken and tandoori marinades loved by thousands." },
    { year: "2022", title: "Interprovincial Growth", desc: "Expanded into vibrant communities across British Columbia and Alberta." },
    { year: "2025", title: "Next-Gen Experience", desc: "Launched seamless online ordering, fast delivery, and digital loyalty rewards." }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F1] text-[#2B1D17]/60">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F47A20]" />
          <span>Loading Our Story...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F1] flex flex-col">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute inset-0 z-0">
          <img src="/media/home.jpg" alt="Spice Hut Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A100D]/95 via-[#1A100D]/90 to-[#1A100D]/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A100D]/80 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#D9A441]/20 backdrop-blur-md rounded-full px-4 py-1.5 border border-[#D9A441]/30 mb-6">
            <FaHeart className="text-[#D9A441] text-xs" />
            <span className="text-xs font-semibold text-[#D9A441] uppercase tracking-widest">Our Heritage & Passion</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-2 mb-6 leading-tight">
            {active.title || "Crafting Authentic East Indian Flavors"}
          </h1>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-white/80 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {active.content || defaultContent.content}
          </p>
        </div>
      </section>

      {/* ============ CULINARY PILLARS ============ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#F47A20] font-semibold text-sm uppercase tracking-widest">Craftsmanship</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1D17] mt-2 mb-4">The Four Pillars of Our Kitchen</h2>
          <p className="text-[#2B1D17]/60 text-base">Every dish served at Spice Hut Indian Cuisine is anchored in time-tested culinary principles.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="card-premium p-8 group hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F47A20]/10 flex items-center justify-center mb-6 text-[#F47A20] text-2xl group-hover:bg-[#F47A20] group-hover:text-white transition-colors duration-300">
                <pillar.icon />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#2B1D17] mb-3">{pillar.title}</h3>
              <p className="text-[#2B1D17]/60 text-sm leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>



      {/* ============ QUALITY COMMITMENT BADGES ============ */}
      <section className="py-12 bg-[#2B1D17]/5 border-y border-[#F47A20]/10 my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 flex items-center justify-center gap-3">
              <FaCertificate className="text-[#F47A20] text-2xl" />
              <span className="font-semibold text-[#2B1D17] text-sm sm:text-base">0% Artificial Colors & Preservatives</span>
            </div>
            <div className="p-4 flex items-center justify-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-200">
              <FaLeaf className="text-[#F47A20] text-2xl" />
              <span className="font-semibold text-[#2B1D17] text-sm sm:text-base">100% Hand-Ground Whole Spices</span>
            </div>
            <div className="p-4 flex items-center justify-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-200">
              <FaAward className="text-[#F47A20] text-2xl" />
              <span className="font-semibold text-[#2B1D17] text-sm sm:text-base">100% Halal Certified Meats</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MILESTONE JOURNEY ============ */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 z-0">
          <img src="/media/home.jpg" alt="Spice Hut Journey" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A100D]/95 via-[#1A100D]/90 to-[#1A100D]/95" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Milestones</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-16">The Spice Hut Indian Cuisine Journey</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((m, i) => (
              <div key={i} className="relative overflow-hidden rounded-3xl p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#F47A20]/50 transition-all text-center flex flex-col items-center group">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#F47A20] to-[#D9A441] flex items-center justify-center text-white font-serif text-xl font-bold shadow-xl group-hover:scale-110 transition-transform">
                  {m.year}
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-2">{m.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CALL TO ACTION ============ */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 w-full text-center">
        <div className="card-premium p-10 sm:p-14 bg-gradient-to-br from-white to-[#FFF5EB] border border-[#F47A20]/20 shadow-2xl">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1D17] mb-4">Ready to Experience Authentic Indian Flavor?</h2>
          <p className="text-[#2B1D17]/70 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Discover our wide range of traditional curries, sizzling tandoori items, biryanis, and fresh naans cooked daily.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/user/menu" className="btn-primary px-8 py-3.5 text-base flex items-center gap-2 shadow-lg shadow-[#F47A20]/20">
              Explore Our Menu <FaArrowRight />
            </Link>
            <Link to="/user/contact" className="btn-secondary px-8 py-3.5 text-base">
              Find a Location
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

