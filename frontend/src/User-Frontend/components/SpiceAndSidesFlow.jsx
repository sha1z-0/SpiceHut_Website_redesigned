import React, { useState, useEffect } from "react";
import Modal from "./Modal";

const PENDING_KEY = "pendingAddToCart";

const SPICE_LEVELS = [
  { label: "Mild", color: "bg-green-500", emoji: "🌱" },
  { label: "Mild Medium", color: "bg-yellow-500", emoji: "🌿" },
  { label: "Medium", color: "bg-orange-500", emoji: "🌶" },
  { label: "Medium Hot", color: "bg-red-400", emoji: "🌶🌶" },
  { label: "Hot", color: "bg-red-600", emoji: "🔥" },
  { label: "Extra Hot", color: "bg-red-800", emoji: "🔥🔥" },
];
const SIDES = [
  { name: "Traditional Naan", price: 3.95, desc: "Classic tandoor-baked bread" },
  { name: "Garlic Naan", price: 4.95, desc: "With fresh garlic & butter" },
  { name: "Saffron Basmati Rice", price: 5.95, desc: "Premium aromatic rice" },
  { name: "Mango Chutney", price: 4.95, desc: "Sweet & tangy complement" },
];

const EXCLUDED_CATEGORY_KEYWORDS = ["naan", "bread", "breads", "appetizer", "appetizers", "salad", "salads", "dessert", "desserts"];

const isSpiceEligible = (category) => {
  if (!category) return true;
  const normalized = category.toString().toLowerCase();
  return !EXCLUDED_CATEGORY_KEYWORDS.some((kw) => normalized.includes(kw));
};

const resolveCategoryName = (item) => {
  const raw = item?.category;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") return raw.name || raw.label || "";
  return item?.categoryName || item?.categoryLabel || "";
};

export const useSpiceAndSidesFlow = (addToCart, isAuthenticated, loginRedirect) => {
  const [pendingItem, setPendingItem] = useState(null);
  const [showSpiceModal, setShowSpiceModal] = useState(false);
  const [showSidesModal, setShowSidesModal] = useState(false);
  const [selectedSpice, setSelectedSpice] = useState("Medium");
  const [selectedSides, setSelectedSides] = useState({});

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(PENDING_KEY);
      if (pending && isAuthenticated) {
        const { item, quantity } = JSON.parse(pending);
        sessionStorage.removeItem(PENDING_KEY);
        if (item) {
          setTimeout(() => startFlow(item, quantity), 300);
        }
      }
    } catch { sessionStorage.removeItem(PENDING_KEY); }
  }, []);

  const resetFlow = () => {
    setPendingItem(null);
    setShowSpiceModal(false);
    setShowSidesModal(false);
    setSelectedSides({});
    setSelectedSpice("Medium");
  };

  const startFlow = (item, quantity = 1) => {
    if (!item) return;

    if (!isAuthenticated) {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ item, quantity }));
      loginRedirect();
      return;
    }

    const normalizedItem = {
      ...item,
      menuItemId: item.menuItemId || item._id || null,
      specialInstructions: item.specialInstructions || "",
    };
    const categoryName = resolveCategoryName(normalizedItem);
    if (categoryName) normalizedItem.category = categoryName;

    setPendingItem({ item: normalizedItem, quantity });

    if (isSpiceEligible(categoryName || normalizedItem.category)) {
      setSelectedSpice("Medium");
      setShowSpiceModal(true);
      return;
    }
    addToCart({ ...normalizedItem }, quantity);
    setShowSidesModal(true);
  };

  const handleConfirmSpice = () => {
    if (!pendingItem) return;
    addToCart({ ...pendingItem.item, spiceLevel: selectedSpice }, pendingItem.quantity);
    setShowSpiceModal(false);
    setShowSidesModal(true);
  };

  const toggleSide = (sideName) => {
    setSelectedSides((prev) => ({ ...prev, [sideName]: !prev[sideName] }));
  };

  const handleAddSides = () => {
    SIDES.forEach((side) => {
      if (selectedSides[side.name]) {
        addToCart({ name: side.name, price: side.price, category: "Sides", description: "Side", tags: [], menuItemId: null, specialInstructions: "" }, 1);
      }
    });
    resetFlow();
  };

  const spiceModal = (
    <Modal
      visible={showSpiceModal}
      title="Choose Spice Level"
      onClose={resetFlow}
      panelClassName="!max-w-sm"
    >
      <p className="text-[#2B1D17]/50 text-sm mb-5">
        Select the perfect spice level for your dish.
      </p>
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {SPICE_LEVELS.map((level) => (
          <button
            key={level.label}
            type="button"
            onClick={() => setSelectedSpice(level.label)}
            className={`flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 transition-all duration-200 ${
              selectedSpice === level.label
                ? "border-[#F47A20] bg-[#F47A20]/5 shadow-lg shadow-[#F47A20]/10"
                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
            }`}
            aria-pressed={selectedSpice === level.label}
          >
            <span className="text-2xl">{level.emoji}</span>
            <span className={`text-sm font-semibold ${selectedSpice === level.label ? "text-[#F47A20]" : "text-[#2B1D17]"}`}>{level.label}</span>
            <span className={`w-full h-1 rounded-full ${level.color}`} />
          </button>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={resetFlow} className="btn-secondary text-sm py-2.5 px-5">Skip</button>
        <button type="button" onClick={handleConfirmSpice} className="btn-primary text-sm py-2.5 px-6">Continue</button>
      </div>
    </Modal>
  );

  const sidesModal = (
    <Modal
      visible={showSidesModal}
      title="Add Sides"
      onClose={resetFlow}
      panelClassName="!max-w-sm"
    >
      <p className="text-[#2B1D17]/50 text-sm mb-5">
        Complete your meal with these popular sides.
      </p>
      <div className="space-y-3 mb-6">
        {SIDES.map((side) => (
          <button
            key={side.name}
            type="button"
            onClick={() => toggleSide(side.name)}
            className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
              selectedSides[side.name]
                ? "border-[#F47A20] bg-[#F47A20]/5 shadow-md shadow-[#F47A20]/10"
                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
            }`}
            aria-pressed={!!selectedSides[side.name]}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              selectedSides[side.name] ? "border-[#F47A20] bg-[#F47A20]" : "border-gray-300"
            }`}>
              {selectedSides[side.name] && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[#2B1D17] text-sm">{side.name}</div>
              <div className="text-[#2B1D17]/40 text-xs">{side.desc}</div>
            </div>
            <span className="font-bold text-[#F47A20] text-sm">${side.price.toFixed(2)}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={resetFlow} className="btn-secondary text-sm py-2.5 px-5">Skip</button>
        {Object.values(selectedSides).some(Boolean) && (
          <button type="button" onClick={handleAddSides} className="btn-primary text-sm py-2.5 px-6">
            Add Selected
          </button>
        )}
      </div>
    </Modal>
  );

  return { startFlow, spiceModal, sidesModal };
};
