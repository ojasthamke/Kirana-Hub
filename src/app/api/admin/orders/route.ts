import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            vendor_id:vendors (store_name),
            user_id:users (name, phone),
            products:order_items (*)
        `)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const formattedOrders = orders.map(o => ({
        ...o,
        _id: o.id,
        vendor_id: o.vendor_id ? { ...o.vendor_id, _id: o.vendor_id.id } : null,
        user_id: o.user_id ? { ...o.user_id, _id: o.user_id.id } : null,
        products: o.products.map((p: any) => ({ ...p, _id: p.id }))
    }));

    return NextResponse.json(formattedOrders);
}

export async function PATCH(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { orderId, status, payment_status } = await req.json();
        const update: any = {};
        if (status) update.status = status;
        if (payment_status) update.payment_status = payment_status;

        const { data: order, error } = await supabase
            .from('orders')
            .update(update)
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, order: { ...order, _id: order.id } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
