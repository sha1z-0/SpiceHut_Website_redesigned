import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context.cart.jsx";
import { useAuth } from "../../contexts/AuthContext";
import { useSpiceAndSidesFlow } from "../components/SpiceAndSidesFlow";
import { menuAPI } from "../../services/api";
import { useState, useEffect } from "react";
import { FaStar, FaArrowLeft } from "react-icons/fa";

const spiceColors = { Mild: "bg-green-500", "Mild Medium": "bg-yellow-500", Medium: "bg-orange-500", "Medium Hot": "bg-red-400", Hot: "bg-red-600", "Extra Hot": "bg-red-800" };
const tagColors = { GF: "bg-green-600", LF: "bg-blue-600" };

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const loginRedirect = () => navigate(`/login?returnTo=${encodeURIComponent(location.pathname)}`);
  const { startFlow, spiceModal, sidesModal } = useSpiceAndSidesFlow(addToCart, isAuthenticated(), loginRedirect);
  const decodedCategory = decodeURIComponent(category);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemQuantities, setItemQuantities] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const serverItems = await menuAPI.getMenuByCategory(decodedCategory);
        setItems(Array.isArray(serverItems) ? serverItems : []);
      } catch (err) { console.warn("Failed to load items", err); setItems([]); }
      finally { setLoading(false); }
    })();
  }, [category]);

  const handleQuantityChange = (itemId, delta) => {
    setItemQuantities((prev) => ({ ...prev, [itemId]: Math.max(1, (prev[itemId] || 1) + delta) }));
  };

  const resolveImage = (img, dishName) => {
    if (img && typeof img === 'string') {
      if (/^https?:\/\//i.test(img)) return img;
      if (img.startsWith('/uploads')) return `localhost:5000/api${img}`;
      if (img.startsWith('uploads/')) return `localhost:5000/api/${img}`;
      if (/^[^\s/]+\.[a-z]{2,4}$/i.test(img)) return `localhost:5000/api/uploads/${img}`;
      if (img.startsWith('/')) return img;
    }
    return "/home.jpg";
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] flex flex-col">
      {/* Hero */}
      <section className="relative bg-[#2B1D17] pt-32 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate('/user/menu')} className="text-white/60 hover:text-white flex items-center gap-2 mb-6 transition-colors text-sm">
            <FaArrowLeft /> Back to Menu
          </button>
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Category</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3">
            {decodedCategory}
          </h1>
        </div>
      </section>

      {/* Items */}
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="text-center py-12 text-[#2B1D17]/60">Loading dishes...</div>
          ) : items.filter(i => i.status === "Available").length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#2B1D17]/60 text-lg">No menu items found for this category.</p>
              <button onClick={() => navigate('/user/menu')} className="btn-primary mt-6">Browse Full Menu</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.filter(i => i.status === "Available").map((dish) => (
                <div key={dish._id || dish.name} className="card-premium overflow-hidden group">
                  <div className="relative h-56 overflow-hidden">
                    <img src={resolveImage(dish.image, dish.name)} alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {dish.subCategory && (
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {dish.subCategory.split(",").map((tag) => tag.trim()).filter((t) => tagColors[t]).map((t) => (
                          <span key={t} className={`text-[10px] text-white px-2 py-0.5 rounded-full font-semibold ${tagColors[t]}`}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-sm font-bold text-[#2B1D17] shadow-lg">${dish.price.toFixed(2)}</div>
                    <div className="absolute bottom-3 left-3">
                      <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-[#2B1D17]">
                        <FaStar className="text-[#D9A441]" size={10} /> 4.8
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-bold text-[#2B1D17] mb-1">{dish.name}</h3>
                    {dish.description && (
                      <p className="text-[#2B1D17]/50 text-sm line-clamp-2 mb-4">{dish.description}</p>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">
                        <button onClick={(e) => { e.stopPropagation(); handleQuantityChange(dish._id, -1); }}
                          className="w-9 h-9 flex items-center justify-center text-[#2B1D17] hover:bg-gray-200 transition-colors font-medium">−</button>
                        <span className="px-3 font-semibold text-[#2B1D17] text-sm">{itemQuantities[dish._id] || 1}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleQuantityChange(dish._id, 1); }}
                          className="w-9 h-9 flex items-center justify-center text-[#2B1D17] hover:bg-gray-200 transition-colors font-medium">+</button>
                      </div>
                      <button onClick={() => startFlow({
                        menuItemId: dish._id, name: dish.name, price: dish.price,
                        category: decodedCategory,
                        tags: dish.subCategory ? dish.subCategory.split(",").map(t => t.trim()) : [],
                        description: dish.description,
                      }, itemQuantities[dish._id] || 1)}
                        className="btn-primary text-xs py-2.5 px-4 flex-shrink-0">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {spiceModal}{sidesModal}
    </div>
  );
};

export default CategoryPage;
