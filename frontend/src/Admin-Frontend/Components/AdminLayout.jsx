import { useState } from "react";
import Sidebar from "../Components/sidebar";
import Navbar from "../Components/navbar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF8F1] flex font-sans">
      <div className="sticky top-0 h-screen z-40">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar setSidebarCollapsed={setSidebarCollapsed} sidebarCollapsed={sidebarCollapsed} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
