import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getAuthSession } from '../../../../lib/auth';

export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'user') {
        return NextResponse.json({ totalUnpaid: 0 });
    }

    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('user_id', session.id)
            .eq('payment_status', 'Unpaid');

        if (error) throw error;

        const totalUnpaid = (orders || []).reduce((sum, order) => sum + Number(order.total_amount), 0);

        return NextResponse.json({ totalUnpaid });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
