import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';

// GET all vendors — Admin only
export async function GET() {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Alias id to _id for frontend
    const formattedVendors = vendors.map(v => {
        const { password, ...rest } = v;
        return { ...rest, _id: v.id };
    });
    return NextResponse.json(formattedVendors);
}

// POST — Admin creates a new vendor directly
export async function POST(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { name, store_name, store_address, gst_number, turnover, phone, email, password } = await req.json();

        const { data: existing } = await supabase
            .from('vendors')
            .select('id')
            .or(`phone.eq.${phone},gst_number.eq.${gst_number}`)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Vendor with this phone or GST already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { data: vendor, error } = await supabase
            .from('vendors')
            .insert({
                name, store_name, store_address, gst_number, turnover,
                phone, email, password: hashedPassword,
                status: 'approved', // Admin-created vendors are auto-approved
                role: 'vendor',
            })
            .select()
            .single();

        if (error) throw error;

        const { password: _, ...vendorObj } = vendor;
        return NextResponse.json({ success: true, vendor: { ...vendorObj, _id: vendorObj.id } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH — Toggle vendor status (approve/block) or update info
export async function PATCH(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { vendorId, status, password, ...rest } = await req.json();
        const updateData: any = { ...rest };
        if (status) updateData.status = status;
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const { data: vendor, error } = await supabase
            .from('vendors')
            .update(updateData)
            .eq('id', vendorId)
            .select()
            .single();

        if (error) throw error;

        const { password: _, ...vendorObj } = vendor;
        return NextResponse.json({ success: true, vendor: { ...vendorObj, _id: vendorObj.id } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE — Remove vendor
export async function DELETE(req: Request) {
    const session = getAuthSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { vendorId } = await req.json();
        const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
