import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, default: 'Maharashtra' },
    city: { type: String, default: 'Yavatmal' },
    business_type: { type: String, default: 'Kirana Store' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
