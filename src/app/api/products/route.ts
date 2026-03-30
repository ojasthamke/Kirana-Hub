import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Vendor from '@/models/Vendor';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect(); // Connect to MongoDB Atlas
        
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        let filter = {};
        if (category && category !== 'All') {
            filter = { category };
        }

        // Fetch products and populate vendor info locally
        const products = await Product.find(filter)
            .populate('vendor_id', 'store_name business_segments')
            .sort({ createdAt: -1 });

        console.log('DEBUG: Products found:', JSON.stringify(products[0]?.variants || 'No variants on first prod'));

        return NextResponse.json(products);
    } catch (error: any) {
        console.error('Failed to load products:', error);
        return NextResponse.json({ error: 'Database connection failed.' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = getAuthSession(req);
    if (!session || (session.role !== 'vendor' && session.role !== 'admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        await dbConnect();
        const data = await req.json();

        const product = await Product.create({
            ...data,
            vendor_id: session.id
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('Failed to create product:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
