export default function Toast({ visible, message }) {
  return (
    <div aria-live="polite" className="fixed inset-0 flex items-end justify-center pointer-events-none z-50 px-4 pb-8">
      <div className={`max-w-sm w-full bg-[#2B1D17] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 pointer-events-auto ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}>
        <div className="w-2 h-2 rounded-full bg-[#F47A20] flex-shrink-0 animate-pulse" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
