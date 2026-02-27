import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '../../../../lib/supabase';

export async function POST(req: Request) {
    try {
        const {
            name, store_name, store_address, gst_number,
            phone, alternate_phone, email, password, role, business_type
        } = await req.json();

        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === 'vendor') {
            // Check for existing vendor
            const { data: existing } = await supabase
                .from('vendors')
                .select('id')
                .or(`phone.eq.${phone},email.eq.${email},gst_number.eq.${gst_number}`)
                .single();

            if (existing) return NextResponse.json({ error: 'Vendor already registered' }, { status: 400 });

            const { error } = await supabase.from('vendors').insert({
                name,
                store_name,
                store_address,
                gst_number,
                phone,
                alternate_phone,
                email,
                password: hashedPassword,
                status: 'pending' // Admin must approve
            });

            if (error) throw error;
        } else {
            // Check for existing user
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('phone', phone)
                .single();

            if (existing) return NextResponse.json({ error: 'User already registered' }, { status: 400 });

            const { error } = await supabase.from('users').insert({
                name,
                phone,
                address: store_address || 'Not Provided',
                business_type: business_type || 'Kirana Store',
                password: hashedPassword,
                role: 'user'
            });

            if (error) throw error;
        }

        return NextResponse.json({ success: true, message: 'Registration submit success' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
