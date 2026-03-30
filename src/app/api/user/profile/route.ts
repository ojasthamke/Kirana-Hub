import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    const session = getAuthSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const user = await User.findById(session.id).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(user);
}

export async function PATCH(req: Request) {
    const session = getAuthSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const { name, address, business_type, password } = await req.json();
        
        // Only allow certain fields to be updated
        const updates: any = {};
        if (name) updates.name = name;
        if (address) updates.address = address;
        if (business_type) updates.business_type = business_type;
        if (password) updates.password = await bcrypt.hash(password, 10);

        const user = await User.findByIdAndUpdate(session.id, updates, { new: true }).select('-password');
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ success: true, user });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Error updating profile' }, { status: 500 });
    }
}
