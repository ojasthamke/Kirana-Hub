import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BusinessCategory from '@/models/BusinessCategory';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
    const session = getAuthSession(req);
    // Allow 'user' also to fetch categories for the sidebar
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    await dbConnect();
    const categories = await BusinessCategory.find({ is_active: true });
    return NextResponse.json(categories);
}

export async function POST(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        await dbConnect();
        const category = await BusinessCategory.create(body);
        return NextResponse.json({ success: true, category });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, ...updates } = await req.json();
        await dbConnect();
        const category = await BusinessCategory.findByIdAndUpdate(id, updates, { new: true });
        return NextResponse.json({ success: true, category });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await req.json();
        await dbConnect();
        await BusinessCategory.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
