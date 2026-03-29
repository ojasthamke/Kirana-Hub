const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://ojasthamke3_db_user:Lubdha123@ac-d6iwvoh-shard-00-00.jsao85l.mongodb.net:27017,ac-d6iwvoh-shard-00-01.jsao85l.mongodb.net:27017,ac-d6iwvoh-shard-00-02.jsao85l.mongodb.net:27017/kirana_hub?replicaSet=atlas-ttvtvm-shard-0&ssl=true&authSource=admin';

async function test() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Connected successfully');
        
        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        // Count users
        const User = mongoose.model('User', new mongoose.Schema({ phone: String }));
        const count = await User.countDocuments();
        console.log('Total Users:', count);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

test();
