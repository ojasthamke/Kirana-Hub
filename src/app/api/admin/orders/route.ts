import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Vendor from '@/models/Vendor';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const orders = await Order.find({})
            .populate('vendor_id', 'store_name')
            .populate('user_id', 'name phone')
            .sort({ createdAt: -1 });

        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { orderId, ...updates } = await req.json();
        const order = await Order.findByIdAndUpdate(orderId, updates, { new: true });
        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function DELETE(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { orderId } = await req.json();
        await Order.findByIdAndDelete(orderId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
