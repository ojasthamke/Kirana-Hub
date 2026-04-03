import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Vendor from '@/models/Vendor';
import Reservation from '@/models/Reservation';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const conn = await dbConnect();
        if (!conn) {
            return NextResponse.json({ error: 'DB_CONNECTION_FAILURE: MONGODB_URI is missing or unreachable.' }, { status: 503 });
        }
        
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        let filter = {};
        if (category && category !== 'All') {
            filter = { category };
        }

        // Fetch products and populate vendor info locally
        const products = await Product.find(filter)
            .populate('vendor_id', 'store_name business_segments')
            .lean() // Get JS objects for modification
            .sort({ createdAt: -1 });

        // Subtract Reservations
        const allReservations = await Reservation.find({ expiresAt: { $gt: new Date() } });
        
        const modifiedProducts = (products as any[]).map(p => {
            let prod = { ...p };
            
            // Base product stock subtraction
            const baseReservations = allReservations.filter(r => 
                r.product_id.toString() === prod._id.toString() && !r.variant_name
            );
            const baseReservedQty = baseReservations.reduce((sum, r) => sum + r.quantity, 0);
            prod.totalReserved = baseReservedQty;
            prod.stock = Math.max(0, prod.stock - baseReservedQty);
            if (prod.stock <= 0 && baseReservedQty > 0) prod.status = 'Out of Stock';

            // Variant stock subtraction
            if (prod.variants && prod.variants.length > 0) {
                prod.variants = prod.variants.map((v: any) => {
                    const varRes = allReservations.filter(r => 
                        r.product_id.toString() === prod._id.toString() && r.variant_name === v.variant_name
                    );
                    const varReservedQty = varRes.reduce((sum, r) => sum + r.quantity, 0);
                    const newStock = Math.max(0, v.stock - varReservedQty);
                    return { 
                        ...v, 
                        totalReserved: varReservedQty,
                        stock: newStock,
                        status: newStock <= 0 && varReservedQty > 0 ? 'Out of Stock' : v.status
                    };
                });
            }

            return prod;
        });

        return NextResponse.json(modifiedProducts);
    } catch (error: any) {
        console.error('Failed to load products:', error);
        return NextResponse.json({ error: 'Database connection failed.' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = getAuthSession(req);
    if (!session || (session.role !== 'vendor' && session.role !== 'admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        await dbConnect();
        const data = await req.json();

        const product = await Product.create({
            ...data,
            vendor_id: session.id
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('Failed to create product:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
