import mongoose from 'mongoose';

const { Schema } = mongoose;

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  image: String,
  status: { type: String, default: 'available' },
  category: String,
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
}, { timestamps: true });

export default mongoose.models.Menu || mongoose.model('Menu', MenuItemSchema);
