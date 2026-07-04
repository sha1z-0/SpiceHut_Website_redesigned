/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const CartContext = createContext();

const getCartKey = (userId) => (userId ? `cart_${userId}` : "cart_guest");
const getPointsKey = (userId) => (userId ? `loyalty_${userId}` : "loyalty_guest");
const BRANCH_KEY = "selectedBranch";

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(() => {
    try { const s = sessionStorage.getItem(BRANCH_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [prevUserId, setPrevUserId] = useState(null);

  // Load cart on mount and when user changes
  useEffect(() => {
    const userId = user?._id || null;
    const cartKey = getCartKey(userId);

    if (userId && prevUserId === null) {
      const guestCart = localStorage.getItem("cart_guest");
      if (guestCart) {
        try {
          const parsed = JSON.parse(guestCart);
          if (parsed.length > 0) {
            setCartItems(parsed);
            localStorage.setItem(cartKey, guestCart);
            localStorage.removeItem("cart_guest");
            setPrevUserId(userId);
            return;
          }
        } catch {}
      }
    }

    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try { setCartItems(JSON.parse(savedCart)); } catch { setCartItems([]); }
    } else {
      setCartItems([]);
    }

    if (userId) {
      const savedPoints = localStorage.getItem(getPointsKey(userId));
      if (savedPoints) { try { setLoyaltyPoints(parseInt(savedPoints, 10) || 0); } catch { setLoyaltyPoints(0); } }
    }

    setPrevUserId(userId);
  }, [user]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem(getCartKey(user?._id || null), JSON.stringify(cartItems));
  }, [cartItems, user]);

  // Persist loyalty
  useEffect(() => {
    if (user?._id) {
      localStorage.setItem(getPointsKey(user._id), loyaltyPoints.toString());
    }
  }, [loyaltyPoints, user]);

  // Persist selected branch to sessionStorage
  useEffect(() => {
    if (selectedBranch) {
      sessionStorage.setItem(BRANCH_KEY, JSON.stringify(selectedBranch));
    } else {
      sessionStorage.removeItem(BRANCH_KEY);
    }
  }, [selectedBranch]);

  const showToast = (message, ms = 1800) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), ms);
  };

  const addToCart = (dish, quantity = 1) => {
    setCartItems((prev) => {
      const dishSpice = (dish?.spiceLevel || "").toString();
      const existing = prev.find(
        (item) => item.name === dish.name && item.category === dish.category && (item.spiceLevel || "").toString() === dishSpice
      );
      if (existing) {
        return prev.map((item) =>
          (item.name === dish.name && item.category === dish.category && (item.spiceLevel || "").toString() === dishSpice)
            ? { ...item, quantity: existing.quantity + quantity } : item
        );
      }
      return [...prev, { ...dish, quantity }];
    });
    showToast(`${dish.name} added to cart`);
  };

  const removeFromCart = (name, category, spiceLevel = "") => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.name === name && item.category === category && (item.spiceLevel || "").toString() === (spiceLevel || "").toString()))
    );
  };

  const updateQuantity = (name, category, quantity, spiceLevel = "") => {
    setCartItems((prev) =>
      prev.map((item) =>
        (item.name === name && item.category === category && (item.spiceLevel || "").toString() === (spiceLevel || "").toString())
          ? { ...item, quantity } : item
      )
    );
  };

  const emptyCart = () => setCartItems([]);

  const addLoyaltyPoints = (amount) => { setLoyaltyPoints((prev) => prev + Math.floor(amount / 10) * 5); };
  const useLoyaltyDiscount = () => { if (loyaltyPoints >= 100) { setLoyaltyPoints((prev) => prev - 100); return 1; } return 0; };
  const applyInstantRedemption = () => 0;

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, emptyCart,
      loyaltyPoints, addLoyaltyPoints, useLoyaltyDiscount, setLoyaltyPoints,
      toast, showToast, applyInstantRedemption,
      selectedBranch, setSelectedBranch,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

