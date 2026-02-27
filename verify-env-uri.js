const mongoose = require('mongoose');

// EXACT string from .env.local
const URI = 'mongodb+srv://ojasthamke3_db_user:Lubdhat%401@ac-c0fpphq.jrz6hcp.mongodb.net/kirana_hub?retryWrites=true&w=majority';

async function test() {
    console.log('Testing .env.local URI...');
    try {
        await mongoose.connect(URI, { serverSelectionTimeoutMS: 15000 });
        console.log('✅ SUCCESS!');
    } catch (err) {
        console.log('❌ FAILED:', err.message);
    }
    process.exit(0);
}

test();
