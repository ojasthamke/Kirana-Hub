import { NextResponse } from 'next/server';

import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = getAuthSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const body = await req.json();
        const { status, payment_status, products } = body;
        const orderId = params.id;

        const order = await Order.findById(orderId);
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        // Security: only user (owner), or vendor (seller) or admin
        const isUserOwner = order.user_id.toString() === session.id;
        const isVendorOwner = order.vendor_id.toString() === session.id;
        const isAdmin = session.role === 'admin';

        if (!isUserOwner && !isVendorOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (payment_status !== undefined) updateData.payment_status = payment_status;
        
        if (products !== undefined) {
            updateData.products = products;
            updateData.total_amount = products.reduce((acc: number, p: any) => acc + (p.total || 0), 0);
        }

        // If cancelling, return stock to inventory
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            for (const item of order.products) {
                if (item.variantName) {
                    await Product.updateOne(
                        { _id: item.product_id, "variants.variant_name": item.variantName },
                        { $inc: { "variants.$.stock": item.quantity } }
                    );
                } else {
                    await Product.findByIdAndUpdate(item.product_id, {
                        $inc: { stock: item.quantity }
                    });
                }
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { $set: updateData }, { new: true });
        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
