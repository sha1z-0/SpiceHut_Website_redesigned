const { getOrderModel, DefaultOrder } = require('../models/Order');
const User = require('../models/User');
const Branch = require('../models/Branch');
const https = require('https');
const { URL } = require('url');

// Find nearest branch by coordinates using Google Distance Matrix API
async function findNearestBranchByCoords(lat, lng) {
  // get branches with coordinates
  const branches = await Branch.find({ latitude: { $ne: null }, longitude: { $ne: null } });
  if (!branches || branches.length === 0) return null;

  // build destinations string: lat,lng|lat2,lng2
  const destinations = branches.map(b => `${b.latitude},${b.longitude}`).join('|');
  const origins = `${lat},${lng}`;

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_MAPS_API_KEY not configured');

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
  url.searchParams.set('origins', origins);
  url.searchParams.set('destinations', destinations);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('units', 'metric');

  // perform GET
  const data = await new Promise((resolve, reject) => {
    https.get(url.toString(), (resp) => {
      let raw = '';
      resp.on('data', (chunk) => { raw += chunk; });
      resp.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          resolve(parsed);
        } catch (e) { reject(e); }
      });
    }).on('error', (err) => reject(err));
  });

  if (!data || !data.rows || !Array.isArray(data.rows) || data.rows.length === 0) return null;
  const elements = data.rows[0].elements || [];
  // find smallest distance value among OK elements
  let minIndex = -1;
  let minDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!el || el.status !== 'OK') continue;
    const dist = typeof el.distance?.value === 'number' ? el.distance.value : Number.POSITIVE_INFINITY;
    if (dist < minDistance) { minDistance = dist; minIndex = i; }
  }
  if (minIndex === -1) return null;

  const selected = branches[minIndex] || null;
  const element = elements[minIndex] || null;
  const distanceKm = element && element.distance && typeof element.distance.value === 'number'
    ? +(element.distance.value / 1000).toFixed(2)
    : 0;
  const driveTimeMins = element && element.duration && typeof element.duration.value === 'number'
    ? Math.round(element.duration.value / 60)
    : 0;

  return {
    branch: selected,
    distanceKm,
    driveTimeMins,
  };
}

const normalizeLocation = (loc) => {
  if (!loc) return '';
  return loc.toString().trim().replace(/[^a-zA-Z0-9]+/g, ' ').split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
};

// Try to parse an address string like "123 Some St, Tofino, v9wq" into components
const tryParseAddress = (raw) => {
  if (!raw || typeof raw !== 'string') return { address: raw || '', city: '', postalCode: '' };
  const parts = raw.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const postal = parts[parts.length - 1];
    const cityPart = parts[parts.length - 2];
    const addrPart = parts.slice(0, parts.length - 2).join(', ');
    return { address: addrPart, city: cityPart, postalCode: postal };
  }
  if (parts.length === 2) {
    return { address: parts[0], city: parts[1], postalCode: '' };
  }
  return { address: parts[0] || '', city: '', postalCode: '' };
};

// Normalize address string for comparison: lowercase, remove punctuation and excess spaces
const normalizeAddrForCompare = (s) => {
  if (!s || typeof s !== 'string') return '';
  return s.toString().trim().toLowerCase().replace(/[.,#\-]/g, '').replace(/\s+/g, ' ');
};

const DEFAULT_DELIVERY_MINS = 40;
const DEFAULT_AUTO_REJECT_MINS = 15;

const ALLOWED_SPICE_LEVELS = [
  'Mild',
  'Mild Medium',
  'Medium',
  'Medium Hot',
  'Hot',
  'Extra Hot',
];

const normalizeSpiceLevel = (value) => {
  if (!value) return '';
  const normalized = value.toString().trim().toLowerCase();
  if (normalized === 'mild') return 'Mild';
  if (normalized === 'mild medium' || normalized === 'mild-medium') return 'Mild Medium';
  if (normalized === 'medium') return 'Medium';
  if (normalized === 'medium hot' || normalized === 'medium-hot') return 'Medium Hot';
  if (normalized === 'hot') return 'Hot';
  if (normalized === 'extra hot' || normalized === 'extra-hot') return 'Extra Hot';
  return '';
};

const normalizeOrderItems = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const spiceLevel = normalizeSpiceLevel(item?.spiceLevel);
    return {
      menuItemId: item?.menuItemId || item?._id || undefined,
      name: item?.name ? item.name.toString().trim() : '',
      price: Number(item?.price || 0),
      quantity: Number(item?.quantity || 1),
      specialInstructions: item?.specialInstructions ? item.specialInstructions.toString() : '',
      spiceLevel: spiceLevel || undefined,
    };
  });
};

const validateOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, message: 'Order items are required' };
  }
  for (const item of items) {
    if (!item.name) {
      return { valid: false, message: 'Each item must include a name' };
    }
    if (Number.isNaN(item.price) || item.price < 0) {
      return { valid: false, message: `Invalid price for item: ${item.name}` };
    }
    if (Number.isNaN(item.quantity) || item.quantity <= 0) {
      return { valid: false, message: `Invalid quantity for item: ${item.name}` };
    }
    if (item.spiceLevel && !ALLOWED_SPICE_LEVELS.includes(item.spiceLevel)) {
      return { valid: false, message: `Invalid spice level for item: ${item.name}` };
    }
  }
  return { valid: true };
};

// return array of models (default + branch-specific) by reading branch cities from DB
const getAllOrderModels = async () => {
  const models = [DefaultOrder];
  try {
    const cities = await Branch.distinct('city');
    if (Array.isArray(cities)) {
      for (const c of cities) {
        if (c && c.toString().trim() !== '') models.push(getOrderModel(c));
      }
    }
  } catch (e) {
    console.warn('[orderController] failed to load branch cities for order models', e && e.message ? e.message : e);
  }
  return models;
};

// Find an order by _id across all collections; returns { order, model } or { order: null }
const findOrderAcrossCollectionsById = async (id) => {
  const models = await getAllOrderModels();
  for (const m of models) {
    try {
      const found = await m.findById(id);
      if (found) return { order: found, model: m };
    } catch (err) {
      // ignore cast errors and continue
    }
  }
  return { order: null };
};

// Find an order by orderId across all collections; returns { order, model }
const findOrderAcrossCollectionsByOrderId = async (orderId) => {
  const models = await getAllOrderModels();
  for (const m of models) {
    try {
      const found = await m.findOne({ orderId });
      if (found) return { order: found, model: m };
    } catch (err) {
      // ignore and continue
    }
  }
  return { order: null };
};

// Generate a unique order identifier that matches the stored document format.
const generateOrderId = async () => {
  const timestamp = Date.now();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${suffix}`;
};

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(6371 * c).toFixed(2);
};

// Create a new order (public / from frontend)
const createOrder = async (req, res) => {
  try {
    const {
      userId: bodyUserId,
      customerId,
      items,
      deliveryLocation,
      currentLocation,
      orderType,
      paymentMethod,
      tax,
      deliveryFee,
      totalAmount,
      subtotal,
      pointsUsed = 0,
      specialInstructions,
      customerPhone,
      customerEmail,
      branchId: bodyBranchId,
      address,
      city,
      postalCode,
    } = req.body;

    const userId = bodyUserId || customerId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const normalizedItems = normalizeOrderItems(items);
    const itemsValidation = validateOrderItems(normalizedItems);
    if (!itemsValidation.valid) {
      return res.status(400).json({ message: itemsValidation.message });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPickup = orderType === 'pickup' || deliveryFee === null;
    const taxValue = Number(tax || 0);
    const deliveryFeeValue = isPickup ? null : Number(deliveryFee || 0);

    const computedSubtotal = normalizedItems.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    );

    let validatedPointsUsed = Math.max(0, Number(pointsUsed || 0));
    const availablePoints = user.loyaltyPoints || 0;
    if (validatedPointsUsed > availablePoints) validatedPointsUsed = availablePoints;
    validatedPointsUsed = Math.floor(validatedPointsUsed / 100) * 100;
    const discount = validatedPointsUsed / 100;
    const subtotalAfterDiscount = Math.max(0, +(computedSubtotal - discount).toFixed(2));
    const finalTotalAmount = +(
      subtotalAfterDiscount + taxValue + (deliveryFeeValue || 0)
    ).toFixed(2);

    let branchDoc = null;
    let distanceKm = 0;
    let driveTimeMins = 0;

    if (bodyBranchId) {
      branchDoc = await Branch.findById(bodyBranchId);
    }

    const coordsFromDelivery =
      deliveryLocation &&
      typeof deliveryLocation.latitude !== 'undefined' &&
      typeof deliveryLocation.longitude !== 'undefined'
        ? {
            latitude: Number(deliveryLocation.latitude),
            longitude: Number(deliveryLocation.longitude),
          }
        : null;

    const coordsFromCurrent =
      currentLocation &&
      typeof currentLocation.latitude !== 'undefined' &&
      typeof currentLocation.longitude !== 'undefined'
        ? {
            latitude: Number(currentLocation.latitude),
            longitude: Number(currentLocation.longitude),
          }
        : null;

    const coordsFromUser =
      user.currentLocation &&
      typeof user.currentLocation.latitude !== 'undefined' &&
      typeof user.currentLocation.longitude !== 'undefined'
        ? {
            latitude: Number(user.currentLocation.latitude),
            longitude: Number(user.currentLocation.longitude),
          }
        : null;

    const coordsForBranch = coordsFromDelivery || coordsFromCurrent || coordsFromUser;
    if (!branchDoc && coordsForBranch) {
      try {
        const nearest = await findNearestBranchByCoords(
          coordsForBranch.latitude,
          coordsForBranch.longitude
        );
        if (nearest && nearest.branch) {
          branchDoc = nearest.branch;
          distanceKm = nearest.distanceKm || 0;
          driveTimeMins = nearest.driveTimeMins || 0;
        }
      } catch (err) {
        console.warn('Failed to determine nearest branch by coords', err);
      }
    }

    if (!branchDoc) {
      const parsed = tryParseAddress(deliveryLocation?.address || address || '');
      const lookupCity = deliveryLocation?.city || city || parsed.city || '';
      if (lookupCity) {
        branchDoc =
          (await Branch.findOne({ city: new RegExp(`^${lookupCity}$`, 'i') })) ||
          (await Branch.findOne({ slug: lookupCity.toLowerCase().replace(/[^a-z0-9]+/g, '-') })) ||
          (await Branch.findOne({ city: { $regex: lookupCity, $options: 'i' } }));
      }
    }

    if (!branchDoc) {
      return res.status(400).json({ message: 'Unable to resolve branch for order' });
    }

    const branchLocation = {
      latitude: typeof branchDoc.latitude === 'number' ? branchDoc.latitude : null,
      longitude: typeof branchDoc.longitude === 'number' ? branchDoc.longitude : null,
      address: branchDoc.fullAddress || '',
    };

    let finalDeliveryLocation = null;
    if (isPickup) {
      finalDeliveryLocation = {
        latitude: branchLocation.latitude,
        longitude: branchLocation.longitude,
        address: branchLocation.address,
        city: branchDoc.city || '',
        postalCode: branchDoc.postalCode || '',
      };
    } else {
      const parsedAddress = tryParseAddress(deliveryLocation?.address || address || '');
      const addressValue = deliveryLocation?.address || parsedAddress.address || address || '';
      const cityValue = deliveryLocation?.city || city || parsedAddress.city || '';
      const postalValue = deliveryLocation?.postalCode || postalCode || parsedAddress.postalCode || '';
      const latValue = coordsFromDelivery?.latitude ?? coordsFromCurrent?.latitude ?? coordsFromUser?.latitude ?? null;
      const lngValue = coordsFromDelivery?.longitude ?? coordsFromCurrent?.longitude ?? coordsFromUser?.longitude ?? null;
      finalDeliveryLocation = {
        latitude: Number.isFinite(latValue) ? latValue : null,
        longitude: Number.isFinite(lngValue) ? lngValue : null,
        address: addressValue,
        city: cityValue,
        postalCode: postalValue,
      };
    }

    if (!distanceKm && finalDeliveryLocation?.latitude && finalDeliveryLocation?.longitude && branchLocation.latitude && branchLocation.longitude) {
      distanceKm = haversineDistanceKm(
        finalDeliveryLocation.latitude,
        finalDeliveryLocation.longitude,
        branchLocation.latitude,
        branchLocation.longitude
      );
    }

    const finalDriveTimeMins = driveTimeMins || DEFAULT_DELIVERY_MINS;
    const now = new Date();
    const estimatedDeliveryTime = new Date(now.getTime() + DEFAULT_DELIVERY_MINS * 60 * 1000);
    const autoRejectAt = new Date(now.getTime() + DEFAULT_AUTO_REJECT_MINS * 60 * 1000);

    const orderId = await generateOrderId();
    const orderNumber = orderId;
    const chosenModel = getOrderModel(branchDoc.city || branchDoc.name || '');

    const orderPayload = {
      orderNumber,
      orderId,
      userId: user._id,
      customer: user._id,
      branchId: branchDoc._id,
      items: normalizedItems,
      deliveryLocation: finalDeliveryLocation,
      branchLocation,
      estimatedDistance: distanceKm || 0,
      estimatedDriveTime: finalDriveTimeMins,
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
    };

    const order = await chosenModel.create(orderPayload);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders (admin only) - across all branch collections
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const models = await getAllOrderModels();
    const orderArrays = await Promise.all(
      models.map((model) =>
        model
          .find()
          .populate('userId', 'name email phone')
          .lean()
          .catch(() => [])
      )
    );

    const allOrders = orderArrays
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = allOrders.length;
    const orders = allOrders.slice(skip, skip + limit);

    res.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user's orders - across all branch collections
const getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Not authorized' });

    const models = await getAllOrderModels();
    const orderArrays = await Promise.all(
      models.map((model) =>
        model
          .find({ userId: req.user._id })
          .lean()
          .sort({ createdAt: -1 })
          .catch(() => [])
      )
    );

    const allOrders = orderArrays
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single order by id
const getOrderById = async (req, res) => {
  try {
    // Try to find by Mongo _id first
    let result = await findOrderAcrossCollectionsById(req.params.id);
    let order = result.order;
    // If not found by _id, try searching by orderId
    if (!order) {
      const r2 = await findOrderAcrossCollectionsByOrderId(req.params.id);
      order = r2.order;
    }
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // populate user info if not already
    await order.populate('userId', 'name email phone');
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const rawStatus = req.body.status;
    if (!rawStatus) return res.status(400).json({ message: 'Status is required' });

    const normalizedStatus = rawStatus.toString().trim().toLowerCase();
    const allowedStatuses = ['incoming', 'accepted', 'rejected', 'completed'];
    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: `Invalid status: ${rawStatus}` });
    }

    const { order } = await findOrderAcrossCollectionsById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = normalizedStatus;

    if (normalizedStatus === 'accepted' && !order.acceptedAt) {
      order.acceptedAt = new Date();
    }

    if (normalizedStatus === 'completed') {
      if (!order.completedAt) {
        order.completedAt = new Date();
      }
      order.paymentStatus = 'PAID';

      try {
        const user = await User.findById(order.userId);
        if (user) {
          const subtotal = typeof order.subtotal === 'number'
            ? order.subtotal
            : (order.items || []).reduce((acc, it) => acc + ((it.price || 0) * (it.quantity || 1)), 0);
          const tax = typeof order.tax === 'number' ? order.tax : 0;
          const deliveryFee = typeof order.deliveryFee === 'number' ? order.deliveryFee : 0;
          const totalAmount = typeof order.totalAmount === 'number'
            ? order.totalAmount
            : +(subtotal + tax + deliveryFee).toFixed(2);

          const discount = Math.max(0, subtotal + tax + deliveryFee - totalAmount);
          const pointsUsed = Math.max(0, Math.round(discount * 100));
          const pointsEarned = Math.floor(Math.max(0, subtotal - discount));

          user.loyaltyPoints = Math.max(0, (user.loyaltyPoints || 0) - pointsUsed);
          user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsEarned;
          await user.save();
        }
      } catch (userErr) {
        console.warn('Failed to update loyalty points on completion', userErr);
      }
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order (owner or admin) - limited fields
const updateOrder = async (req, res) => {
  try {
    const { order } = await findOrderAcrossCollectionsById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { items, deliveryLocation, specialInstructions, paymentMethod } = req.body;

    if (Array.isArray(items)) {
      const normalizedItems = normalizeOrderItems(items);
      const itemsValidation = validateOrderItems(normalizedItems);
      if (!itemsValidation.valid) {
        return res.status(400).json({ message: itemsValidation.message });
      }
      order.items = normalizedItems;
      const newSubtotal = normalizedItems.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
        0
      );
      order.subtotal = +(newSubtotal || 0).toFixed(2);
      const taxValue = typeof order.tax === 'number' ? order.tax : 0;
      const deliveryFeeValue = typeof order.deliveryFee === 'number' ? order.deliveryFee : 0;
      order.totalAmount = +(order.subtotal + taxValue + deliveryFeeValue).toFixed(2);
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

    if (typeof specialInstructions !== 'undefined') {
      order.specialInstructions = specialInstructions || '';
    }

    if (typeof paymentMethod !== 'undefined') {
      order.paymentMethod = paymentMethod || order.paymentMethod;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get orders for a specific user (admin only) - searches across all collections
const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const models = await getAllOrderModels();
    const orderPromises = models.map((model) =>
      model
        .find({ userId: customerId })
        .lean()
        .sort({ createdAt: -1 })
        .catch(() => [])
    );

    const orderArrays = await Promise.all(orderPromises);
    const allOrders = orderArrays
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, getUserOrders, updateOrder, getOrdersByCustomer };
