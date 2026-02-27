import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, phone, address, business_type, role, created_at')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Alias id to _id for frontend
    const formattedUsers = users.map(u => ({ ...u, _id: u.id }));
    return NextResponse.json(formattedUsers);
}

export async function PATCH(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { userId, name, phone, address, password } = await req.json();
        const update: any = {};
        if (name) update.name = name;
        if (phone) update.phone = phone;
        if (address) update.address = address;
        if (password) update.password = await bcrypt.hash(password, 10);

        const { data: user, error } = await supabase
            .from('users')
            .update(update)
            .eq('id', userId)
            .select('id, name, phone, address, business_type, role, created_at')
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, user: { ...user, _id: user.id } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { userId } = await req.json();
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
