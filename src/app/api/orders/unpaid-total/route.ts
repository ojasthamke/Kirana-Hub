import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'user') {
        return NextResponse.json({ totalUnpaid: 0 });
    }

    try {
        await dbConnect();
        const orders = await Order.find({
            user_id: session.id,
            payment_status: 'Unpaid'
        });

        const totalUnpaid = orders.reduce((sum, order) => sum + order.total_amount, 0);

        return NextResponse.json({ totalUnpaid });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
