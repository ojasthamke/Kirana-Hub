import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('vendor_id', 'store_name').populate('user_id', 'name phone');
    return NextResponse.json(orders);
}

export async function PATCH(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId, status, payment_status } = await req.json();
    await dbConnect();
    const update: any = {};
    if (status) update.status = status;
    if (payment_status) update.payment_status = payment_status;
    const order = await Order.findByIdAndUpdate(orderId, update, { new: true });
    return NextResponse.json({ success: true, order });
}
