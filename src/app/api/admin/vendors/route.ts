import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vendor from '@/models/Vendor';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const vendors = await Vendor.find({});
    return NextResponse.json(vendors);
}

export async function PATCH(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { vendorId, status } = await req.json();
    await dbConnect();
    const vendor = await Vendor.findByIdAndUpdate(vendorId, { status }, { new: true });
    return NextResponse.json(vendor);
}
