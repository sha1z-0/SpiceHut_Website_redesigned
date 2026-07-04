import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatsCard from "../Components/statscard";
import { FiShoppingCart, FiDollarSign, FiUsers, FiPackage } from "react-icons/fi";
import { orderAPI, adminAPI } from "../../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await adminAPI.getStats();
        setStats([
          { title: 'Total Orders', value: dashboardStats.totalOrders.toString(), icon: <FiShoppingCart />, color: 'blue' },
          { title: 'Total Revenue', value: `$${dashboardStats.totalRevenue.toFixed(2)}`, icon: <FiDollarSign />, color: 'green' },
          { title: 'Total Customers', value: dashboardStats.totalCustomers.toString(), icon: <FiUsers />, color: 'purple' },
          { title: 'Menu Items', value: dashboardStats.totalItems.toString(), icon: <FiPackage />, color: 'orange' },
        ]);
        const ordersData = await orderAPI.getOrders({ page: 1, limit: 5 });
        setRecentOrders(ordersData.orders || []);
      } catch (err) { console.error('Failed to load dashboard stats', err); }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2B1D17] mb-2">Dashboard</h1>
        <p className="text-[#2B1D17]/50">Here's an overview of your restaurant's performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, index) => (
          <StatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium p-6">
          <h2 className="font-serif text-xl font-bold text-[#2B1D17] mb-5">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-[#FFF5EB] rounded-2xl">
                <div>
                  <p className="font-semibold text-[#2B1D17] text-sm">{order.orderId || `Order #${order._id}`}</p>
                  <p className="text-xs text-[#2B1D17]/50">{(order.items || []).length} items • ${(order.totalAmount || 0).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#2B1D17]/40">{new Date(order.createdAt).toLocaleString()}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-[#F47A20]/10 text-[#F47A20]'
                  }`}>{order.status || 'incoming'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-premium p-6">
          <h2 className="font-serif text-xl font-bold text-[#2B1D17] mb-5">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => navigate('/admin/menumanagement')}
              className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex flex-col items-center gap-2">
              <FiPackage size={24} /> <span className="font-semibold text-xs">Add Item</span>
            </button>
            <button onClick={() => navigate('/admin/customers')}
              className="p-5 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex flex-col items-center gap-2">
              <FiUsers size={24} /> <span className="font-semibold text-xs">Customers</span>
            </button>
            <button onClick={() => navigate('/admin/orders')}
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex flex-col items-center gap-2">
              <FiShoppingCart size={24} /> <span className="font-semibold text-xs">Orders</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
