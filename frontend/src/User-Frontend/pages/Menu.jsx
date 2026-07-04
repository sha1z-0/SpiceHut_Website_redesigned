import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { categoryAPI, menuAPI } from "../../services/api";
import { useCart } from "../context.cart";
import { useAuth } from "../../contexts/AuthContext";
import { useSpiceAndSidesFlow } from "../components/SpiceAndSidesFlow";
import { FaSearch, FaStar, FaFire, FaShoppingCart } from 'react-icons/fa';
import { resolveImageSrc } from '../../services/image';

const spiceColors = { Mild: "bg-green-500", "Mild Medium": "bg-yellow-500", Medium: "bg-orange-500", "Medium Hot": "bg-red-400", Hot: "bg-red-600", "Extra Hot": "bg-red-800" };
const tagColors = { GF: "bg-green-600", LF: "bg-blue-600" };

const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated } = useAuth();
  const loginRedirect = () => navigate(`/login?returnTo=${encodeURIComponent(location.pathname)}`);
  const { startFlow, spiceModal, sidesModal } = useSpiceAndSidesFlow(addToCart, isAuthenticated(), loginRedirect);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");
  const searchInputRef = useRef(null);

  const cartCount = cartItems.reduce((t, i) => t + (Number(i.quantity) || 0), 0);

  useEffect(() => {
    (async () => {
      try {
        const cats = await categoryAPI.getCategories();
        if (Array.isArray(cats) && cats.length) {
          setCategories(cats.map((c) => ({
            name: c.name, image: resolveImageSrc(c.image, '/home.jpg'),
            desc: c.description || "", slug: c.slug, subCategory: c.subCategory || "", _id: c._id,
          })));
        }
      } catch (err) { console.warn("Failed to load categories", err); }
    })();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) { setSearchResults(null); setIsSearching(false); return; }
      setIsSearching(true);
      try { const results = await menuAPI.searchMenu(searchQuery); setSearchResults(results); }
      catch (err) { setSearchResults({ categories: [], items: [] }); }
      finally { setIsSearching(false); }
    };
    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleQuantityChange = (itemId, delta) => {
    setItemQuantities((prev) => ({ ...prev, [itemId]: Math.max(1, (prev[itemId] || 1) + delta) }));
  };

  const displayCategories = searchResults ? (searchResults.categories || []) : categories;
  const displayItems = searchResults ? (searchResults.items || []).filter(i => i.status === "Available") : [];
  const getItemImage = (item) => resolveImageSrc(item?.image, '/home.jpg');
  const filteredCategories = activeCategory === "all" ? categories : categories.filter(c => (c.slug || c.name) === activeCategory);

  return (
    <div className="min-h-screen bg-[#FFF8F1] flex flex-col">
      {/* Hero */}
      <section className="relative bg-[#2B1D17] pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#D9A441] font-semibold text-sm uppercase tracking-widest">Discover</span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-3 mb-4">
            Explore Our <span className="text-[#F47A20]">Menu</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Select a category or search to discover our delicious offerings
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search dishes, categories..." ref={searchInputRef}
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl text-[#2B1D17] placeholder:text-gray-400 text-lg focus:outline-none focus:ring-4 focus:ring-[#F47A20]/20 shadow-card transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            )}
            {isSearching && (
              <div className="absolute right-14 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#F47A20]" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide -mx-2 px-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeCategory === "all"
                    ? "bg-[#F47A20] text-white shadow-lg shadow-[#F47A20]/20"
                    : "bg-gray-100 text-[#2B1D17]/70 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button key={cat._id || cat.name}
                  onClick={() => setActiveCategory(cat.slug || cat.name)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeCategory === (cat.slug || cat.name)
                      ? "bg-[#F47A20] text-white shadow-lg shadow-[#F47A20]/20"
                      : "bg-gray-100 text-[#2B1D17]/70 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Search Results */}
          {searchResults && searchQuery.trim() ? (
            <div className="space-y-12">
              {displayCategories.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mb-6">Categories</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {displayCategories.map((cat) => (
                      <div key={cat._id || cat.name} onClick={() => navigate(`/user/menu/${encodeURIComponent(cat.slug || cat.name)}`)}
                        className="card-premium overflow-hidden cursor-pointer group">
                        <div className="h-40 overflow-hidden">
                          <img src={cat.image || "/home.jpg"} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-serif font-bold text-[#2B1D17]">{cat.name}</h3>
                          {cat.subCategory && (
                            <span className="text-xs text-[#2B1D17]/50 mt-1">{cat.subCategory}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {displayItems.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#2B1D17] mb-6">Dishes</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayItems.map((item) => (
                      <DishCard key={item._id} item={item} itemQuantities={itemQuantities}
                        handleQuantityChange={handleQuantityChange} startFlow={startFlow}
                        getItemImage={getItemImage} />
                    ))}
                  </div>
                </div>
              )}

              {displayCategories.length === 0 && displayItems.length === 0 && !isSearching && (
                <p className="text-center text-[#2B1D17]/60 py-12">No results found for "{searchQuery}"</p>
              )}
            </div>
          ) : (
            /* Categories Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((cat) => (
                <div key={cat._id || cat.name} onClick={() => navigate(`/user/menu/${encodeURIComponent(cat.slug || cat.name)}`)}
                  className="card-premium overflow-hidden cursor-pointer group">
                  <div className="relative h-52 overflow-hidden">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-serif text-xl font-bold text-white">{cat.name}</h3>
                      {cat.subCategory && (
                        <div className="flex gap-1 mt-1.5">
                          {cat.subCategory.split(",").map((tag) => tag.trim()).filter((t) => tagColors[t]).map((t) => (
                            <span key={t} className={`text-[10px] text-white px-2 py-0.5 rounded-full font-semibold ${tagColors[t]}`}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    {cat.desc && <p className="text-[#2B1D17]/60 text-sm line-clamp-2">{cat.desc}</p>}
                    <button className="btn-secondary w-full mt-4 text-sm py-2.5">Explore Menu</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Mobile Cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50 lg:hidden">
          <button onClick={() => navigate('/user/cart')}
            className="w-full bg-[#F47A20] text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-2xl shadow-[#F47A20]/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaShoppingCart className="text-xl" />
                <span className="absolute -top-2 -right-2 bg-white text-[#F47A20] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartCount}</span>
              </div>
              <span className="font-semibold">View Cart</span>
            </div>
            <span className="font-bold">${cartItems.reduce((t, i) => t + i.price * i.quantity, 0).toFixed(2)}</span>
          </button>
        </div>
      )}

      {spiceModal}{sidesModal}
    </div>
  );
};

/* Dish Card Component */
function DishCard({ item, itemQuantities, handleQuantityChange, startFlow, getItemImage }) {
  return (
    <div className="card-premium overflow-hidden group">
      <div className="relative h-52 overflow-hidden">
        <img src={getItemImage(item)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {item.subCategory && item.subCategory.split(",").map((tag) => tag.trim()).filter((t) => tagColors[t]).map((t) => (
            <span key={t} className={`text-[10px] text-white px-2 py-0.5 rounded-full font-semibold ${tagColors[t]}`}>{t}</span>
          ))}
        </div>
        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-sm font-bold text-[#2B1D17] shadow-lg">
          ${item.price.toFixed(2)}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-bold text-[#2B1D17] mb-1">{item.name}</h3>
        {item.description && (
          <p className="text-[#2B1D17]/50 text-sm line-clamp-2 mb-4">{item.description}</p>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">
            <button onClick={(e) => { e.stopPropagation(); handleQuantityChange(item._id, -1); }}
              className="w-9 h-9 flex items-center justify-center text-[#2B1D17] hover:bg-gray-200 transition-colors font-medium">−</button>
            <span className="px-3 font-semibold text-[#2B1D17] text-sm">{itemQuantities[item._id] || 1}</span>
            <button onClick={(e) => { e.stopPropagation(); handleQuantityChange(item._id, 1); }}
              className="w-9 h-9 flex items-center justify-center text-[#2B1D17] hover:bg-gray-200 transition-colors font-medium">+</button>
          </div>
          <button onClick={(e) => { e.stopPropagation(); startFlow(item, itemQuantities[item._id] || 1); }}
            className="btn-primary text-xs py-2.5 px-4 flex-shrink-0">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;
