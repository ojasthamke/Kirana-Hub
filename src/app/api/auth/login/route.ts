import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Vendor from '@/models/Vendor';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { phone, password, role } = await req.json();
        await dbConnect();

        let account;
        if (role === 'vendor') {
            account = await Vendor.findOne({ phone });
            if (account && account.status !== 'approved') {
                return NextResponse.json({ error: 'Vendor account pending approval' }, { status: 403 });
            }
        } else {
            account = await User.findOne({ phone });
        }

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = signToken({
            id: account._id,
            role: account.role as any,
            name: account.name
        });

        cookies().set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return NextResponse.json({
            success: true,
            user: { name: account.name, role: account.role }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
