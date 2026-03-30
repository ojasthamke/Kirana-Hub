import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Location from '@/models/Location';

export async function GET() {
    try {
        await dbConnect();
        const locations = await Location.find({ is_active: true }).sort({ state: 1 });
        return NextResponse.json(locations);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
