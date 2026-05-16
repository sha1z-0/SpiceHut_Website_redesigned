import React, { useState } from "react";
import Modal from "./Modal";

const SPICE_LEVELS = [
  "Mild",
  "Mild Medium",
  "Medium",
  "Medium Hot",
  "Hot",
  "Extra Hot",
];
const SIDES = [
  { name: "Traditional Naan", price: 3.95 },
  { name: "Garlic Naan", price: 4.95 },
  { name: "Saffron Basmati Rice", price: 5.95 },
  { name: "Mango Chutney", price: 4.95 },
];

const EXCLUDED_CATEGORY_KEYWORDS = [
  "naan",
  "bread",
  "breads",
  "appetizer",
  "appetizers",
  "salad",
  "salads",
  "dessert",
  "desserts",
];

const isSpiceEligible = (category) => {
  if (!category) return true;
  const normalized = category.toString().toLowerCase();
  return !EXCLUDED_CATEGORY_KEYWORDS.some((keyword) =>
    normalized.includes(keyword)
  );
};

const resolveCategoryName = (item) => {
  const raw = item?.category;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") {
    return raw.name || raw.label || "";
  }
  return item?.categoryName || item?.categoryLabel || "";
};

export const useSpiceAndSidesFlow = (addToCart) => {
  const [pendingItem, setPendingItem] = useState(null);
  const [showSpiceModal, setShowSpiceModal] = useState(false);
  const [showSidesModal, setShowSidesModal] = useState(false);
  const [selectedSpice, setSelectedSpice] = useState("Medium");
  const [selectedSides, setSelectedSides] = useState({});

  const resetFlow = () => {
    setPendingItem(null);
    setShowSpiceModal(false);
    setShowSidesModal(false);
    setSelectedSides({});
    setSelectedSpice("Medium");
  };

  const startFlow = (item, quantity = 1) => {
    if (!item) return;
    const normalizedItem = {
      ...item,
      menuItemId: item.menuItemId || item._id || null,
      specialInstructions: item.specialInstructions || "",
    };
    const categoryName = resolveCategoryName(normalizedItem);
    if (categoryName) {
      normalizedItem.category = categoryName;
    }
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
    addToCart(
      { ...pendingItem.item, spiceLevel: selectedSpice },
      pendingItem.quantity
    );
    setShowSpiceModal(false);
    setShowSidesModal(true);
  };

  const handleCancelSpice = () => {
    resetFlow();
  };

  const toggleSide = (sideName) => {
    setSelectedSides((prev) => ({
      ...prev,
      [sideName]: !prev[sideName],
    }));
  };

  const handleAddSides = () => {
    SIDES.forEach((side) => {
      if (selectedSides[side.name]) {
        addToCart(
          {
            name: side.name,
            price: side.price,
            category: "Sides",
            description: "Side",
            tags: [],
            menuItemId: null,
            specialInstructions: "",
          },
          1
        );
      }
    });

    resetFlow();
  };

  const handleSkipSides = () => {
    resetFlow();
  };

  const spiceModal = (
    <Modal
      visible={showSpiceModal}
      title="Choose Spice Level"
      onClose={handleCancelSpice}
      panelClassName="bg-gradient-to-br from-[#FF6A00] via-[#FF7A1A] to-[#FF9A3C] text-white border border-white/20 rounded-2xl shadow-2xl"
      titleClassName="text-white text-xl"
      contentClassName="text-white"
      closeClassName="text-white/80 hover:text-white"
      overlayClassName="bg-black/20"
    >
      <div className="space-y-5">
        <p className="text-sm text-white/90">
          Select the spice level for this dish.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {SPICE_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedSpice(level)}
              className={`px-3 py-2 rounded-full border text-sm font-semibold tracking-wide transition ${
                selectedSpice === level
                  ? "bg-[#4B0B0B] text-white border-[#FFB366] shadow-md"
                  : "bg-white/15 text-white border-white/40 hover:bg-white/25"
              }`}
              aria-pressed={selectedSpice === level}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/80">
          Skip for dishes where spice level is not applicable.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancelSpice}
            className="px-4 py-2 text-sm text-white/80 hover:text-white"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleConfirmSpice}
            className="px-5 py-2 text-sm bg-[#4B0B0B] text-white rounded-full hover:bg-[#3a0909]"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );

  const sidesModal = (
    <Modal
      visible={showSidesModal}
      title="Add Sides"
      onClose={handleSkipSides}
      panelClassName="bg-gradient-to-br from-[#FF6A00] via-[#FF7A1A] to-[#FF9A3C] text-white border border-white/20 rounded-2xl shadow-2xl"
      titleClassName="text-white text-xl"
      contentClassName="text-white"
      closeClassName="text-white/80 hover:text-white"
      overlayClassName="bg-black/20"
    >
      <div className="space-y-5">
        <p className="text-sm text-white/90">
          Choose any sides to add to your order.
        </p>
        <div className="space-y-3">
          {SIDES.map((side) => (
            <button
              key={side.name}
              type="button"
              onClick={() => toggleSide(side.name)}
              className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                selectedSides[side.name]
                  ? "bg-[#4B0B0B] border-[#FFB366] shadow-md"
                  : "bg-black/20 border-white/30 hover:bg-black/30"
              }`}
              aria-pressed={!!selectedSides[side.name]}
            >
              <div>
                <div className="text-sm font-semibold text-white">
                  {side.name}
                </div>
                <div className="text-xs text-white/70">
                  ${side.price.toFixed(2)}
                </div>
              </div>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                selectedSides[side.name]
                  ? "border-[#FFB366]"
                  : "border-white/60"
              }`}>
                <span className={`h-3 w-3 rounded-full transition ${
                  selectedSides[side.name]
                    ? "bg-[#FFB366]"
                    : "bg-transparent"
                }`} />
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSkipSides}
            className="px-4 py-2 text-sm text-white/80 hover:text-white"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleAddSides}
            className="px-5 py-2 text-sm bg-[#4B0B0B] text-white rounded-full hover:bg-[#3a0909]"
          >
            Add Selected
          </button>
        </div>
      </div>
    </Modal>
  );

  return { startFlow, spiceModal, sidesModal };
};
