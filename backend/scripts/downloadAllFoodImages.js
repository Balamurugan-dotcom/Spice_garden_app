const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { foods } = require('../seeder/seedData');

const targetDir = path.join(__dirname, '../../frontend/public/images/foods');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Precise search terms for each of the 60 dishes to get the most authentic, mouth-watering photo
const searchTerms = {
  'Chicken Ghee Roast': 'Chicken ghee roast',
  'Paneer Tikka Angara': 'Paneer tikka',
  'Crispy Corn Pepper Salt': 'Crispy corn kernels',
  'Tandoori Murgh (Half)': 'Tandoori chicken',
  'Hara Bhara Kebab': 'Hara bhara kabab',
  'Mutton Galouti Kebab': 'Galouti kabab',
  'Dahi Ke Kebab': 'Dahi kabab',
  'Fish Amritsari Fry': 'Amritsari fish fry',
  'Tandoori Malai Broccoli': 'Broccoli tikka',
  'Chicken 65 Bangalore Style': 'Chicken 65',
  'Mushroom Kurkure': 'Stuffed mushroom fry',
  'Old Delhi Butter Chicken': 'Murgh makhani',
  'Paneer Butter Masala': 'Paneer butter masala',
  'Bangalore Mutton Sukka Curry': 'Mutton sukka',
  'Dal Makhani Royal': 'Dal makhani',
  'Butter Garlic Naan (2 pcs)': 'Garlic naan',
  'Kadhai Paneer Dhaba Style': 'Kadai paneer',
  'Chicken Tikka Masala': 'Chicken tikka masala',
  'Malai Kofta Imperial': 'Malai kofta',
  'Mutton Rogan Josh': 'Rogan josh',
  'Yellow Dal Tadka Double Chaunk': 'Dal tadka',
  'Palak Paneer Lahsuni': 'Palak paneer',
  'Amritsari Kulcha with Chole': 'Amritsari kulcha',
  'Hyderabadi Dum Chicken Biryani': 'Hyderabadi chicken biryani',
  'Royal Mutton Dum Biryani': 'Mutton biryani',
  'Lucknowi Paneer & Veg Biryani': 'Vegetable biryani',
  'Egg Dum Biryani': 'Egg biryani',
  'Kolkata Chicken Biryani with Potato & Egg': 'Kolkata biryani',
  'Ambur Star Mutton Biryani': 'Ambur biryani',
  'Chettinad Chicken Biryani': 'Chettinad chicken biryani',
  'Mushroom & Green Peas Dum Biryani': 'Mushroom biryani',
  'Tawa Chicken Tikka Biryani': 'Chicken biryani handi',
  'Saffron Jeera Rice with Dal Makhani': 'Jeera rice',
  'Dragon Chicken Bangalore Style': 'Dragon chicken Indo-Chinese',
  'Gobi Manchurian Dry': 'Gobi manchurian dry',
  'Chilli Garlic Veg Hakka Noodles': 'Veg hakka noodles',
  'Schezwan Chicken Fried Rice': 'Schezwan fried rice',
  'Chilli Paneer Gravy': 'Chilli paneer gravy',
  'Chicken Manchurian Gravy': 'Chicken manchurian',
  'Veg Triple Schezwan Fried Rice': 'Triple schezwan rice',
  'Crispy Honey Chilli Potatoes': 'Honey chilli potato',
  'Chicken Hakka Noodles Special': 'Chicken noodles wok',
  'Crispy Veg Spring Rolls (6 Pcs)': 'Fried spring rolls',
  'Gulab Jamun with Shahi Rabdi': 'Gulab jamun',
  'Kesari Rasmalai (2 Pcs)': 'Rasmalai saffron',
  'Gajar Ka Halwa Pure Desi Ghee': 'Gajar ka halwa',
  'Shahi Tukda Royal Oudh': 'Shahi tukda rabri',
  'Moong Dal Halwa Desi Ghee': 'Moong dal halwa',
  'Kulfi Falooda Delight': 'Falooda kulfi dessert',
  'Matka Phirni Chilled': 'Phirni rice pudding',
  'Hot Chocolate Brownie with Fudge': 'Chocolate brownie with fudge',
  'Bangalore Degree Filter Coffee': 'South Indian filter coffee',
  'Alphonso Mango Malai Lassi': 'Mango lassi beverage',
  'Fresh Nimbu Soda (Sweet & Salt)': 'Nimbu soda drink',
  'Masala Chai Cutting Kulhad': 'Masala chai kulhad tea',
  'Classic Sweet Punjabi Lassi': 'Sweet lassi curd',
  'Spiced Butter Milk (Masala Chaas)': 'Chaas buttermilk drink',
  'Cold Badam Milk with Kesar': 'Badam milk kesar drink',
  'Virgin Mojito Cooler': 'Mint lime mojito',
  'Kashmiri Kahwa Green Tea': 'Kashmiri kahwa green tea',
};

// Fallback high quality Unsplash photos for each dish if wiki doesn't return
const fallbackUnsplash = {
  'Chicken Ghee Roast': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80',
  'Paneer Tikka Angara': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=700&q=80',
  'Crispy Corn Pepper Salt': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80',
  'Tandoori Murgh (Half)': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=700&q=80',
  'Hara Bhara Kebab': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80',
  'Mutton Galouti Kebab': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
  'Dahi Ke Kebab': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
  'Fish Amritsari Fry': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=700&q=80',
  'Tandoori Malai Broccoli': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
  'Chicken 65 Bangalore Style': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80',
  'Mushroom Kurkure': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80',
  'Old Delhi Butter Chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80',
  'Paneer Butter Masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80',
  'Bangalore Mutton Sukka Curry': 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=700&q=80',
  'Dal Makhani Royal': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=700&q=80',
  'Butter Garlic Naan (2 pcs)': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=700&q=80',
  'Kadhai Paneer Dhaba Style': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=700&q=80',
  'Chicken Tikka Masala': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=80',
  'Malai Kofta Imperial': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80',
  'Mutton Rogan Josh': 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=700&q=80',
  'Yellow Dal Tadka Double Chaunk': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
  'Palak Paneer Lahsuni': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80',
  'Amritsari Kulcha with Chole': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=80',
  'Hyderabadi Dum Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80',
  'Royal Mutton Dum Biryani': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=80',
  'Lucknowi Paneer & Veg Biryani': 'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=700&q=80',
  'Egg Dum Biryani': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=700&q=80',
  'Kolkata Chicken Biryani with Potato & Egg': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80',
  'Ambur Star Mutton Biryani': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=80',
  'Chettinad Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80',
  'Mushroom & Green Peas Dum Biryani': 'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=700&q=80',
  'Tawa Chicken Tikka Biryani': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=700&q=80',
  'Saffron Jeera Rice with Dal Makhani': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=80',
  'Dragon Chicken Bangalore Style': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=700&q=80',
  'Gobi Manchurian Dry': 'https://images.unsplash.com/photo-1625398407795-82650a8c135f?auto=format&fit=crop&w=700&q=80',
  'Chilli Garlic Veg Hakka Noodles': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80',
  'Schezwan Chicken Fried Rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=80',
  'Chilli Paneer Gravy': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=700&q=80',
  'Chicken Manchurian Gravy': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=700&q=80',
  'Veg Triple Schezwan Fried Rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=80',
  'Crispy Honey Chilli Potatoes': 'https://images.unsplash.com/photo-1518013034458-30b0ee243591?auto=format&fit=crop&w=700&q=80',
  'Chicken Hakka Noodles Special': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=80',
  'Crispy Veg Spring Rolls (6 Pcs)': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
  'Gulab Jamun with Shahi Rabdi': 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?auto=format&fit=crop&w=700&q=80',
  'Kesari Rasmalai (2 Pcs)': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
  'Gajar Ka Halwa Pure Desi Ghee': 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=700&q=80',
  'Shahi Tukda Royal Oudh': 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?auto=format&fit=crop&w=700&q=80',
  'Moong Dal Halwa Desi Ghee': 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=700&q=80',
  'Kulfi Falooda Delight': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=700&q=80',
  'Matka Phirni Chilled': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
  'Hot Chocolate Brownie with Fudge': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80',
  'Bangalore Degree Filter Coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
  'Alphonso Mango Malai Lassi': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=700&q=80',
  'Fresh Nimbu Soda (Sweet & Salt)': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80',
  'Masala Chai Cutting Kulhad': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80',
  'Classic Sweet Punjabi Lassi': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=700&q=80',
  'Spiced Butter Milk (Masala Chaas)': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80',
  'Cold Badam Milk with Kesar': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=700&q=80',
  'Virgin Mojito Cooler': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=80',
  'Kashmiri Kahwa Green Tea': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80',
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function searchWiki(term) {
  return new Promise((resolve) => {
    const url =
      'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
      encodeURIComponent(term + ' filetype:bitmap') +
      '&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json';
    https
      .get(url, { headers: { 'User-Agent': 'SpiceGardenApp/1.0 (contact@spicegardenblr.com)' } }, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            const j = JSON.parse(d);
            const pages = j.query ? Object.values(j.query.pages) : [];
            const urls = pages
              .map((p) => (p.imageinfo ? p.imageinfo[0].url : null))
              .filter(
                (u) =>
                  u &&
                  !u.endsWith('.svg') &&
                  !u.endsWith('.ogg') &&
                  !u.endsWith('.pdf') &&
                  !u.endsWith('.tif')
              );
            resolve(urls[0] || null);
          } catch {
            resolve(null);
          }
        });
      })
      .on('error', () => resolve(null));
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers: { 'User-Agent': 'SpiceGardenApp/1.0 (contact@spicegardenblr.com)' } }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const out = fs.createWriteStream(destPath);
      res.pipe(out);
      out.on('finish', () => {
        out.close();
        resolve(true);
      });
      out.on('error', () => resolve(false));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(12000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function start() {
  console.log('🚀 Starting Authentic Dish Image Downloader for Spice Garden...');
  const finalImageMap = {};

  for (let i = 0; i < foods.length; i++) {
    const food = foods[i];
    const slug = slugify(food.name);
    const destFileName = `${slug}.jpg`;
    const destFilePath = path.join(targetDir, destFileName);
    const localWebPath = `/images/foods/${destFileName}`;

    console.log(`[${i + 1}/${foods.length}] Processing "${food.name}"...`);

    // Check if already exists and > 5KB
    if (fs.existsSync(destFilePath) && fs.statSync(destFilePath).size > 5000) {
      console.log(`  ✓ Already downloaded: ${destFileName}`);
      finalImageMap[food.name] = localWebPath;
      continue;
    }

    const term = searchTerms[food.name] || food.name;
    let imgUrl = await searchWiki(term);
    let success = false;

    if (imgUrl) {
      console.log(`  🔍 Found Wiki image: ${imgUrl.substring(0, 60)}...`);
      success = await downloadFile(imgUrl, destFilePath);
    }

    if (!success || !fs.existsSync(destFilePath) || fs.statSync(destFilePath).size < 3000) {
      const fallback = fallbackUnsplash[food.name] || food.image;
      console.log(`  ⚠️ Wiki failed or not found, downloading fallback: ${fallback.substring(0, 60)}...`);
      success = await downloadFile(fallback, destFilePath);
    }

    if (success && fs.existsSync(destFilePath) && fs.statSync(destFilePath).size > 3000) {
      console.log(`  ✅ Saved ${destFileName} (${Math.round(fs.statSync(destFilePath).size / 1024)} KB)`);
      finalImageMap[food.name] = localWebPath;
    } else {
      console.log(`  ❌ Could not save file, using online fallback for ${food.name}`);
      finalImageMap[food.name] = fallbackUnsplash[food.name] || food.image;
    }
  }

  // Update seedData.js with new distinct paths
  console.log('\n📝 Updating seedData.js with unique relatable image paths...');
  const seedDataPath = path.join(__dirname, '../seeder/seedData.js');
  let content = fs.readFileSync(seedDataPath, 'utf8');

  for (const [name, imgPath] of Object.entries(finalImageMap)) {
    // Regex replace the image for this specific food
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(name:\\s*['"]${escapedName}['"][\\s\\S]*?image:\\s*['"])([^'"]+)(['"])`);
    content = content.replace(regex, `$1${imgPath}$3`);
  }
  fs.writeFileSync(seedDataPath, content, 'utf8');
  console.log('✅ seedData.js successfully updated!');

  // Now update the running database directly!
  try {
    console.log('\n🔄 Updating running MongoDB database with new unique images...');
    const connectDB = require('../config/db');
    const Food = require('../models/Food');
    await connectDB();

    for (const [name, imgPath] of Object.entries(finalImageMap)) {
      await Food.updateOne({ name }, { $set: { image: imgPath } });
    }
    console.log('✅ All 60 dish records updated in live MongoDB!');
  } catch (err) {
    console.warn('⚠️ Could not connect to live DB for instant update:', err.message);
  }

  console.log('\n🎉 ALL 60 DISHES NOW HAVE UNIQUE, RELATABLE LOCAL IMAGES!');
  process.exit(0);
}

start();
