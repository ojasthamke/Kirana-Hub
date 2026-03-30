async function test() {
    try {
        const res = await fetch('https://kiranahub.vercel.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: 'test', password: 'test', role: 'user' })
        });
        console.log('Status:', res.status);
        console.log('Headers:', Object.fromEntries(res.headers.entries()));
        const text = await res.text();
        console.log('Body snippet:', text.substring(0, 200));
        try {
            JSON.parse(text);
            console.log('✅ Valid JSON');
        } catch (e) {
            console.log('❌ NOT VALID JSON');
        }
    } catch (err) {
        console.error('Test failed:', err.message);
    }
}
test();
