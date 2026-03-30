import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Location from '@/models/Location';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const locations = await Location.find({}).sort({ state: 1 });
        return NextResponse.json(locations);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        await dbConnect();
        const { state, city } = await req.json();

        if (state && !city) {
            // Adding a new state
            const existing = await Location.findOne({ state });
            if (existing) {
                return NextResponse.json({ error: 'State already exists' }, { status: 400 });
            }
            const location = await Location.create({ state, cities: [] });
            return NextResponse.json({ success: true, location });
        } else if (state && city) {
            // Adding a city to an existing state
            const location = await Location.findOneAndUpdate(
                { state },
                { $addToSet: { cities: city } },
                { new: true, upsert: true }
            );
            return NextResponse.json({ success: true, location });
        }

        return NextResponse.json({ error: 'Missing state or city' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        await dbConnect();
        const { id, is_active, state } = await req.json();
        const location = await Location.findByIdAndUpdate(id, { is_active, state }, { new: true });
        return NextResponse.json({ success: true, location });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        await dbConnect();
        const { id, city, state } = await req.json();

        if (id && !city) {
            // Delete entire state record
            await Location.findByIdAndDelete(id);
            return NextResponse.json({ success: true });
        } else if (state && city) {
            // Remove a specific city from state
            const location = await Location.findOneAndUpdate(
                { state },
                { $pull: { cities: city } },
                { new: true }
            );
            return NextResponse.json({ success: true, location });
        }

        return NextResponse.json({ error: 'Missing location details' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
