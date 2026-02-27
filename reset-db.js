const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const password = encodeURIComponent('Lubdhat@1');
const shards = [
    'ac-c0fpphq-shard-00-00.jrz6hcp.mongodb.net:27017',
    'ac-c0fpphq-shard-00-01.jrz6hcp.mongodb.net:27017',
    'ac-c0fpphq-shard-00-02.jrz6hcp.mongodb.net:27017'
];

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    business_type: { type: String, default: 'Kirana Store' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function findPrimaryAndReset() {
    for (const host of shards) {
        const URI = `mongodb://ojasthamke3_db_user:${password}@${host}/kirana_hub?ssl=true&authSource=admin&directConnection=true`;
        console.log(`Checking shard ${host}...`);
        try {
            await mongoose.connect(URI, { serverSelectionTimeoutMS: 5000 });

            // Check if this is the primary or if it's writable
            const isMaster = await mongoose.connection.db.command({ isMaster: 1 });
            if (isMaster.ismaster || isMaster.isWritablePrimary) {
                console.log(`✅ FOUND PRIMARY: ${host}`);

                console.log('Dropping database...');
                await mongoose.connection.db.dropDatabase();
                console.log('✅ Database dropped');

                console.log('Creating Super Admin...');
                const adminPhone = 'ojas';
                const adminPass = '121';
                const hashedPassword = await bcrypt.hash(adminPass, 10);

                await User.create({
                    name: 'Super Admin',
                    phone: adminPhone,
                    password: hashedPassword,
                    address: 'Admin Headquarters',
                    business_type: 'Management',
                    role: 'admin'
                });

                console.log('\n✅ NEW DATABASE INITIALIZED');
                console.log('ID: ojas, PASS: 121');

                await mongoose.disconnect();
                process.exit(0);
            } else {
                console.log(`ℹ️ ${host} is a secondary. Skipping...`);
                await mongoose.disconnect();
            }
        } catch (err) {
            console.log(`❌ Error on ${host}: ${err.message}`);
            try { await mongoose.disconnect(); } catch (e) { }
        }
    }
    console.error('FAILED: Could not find or connect to a primary node.');
    process.exit(1);
}

findPrimaryAndReset();
