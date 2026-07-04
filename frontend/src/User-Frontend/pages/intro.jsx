import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const videoSrc = '/media/intro.mp4';

export default function Intro() {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#1A100D] min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decor orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#F47A20]/5 blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-[#D9A441]/5 blur-3xl" />

      <video
        src={videoSrc}
        autoPlay muted loop playsInline
        className={`w-full h-auto max-h-screen object-contain sm:object-cover transition-opacity duration-1000 ${showButton ? "opacity-40" : "opacity-100"}`}
      />

      {/* Branding overlay */}
      <div className={`absolute top-8 left-1/2 -translate-x-1/2 transition-opacity duration-1000 ${showButton ? "opacity-100" : "opacity-0"}`}>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white text-center">
          Spice<span className="text-[#F47A20]">Hut</span>
        </h1>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate("/user/menu")}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          bg-[#F47A20] text-white font-bold text-sm sm:text-base md:text-lg
          px-8 py-4 sm:px-10 sm:py-4 rounded-full shadow-2xl shadow-[#F47A20]/30
          transition-all duration-1000 hover:bg-[#D96B1A] hover:shadow-[#F47A20]/50 hover:scale-105
          ${showButton ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        Start Ordering
      </button>
    </div>
  );
}
