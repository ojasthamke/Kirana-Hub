import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Vendor from '@/models/Vendor';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
    const session = getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect(); // Connect to Database

        let filter: any = {};
        if (session.role === 'user') filter.user_id = session.id;
        else if (session.role === 'vendor') filter.vendor_id = session.id;

        // Fetch orders and populate details from database
        const orders = await Order.find(filter)
            .populate('vendor_id', 'store_name phone')
            .populate('user_id', 'name phone address')
            .sort({ createdAt: -1 });

        return NextResponse.json(orders);
    } catch (error: any) {
        console.error('Failed to load orders:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
