import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        let query = {};
        if (category && category !== 'All') {
            query = { category };
        }

        const products = await Product.find(query).populate('vendor_id', 'store_name');
        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'vendor') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await req.json();
        await dbConnect();
        const product = await Product.create({ ...data, vendor_id: session.id });
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
