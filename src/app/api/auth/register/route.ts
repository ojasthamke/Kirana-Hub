import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Vendor from '@/models/Vendor';

export async function POST(req: Request) {
    try {
        await dbConnect(); // Connect to Database

        const {
            name, store_name, store_address, gst_number,
            phone, alternate_phone, email, password, role, business_type,
            state, city
        } = await req.json();

        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === 'vendor') {
            // Check for existing vendor in Local MongoDB
            const existing = await Vendor.findOne({
                $or: [{ phone }, { email }, { gst_number }]
            });

            if (existing) return NextResponse.json({ error: 'Vendor already registered' }, { status: 400 });

            await Vendor.create({
                name,
                store_name,
                store_address,
                gst_number,
                phone,
                alternate_phone,
                email,
                password: hashedPassword,
                status: 'pending', // Admin must approve
                state: state || 'Maharashtra',
                city: city || 'Yavatmal'
            });
        } else {
            // Check for existing user in Local MongoDB
            const existing = await User.findOne({ phone });

            if (existing) return NextResponse.json({ error: 'User already registered' }, { status: 400 });

            await User.create({
                name,
                phone,
                address: store_address || 'Not Provided',
                state: state || 'Maharashtra',
                city: city || 'Yavatmal',
                business_type: business_type || 'Kirana Store',
                password: hashedPassword,
                role: 'user'
            });
        }

        return NextResponse.json({ success: true, message: 'Registration success' });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Database connection failed.' }, { status: 500 });
    }
}
