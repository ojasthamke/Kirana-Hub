import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from '../../../../lib/db';
import Product from '@/models/Product';
import { getAuthSession } from '../../../../lib/auth';

const isLocal = process.env.LOCAL_MODE === 'true';

export async function GET() {
    const session = getAuthSession();
    if (!session || (session.role !== 'vendor' && session.role !== 'admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const query = isLocal ? {} : { vendor_id: session.id };
    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json(products);
}

export async function POST(req: Request) {
    const session = getAuthSession();
    if (!session || (session.role !== 'vendor' && session.role !== 'admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const data = await req.json();
        await dbConnect();
        const product = await Product.create({ ...data, vendor_id: session.id });
        revalidateTag('products'); // Update homepage cache immediately
        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = getAuthSession();
    if (!session || (session.role !== 'vendor' && session.role !== 'admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { productId, ...updates } = await req.json();
        await dbConnect();
        const filter = isLocal ? { _id: productId } : { _id: productId, vendor_id: session.id };
        const product = await Product.findOneAndUpdate(filter, updates, { new: true });
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        revalidateTag('products'); // Update homepage cache immediately
        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = getAuthSession();
    if (!session || (session.role !== 'vendor' && session.role !== 'admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { productId } = await req.json();
        await dbConnect();
        const filter = isLocal ? { _id: productId } : { _id: productId, vendor_id: session.id };
        const result = await Product.findOneAndDelete(filter);
        if (!result) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        revalidateTag('products'); // Update homepage cache immediately
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
