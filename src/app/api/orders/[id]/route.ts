import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { status, payment_status } = body;
        const orderId = params.id;

        // Fetch old order
        const { data: oldOrder, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !oldOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (payment_status !== undefined) updateData.payment_status = payment_status;

        const { data: newOrder, error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single();

        if (updateError) throw updateError;

        // Note: Wallet system can be complex in SQL. For now, we skip detailed logic 
        // to ensure the order update works first.

        return NextResponse.json({ ...newOrder, _id: newOrder.id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
