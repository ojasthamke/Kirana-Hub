import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Order from '@/models/Order';
import { getAuthSession } from '../../../../lib/auth';

export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'vendor') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        // Calculate wallet from orders directly — no separate model needed
        const orders = await Order.find({ vendor_id: session.id });

        const totalRevenue = orders
            .filter(o => o.status === 'Delivered')
            .reduce((sum, o) => sum + (o.total_amount || 0), 0);

        const pendingAmount = orders
            .filter(o => !['Delivered', 'Cancelled'].includes(o.status))
            .reduce((sum, o) => sum + (o.total_amount || 0), 0);

        return NextResponse.json({
            totalRevenue,
            pendingAmount,
            totalPaid: 0,
            orderCount: orders.length,
        });
    } catch (error: any) {
        // Return safe defaults on error — never crash the vendor page
        return NextResponse.json({
            totalRevenue: 0,
            pendingAmount: 0,
            totalPaid: 0,
            orderCount: 0,
        });
    }
}
