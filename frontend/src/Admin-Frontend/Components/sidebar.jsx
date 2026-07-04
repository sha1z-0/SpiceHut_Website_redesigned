import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiShoppingCart, FiSettings, FiUser, FiLogOut, FiX, FiBarChart, FiMapPin } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import LogoutButton from "../../components/LogoutButton";

const links = [
  { to: "/admin", label: "Dashboard", icon: <FiBarChart /> },
  { to: "/admin/menumanagement", label: "Menu", icon: <FiHome /> },
  { to: "/admin/orders", label: "Orders", icon: <FiShoppingCart /> },
  { to: "/admin/customers", label: "Customers", icon: <FiUsers /> },
  { to: "/admin/admins", label: "Admins", icon: <FiUser /> },
  { to: "/admin/branches", label: "Branches", icon: <FiMapPin /> },
  { to: "/admin/settings", label: "Content", icon: <FiSettings /> },
];

export default function Sidebar({ collapsed, open, setOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  const mobileSidebar = (
    <>
      <div className="fixed inset-0 bg-black/50 z-[90]" onClick={() => setOpen(false)} />
      <aside className="fixed top-0 left-0 h-full w-72 bg-[#2B1D17] text-white flex flex-col z-[100] shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F47A20] to-[#D9A441] flex items-center justify-center">
              <FiBarChart className="text-white" size={18} />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">Admin</span>
          </div>
          <button className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>
            <FiX size={22} />
          </button>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive(link.to)
                      ? "bg-[#F47A20] text-white shadow-lg shadow-[#F47A20]/20"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {React.cloneElement(link.icon, { size: 18 })}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <button onClick={() => navigate("/admin/profile")} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white transition-colors">
            <FiUser size={18} /> Profile
          </button>
          <LogoutButton className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors" />
        </div>
      </aside>
    </>
  );

  const desktopSidebar = (
    <aside className={`flex h-full bg-[#2B1D17] text-white flex-col shadow-xl transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}>
      <div className={`flex items-center p-5 border-b border-white/5 ${collapsed ? "justify-center" : "gap-3"}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F47A20] to-[#D9A441] flex items-center justify-center flex-shrink-0">
          <FiBarChart className="text-white" size={18} />
        </div>
        {!collapsed && <span className="font-serif text-xl font-bold tracking-tight">Admin</span>}
      </div>
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive(link.to)
                    ? "bg-[#F47A20] text-white shadow-lg shadow-[#F47A20]/20"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
                title={collapsed ? link.label : undefined}
              >
                {React.cloneElement(link.icon, { size: 18 })}
                {!collapsed && <span>{link.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 border-t border-white/5 flex flex-col gap-1">
        <button onClick={() => navigate("/admin/profile")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white transition-colors ${collapsed ? "justify-center" : ""}`}>
          <FiUser size={18} /> {!collapsed && "Profile"}
        </button>
        <LogoutButton className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors ${collapsed ? "justify-center" : ""}`} />
      </div>
    </aside>
  );

  return <>{isDesktop ? desktopSidebar : (open ? mobileSidebar : null)}</>;
}
