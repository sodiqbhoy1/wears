import mongoose from 'mongoose';

const { Schema } = mongoose;

const AdminSchema = new Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
