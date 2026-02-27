const mongoose = require('mongoose');

const password = encodeURIComponent('Lubdhat@1');
const URI = `mongodb://ojasthamke3_db_user:${password}@ac-c0fpphq-shard-00-02.jrz6hcp.mongodb.net:27017/kirana_hub?ssl=true&authSource=admin&directConnection=true`;

async function test() {
    console.log('Testing Direct Shard 02 URI...');
    try {
        await mongoose.connect(URI, { serverSelectionTimeoutMS: 10000 });
        console.log('✅ SUCCESS!');
        await mongoose.disconnect();
    } catch (err) {
        console.log('❌ FAILED:', err.message);
    }
    process.exit(0);
}

test();
