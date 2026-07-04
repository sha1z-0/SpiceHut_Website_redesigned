import { FiMenu } from "react-icons/fi";
import { useLocation } from "react-router-dom";

export default function Navbar({ setSidebarCollapsed, setSidebarOpen }) {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/admin": return "Dashboard";
      case "/admin/menumanagement": return "Menu Management";
      case "/admin/customers": return "Customers";
      case "/admin/orders": return "Orders";
      case "/admin/reports": return "Reports";
      case "/admin/settings": return "Content Management";
      case "/admin/admins": return "Admins";
      case "/admin/branches": return "Branches";
      case "/admin/profile": return "Profile";
      default: return "Admin Panel";
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30">
      <div className="flex items-center px-5 py-3">
        <button className="hidden md:inline-flex text-[#2B1D17] p-2 rounded-xl hover:bg-[#FFF5EB] transition-colors mr-3"
          onClick={() => setSidebarCollapsed((prev) => !prev)} aria-label="Toggle sidebar">
          <FiMenu size={22} />
        </button>
        <button className="md:hidden text-[#2B1D17] p-2 rounded-xl hover:bg-[#FFF5EB] transition-colors mr-3"
          onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
          <FiMenu size={22} />
        </button>
        <h1 className="font-serif text-xl font-bold text-[#2B1D17]">{getPageTitle()}</h1>
      </div>
    </header>
  );
}
