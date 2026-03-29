const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://ojasthamke3_db_user:Lubdha123@ac-d6iwvoh-shard-00-00.jsao85l.mongodb.net:27017,ac-d6iwvoh-shard-00-01.jsao85l.mongodb.net:27017,ac-d6iwvoh-shard-00-02.jsao85l.mongodb.net:27017/kirana_hub?replicaSet=atlas-ttvtvm-shard-0&ssl=true&authSource=admin';

async function test() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({ phone: String, role: String }));
        const Vendor = mongoose.model('Vendor', new mongoose.Schema({ phone: String, role: String, status: String }));
        
        const users = await User.find({}, 'phone role');
        const vendors = await Vendor.find({}, 'phone role status');
        
        console.log('--- USERS ---');
        console.table(users.map(u => u.toObject()));
        
        console.log('--- VENDORS ---');
        console.table(vendors.map(v => v.toObject()));
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

test();
