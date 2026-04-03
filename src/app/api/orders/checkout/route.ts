import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Reservation from '@/models/Reservation';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = getAuthSession(req);
        if (!session || session.role !== 'user') {
            return NextResponse.json({ error: 'Please login as a Shop Owner to place orders.' }, { status: 401 });
        }

        await dbConnect(); // Local MongoDB

        const { cartItems, payment_method } = await req.json();

        // 1. Group by productId to avoid multiple fetches
        const productIds = Array.from(new Set(cartItems.map((item: any) => item.productId)));
        const dbProducts = await Product.find({ _id: { $in: productIds } });

        if (!dbProducts || dbProducts.length === 0) throw new Error('Failed to fetch products from local database');

        const vendorBatches: Record<string, any[]> = {};
        const masterOrderId = `MST-${Date.now()}`;

        // 2. Process items and group by vendor
        for (const item of cartItems) {
            const dbProduct = dbProducts.find(p => p._id.toString() === item.productId);
            if (!dbProduct) throw new Error(`Product not found: ${item.name}`);

            let price = dbProduct.price;
            let currentStock = dbProduct.stock;
            let name = dbProduct.name_en;

            // Handle Variants
            if (item.variantName) {
                const variant = dbProduct.variants.find((v: any) => v.variant_name === item.variantName);
                if (!variant) throw new Error(`Variant "${item.variantName}" not found for ${dbProduct.name_en}`);
                price = variant.price;
                currentStock = variant.stock;
                name = `${dbProduct.name_en} (${item.variantName})`;
            }

            // Calculate available stock (Product Stock - Other Reservations)
            const otherReservations = await Reservation.find({
                product_id: dbProduct._id,
                variant_name: item.variantName || null,
                user_id: { $ne: session.id },
                expiresAt: { $gt: new Date() }
            });
            const reservedByOthers = otherReservations.reduce((sum, r) => sum + r.quantity, 0);
            const netAvailable = currentStock - reservedByOthers;

            if (netAvailable < item.quantity) {
                throw new Error(`Item "${name}" just became unavailable (Reserved by someone else: ${reservedByOthers}, Available: ${netAvailable})`);
            }

            const vendorId = dbProduct.vendor_id.toString();
            if (!vendorBatches[vendorId]) vendorBatches[vendorId] = [];

            const lineTotal = price * item.quantity;

            vendorBatches[vendorId].push({
                product_id: dbProduct._id,
                variantName: item.variantName,
                name: name,
                image_url: dbProduct.image_url || '',
                price: price,
                quantity: item.quantity,
                total: lineTotal
            });

            // Update stock in Local MongoDB
            if (item.variantName) {
                // Update variant stock only
                await Product.updateOne(
                    { _id: dbProduct._id, "variants.variant_name": item.variantName },
                    { $inc: { "variants.$.stock": -item.quantity } }
                );
            } else {
                // Update base product stock
                const newStock = dbProduct.stock - item.quantity;
                await Product.findByIdAndUpdate(dbProduct._id, {
                    stock: newStock,
                    status: newStock <= 0 ? 'Out of Stock' : 'In Stock'
                });
            }
        }

        // 3. Create orders for each vendor
        for (const [vendorId, products] of Object.entries(vendorBatches)) {
            const vendorTotal = products.reduce((acc, p) => acc + p.total, 0);
            const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            await Order.create({
                order_id: orderId,
                master_order_id: masterOrderId,
                vendor_id: vendorId,
                user_id: session.id,
                products,
                total_amount: vendorTotal,
                status: 'Pending',
                payment_status: 'Unpaid',
                payment_method: payment_method || 'Cash',
            });
        }

        // 4. Clear user's reservations
        await Reservation.deleteMany({ user_id: session.id });

        return NextResponse.json({ success: true, masterOrderId });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
