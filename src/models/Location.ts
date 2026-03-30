import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
    state: { type: String, required: true, unique: true },
    cities: [{ type: String }],
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);
