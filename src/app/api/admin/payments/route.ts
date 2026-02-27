import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import VendorWallet from '@/models/VendorWallet';
import { getAuthSession } from '../../../../lib/auth';

export async function POST(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { vendorId, amount } = await req.json();
    await dbConnect();

    const wallet = await VendorWallet.findOneAndUpdate(
        { vendor_id: vendorId },
        {
            $inc: {
                total_paid: amount,
                pending_amount: -amount
            }
        },
        { new: true }
    );

    return NextResponse.json({ success: true, wallet });
}
