import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Vendor from '@/models/Vendor';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('key') !== process.env.SEED_SECRET) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();

    const existing = await Product.countDocuments();
    if (existing >= 20) {
        return NextResponse.json({ error: 'Products already seeded', count: existing }, { status: 409 });
    }

    // Get all vendors
    const vendors = await Vendor.find({ status: 'approved' }).limit(2);
    if (vendors.length === 0) {
        return NextResponse.json({ error: 'No approved vendors found. Approve vendors first.' }, { status: 400 });
    }

    const v1 = vendors[0]._id;
    const v2 = vendors.length > 1 ? vendors[1]._id : vendors[0]._id;

    // 10 products for vendor 1
    const v1Products = [
        { vendor_id: v1, name_en: 'Toor Dal', name_hi: 'तूर दाल', category: 'Pulses', price: 120, stock: 500, offer: 'Best Seller', status: 'In Stock' },
        { vendor_id: v1, name_en: 'Moong Dal', name_hi: 'मूंग दाल', category: 'Pulses', price: 95, stock: 300, offer: '', status: 'In Stock' },
        { vendor_id: v1, name_en: 'Basmati Rice', name_hi: 'बासमती चावल', category: 'Rice', price: 85, stock: 1000, offer: 'Bulk Deal', status: 'In Stock' },
        { vendor_id: v1, name_en: 'Sona Masoori Rice', name_hi: 'सोना मसूरी चावल', category: 'Rice', price: 60, stock: 800, offer: '', status: 'In Stock' },
        { vendor_id: v1, name_en: 'Haldi Powder', name_hi: 'हल्दी पाउडर', category: 'Spices', price: 180, stock: 200, offer: 'Fresh Stock', status: 'In Stock' },
        { vendor_id: v1, name_en: 'Red Chilli Powder', name_hi: 'लाल मिर्च पाउडर', category: 'Spices', price: 220, stock: 150, offer: '', status: 'In Stock' },
        { vendor_id: v1, name_en: 'Sunflower Oil', name_hi: 'सूरजमुखी तेल', category: 'Oil', price: 140, stock: 400, offer: '5% Off', status: 'In Stock' },
        { vendor_id: v1, name_en: 'Wheat Flour (Atta)', name_hi: 'गेहूं का आटा', category: 'Flour', price: 45, stock: 2000, offer: 'Bulk Price', status: 'In Stock' },
        { vendor_id: v1, name_en: 'Sugar', name_hi: 'चीनी', category: 'Sugar', price: 42, stock: 1500, offer: '', status: 'In Stock' },
        { vendor_id: v1, name_en: 'Chana Dal', name_hi: 'चना दाल', category: 'Pulses', price: 88, stock: 400, offer: 'New Arrival', status: 'In Stock' },
    ];

    // 10 products for vendor 2
    const v2Products = [
        { vendor_id: v2, name_en: 'Urad Dal', name_hi: 'उड़द दाल', category: 'Pulses', price: 110, stock: 350, offer: '', status: 'In Stock' },
        { vendor_id: v2, name_en: 'Masoor Dal', name_hi: 'मसूर दाल', category: 'Pulses', price: 78, stock: 450, offer: 'Value Pack', status: 'In Stock' },
        { vendor_id: v2, name_en: 'Brown Rice', name_hi: 'ब्राउन राइस', category: 'Rice', price: 75, stock: 600, offer: 'Healthy Choice', status: 'In Stock' },
        { vendor_id: v2, name_en: 'Jeera (Cumin)', name_hi: 'जीरा', category: 'Spices', price: 320, stock: 100, offer: 'Premium', status: 'In Stock' },
        { vendor_id: v2, name_en: 'Coriander Powder', name_hi: 'धनिया पाउडर', category: 'Spices', price: 150, stock: 200, offer: '', status: 'In Stock' },
        { vendor_id: v2, name_en: 'Mustard Oil', name_hi: 'सरसों का तेल', category: 'Oil', price: 165, stock: 300, offer: 'Pure & Natural', status: 'In Stock' },
        { vendor_id: v2, name_en: 'Besan (Chickpea Flour)', name_hi: 'बेसन', category: 'Flour', price: 65, stock: 800, offer: '', status: 'In Stock' },
        { vendor_id: v2, name_en: 'Cashews', name_hi: 'काजू', category: 'Dry Fruits', price: 850, stock: 50, offer: 'Premium Quality', status: 'In Stock' },
        { vendor_id: v2, name_en: 'Almonds', name_hi: 'बादाम', category: 'Dry Fruits', price: 680, stock: 80, offer: 'Best Quality', status: 'In Stock' },
        { vendor_id: v2, name_en: 'Salt (Rock)', name_hi: 'सेंधा नमक', category: 'Staples', price: 30, stock: 5000, offer: 'Daily Essential', status: 'In Stock' },
    ];

    await Product.insertMany([...v1Products, ...v2Products]);

    return NextResponse.json({
        success: true,
        message: '20 products seeded successfully — 10 per vendor.',
        vendor1: vendors[0].store_name,
        vendor2: vendors[1]?.store_name || vendors[0].store_name
    });
}
