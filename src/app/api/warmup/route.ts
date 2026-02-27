import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

// This endpoint is called by Vercel Cron every 5 minutes
// to prevent cold starts on the DB connection
export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json({ ok: true, ts: Date.now() });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
