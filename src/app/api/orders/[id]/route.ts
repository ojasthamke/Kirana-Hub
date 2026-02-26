import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import VendorWallet from '@/models/VendorWallet';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { status, payment_status } = body;
        await dbConnect();

        const orderId = params.id;
        const oldOrder = await Order.findById(orderId);
        if (!oldOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (payment_status !== undefined) updateData.payment_status = payment_status;

        const newOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

        // Update Wallet stats if status changed to Delivered
        if (status === 'Delivered' && oldOrder.status !== 'Delivered') {
            await VendorWallet.findOneAndUpdate(
                { vendor_id: oldOrder.vendor_id },
                {
                    $inc: {
                        total_delivered: 1,
                        total_revenue: oldOrder.total_amount,
                        pending_amount: oldOrder.total_amount
                    }
                },
                { upsert: true }
            );
        }

        return NextResponse.json(newOrder);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
