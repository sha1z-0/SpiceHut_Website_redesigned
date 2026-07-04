const { getOrderModel, DefaultOrder } = require('../models/Order');
const User = require('../models/User');
const Branch = require('../models/Branch');

// ---- Configuration ----
const MAX_DELIVERY_RADIUS_KM = 40;
const DEFAULT_DELIVERY_MINS = 40;
const DEFAULT_AUTO_REJECT_MINS = 15;

const ALLOWED_SPICE_LEVELS = [
  'Mild', 'Mild Medium', 'Medium', 'Medium Hot', 'Hot', 'Extra Hot',
];

// ---- Branch utilities ----

const normalizeLocation = (loc) => {
  if (!loc) return '';
  return loc.toString().trim().replace(/[^a-zA-Z0-9]+/g, ' ').split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
};

/**
 * Haversine distance in kilometres between two lat/lng pairs.
 * Zero-cost geometric calculation — no external APIs needed.
 */
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(6371 * c).toFixed(2);
};

/**
 * Validate delivery distance.
 * Returns { valid: true, distanceKm } or { valid: false, message, distanceKm }.
 */
const validateDeliveryDistance = (branchDoc, deliveryCoords) => {
  if (!branchDoc || typeof branchDoc.latitude !== 'number' || typeof branchDoc.longitude !== 'number') {
    return { valid: false, message: 'Selected branch has no coordinates configured.', distanceKm: 0 };
  }
  if (!deliveryCoords || typeof deliveryCoords.latitude !== 'number' || typeof deliveryCoords.longitude !== 'number') {
    // Pickup orders or orders without delivery coords — allow through
    return { valid: true, distanceKm: 0 };
  }
  const distanceKm = haversineDistanceKm(
    deliveryCoords.latitude, deliveryCoords.longitude,
    branchDoc.latitude, branchDoc.longitude
  );
  if (distanceKm > MAX_DELIVERY_RADIUS_KM) {
    return {
      valid: false,
      message: `Your delivery address is ${distanceKm} km away — outside the ${MAX_DELIVERY_RADIUS_KM} km delivery range of ${branchDoc.name || branchDoc.city}. Please select a closer branch or update your delivery address.`,
      distanceKm,
    };
  }
  return { valid: true, distanceKm };
};

// ---- Item helpers ----

const normalizeSpiceLevel = (value) => {
  if (!value) return '';
  const n = value.toString().trim().toLowerCase();
  if (n === 'mild') return 'Mild';
  if (n === 'mild medium' || n === 'mild-medium') return 'Mild Medium';
  if (n === 'medium') return 'Medium';
  if (n === 'medium hot' || n === 'medium-hot') return 'Medium Hot';
  if (n === 'hot') return 'Hot';
  if (n === 'extra hot' || n === 'extra-hot') return 'Extra Hot';
  return '';
};

const normalizeOrderItems = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    menuItemId: item?.menuItemId || item?._id || undefined,
    name: item?.name ? item.name.toString().trim() : '',
    price: Number(item?.price || 0),
    quantity: Number(item?.quantity || 1),
    specialInstructions: item?.specialInstructions ? item.specialInstructions.toString() : '',
    spiceLevel: normalizeSpiceLevel(item?.spiceLevel) || undefined,
  }));
};

const validateOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return { valid: false, message: 'Order items are required' };
  for (const item of items) {
    if (!item.name) return { valid: false, message: 'Each item must include a name' };
    if (Number.isNaN(item.price) || item.price < 0) return { valid: false, message: `Invalid price for item: ${item.name}` };
    if (Number.isNaN(item.quantity) || item.quantity <= 0) return { valid: false, message: `Invalid quantity for item: ${item.name}` };
    if (item.spiceLevel && !ALLOWED_SPICE_LEVELS.includes(item.spiceLevel)) return { valid: false, message: `Invalid spice level for item: ${item.name}` };
  }
  return { valid: true };
};

// ---- Order model helpers ----

const getAllOrderModels = async () => {
  const models = [DefaultOrder];
  try {
    const cities = await Branch.distinct('city');
    if (Array.isArray(cities)) {
      for (const c of cities) { if (c && c.toString().trim() !== '') models.push(getOrderModel(c)); }
    }
  } catch (e) { }
  return models;
};

const findOrderAcrossCollectionsById = async (id) => {
  const models = await getAllOrderModels();
  for (const m of models) {
    try { const found = await m.findById(id); if (found) return { order: found, model: m }; } catch { }
  }
  return { order: null };
};

const findOrderAcrossCollectionsByOrderId = async (orderId) => {
  const models = await getAllOrderModels();
  for (const m of models) {
    try { const found = await m.findOne({ orderId }); if (found) return { order: found, model: m }; } catch { }
  }
  return { order: null };
};

const generateOrderId = async () => `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// ====================================================================
// CREATE ORDER — explicit branchId required, no auto-resolution, 40km validation
// ====================================================================
const createOrder = async (req, res) => {
  try {
    const {
      userId: bodyUserId, customerId, items, deliveryLocation,
      orderType, paymentMethod, tax, deliveryFee, totalAmount, subtotal,
      pointsUsed = 0, specialInstructions, customerPhone, customerEmail,
      branchId: bodyBranchId, address, city, postalCode,
    } = req.body;

    const userId = bodyUserId || customerId;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    // 1. Validate branchId is provided
    if (!bodyBranchId) {
      return res.status(400).json({ message: 'Branch selection is required. Please select a branch before placing your order.' });
    }

    const branchDoc = await Branch.findById(bodyBranchId);
    if (!branchDoc) {
      return res.status(400).json({ message: 'Selected branch not found. Please choose a valid branch.' });
    }

    // 2. Validate items
    const normalizedItems = normalizeOrderItems(items);
    const itemsValidation = validateOrderItems(normalizedItems);
    if (!itemsValidation.valid) return res.status(400).json({ message: itemsValidation.message });

    // 3. Get user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPickup = orderType === 'pickup' || deliveryFee === null;
    const taxValue = Number(tax || 0);
    const deliveryFeeValue = isPickup ? null : Number(deliveryFee || 0);

    const computedSubtotal = normalizedItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

    let validatedPointsUsed = Math.max(0, Number(pointsUsed || 0));
    const availablePoints = user.loyaltyPoints || 0;
    if (validatedPointsUsed > availablePoints) validatedPointsUsed = availablePoints;
    validatedPointsUsed = Math.floor(validatedPointsUsed / 100) * 100;
    const discount = validatedPointsUsed / 100;
    const subtotalAfterDiscount = Math.max(0, +(computedSubtotal - discount).toFixed(2));
    const finalTotalAmount = +(subtotalAfterDiscount + taxValue + (deliveryFeeValue || 0)).toFixed(2);

    // 4. Resolve delivery coordinates from deliveryLocation ONLY — never fall back to device GPS
    const resolveCoords = (loc) => {
      if (!loc) return null;
      const lat = typeof loc.latitude !== 'undefined' ? Number(loc.latitude) : NaN;
      const lng = typeof loc.longitude !== 'undefined' ? Number(loc.longitude) : NaN;
      return Number.isFinite(lat) && Number.isFinite(lng) ? { latitude: lat, longitude: lng } : null;
    };

    const deliveryCoords = resolveCoords(deliveryLocation);

    // 5. Build delivery location
    let finalDeliveryLocation;
    if (isPickup) {
      finalDeliveryLocation = {
        latitude: branchDoc.latitude || null,
        longitude: branchDoc.longitude || null,
        address: branchDoc.fullAddress || '',
        city: branchDoc.city || '',
        postalCode: branchDoc.postalCode || '',
      };
    } else {
      finalDeliveryLocation = {
        latitude: deliveryCoords?.latitude ?? null,
        longitude: deliveryCoords?.longitude ?? null,
        address: deliveryLocation?.address || address || '',
        city: deliveryLocation?.city || city || '',
        postalCode: deliveryLocation?.postalCode || postalCode || '',
      };
    }

    // 6. Delivery distance validation (backend source of truth)
    let distanceKm = 0;
    if (!isPickup) {
      const distValidation = validateDeliveryDistance(branchDoc, deliveryCoords);
      if (!distValidation.valid) {
        return res.status(400).json({ message: distValidation.message });
      }
      distanceKm = distValidation.distanceKm;
    }

    // 7. Build order
    const branchLocation = {
      latitude: typeof branchDoc.latitude === 'number' ? branchDoc.latitude : null,
      longitude: typeof branchDoc.longitude === 'number' ? branchDoc.longitude : null,
      address: branchDoc.fullAddress || '',
    };

    const now = new Date();
    const estimatedDeliveryTime = new Date(now.getTime() + DEFAULT_DELIVERY_MINS * 60 * 1000);
    const autoRejectAt = new Date(now.getTime() + DEFAULT_AUTO_REJECT_MINS * 60 * 1000);

    const orderId = await generateOrderId();
    const chosenModel = getOrderModel(branchDoc.city || branchDoc.name || '');

    const order = await chosenModel.create({
      orderNumber: orderId,
      orderId,
      userId: user._id,
      customer: user._id,
      branchId: branchDoc._id,
      items: normalizedItems,
      deliveryLocation: finalDeliveryLocation,
      branchLocation,
      estimatedDistance: distanceKm,
      estimatedDriveTime: DEFAULT_DELIVERY_MINS,
      subtotal: +(computedSubtotal || 0).toFixed(2),
      tax: taxValue,
      deliveryFee: deliveryFeeValue,
      totalAmount: finalTotalAmount,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: 'PENDING',
      status: 'incoming',
      customerPhone: customerPhone || user.phone || '',
      customerEmail: customerEmail || user.email || '',
      specialInstructions: specialInstructions || '',
      estimatedDeliveryTime,
      autoRejectAt,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ====================================================================
// READ OPERATIONS (unchanged)
// ====================================================================

const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const models = await getAllOrderModels();
    const orderArrays = await Promise.all(models.map((m) => m.find().populate('userId', 'name email phone').lean().catch(() => [])));
    const allOrders = orderArrays.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ orders: allOrders.slice(skip, skip + limit), pagination: { total: allOrders.length, page, limit, pages: Math.ceil(allOrders.length / limit) } });
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

const getUserOrders = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'Not authorized' });
    const models = await getAllOrderModels();
    const orderArrays = await Promise.all(models.map((m) => m.find({ userId: req.user._id }).lean().sort({ createdAt: -1 }).catch(() => [])));
    res.json(orderArrays.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

const getOrderById = async (req, res) => {
  try {
    let result = await findOrderAcrossCollectionsById(req.params.id);
    let order = result.order;
    if (!order) { const r2 = await findOrderAcrossCollectionsByOrderId(req.params.id); order = r2.order; }
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.populate('userId', 'name email phone');
    res.json(order);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

const updateOrderStatus = async (req, res) => {
  try {
    const rawStatus = req.body.status;
    if (!rawStatus) return res.status(400).json({ message: 'Status is required' });
    const normalizedStatus = rawStatus.toString().trim().toLowerCase();
    if (!['incoming', 'accepted', 'rejected', 'completed'].includes(normalizedStatus)) return res.status(400).json({ message: `Invalid status: ${rawStatus}` });
    const { order } = await findOrderAcrossCollectionsById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = normalizedStatus;
    if (normalizedStatus === 'accepted' && !order.acceptedAt) order.acceptedAt = new Date();
    if (normalizedStatus === 'completed') {
      if (!order.completedAt) order.completedAt = new Date();
      order.paymentStatus = 'PAID';
      try {
        const user = await User.findById(order.userId);
        if (user) {
          const sub = typeof order.subtotal === 'number' ? order.subtotal : (order.items || []).reduce((a, i) => a + ((i.price || 0) * (i.quantity || 1)), 0);
          const t = typeof order.tax === 'number' ? order.tax : 0;
          const df = typeof order.deliveryFee === 'number' ? order.deliveryFee : 0;
          const tot = typeof order.totalAmount === 'number' ? order.totalAmount : +(sub + t + df).toFixed(2);
          const disc = Math.max(0, sub + t + df - tot);
          const ptsUsed = Math.max(0, Math.round(disc * 100));
          const ptsEarned = Math.floor(Math.max(0, sub - disc));
          user.loyaltyPoints = Math.max(0, (user.loyaltyPoints || 0) - ptsUsed) + ptsEarned;
          await user.save();
        }
      } catch (e) { }
    }
    await order.save();
    res.json(order);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

const updateOrder = async (req, res) => {
  try {
    const { order } = await findOrderAcrossCollectionsById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { items, deliveryLocation, specialInstructions, paymentMethod } = req.body;
    if (Array.isArray(items)) {
      const ni = normalizeOrderItems(items);
      const iv = validateOrderItems(ni);
      if (!iv.valid) return res.status(400).json({ message: iv.message });
      order.items = ni;
      order.subtotal = +(ni.reduce((a, i) => a + (i.price || 0) * (i.quantity || 1), 0) || 0).toFixed(2);
      order.totalAmount = +(order.subtotal + (order.tax || 0) + (order.deliveryFee || 0)).toFixed(2);
    }
    if (deliveryLocation && typeof deliveryLocation === 'object') {
      order.deliveryLocation = {
        latitude: typeof deliveryLocation.latitude === 'number' ? deliveryLocation.latitude : order.deliveryLocation?.latitude || null,
        longitude: typeof deliveryLocation.longitude === 'number' ? deliveryLocation.longitude : order.deliveryLocation?.longitude || null,
        address: deliveryLocation.address || order.deliveryLocation?.address || '',
        city: deliveryLocation.city || order.deliveryLocation?.city || '',
        postalCode: deliveryLocation.postalCode || order.deliveryLocation?.postalCode || '',
      };
    }
    if (typeof specialInstructions !== 'undefined') order.specialInstructions = specialInstructions || '';
    if (typeof paymentMethod !== 'undefined') order.paymentMethod = paymentMethod || order.paymentMethod;
    await order.save();
    res.json(order);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId) return res.status(400).json({ message: 'User ID is required' });
    const models = await getAllOrderModels();
    const arrays = await Promise.all(models.map((m) => m.find({ userId: customerId }).lean().sort({ createdAt: -1 }).catch(() => [])));
    res.json(arrays.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, getUserOrders, updateOrder, getOrdersByCustomer };
