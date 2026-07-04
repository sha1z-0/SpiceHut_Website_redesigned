import React, { useState, useEffect } from 'react';
import { contentAPI } from '../../services/api';

export default function Policies() {
  const [policies, setPolicies] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const data = await contentAPI.getContent(); setPolicies(data?.policies || null); }
      catch (err) { setPolicies(null); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#2B1D17]/60">Loading...</div>;
  if (!policies) return <div className="min-h-screen flex items-center justify-center text-[#2B1D17]/60">Policies not available.</div>;

  const items = [
    { key: 'privacyPolicy', icon: '🔒', data: policies.privacyPolicy },
    { key: 'termsOfService', icon: '📋', data: policies.termsOfService },
    { key: 'refundPolicy', icon: '↩️', data: policies.refundPolicy },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F1]">
      <section className="relative bg-[#2B1D17] pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Legal</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">Policies</h1>
          <p className="text-white/70 text-lg">Our policies ensure a safe and enjoyable experience.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {items.map(({ key, icon, data }) => (
            <div key={key} className="card-premium p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F47A20]/10 flex items-center justify-center flex-shrink-0 text-2xl">{icon}</div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mb-4">{data.title}</h2>
                  <p className="text-[#2B1D17]/60 leading-relaxed">{data.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
