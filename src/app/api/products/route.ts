import { NextResponse } from 'next/server';
import { unstable_cache, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getAuthSession } from '@/lib/auth';

// Fetch products from DB and store in Next.js server cache
// Cache is tagged 'products' so we can invalidate it on any update
const getCachedProducts = unstable_cache(
    async (category?: string) => {
        await dbConnect();
        const query: any = {};
        if (category && category !== 'All') query.category = category;
        const products = await Product.find(query)
            .populate('vendor_id', 'store_name')
            .lean()
            .exec();
        // Must serialize (remove Mongoose internals) before caching
        return JSON.parse(JSON.stringify(products));
    },
    ['products-list'],
    {
        revalidate: 300, // Refresh from DB every 5 minutes automatically
        tags: ['products'], // Can be force-invalidated on any CRUD
    }
);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category') || undefined;
        const products = await getCachedProducts(category);
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
        revalidateTag('products'); // Bust the cache immediately
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
