import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getAuthSession } from '../../../../lib/auth';

export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            vendor_id:vendors (store_name, name)
        `)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const formattedProducts = products.map(p => ({
        ...p,
        _id: p.id,
        vendor_id: p.vendor_id ? { ...p.vendor_id, _id: p.vendor_id.id } : null
    }));
    return NextResponse.json(formattedProducts);
}

export async function POST(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const data = await req.json();
        const { data: product, error } = await supabase
            .from('products')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, product: { ...product, _id: product.id } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { productId, ...updates } = await req.json();
        const { data: product, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', productId)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, product: { ...product, _id: product.id } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { productId } = await req.json();
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
