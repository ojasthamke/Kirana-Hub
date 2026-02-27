import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const products = await Product.find({}).populate('vendor_id', 'store_name name').sort({ createdAt: -1 });
    return NextResponse.json(products);
}

export async function POST(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const data = await req.json();
        await dbConnect();
        const product = await Product.create(data);
        revalidateTag('products'); // Update homepage cache immediately
        return NextResponse.json({ success: true, product });
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
        await dbConnect();
        const product = await Product.findByIdAndUpdate(productId, updates, { new: true });
        revalidateTag('products'); // Update homepage cache immediately
        return NextResponse.json({ success: true, product });
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
        await dbConnect();
        await Product.findByIdAndDelete(productId);
        revalidateTag('products'); // Update homepage cache immediately
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
