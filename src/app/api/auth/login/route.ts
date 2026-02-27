import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { phone, password, role } = await req.json();

        // 1. Fetch user/vendor from Supabase
        const table = role === 'vendor' ? 'vendors' : 'users';
        const { data: account, error: fetchError } = await supabase
            .from(table)
            .select('*')
            .eq('phone', phone)
            .single();

        if (fetchError || !account) {
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

        // 4. Generate Token
        const token = signToken({
            id: account.id,
            role: account.role as any,
            name: account.name
        });

        cookies().set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60, // 365 days
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
