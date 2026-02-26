import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
    const session = getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        let query: any = {};
        if (session.role === 'user') query.user_id = session.id;
        if (session.role === 'vendor') query.vendor_id = session.id;

        const orders = await Order.find(query).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
