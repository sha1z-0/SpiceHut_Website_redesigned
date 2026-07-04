import React, { useState, useEffect } from 'react';
import { contentAPI } from '../../services/api';

export default function AboutUs() {
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const data = await contentAPI.getContent(); if (data?.about) setAboutContent(data.about); else setAboutContent(null); }
      catch (err) { setAboutContent(null); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#2B1D17]/60">Loading...</div>;
  if (!aboutContent) return <div className="min-h-screen flex items-center justify-center text-[#2B1D17]/60">About content not available.</div>;

  return (
    <div className="min-h-screen bg-[#FFF8F1]">
      {/* Hero */}
      <section className="relative bg-[#2B1D17] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Our Story</span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-3 mb-6">{aboutContent.title}</h1>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-white/70 text-lg max-w-3xl mx-auto leading-relaxed">{aboutContent.content}</p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-premium p-8 group hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#F47A20]/10 flex items-center justify-center mb-6">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mb-4">Our Mission</h2>
            <p className="text-[#2B1D17]/60 leading-relaxed">{aboutContent.mission}</p>
          </div>
          <div className="card-premium p-8 group hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#F47A20]/10 flex items-center justify-center mb-6">
              <span className="text-2xl">👁️</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mb-4">Our Vision</h2>
            <p className="text-[#2B1D17]/60 leading-relaxed">{aboutContent.vision}</p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-[#2B1D17]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Journey</span>
          <h2 className="font-serif text-4xl font-bold text-white mt-3 mb-12">The Spice Hut Journey</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[{ year: "2018", title: "Founded", desc: "First location opened with a passion for authentic East Indian cuisine." },
              { year: "2021", title: "Expansion", desc: "Grew to multiple locations across BC and Alberta." },
              { year: "2025", title: "Innovation", desc: "Launched online ordering platform with free delivery across Canada." }
            ].map((m, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#F47A20] to-[#D9A441] flex items-center justify-center text-white font-serif text-xl font-bold">{m.year}</div>
                <h3 className="font-serif text-xl font-bold text-white mb-2">{m.title}</h3>
                <p className="text-white/50 text-sm">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
