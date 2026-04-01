const mongoose = require('mongoose');
const fs = require('fs');

// Read production env for DB URI
const envFile = fs.readFileSync('.env.local', 'utf8');
const connectionString = envFile.match(/MONGODB_URI=(.*)/)[1].trim();
const VENDOR_ID = "69cab62051b0fbba68894639"; // VARDHAMAN GENERAL

const productsData = [
  // Pulses (Dals) - 15 items
  { category: 'Pulses', en: 'Toor Dal (Premium)', hi: 'तूर दाल (प्रीमियम)', p: 168, u: 'kg', img: 'https://5.imimg.com/data5/ANDROID/Default/2021/2/QY/YH/ZN/24855013/pulses-500x500.jpg' },
  { category: 'Pulses', en: 'Moong Dal (Yellow)', hi: 'मूंग दाल (पीली)', p: 110, u: 'kg', img: 'https://m.media-amazon.com/images/I/71I6Y6hG8sL._AC_UF894,1000_QL80_.jpg' },
  { category: 'Pulses', en: 'Chana Dal', hi: 'चना दाल', p: 85, u: 'kg', img: 'https://m.media-amazon.com/images/I/41-3D6Wl+0L.jpg' },
  { category: 'Pulses', en: 'Urad Dal (Split)', hi: 'उड़द दाल (छिली)', p: 135, u: 'kg', img: 'https://m.media-amazon.com/images/I/81I71S70r6L._SL1500_.jpg' },
  { category: 'Pulses', en: 'Masoor Dal (Red)', hi: 'मसूर दाल (लाल)', p: 98, u: 'kg' },
  { category: 'Pulses', en: 'Kabuli Chana (Big)', hi: 'काबुली चना (बड़ा)', p: 145, u: 'kg' },
  { category: 'Pulses', en: 'Black Chana', hi: 'काला चना', p: 78, u: 'kg' },
  { category: 'Pulses', en: 'Rajma (Chitra)', hi: 'राजमा (चित्रा)', p: 155, u: 'kg' },
  { category: 'Pulses', en: 'Lobia (White)', hi: 'लोबिया (सफेद)', p: 90, u: 'kg' },
  { category: 'Pulses', en: 'Moong Sabut (Whole)', hi: 'मूंग साबुत', p: 105, u: 'kg' },
  { category: 'Pulses', en: 'Urad Sabut (Whole)', hi: 'उड़द साबुत', p: 140, u: 'kg' },
  { category: 'Pulses', en: 'Matar (White)', hi: 'सफेद मटर', p: 70, u: 'kg' },
  { category: 'Pulses', en: 'Dal Val (Broad)', hi: 'दाल वाल', p: 120, u: 'kg' },
  { category: 'Pulses', en: 'Chowli Dal', hi: 'चौली दाल', p: 100, u: 'kg' },
  { category: 'Pulses', en: 'Soya Chunks', hi: 'सोया चंक्स', p: 45, u: 'pack' },

  // Rice - 10 items
  { category: 'Rice', en: 'Basmati Rice (Gold)', hi: 'बासमती चावल (गोल्ड)', p: 185, u: 'kg', img: 'https://m.media-amazon.com/images/I/81kH6pXunxL._SL1500_.jpg' },
  { category: 'Rice', en: 'Kolam Rice (Select)', hi: 'कोलम चावल', p: 68, u: 'kg' },
  { category: 'Rice', en: 'Wada Kolam', hi: 'वाडा कोलम', p: 85, u: 'kg' },
  { category: 'Rice', en: 'HMT Rice', hi: 'HMT चावल', p: 65, u: 'kg' },
  { category: 'Rice', en: 'Mogra Rice', hi: 'मोगरा चावल', p: 55, u: 'kg' },
  { category: 'Rice', en: 'Indrayani Rice (Sticky)', hi: 'इंद्रायणी चावल', p: 75, u: 'kg' },
  { category: 'Rice', en: 'Brown Rice', hi: 'ब्राउन राइस', p: 120, u: 'kg' },
  { category: 'Rice', en: 'Sona Masoori Rice', hi: 'सोना मसूरी चावल', p: 60, u: 'kg' },
  { category: 'Rice', en: 'Dubar Basmati', hi: 'दुबर बासमती', p: 110, u: 'kg' },
  { category: 'Rice', en: 'Tibar Basmati', hi: 'तिबर बासमती', p: 135, u: 'kg' },

  // Spices & Masala - 20 items
  { category: 'Spices', en: 'Red Chilli Powder', hi: 'लाल मिर्च पाउडर', p: 380, u: 'kg', img: 'https://m.media-amazon.com/images/I/81L7L9Z5xSL._SL1500_.jpg' },
  { category: 'Spices', en: 'Turmeric Powder (Haldi)', hi: 'हल्दी पाउडर', p: 240, u: 'kg' },
  { category: 'Spices', en: 'Coriander Powder (Dhaniya)', hi: 'धनिया पाउडर', p: 220, u: 'kg' },
  { category: 'Spices', en: 'Cumin Seeds (Jeera)', hi: 'जीरा', p: 550, u: 'kg' },
  { category: 'Spices', en: 'Black Pepper (Kali Mirch)', hi: 'काली मिर्च', p: 850, u: 'kg' },
  { category: 'Spices', en: 'Cardamom (Elaichi)', hi: 'हरी इलायची', p: 2800, u: 'kg' },
  { category: 'Spices', en: 'Cinnamon Sticks (Dalchini)', hi: 'दालचीनी', p: 450, u: 'kg' },
  { category: 'Spices', en: 'Cloves (Laung)', hi: 'लौंग', p: 1200, u: 'kg' },
  { category: 'Spices', en: 'Fennel Seeds (Saunf)', hi: 'सौंफ', p: 320, u: 'kg' },
  { category: 'Spices', en: 'Mustard Seeds (Rai)', hi: 'राई', p: 95, u: 'kg' },
  { category: 'Spices', en: 'Garam Masala (Powder)', hi: 'गरम मसाला', p: 150, u: 'pack' },
  { category: 'Spices', en: 'Chicken Masala', hi: 'चिकन मसाला', p: 80, u: 'pack' },
  { category: 'Spices', en: 'Kitchen King Masala', hi: 'किचन किंग मसाला', p: 95, u: 'pack' },
  { category: 'Spices', en: 'Asafoetida (Hing)', hi: 'हींग', p: 45, u: 'pcs' },
  { category: 'Spices', en: 'Kasamir Red Chilli', hi: 'कश्मीरी लाल मिर्च', p: 550, u: 'kg' },
  { category: 'Spices', en: 'Bay Leaves (Tejpatta)', hi: 'तेजपत्ता', p: 10, u: 'pack' },
  { category: 'Spices', en: 'Dry Ginger (Sonth)', hi: 'सोंठ', p: 450, u: 'kg' },
  { category: 'Spices', en: 'Fenugreek (Methi)', hi: 'मेथी दाना', p: 110, u: 'kg' },
  { category: 'Spices', en: 'Carom Seeds (Ajwain)', hi: 'अजवाइन', p: 340, u: 'kg' },
  { category: 'Spices', en: 'Rock Salt (Sendha Namak)', hi: 'सेंधा नमक', p: 65, u: 'kg' },

  // Oil & Ghee - 10 items
  { category: 'Oil', en: 'Sunflower Oil (1L)', hi: 'सूरजमुखी तेल', p: 135, u: 'liter', img: 'https://m.media-amazon.com/images/I/71Y8KxAnEwL._SL1500_.jpg' },
  { category: 'Oil', en: 'Soyabean Oil (1L)', hi: 'सोयाबीन तेल', p: 122, u: 'liter' },
  { category: 'Oil', en: 'Refined Groundnut Oil', hi: 'मूंगफली का तेल', p: 175, u: 'liter' },
  { category: 'Oil', en: 'Pure Mustard Oil', hi: 'सरसों का तेल', p: 145, u: 'liter' },
  { category: 'Oil', en: 'Pure Cow Ghee (500ml)', hi: 'गाय का घी', p: 310, u: 'pcs', img: 'https://m.media-amazon.com/images/I/61S1qEqyJ0L._SL1100_.jpg' },
  { category: 'Oil', en: 'Buffalo Ghee (1L)', hi: 'भैंस का घी', p: 680, u: 'liter' },
  { category: 'Oil', en: 'Coconut Oil (Edible)', hi: 'नारियल तेल', p: 180, u: 'liter' },
  { category: 'Oil', en: 'Rice Bran Oil', hi: 'राइस ब्रान तेल', p: 130, u: 'liter' },
  { category: 'Oil', en: 'Palm Oil', hi: 'पाम तेल', p: 98, u: 'liter' },
  { category: 'Oil', en: 'Cottonseed Oil', hi: 'कपास्या तेल', p: 128, u: 'liter' },

  // Flour & Grains - 10 items
  { category: 'Flour', en: 'Wheat Flour (Chakki Atta)', hi: 'chakki आटा', p: 45, u: 'kg' },
  { category: 'Flour', en: 'Maida (Premium)', hi: 'मैदा', p: 38, u: 'kg' },
  { category: 'Flour', en: 'Besan (Chana Flour)', hi: 'बेसन', p: 95, u: 'kg' },
  { category: 'Flour', en: 'Rice Flour', hi: 'चावल का आटा', p: 42, u: 'kg' },
  { category: 'Flour', en: 'Rava (Suji)', hi: 'रवा (सूजी)', p: 44, u: 'kg' },
  { category: 'Flour', en: 'Lapsi Rava', hi: 'लाप्सी रवा', p: 48, u: 'kg' },
  { category: 'Flour', en: 'Bajra Flour', hi: 'बाजरा का आटा', p: 35, u: 'kg' },
  { category: 'Flour', en: 'Jowar Flour', hi: 'ज्वार का आटा', p: 65, u: 'kg' },
  { category: 'Flour', en: 'Makai Atta (Corn)', hi: 'मकाई आटा', p: 40, u: 'kg' },
  { category: 'Flour', en: 'Multigrain Atta', hi: 'मल्टीग्रेन आटा', p: 65, u: 'kg' },

  // Sugar & Staples - 10 items
  { category: 'Sugar', en: 'Pure Sugar (M-Grade)', hi: 'चीनी', p: 42, u: 'kg' },
  { category: 'Sugar', en: 'Jaggery (Gud Cubes)', hi: 'गुड़', p: 65, u: 'kg' },
  { category: 'Sugar', en: 'Jaggery Powder', hi: 'गुड़ पाउडर', p: 85, u: 'kg' },
  { category: 'Sugar', en: 'Misri (Sugar Candy)', hi: 'मिश्री', p: 110, u: 'kg' },
  { category: 'Staples', en: 'Iodized Salt', hi: 'नमक', p: 25, u: 'kg' },
  { category: 'Staples', en: 'Poha (Medium)', hi: 'पोहा', p: 55, u: 'kg' },
  { category: 'Staples', en: 'Poha (Thick)', hi: 'मोटा पोहा', p: 58, u: 'kg' },
  { category: 'Staples', en: 'Murmura (Puffed Rice)', hi: 'मुरमुरा', p: 80, u: 'kg' },
  { category: 'Staples', en: 'Sabudana (Tapioca)', hi: 'साबूदाना', p: 95, u: 'kg' },
  { category: 'Staples', en: 'Makhana (Fox Nuts)', hi: 'मखाना', p: 750, u: 'kg' },

  // Dry Fruits - 10 items
  { category: 'Dry Fruits', en: 'Almonds (Badam)', hi: 'बादाम', p: 850, u: 'kg', img: 'https://m.media-amazon.com/images/I/51wXFpCoz7L.jpg' },
  { category: 'Dry Fruits', en: 'Cashew (Kaju W320)', hi: 'काजू', p: 950, u: 'kg' },
  { category: 'Dry Fruits', en: 'Walnut (Akhrot)', hi: 'अखरोट', p: 1200, u: 'kg' },
  { category: 'Dry Fruits', en: 'Pistachios (Pista)', hi: 'पिस्ता', p: 1400, u: 'kg' },
  { category: 'Dry Fruits', en: 'Raisins (Kishmish)', hi: 'किशमिश', p: 280, u: 'kg' },
  { category: 'Dry Fruits', en: 'Dates (Khajur)', hi: 'खजूर', p: 350, u: 'kg' },
  { category: 'Dry Fruits', en: 'Anjeer (Dry Figs)', hi: 'अंजीर', p: 1200, u: 'kg' },
  { category: 'Dry Fruits', en: 'Dry Coconut', hi: 'सूखा नारियल', p: 220, u: 'kg' },
  { category: 'Dry Fruits', en: 'Peanuts (Sengdana)', hi: 'मूंगफली', p: 135, u: 'kg' },
  { category: 'Dry Fruits', en: 'Melon Seeds', hi: 'खरबूजे के बीज', p: 480, u: 'kg' },

  // Cleaning & Personal Care (Other) - 15 items
  { category: 'Other', en: 'Detergent Powder', hi: 'सर्फ़ पाउडर', p: 95, u: 'kg' },
  { category: 'Other', en: 'Dishwash Bar', hi: 'बर्तन धोने का साबुन', p: 10, u: 'pcs' },
  { category: 'Other', en: 'Toilet Cleaner (500ml)', hi: 'टॉयलेट क्लीनर', p: 95, u: 'pcs' },
  { category: 'Other', en: 'Bath Soap (Sandals)', hi: 'नहाने का साबुन', p: 45, u: 'pcs' },
  { category: 'Other', en: 'Hand Wash Refill', hi: 'हैंड वॉश', p: 85, u: 'pcs' },
  { category: 'Other', en: 'Washing Soda', hi: 'धोने का सोडा', p: 35, u: 'kg' },
  { category: 'Other', en: 'Phenyl (Concentrated)', hi: 'फिनाइल', p: 65, u: 'liter' },
  { category: 'Other', en: 'Floor Cleaner (1L)', hi: 'फ़्लोर क्लीनर', p: 110, u: 'liter' },
  { category: 'Other', en: 'Napthalene Balls', hi: 'डामर की गोलियां', p: 25, u: 'pack' },
  { category: 'Other', en: 'Toothpaste (100g)', hi: 'टूथपेस्ट', p: 55, u: 'pcs' },
  { category: 'Other', en: 'Matches (Bundle)', hi: 'माचिस', p: 50, u: 'pack' },
  { category: 'Other', en: 'Agarbatti (Incense)', hi: 'अगरबत्ती', p: 40, u: 'pack' },
  { category: 'Other', en: 'Dua Ghee Wick', hi: 'घी बत्ती', p: 35, u: 'pack' },
  { category: 'Other', en: 'Scrubber (Steel)', hi: 'लोहे का जूना', p: 15, u: 'pcs' },
  { category: 'Other', en: 'Camphor (Kapoor)', hi: 'कपूर', p: 20, u: 'pack' }
];

async function seed() {
    console.log("🚀 Starting Bulk Product Seed...");
    await mongoose.connect(connectionString);
    console.log("✅ DB Connected.");

    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
        vendor_id: mongoose.Schema.Types.ObjectId,
        category: String,
        name_en: String,
        name_hi: String,
        price: Number,
        unit: String,
        min_qty: Number,
        stock: Number,
        offer: String,
        status: String,
        image_url: String,
        variants: Array
    }));

    // Clear existing products to prevent spam
    // await Product.deleteMany({ vendor_id: VENDOR_ID });

    const finalProducts = productsData.map(p => ({
        vendor_id: new mongoose.Types.ObjectId(VENDOR_ID),
        category: p.category,
        name_en: p.en,
        name_hi: p.hi,
        price: p.p,
        unit: p.u,
        min_qty: p.category === 'Other' ? 5 : 1,
        stock: 500,
        offer: Math.random() > 0.8 ? 'BUY 5 GET 1 FREE' : '',
        status: 'In Stock',
        image_url: p.img || '',
        variants: [
            { variant_name: '5kg Pack', price: p.p * 5 * 0.95, stock: 100, unit: p.u === 'kg' ? 'pack' : p.u, min_qty: 1, status: 'In Stock' },
            { variant_name: '10kg Wholesale', price: p.p * 10 * 0.92, stock: 50, unit: p.u === 'kg' ? 'bag' : p.u, min_qty: 1, status: 'In Stock' }
        ]
    }));

    console.log(`📦 Preparing to insert ${finalProducts.length} products...`);
    const result = await Product.insertMany(finalProducts);
    console.log(`✅ Success! Seeded ${result.length} products to Vendor ID: ${VENDOR_ID}`);
    process.exit();
}

seed().catch(err => {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
});
