import dbConnect from './src/lib/db';
import User from './src/models/User';
import Vendor from './src/models/Vendor';
import Product from './src/models/Product';
import Order from './src/models/Order';

async function check() {
    await dbConnect();
    const u = await User.countDocuments();
    const v = await Vendor.countDocuments();
    const p = await Product.countDocuments();
    const o = await Order.countDocuments();
    console.log('--- DB STATS ---');
    console.log('Users:', u);
    console.log('Vendors:', v);
    console.log('Products:', p);
    console.log('Orders:', o);
    process.exit(0);
}

check();
