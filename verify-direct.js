const mongoose = require('mongoose');

const password = encodeURIComponent('Lubdhat@1');
// Direct shard list URI
const directURI = `mongodb://ojasthamke3_db_user:${password}@ac-c0fpphq-shard-00-00.jrz6hcp.mongodb.net:27017,ac-c0fpphq-shard-00-01.jrz6hcp.mongodb.net:27017,ac-c0fpphq-shard-00-02.jrz6hcp.mongodb.net:27017/kirana_hub?ssl=true&replicaSet=atlas-13q9ze&authSource=admin&retryWrites=true&w=majority`;

async function test() {
    console.log('Testing Direct Shard URI...');
    try {
        await mongoose.connect(directURI, { serverSelectionTimeoutMS: 15000 });
        console.log('✅ SUCCESS!');
        await mongoose.disconnect();
    } catch (err) {
        console.log('❌ FAILED:', err.message);
    }
    process.exit(0);
}

test();
