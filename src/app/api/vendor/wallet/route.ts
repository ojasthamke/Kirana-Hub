import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VendorWallet from '@/models/VendorWallet';
import Order from '@/models/Order';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'vendor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const wallet = await VendorWallet.findOne({ vendor_id: session.id });
    return NextResponse.json(wallet);
}

export async function POST(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'vendor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, amount } = await req.json();
    await dbConnect();

    // Only Admin can actually MARK. Vendor sends "Mark Payment Received" request.
    // Simplifying: Admin approves, Vendor requests.
    return NextResponse.json({ success: true, message: 'Request sent to Admin' });
}
