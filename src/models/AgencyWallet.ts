import mongoose from 'mongoose';

const VendorWalletSchema = new mongoose.Schema({
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', unique: true, required: true },
    total_orders: { type: Number, default: 0 },
    total_delivered: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    total_paid: { type: Number, default: 0 },
    pending_amount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.VendorWallet || mongoose.model('VendorWallet', VendorWalletSchema);
