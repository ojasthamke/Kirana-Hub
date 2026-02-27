const mongoose = require('mongoose');

const password = encodeURIComponent('Lubdhat@1');
const shards = [
    'ac-c0fpphq-shard-00-00.jrz6hcp.mongodb.net:27017',
    'ac-c0fpphq-shard-00-01.jrz6hcp.mongodb.net:27017',
    'ac-c0fpphq-shard-00-02.jrz6hcp.mongodb.net:27017'
];

async function checkUsers() {
    for (const host of shards) {
        const URI = `mongodb://ojasthamke3_db_user:${password}@${host}/kirana_hub?ssl=true&authSource=admin&directConnection=true`;
        try {
            await mongoose.connect(URI, { serverSelectionTimeoutMS: 5000 });
            console.log(`Connected to ${host}`);
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('Collections:', collections.map(c => c.name));

            const User = mongoose.connection.db.collection('users');
            const userCount = await User.countDocuments();
            console.log('User count:', userCount);

            const admin = await User.findOne({ phone: 'ojas' });
            if (admin) {
                console.log('Admin user found in DB:', admin.phone, admin.role);
            } else {
                console.log('Admin user NOT found in DB');
            }

            await mongoose.disconnect();
            process.exit(0);
        } catch (err) {
            console.log(`Error on ${host}: ${err.message}`);
        }
    }
}

checkUsers();
