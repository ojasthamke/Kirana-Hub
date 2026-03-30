import mongoose from 'mongoose';

const BusinessCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    icon: { type: String, default: '🏢' },
    description: { type: String },
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.BusinessCategory || mongoose.model('BusinessCategory', BusinessCategorySchema);
