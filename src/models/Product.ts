import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    category: { type: String, required: true },
    name_en: { type: String, required: true },
    name_hi: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    offer: { type: String, default: '' },
    status: { type: String, enum: ['In Stock', 'Out of Stock'], default: 'In Stock' },
    image_url: { type: String } // Adding image for better UI
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
