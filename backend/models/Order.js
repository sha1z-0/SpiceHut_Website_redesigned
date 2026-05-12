const mongoose = require('mongoose');

/**
 * Order schema and dynamic model factory
 * This file exports a getOrderModel(location) function which returns a Mongoose model
 * backed by a collection name derived from the provided location. If location is
 * falsy the default collection name "orders" is used (keeps backwards compatibility).
 */

const SPICE_LEVELS = [
  'Mild',
  'Mild Medium',
  'Medium',
  'Medium Hot',
  'Hot',
  'Extra Hot',
];

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  specialInstructions: { type: String, default: '' },
  spiceLevel: { type: String, enum: SPICE_LEVELS },
}, { _id: true });

const deliveryLocationSchema = new mongoose.Schema({
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  postalCode: { type: String, default: '' },
}, { _id: false });

const branchLocationSchema = new mongoose.Schema({
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true },
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  items: { type: [orderItemSchema], default: [] },
  deliveryLocation: { type: deliveryLocationSchema, default: null },
  branchLocation: { type: branchLocationSchema, default: null },
  estimatedDistance: { type: Number, default: 0 },
  estimatedDriveTime: { type: Number, default: 40 },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: null },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
  status: { type: String, enum: ['incoming', 'accepted', 'rejected', 'completed'], default: 'incoming' },
  customerPhone: { type: String, default: '' },
  customerEmail: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  estimatedDeliveryTime: { type: Date },
  autoRejectAt: { type: Date },
  acceptedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

// Add indexes for frequently queried fields
orderSchema.index({ userId: 1 });
orderSchema.index({ branchId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Cache created models in mongoose.models (Mongoose handles this) so repeated calls
// to getOrderModel for the same location reuse the compiled model.
const normalizeLocation = (loc) => {
  if (!loc) return '';
  // remove non-alphanum and capitalize words (e.g., 'Cambell River' -> 'CambellRiver')
  return loc.toString().trim().replace(/[^a-zA-Z0-9]+/g, ' ').split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
};

/**
 * Get or create an Order model for a given location.
 * @param {string} location - branch location (e.g. 'Cambell River'). If falsy returns default model.
 * @returns {mongoose.Model}
 */
function getOrderModel(location) {
  const norm = normalizeLocation(location);
  const modelName = norm ? `Order${norm}` : 'Order';
  const collectionName = norm ? `orders${norm}` : 'orders';

  // reuse if already compiled
  if (mongoose.models[modelName]) return mongoose.models[modelName];

  return mongoose.model(modelName, orderSchema, collectionName);
}

// Export the factory and also the default model for backwards compatibility
module.exports = { getOrderModel, DefaultOrder: getOrderModel(null), orderSchema };
