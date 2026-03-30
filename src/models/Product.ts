import mongoose from 'mongoose';
import './Vendor'; // Ensure Vendor schema is registered for populate

// Define the Variant Schema first
const VariantSchema = new mongoose.Schema({
    variant_name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'pcs' },
    min_qty: { type: Number, default: 1 },
    offer: { type: String, default: '' },
    status: { type: String, enum: ['In Stock', 'Out of Stock'], default: 'In Stock' }
});

const ProductSchema = new mongoose.Schema({
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    category: { type: String, required: true },
    name_en: { type: String, required: true },
    name_hi: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    unit: { type: String, enum: ['kg', 'g', 'pcs', 'pack', 'liter', 'ml'], default: 'kg' },
    min_qty: { type: Number, default: 1 },
    stock: { type: Number, required: true, default: 0 },
    offer: { type: String, default: '' },
    status: { type: String, enum: ['In Stock', 'Out of Stock'], default: 'In Stock' },
    image_url: { type: String },
    variants: [VariantSchema] // Array of packaging/variant options
}, { timestamps: true });

// VERY IMPORTANT: Clear the model from mongoose cache to ensure schema refresh
delete mongoose.models.Product;

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
