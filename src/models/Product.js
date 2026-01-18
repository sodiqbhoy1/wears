import mongoose from 'mongoose';

const { Schema } = mongoose;

const VariantSchema = new Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number }, // Optional: if price depends on variant
  image: { type: String }, // Optional: image for this specific variant
}, { _id: true });

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  basePrice: { type: Number, required: true },
  images: [{ type: String }],
  category: String,
  variants: [VariantSchema],
  status: { type: String, default: 'available' }, // e.g., 'available', 'out of stock'
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
}, { timestamps: true });

// Middleware to update product status based on total variant quantity
ProductSchema.pre('save', function(next) {
  const totalQuantity = this.variants.reduce((sum, variant) => sum + variant.quantity, 0);
  if (totalQuantity === 0) {
    this.status = 'out of stock';
  } else {
    this.status = 'available';
  }
  next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);