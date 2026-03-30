import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Vendor from '@/models/Vendor';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
    return NextResponse.json({ ok: true, message: "Login API is reachable" });
}

export async function POST(req: Request) {
    try {
        const conn = await dbConnect(); // Connect to Database
        if (!conn) {
            console.error('❌ Login API failed: No database connection.');
            return NextResponse.json({ error: 'Database connection failed. Please try again later.' }, { status: 503 });
        }

        const { phone, password, role } = await req.json();

        // 1. Fetch user/vendor from Database
        let account;
        if (role === 'vendor' || role === 'admin') {
            account = await Vendor.findOne({ phone });
            // If not found in Vendor, try User for admin
            if (!account && role === 'admin') account = await User.findOne({ phone, role: 'admin' });
        } else {
            account = await User.findOne({ phone });
        }

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // 2. Check vendor approval status
        if (role === 'vendor' && account.status !== 'approved') {
            return NextResponse.json({ error: 'Vendor account pending approval' }, { status: 403 });
        }

        // 3. Verify Password
        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 4. Generate Token (using Database _id)
        const token = signToken({
            id: account._id.toString(),
            role: account.role as any,
            name: account.name
        });

        cookies().set('token', token, {
            httpOnly: true,
            secure: true, // Required for sameSite: 'none'
            sameSite: 'none',
            maxAge: 365 * 24 * 60 * 60, // 365 days
            path: '/',
        });

        return NextResponse.json({
            success: true,
            user: { name: account.name, role: account.role }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Database connection failed.' }, { status: 500 });
    }
}
