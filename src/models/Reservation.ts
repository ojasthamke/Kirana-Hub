import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant_name: { type: String }, // Optional for non-variant products
    quantity: { type: Number, required: true },
    expiresAt: { 
        type: Date, 
        required: true, 
        default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        index: { expires: 0 } // TTL Index: Mongo will auto-delete this document when Date.now() > expiresAt
    }
}, { timestamps: true });

export default mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
