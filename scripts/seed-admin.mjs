// Run: node scripts/seed-admin.mjs
// Delete this file immediately after running

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ojasthamke3_db_user:khCUGxl2FkscvBdp@ojas.jrz6hcp.mongodb.net/kirana_hub?retryWrites=true&w=majority&appName=OJAS';

await mongoose.connect(MONGODB_URI);

const UserSchema = new mongoose.Schema({
    name: String, phone: String, password: String, address: { type: String, default: 'Admin HQ' }, role: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Remove any existing admin
await User.deleteMany({ role: 'admin' });

// Create admin — password hashed, never stored in plain text
const hash = await bcrypt.hash('1212121', 12);
await User.create({
    name: 'Super Admin',
    phone: 'ojasthamke',   // Admin ID to login
    password: hash,
    address: 'Admin HQ',
    role: 'admin'
});

console.log('✅ Admin created! ID: ojasthamke | Password: [hashed safely in DB]');
await mongoose.disconnect();
