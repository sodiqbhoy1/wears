import mongoose from 'mongoose';

const { Schema } = mongoose;

const AnnouncementSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: String,
}, { timestamps: true });

export default mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
