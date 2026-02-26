import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// One-time admin seed endpoint. Protected by a secret key.
// After first use, it will refuse to run again if admin already exists.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('key');

    // Must provide the correct secret key to run
    if (secret !== process.env.SEED_SECRET) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Check if admin already exists — only run once
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
        return NextResponse.json({ error: 'Admin already exists. This endpoint is disabled.' }, { status: 409 });
    }

    // Create admin with bcrypt-hashed password
    const hash = await bcrypt.hash('1212121', 12);
    await User.create({
        name: 'Super Admin',
        phone: 'ojasthamke',
        password: hash,
        address: 'Admin HQ',
        role: 'admin',
    });

    return NextResponse.json({ success: true, message: 'Admin created. Delete this endpoint now.' });
}
