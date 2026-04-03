import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Reservation from '@/models/Reservation';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
    const session = getAuthSession(req);
    if (!session) return NextResponse.json({ error: 'Please login to reserve items.' }, { status: 401 });

    try {
        await dbConnect();
        const { productId, variantName, quantity } = await req.json();

        // 1. Fetch Product
        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        // 2. Fetch all OTHER reservations for this item
        const otherReservations = await Reservation.find({
            product_id: productId,
            variant_name: variantName || null,
            user_id: { $ne: session.id },
            expiresAt: { $gt: new Date() }
        });

        const reservedByOthers = otherReservations.reduce((sum, r) => sum + r.quantity, 0);

        // 3. Determine base stock
        let availableStock = product.stock;
        if (variantName) {
            const variant = product.variants.find((v: any) => v.variant_name === variantName);
            if (!variant) return NextResponse.json({ error: 'Variant not found' }, { status: 400 });
            availableStock = variant.stock;
        }

        const netAvailable = availableStock - reservedByOthers;

        // 4. Validate requested quantity
        if (quantity > netAvailable) {
            return NextResponse.json({ 
                error: `Only ${netAvailable} units available (Others have some in their carts).`,
                available: netAvailable
            }, { status: 400 });
        }

        // 5. Place or remove reservation
        if (quantity <= 0) {
            await Reservation.deleteOne({ 
                user_id: session.id, 
                product_id: productId, 
                variant_name: variantName || null 
            });
        } else {
            await Reservation.findOneAndUpdate(
                { user_id: session.id, product_id: productId, variant_name: variantName || null },
                { 
                    quantity, 
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // Reset expiration
                },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ success: true, reserved: quantity });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
