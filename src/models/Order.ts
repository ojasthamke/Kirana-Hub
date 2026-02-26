import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    order_id: { type: String, unique: true },
    master_order_id: { type: String, required: true },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name_en: String,
        name_hi: String,
        price: Number,
        quantity: Number,
        total: Number
    }],
    total_amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    payment_status: { type: String, enum: ['Unpaid', 'Paid', 'Pending Approval'], default: 'Unpaid' },
    payment_method: { type: String, enum: ['Cash', 'Online'], default: 'Cash' },
    created_at: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
