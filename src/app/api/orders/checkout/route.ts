import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = getAuthSession();
        if (!session || session.role !== 'user') {
            return NextResponse.json({ error: 'Please login as a Shop Owner to place orders.' }, { status: 401 });
        }

        const { cartItems, payment_method } = await req.json();

        // 1. Fetch products to verify stock and identity
        const productIds = cartItems.map((item: any) => item.productId);
        const { data: dbProducts, error: productError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

        if (productError || !dbProducts) throw new Error('Failed to fetch products');

        const vendorBatches: Record<string, any[]> = {};
        const masterOrderId = `MST-${Date.now()}`;
        let masterTotal = 0;

        // 2. Process items and group by vendor
        for (const item of cartItems) {
            const dbProduct = dbProducts.find(p => p.id === item.productId);
            if (!dbProduct || dbProduct.stock < item.quantity) {
                throw new Error(`Product "${dbProduct?.name_en || item.productId}" is out of stock or has insufficient quantity.`);
            }

            const vendorId = dbProduct.vendor_id;
            if (!vendorBatches[vendorId]) vendorBatches[vendorId] = [];

            const lineTotal = dbProduct.price * item.quantity;
            masterTotal += lineTotal;

            vendorBatches[vendorId].push({
                product_id: dbProduct.id,
                name_en: dbProduct.name_en,
                name_hi: dbProduct.name_hi,
                price: dbProduct.price,
                quantity: item.quantity,
                total: lineTotal
            });

            // Update stock in Supabase
            const newStock = dbProduct.stock - item.quantity;
            const newStatus = newStock === 0 ? 'Out of Stock' : 'In Stock';

            await supabase
                .from('products')
                .update({ stock: newStock, status: newStatus })
                .eq('id', dbProduct.id);
        }

        // 3. Create orders for each vendor
        const orders = [];
        for (const [vendorId, products] of Object.entries(vendorBatches)) {
            const vendorTotal = products.reduce((acc, p) => acc + p.total, 0);
            const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_id: orderId,
                    master_order_id: masterOrderId,
                    vendor_id: vendorId,
                    user_id: session.id,
                    total_amount: vendorTotal,
                    status: 'Pending',
                    payment_status: 'Unpaid',
                    payment_method: payment_method || 'Cash',
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Insert order items
            const itemsToInsert = products.map(p => ({
                order_id: newOrder.id,
                product_id: p.product_id,
                name_en: p.name_en,
                name_hi: p.name_hi,
                price: p.price,
                quantity: p.quantity,
                total: p.total
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
            if (itemsError) throw itemsError;

            orders.push({ ...newOrder, _id: newOrder.id, products });
        }

        return NextResponse.json({ success: true, masterOrderId, orders });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
