import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Vendor from '@/models/Vendor';
import { getAuthSession } from '@/lib/auth';

// GET all vendors — Admin only
export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const vendors = await Vendor.find({}).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(vendors);
}

// POST — Admin creates a new vendor directly
export async function POST(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { name, store_name, store_address, gst_number, turnover, phone, email, password } = await req.json();
        await dbConnect();

        const existing = await Vendor.findOne({ $or: [{ phone }, { gst_number }] });
        if (existing) {
            return NextResponse.json({ error: 'Vendor with this phone or GST already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const vendor = await Vendor.create({
            name, store_name, store_address, gst_number, turnover,
            phone, email, password: hashedPassword,
            status: 'approved', // Admin-created vendors are auto-approved
            role: 'vendor',
        });

        const vendorObj = vendor.toObject();
        delete vendorObj.password;
        return NextResponse.json({ success: true, vendor: vendorObj });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH — Toggle vendor status (approve/block) or update info
export async function PATCH(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { vendorId, status, ...updates } = await req.json();
        await dbConnect();
        const updateData: any = {};
        if (status) updateData.status = status;
        Object.assign(updateData, updates);

        const vendor = await Vendor.findByIdAndUpdate(vendorId, updateData, { new: true }).select('-password');
        return NextResponse.json({ success: true, vendor });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE — Remove vendor
export async function DELETE(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { vendorId } = await req.json();
    await dbConnect();
    await Vendor.findByIdAndDelete(vendorId);
    return NextResponse.json({ success: true });
}
