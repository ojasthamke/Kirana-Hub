import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
    const session = getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        let query = supabase
            .from('orders')
            .select(`
                *,
                user_id:users (name, phone, address),
                vendor_id:vendors (store_name, phone),
                products:order_items (*)
            `);

        if (session.role === 'user') query = query.eq('user_id', session.id);
        if (session.role === 'vendor') query = query.eq('vendor_id', session.id);

        const { data: orders, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Alias id to _id and format for frontend
        const formattedOrders = orders.map(o => ({
            ...o,
            _id: o.id,
            user_id: o.user_id ? { ...o.user_id, _id: o.user_id.id } : null,
            vendor_id: o.vendor_id ? { ...o.vendor_id, _id: o.vendor_id.id } : null,
            products: o.products.map((p: any) => ({ ...p, _id: p.id }))
        }));

        return NextResponse.json(formattedOrders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
