import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Vendor from '@/models/Vendor';

export async function POST(req: Request) {
    try {
        const {
            name, store_name, store_address, gst_number,
            phone, alternate_phone, email, password, role
        } = await req.json();

        await dbConnect();

        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === 'vendor') {
            const existing = await Vendor.findOne({ $or: [{ phone }, { email }, { gst_number }] });
            if (existing) return NextResponse.json({ error: 'Vendor already registered' }, { status: 400 });

            await Vendor.create({
                name, store_name, store_address, gst_number,
                phone, alternate_phone, email,
                password: hashedPassword,
                status: 'pending' // Admin must approve
            });
        } else {
            const existing = await User.findOne({ phone });
            if (existing) return NextResponse.json({ error: 'User already registered' }, { status: 400 });

            await User.create({
                name, phone, address: store_address,
                password: hashedPassword,
                role: 'user'
            });
        }

        return NextResponse.json({ success: true, message: 'Registration submit success' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
