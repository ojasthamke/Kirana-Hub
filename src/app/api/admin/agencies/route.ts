import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Vendor from '@/models/Vendor';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const vendors = await Vendor.find({}).sort({ createdAt: -1 });
        return NextResponse.json(vendors);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        await dbConnect();
        const { name, store_name, store_address, gst_number, turnover, phone, email, password, business_segments } = await req.json();

        const existing = await Vendor.findOne({ $or: [{ phone }, { gst_number }, { email }] });
        if (existing) {
            return NextResponse.json({ error: 'Vendor already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const vendor = await Vendor.create({
            name, store_name, store_address, gst_number, turnover,
            phone, email, password: hashedPassword,
            status: 'approved',
            business_segments: business_segments || []
        });

        return NextResponse.json({ success: true, vendor });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        await dbConnect();
        const { vendorId, password, business_segments, ...updates } = await req.json();
        
        if (password && password.trim() !== '') {
            updates.password = await bcrypt.hash(password, 10);
        }

        if (business_segments) {
            updates.business_segments = business_segments;
        }

        const vendor = await Vendor.findByIdAndUpdate(vendorId, updates, { new: true });
        return NextResponse.json({ success: true, vendor });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        await dbConnect();
        const { vendorId } = await req.json();
        await Vendor.findByIdAndDelete(vendorId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
