const normalize = (value) =>
  (value || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const CATEGORY_ORDER = [
  "Appetizers",
  "Butter Dishes",
  "Korma Dishes",
  "Curry Dishes",
  "Masala Dishes",
  "Coconut Curry Dishes",
  "Tandoori Dishes",
  "Biryani Dishes",
  "Karahi Dishes",
  "Vindaloo Dishes",
  "Jalfrezi Dishes",
  "Palak Dishes",
  "Mango Curry Dishes",
  "Vegetable Dishes",
  "Indian Naan Bread",
  "Salads & Sides",
  "Spice Hut Combo Specials",
  "Indian Desserts",
];

const CATEGORY_ALIAS = {
  "salads": "salads & sides",
  "salads & sides": "salads & sides",
  "indian desserts": "indian desserts",
  "indian deserts": "indian desserts",
  "spice hut combo specials": "spice hut combo specials",
  "spice hut special combo": "spice hut combo specials",
};

const CATEGORY_ORDER_INDEX = new Map();
CATEGORY_ORDER.forEach((name, index) => {
  CATEGORY_ORDER_INDEX.set(normalize(name), index);
});

const ITEM_ORDER_BY_CATEGORY = {
  "appetizers": [
    "Poppadums",
    "Vegetable Samosa",
    "Chicken Samosa",
    "Veggie Pakora",
    "Beef Samosa",
    "Paneer Pakora",
    "Chicken Pakora",
    "Fish Pakora",
    "Prawn Pakora",
  ],
  "butter dishes": [
    "Butter Chicken",
    "Butter Beef",
    "Butter Lamb",
    "Butter Prawns",
  ],
  "korma dishes": [
    "Chicken Korma",
    "Beef Korma",
    "Lamb Korma",
    "Prawn Korma",
  ],
  "curry dishes": [
    "Chicken Curry",
    "Beef Curry",
    "Lamb Curry",
    "Fish Curry",
    "Prawn Curry",
  ],
  "masala dishes": [
    "Chicken Masala",
    "Beef Masala",
    "Lamb Masala",
    "Prawn Masala",
  ],
  "coconut curry dishes": [
    "Coconut Curry",
    "Coconut Chicken Curry",
    "Coconut Beef Curry",
    "Coconut Lamb Curry",
    "Coconut Prawn Curry",
  ],
  "tandoori dishes": [
    "Tandoori Beef Kebab",
    "Tandoori Chicken (Boneless)",
    "Tandoori Chicken Tikka (Boneless)",
    "Tandoori Malai Tikka (Boneless)",
    "Tandoori Mint Chicken Tikka (Boneless)",
    "Tandoori Fish Tikka",
    "Tandoori Prawn Tikka",
    "Tandoori Mix Platter",
  ],
  "biryani dishes": [
    "Saffron Basmati Rice",
    "Chicken Biryani",
    "Vegetable Biryani",
    "Beef Biryani",
    "Lamb Biryani",
    "Prawn Biryani",
  ],
  "karahi dishes": [
    "Chicken Karahi",
    "Beef Karahi",
    "Lamb Karahi",
    "Prawn Karahi",
  ],
  "vindaloo dishes": [
    "Chicken Vindaloo",
    "Beef Vindaloo",
    "Lamb Vindaloo",
    "Prawn Vindaloo",
  ],
  "jalfrezi dishes": [
    "Chicken Jalfrezi",
    "Beef Jalfrezi",
    "Lamb Jalfrezi",
    "Prawn Jalfrezi",
  ],
  "palak dishes": [
    "Palak Chicken",
    "Palak Beef",
    "Palak Lamb",
    "Palak Prawn",
  ],
  "mango curry dishes": [
    "Mango Chicken Curry",
    "Mango Beef Curry",
    "Mango Lamb Curry",
    "Mango Fish Curry",
    "Mango Prawn Curry",
  ],
  "vegetable dishes": [
    "Butter Sauce",
    "Malai Kofta",
    "Bhindi Masala",
    "Butter Veggie",
    "Chana Masala",
    "Dal",
    "Dal Makhani",
    "Eggplant Bharta",
    "Vegetable Jalfrezi",
    "Veggie Korma",
    "Karahi Paneer",
    "Matar Paneer",
    "Palak Paneer",
    "Shahi Paneer",
  ],
  "indian naan bread": [
    "Roti",
    "Traditional Naan",
    "Garlic Naan",
    "Veggie Stuffed Naan",
    "Coconut Naan",
    "Chicken Keema Naan",
    "Beef Keema Naan",
  ],
  "salads & sides": [
    "Chali Mixed Pickles",
    "Mango Chutney",
    "Raita",
    "Spicy Salad",
  ],
  "spice hut combo specials": [
    "Biryani Combo",
    "Butter Chicken Combo",
    "Beef Combo",
    "Lamb Combo",
    "Prawn Combo",
  ],
  "indian desserts": [
    "Gulab Jamun",
    "Kheer",
    "Kulfi",
    "Rasmalai",
  ],
};

const ITEM_ORDER_INDEX = Object.entries(ITEM_ORDER_BY_CATEGORY).reduce(
  (acc, [categoryKey, items]) => {
    const map = new Map();
    items.forEach((name, index) => {
      map.set(normalize(name), index);
    });
    acc[categoryKey] = map;
    return acc;
  },
  {}
);

const resolveCategoryKey = (name) => {
  const normalized = normalize(name);
  return CATEGORY_ALIAS[normalized] || normalized;
};

const getCategoryOrderIndex = (name) => {
  const key = resolveCategoryKey(name);
  if (CATEGORY_ORDER_INDEX.has(key)) return CATEGORY_ORDER_INDEX.get(key);
  return Number.MAX_SAFE_INTEGER;
};

const getItemOrderIndex = (categoryName, itemName) => {
  const categoryKey = resolveCategoryKey(categoryName);
  const categoryMap = ITEM_ORDER_INDEX[categoryKey];
  if (!categoryMap) return Number.MAX_SAFE_INTEGER;
  const itemKey = normalize(itemName);
  if (categoryMap.has(itemKey)) return categoryMap.get(itemKey);
  return Number.MAX_SAFE_INTEGER;
};

const sortCategories = (categories) => {
  return (categories || [])
    .map((category, index) => ({
      category,
      orderIndex: getCategoryOrderIndex(category.name),
      originalIndex: index,
    }))
    .sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return a.originalIndex - b.originalIndex;
    })
    .map((entry) => entry.category);
};

const sortMenuItemsForCategory = (items, categoryName) => {
  return (items || [])
    .map((item, index) => ({
      item,
      orderIndex: getItemOrderIndex(categoryName, item.name),
      originalIndex: index,
    }))
    .sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return a.originalIndex - b.originalIndex;
    })
    .map((entry) => entry.item);
};

const sortMenuItems = (items) => {
  return (items || [])
    .map((item, index) => ({
      item,
      categoryOrderIndex: getCategoryOrderIndex(item.category),
      itemOrderIndex: getItemOrderIndex(item.category, item.name),
      originalIndex: index,
    }))
    .sort((a, b) => {
      if (a.categoryOrderIndex !== b.categoryOrderIndex)
        return a.categoryOrderIndex - b.categoryOrderIndex;
      if (a.itemOrderIndex !== b.itemOrderIndex)
        return a.itemOrderIndex - b.itemOrderIndex;
      return a.originalIndex - b.originalIndex;
    })
    .map((entry) => entry.item);
};

module.exports = {
  resolveCategoryKey,
  sortCategories,
  sortMenuItems,
  sortMenuItemsForCategory,
};
