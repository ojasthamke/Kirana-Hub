import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const body = await req.json();
        const { status, payment_status } = body;
        const orderId = params.id;

        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (payment_status !== undefined) updateData.payment_status = payment_status;

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

        if (!updatedOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
