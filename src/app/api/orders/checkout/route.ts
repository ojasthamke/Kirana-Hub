import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import VendorWallet from '@/models/VendorWallet';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = getAuthSession();
        if (!session || session.role !== 'user') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { cartItems } = await req.json(); // Array of { productId, quantity }
        await dbConnect();

        // 1. Fetch products and group by vendor
        const productIds = cartItems.map((item: any) => item.productId);
        const dbProducts = await Product.find({ _id: { $in: productIds } });

        const vendorBatches: Record<string, any[]> = {};
        const masterOrderId = `MST-${Date.now()}`;

        let masterTotal = 0;

        for (const item of cartItems) {
            const dbProduct = dbProducts.find(p => p._id.toString() === item.productId);
            if (!dbProduct || dbProduct.stock < item.quantity) {
                throw new Error(`Product ${dbProduct?.name_en || item.productId} out of stock`);
            }

            const vendorId = dbProduct.vendor_id.toString();
            if (!vendorBatches[vendorId]) vendorBatches[vendorId] = [];

            const lineTotal = dbProduct.price * item.quantity;
            masterTotal += lineTotal;

            vendorBatches[vendorId].push({
                product_id: dbProduct._id,
                name_en: dbProduct.name_en,
                name_hi: dbProduct.name_hi,
                price: dbProduct.price,
                quantity: item.quantity,
                total: lineTotal
            });

            // Update Stock (Real-time)
            dbProduct.stock -= item.quantity;
            if (dbProduct.stock === 0) dbProduct.status = 'Out of Stock';
            await dbProduct.save();
        }

        // 2. Create Vendor Orders
        const orders = [];
        for (const [vendorId, products] of Object.entries(vendorBatches)) {
            const vendorTotal = products.reduce((acc, p) => acc + p.total, 0);
            const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            const newOrder = await Order.create({
                order_id: orderId,
                master_order_id: masterOrderId,
                vendor_id: vendorId,
                user_id: session.id,
                products: products,
                total_amount: vendorTotal,
                status: 'Pending',
                payment_status: 'Unpaid'
            });

            // 3. Update Vendor Wallet
            await VendorWallet.findOneAndUpdate(
                { vendor_id: vendorId },
                { $inc: { total_orders: 1 } },
                { upsert: true }
            );

            orders.push(newOrder);
        }

        return NextResponse.json({ success: true, masterOrderId, orders });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
