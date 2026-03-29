import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    store_name: { type: String, required: true },
    store_address: { type: String, required: true },
    gst_number: { type: String, required: true, unique: true },
    turnover: { type: String },
    phone: { type: String, required: true, unique: true },
    alternate_phone: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'blocked'], default: 'pending' },
    role: { type: String, default: 'vendor' },
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
