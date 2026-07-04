import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaTruck, FaStar, FaMapMarkerAlt, FaChevronRight, FaQuoteRight } from "react-icons/fa";
import { categoryAPI } from "../../services/api";
import { resolveImageSrc } from '../../services/image';

const featuresData = [
  { icon: FaUtensils, title: "Expert Chefs", desc: "Authentic recipes prepared by master chefs" },
  { icon: FaTruck, title: "Fast Delivery", desc: "Hot and fresh meals delivered in 30 minutes" },
  { icon: FaStar, title: "Premium Quality", desc: "Only the finest ingredients in every dish" },
];

const testimonials = [
  { name: "Sarah M.", location: "Campbell River", quote: "The Butter Chicken is absolutely divine. Best Indian food on the island!", rating: 5 },
  { name: "James K.", location: "Canmore", quote: "Incredible flavors and the delivery is always fast. Our go-to for family dinners.", rating: 5 },
  { name: "Priya R.", location: "Tofino", quote: "Authentic taste that reminds me of home. The spice levels are perfect.", rating: 5 },
];

const popularDishes = [
  { name: "Butter Chicken", image: "/media/butter-chicken.jpg", price: 17.95, spice: "Mild", cat: "Butter Dishes" },
  { name: "Chicken Biryani", image: "/Biryani.jpg", price: 18.95, spice: "Medium", cat: "Biryani Dishes" },
  { name: "Tandoori Chicken Tikka", image: "/Tandoori%20Chicken%20Tikka%20.jpg", price: 16.95, spice: "Medium Hot", cat: "Tandoori Dishes" },
  { name: "Lamb Korma", image: "/korma.jpg", price: 19.95, spice: "Mild", cat: "Korma Dishes" },
];

const spiceColors = { Mild: "bg-green-500", "Mild Medium": "bg-yellow-500", Medium: "bg-orange-500", "Medium Hot": "bg-red-400", Hot: "bg-red-600", "Extra Hot": "bg-red-800" };

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [testimonialScrollIdx, setTestimonialScrollIdx] = useState(0);
  const heroRef = useRef(null);
  const testimonialScrollRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await categoryAPI.getCategories();
        if (Array.isArray(data))
          setCategories(data.map((c) => ({
            name: c.name, image: c.image, slug: c.slug,
            description: c.description, subCategory: c.subCategory || "", _id: c._id,
          })));
      } catch (err) { console.error("Failed to load categories for Home", err); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F1] flex flex-col">

      {/* ============ DESKTOP HERO ============ */}
      <div className="hidden md:block">
        <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/media/home.jpg"
              alt="Spice Hut"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A100D]/95 via-[#1A100D]/80 to-[#1A100D]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A100D]/60 via-transparent to-transparent" />
          </div>
          <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block z-[1]">
            <div className="relative w-full h-full">
              <div className="absolute right-20 top-32 w-72 h-72 rounded-full bg-[#F47A20]/10 blur-3xl animate-pulse-glow" />
              <div className="absolute right-40 top-64 w-56 h-56 rounded-full bg-[#D9A441]/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
            </div>
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-white space-y-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-[#F47A20] animate-pulse" />
                  <span className="text-sm font-medium text-white/80">Now serving 10+ locations across Canada</span>
                </div>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tight">
                  Authentic<span className="text-[#F47A20]"> Indian </span>
                  <br />
                  <span className="text-[#D9A441] italic">Cuisine</span>
                </h1>
                <p className="text-lg sm:text-xl text-white/70 max-w-lg leading-relaxed">
                  Experience the rich flavors of East India — from our family kitchen to your table.
                  Handcrafted with imported spices and generations of tradition.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button onClick={() => navigate('/user/menu')} className="btn-primary text-base px-8 py-4">
                    Start Ordering
                    <FaChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => navigate('/user/menu')} className="btn-secondary !border-white/30 !text-white hover:!bg-white hover:!text-[#2B1D17] text-base px-8 py-4">
                    View Full Menu
                  </button>
                </div>
                <div className="flex items-center gap-6 pt-4 text-white/50 text-sm">
                  <span className="flex items-center gap-1.5">
                    <FaStar className="text-[#D9A441]" /> 4.8 Rating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaTruck className="text-[#F47A20]" /> Free Delivery
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaUtensils className="text-[#F47A20]" /> Halal Certified
                  </span>
                </div>
              </div>
              <div className="hidden lg:flex justify-center items-center relative">
                <div className="relative w-[420px] h-[420px]">
                  <img src="/media/butter-chicken.jpg" alt="Butter Chicken"
                    className="absolute top-0 right-0 w-64 h-64 object-cover rounded-3xl shadow-2xl border-4 border-white/20 animate-float z-20" />
                  <img src="/Biryani.jpg" alt="Biryani"
                    className="absolute bottom-0 left-0 w-56 h-56 object-cover rounded-3xl shadow-2xl border-4 border-white/20 animate-float z-10"
                    style={{ animationDelay: "1.5s" }} />
                  <img src="/Tandoori%20Chicken%20Tikka%20.jpg" alt="Tikka"
                    className="absolute top-32 left-20 w-48 h-48 object-cover rounded-3xl shadow-2xl border-4 border-white/20 animate-float z-0"
                    style={{ animationDelay: "2.5s" }} />
                  <div className="absolute bottom-10 right-10 glass rounded-2xl px-4 py-3 z-30">
                    <p className="text-white text-sm font-medium">🔥 Most Ordered</p>
                    <p className="text-[#D9A441] font-serif text-lg font-bold">Butter Chicken</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 z-10">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-5 h-8 rounded-full border-2 border-white/20 flex justify-center">
              <div className="w-1 h-2 rounded-full bg-[#F47A20] mt-1 animate-bounce" />
            </div>
          </div>
        </section>
      </div>

      {/* ============ MOBILE HERO ============ */}
      <section className="md:hidden relative pt-28 pb-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/media/home.jpg" alt="Spice Hut" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A100D]/90 via-[#1A100D]/75 to-[#1A100D]/60" />
        </div>
        <div className="relative z-10 px-5">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#F47A20] animate-pulse" />
            <span className="text-xs font-medium text-white/80">Serving 10+ Canadian locations</span>
          </div>
          <h1 className="font-serif text-3xl font-bold leading-[1.05] tracking-tight text-white mb-4">
            Authentic<span className="text-[#F47A20]"> Indian </span>
            <br />
            <span className="text-[#D9A441] italic">Cuisine</span>
          </h1>
          <p className="text-sm text-white/60 max-w-xs leading-relaxed mb-6">
            Rich flavors of East India. Handcrafted with imported spices and tradition.
          </p>
          <div className="flex flex-col gap-3 mb-6">
            <button onClick={() => navigate('/user/menu')} className="btn-primary w-full text-sm !py-3.5">
              Start Ordering
              <FaChevronRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => navigate('/user/menu')} className="btn-secondary w-full !border-white/30 !text-white hover:!bg-white hover:!text-[#2B1D17] text-sm !py-3.5">
              View Full Menu
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <span className="flex-shrink-0 flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-white/70 border border-white/10">
              <FaStar className="text-[#D9A441] w-3 h-3" /> 4.8 Rating
            </span>
            <span className="flex-shrink-0 flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-white/70 border border-white/10">
              <FaTruck className="text-[#F47A20] w-3 h-3" /> Free Delivery
            </span>
            <span className="flex-shrink-0 flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-white/70 border border-white/10">
              <FaUtensils className="text-[#F47A20] w-3 h-3" /> Halal Certified
            </span>
          </div>
        </div>
      </section>

      {/* ============ DESKTOP FEATURES BAR ============ */}
      <div className="hidden md:block">
        <section className="bg-[#2B1D17] text-white py-16">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuresData.map((f, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#F47A20]/20 to-[#D9A441]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="text-3xl text-[#F47A20]" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-white/60 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ============ MOBILE FEATURES ============ */}
      <section className="md:hidden bg-[#2B1D17] text-white py-8">
        <div className="px-5 flex flex-col divide-y divide-white/10">
          {featuresData.map((f, i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F47A20]/20 to-[#D9A441]/20 flex items-center justify-center flex-shrink-0">
                <f.icon className="text-xl text-[#F47A20]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm mb-0.5">{f.title}</h3>
                <p className="text-white/50 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ DESKTOP POPULAR DISHES ============ */}
      <div className="hidden md:block">
        <section className="bg-[#FFF8F1] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <span className="text-[#F47A20] font-semibold text-sm uppercase tracking-widest">Chef's Selections</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#2B1D17] mt-3 mb-4">Popular Dishes</h2>
              <div className="section-divider mx-auto mb-6" />
              <p className="text-[#2B1D17]/60 max-w-xl mx-auto">Our most loved creations, crafted with authenticity and passion</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularDishes.map((dish, i) => (
                <div key={i} className="card-premium overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/user/menu/${encodeURIComponent(dish.cat)}`)}>
                  <div className="relative overflow-hidden h-56">
                    <img src={dish.image} alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-xs font-semibold text-[#2B1D17] shadow-lg">
                      ${dish.price.toFixed(2)}
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-semibold uppercase ${spiceColors[dish.spice] || "bg-gray-500"}`}>
                        {dish.spice}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-bold text-[#2B1D17] mb-1">{dish.name}</h3>
                    <p className="text-[#2B1D17]/50 text-sm flex items-center gap-1">
                      <FaStar className="text-[#D9A441]" size={12} /> 4.8 · Chef's Pick
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ============ MOBILE POPULAR DISHES ============ */}
      <section className="md:hidden bg-[#FFF8F1] py-10">
        <div className="px-5">
          <div className="mb-6">
            <span className="text-[#F47A20] font-semibold text-xs uppercase tracking-widest">Chef's Selections</span>
            <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mt-1.5 mb-2">Popular Dishes</h2>
            <div className="section-divider" />
          </div>
          <p className="text-[#2B1D17]/40 text-xs mb-3 flex items-center gap-1.5">
            Swipe to explore <FaChevronRight className="w-3 h-3" />
          </p>
          <div className="snap-carousel">
            {popularDishes.map((dish, i) => (
              <div key={i}
                className="w-[150px] flex-shrink-0 card-premium overflow-hidden cursor-pointer"
                onClick={() => navigate(`/user/menu/${encodeURIComponent(dish.cat)}`)}>
                <div className="relative h-36 overflow-hidden">
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-0.5 text-[10px] font-semibold text-[#2B1D17] shadow">
                    ${dish.price.toFixed(2)}
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className={`text-[9px] text-white px-1.5 py-0.5 rounded-full font-semibold uppercase ${spiceColors[dish.spice] || "bg-gray-500"}`}>
                      {dish.spice}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-serif text-sm font-bold text-[#2B1D17] truncate">{dish.name}</h3>
                  <p className="text-[#2B1D17]/40 text-xs flex items-center gap-1 mt-0.5">
                    <FaStar className="text-[#D9A441]" size={10} /> 4.8
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DESKTOP CATEGORIES GRID ============ */}
      <div className="hidden md:block">
        <section className="bg-[#2B1D17] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Explore</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">Our Menu Categories</h2>
              <div className="section-divider mx-auto mb-6" />
              <p className="text-white/60 max-w-xl mx-auto">Discover our carefully curated selection of authentic dishes</p>
            </div>
            {loading ? (
              <div className="text-center text-white/60 py-12">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-center text-white/60 py-12">No categories available.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, i) => (
                  <div key={i} className="group cursor-pointer" onClick={() => navigate(`/user/menu/${encodeURIComponent(cat.slug || cat.name)}`)}>
                    <div className="card-premium !bg-white/5 !border !border-white/10 overflow-hidden hover:!border-[#F47A20]/30">
                      <div className="relative overflow-hidden h-52">
                        <img
                          src={cat.image ? resolveImageSrc(cat.image, "/home.jpg") : "/home.jpg"}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2B1D17] via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-serif text-xl font-bold text-white">{cat.name}</h3>
                          {cat.subCategory && (
                            <span className="text-xs text-white/60 mt-1 inline-block">{cat.subCategory}</span>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        {cat.description && (
                          <p className="text-white/50 text-sm leading-relaxed">{cat.description}</p>
                        )}
                        <button className="btn-secondary !border-[#F47A20] !text-white hover:!bg-[#F47A20] hover:!text-white w-full mt-4 text-sm">
                          Explore Menu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ============ MOBILE CATEGORIES ============ */}
      <section className="md:hidden bg-[#2B1D17] py-10">
        <div className="px-5">
          <div className="mb-6">
            <span className="text-[#D9A441] font-semibold text-xs uppercase tracking-widest">Explore</span>
            <h2 className="font-serif text-2xl font-bold text-white mt-1.5 mb-2">Our Menu Categories</h2>
            <div className="section-divider" />
          </div>
          {loading ? (
            <div className="text-center text-white/50 py-10 text-sm">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-white/50 py-10 text-sm">No categories available.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat, i) => (
                <div key={i} className="cursor-pointer"
                  onClick={() => navigate(`/user/menu/${encodeURIComponent(cat.slug || cat.name)}`)}>
                  <div className="card-premium !bg-white/8 !border !border-white/10 overflow-hidden hover:!border-[#F47A20]/30">
                    <div className="relative h-24 overflow-hidden">
                      <img
                        src={cat.image ? resolveImageSrc(cat.image, "/home.jpg") : "/home.jpg"}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2B1D17]/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="font-serif text-xs font-bold text-white leading-tight">{cat.name}</h3>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <span className="text-[#D9A441] text-[10px] font-medium">Explore →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ DESKTOP TESTIMONIALS ============ */}
      <div className="hidden md:block">
        <section className="bg-[#FFF8F1] py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <span className="text-[#F47A20] font-semibold text-sm uppercase tracking-widest">Testimonials</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#2B1D17] mt-3 mb-4">What Our Guests Say</h2>
              <div className="section-divider mx-auto mb-6" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="card-premium p-6 relative">
                  <FaQuoteRight className="text-[#F47A20]/15 text-4xl absolute top-4 right-4" />
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <FaStar key={j} className="text-[#D9A441]" size={14} />
                    ))}
                  </div>
                  <p className="text-[#2B1D17]/70 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F47A20] to-[#D9A441] flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2B1D17] text-sm">{t.name}</p>
                      <p className="text-[#2B1D17]/50 text-xs">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ============ MOBILE TESTIMONIALS ============ */}
      <section className="md:hidden bg-[#FFF8F1] py-10">
        <div className="px-5">
          <div className="mb-5">
            <span className="text-[#F47A20] font-semibold text-xs uppercase tracking-widest">Testimonials</span>
            <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mt-1.5 mb-2">What Our Guests Say</h2>
            <div className="section-divider" />
          </div>
          <div className="snap-carousel" ref={testimonialScrollRef}
            onScroll={() => {
              if (testimonialScrollRef.current) {
                const scrollLeft = testimonialScrollRef.current.scrollLeft;
                const cardWidth = testimonialScrollRef.current.firstChild?.offsetWidth || 300;
                const idx = Math.round(scrollLeft / (cardWidth + 12));
                setTestimonialScrollIdx(Math.min(idx, testimonials.length - 1));
              }
            }}>
            {testimonials.map((t, i) => (
              <div key={i} className="w-[85vw] max-w-[340px] flex-shrink-0 card-premium p-5 relative">
                <FaQuoteRight className="text-[#F47A20]/10 text-3xl absolute top-3 right-3" />
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <FaStar key={j} className="text-[#D9A441]" size={12} />
                  ))}
                </div>
                <p className="text-[#2B1D17]/60 text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F47A20] to-[#D9A441] flex items-center justify-center text-white font-bold text-xs">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2B1D17] text-sm">{t.name}</p>
                    <p className="text-[#2B1D17]/50 text-xs">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button key={i} aria-label={`Testimonial ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === testimonialScrollIdx ? 'bg-[#F47A20] w-5 h-2' : 'bg-[#2B1D17]/15 w-2 h-2'
                }`}
                onClick={() => {
                  if (testimonialScrollRef.current) {
                    const card = testimonialScrollRef.current.children[i];
                    card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
                  }
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION (responsive, no duplication) ============ */}
      <section className="relative py-16 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/media/home.jpg" alt="" className="w-full h-full object-cover brightness-[0.25]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <h2 className="font-serif text-2xl md:text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Experience <span className="text-[#F47A20]">Authentic</span> Indian Flavors?
          </h2>
          <p className="text-white/70 text-sm md:text-lg mb-6 md:mb-10 max-w-xl mx-auto">
            Join thousands of satisfied customers who trust us for their dining experience
          </p>
          <div className="flex flex-col md:flex-row md:flex-wrap md:justify-center gap-3 md:gap-4">
            <button onClick={() => navigate('/user/menu')} className="btn-primary w-full md:w-auto text-sm md:text-base px-10 py-4">
              Start Ordering
              <FaChevronRight size={16} />
            </button>
            <button onClick={() => navigate('/user/menu')} className="btn-secondary !border-white/40 !text-white hover:!bg-white hover:!text-[#2B1D17] w-full md:w-auto text-sm md:text-base px-10 py-4">
              View Full Menu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
