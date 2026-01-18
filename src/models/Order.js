import mongoose from 'mongoose';

const { Schema } = mongoose;

const ItemSchema = new Schema({
  key: String,
  title: String,
  price: Number,
  quantity: Number,
  image: String,
  size: String,
  color: String
}, { _id: false });

const OrderSchema = new Schema({
  reference: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  items: [ItemSchema],
  paid: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'preparing', 'ready', 'delivered'], default: 'pending' },
  source: String,
  paystack_reference: String,
  paystack_transaction_id: String,
  confirmationEmailSent: { type: Boolean, default: false },
  confirmationEmailSentAt: Date,
  confirmationEmailError: String,
  emailAttempts: { type: Number, default: 0 },
}, { timestamps: true });

OrderSchema.methods.markEmailSent = function() {
  this.confirmationEmailSent = true;
  this.confirmationEmailSentAt = new Date();
  return this.save();
};

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
