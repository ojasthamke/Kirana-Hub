const fetch = require('node-fetch');

async function test() {
    const res = await fetch('http://localhost:3000/api/agency/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name_en: 'Test Product',
            name_hi: 'टेस्ट',
            category: 'Oil',
            price: 100,
            stock: 10,
            unit: 'liter',
            min_qty: 1,
            status: 'In Stock',
            variants: [
                {
                    variant_name: 'Box',
                    price: 1200,
                    stock: 5,
                    unit: 'pcs',
                    min_qty: 1,
                    status: 'In Stock'
                }
            ]
        })
    });
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
}

test();
