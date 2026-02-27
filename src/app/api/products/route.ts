import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getAuthSession } from '../../../../lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        let query = supabase
            .from('products')
            .select(`
                *,
                vendor_id:vendors (
                    store_name
                )
            `);

        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        const { data: rawProducts, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Map data to match frontend expectations (_id instead of id)
        const products = rawProducts.map((p: any) => ({
            ...p,
            _id: p.id,
            vendor_id: p.vendor_id ? { ...p.vendor_id, _id: p.vendor_id.id } : null
        }));

        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = getAuthSession();
    if (!session || (session.role !== 'vendor' && session.role !== 'admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const data = await req.json();

        const { data: product, error } = await supabase
            .from('products')
            .insert({
                ...data,
                vendor_id: session.id
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
