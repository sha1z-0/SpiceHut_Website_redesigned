export default function StatsCard({ title, value, icon, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-[#F47A20] to-[#D96B1A]",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="card-premium p-6 flex flex-col items-center hover:-translate-y-1">
      <div className={`mb-4 w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
        <div className="text-xl">{icon}</div>
      </div>
      <h3 className="text-sm font-medium text-[#2B1D17]/50 mb-1">{title}</h3>
      <p className="font-serif text-2xl font-bold text-[#2B1D17]">{value}</p>
    </div>
  );
}
