import { NextResponse } from 'next/server';

import dbConnect from '@/lib/db';
import Order from '@/models/Order';
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

        // Security: only owner or admin
        if (order.user_id.toString() !== session.id && session.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (payment_status !== undefined) updateData.payment_status = payment_status;
        
        if (products !== undefined) {
            updateData.products = products;
            updateData.total_amount = products.reduce((acc: number, p: any) => acc + (p.total || 0), 0);
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
