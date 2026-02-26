import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getAuthSession } from '@/lib/auth';

// GET — vendor's own products
export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'vendor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const products = await Product.find({ vendor_id: session.id }).sort({ createdAt: -1 });
    return NextResponse.json(products);
}

// POST — vendor adds a product
export async function POST(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'vendor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const data = await req.json();
        await dbConnect();
        const product = await Product.create({ ...data, vendor_id: session.id });
        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH — vendor edits own product only
export async function PATCH(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'vendor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { productId, ...updates } = await req.json();
        await dbConnect();
        // Ensure vendor can only edit their own product
        const product = await Product.findOneAndUpdate(
            { _id: productId, vendor_id: session.id },
            updates,
            { new: true }
        );
        if (!product) return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 });
        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE — vendor deletes own product only
export async function DELETE(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'vendor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { productId } = await req.json();
        await dbConnect();
        const result = await Product.findOneAndDelete({ _id: productId, vendor_id: session.id });
        if (!result) return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
