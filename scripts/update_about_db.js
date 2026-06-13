const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'delight.db');
const db = new Database(dbPath);

console.log('Opened database at:', dbPath);

db.prepare('DELETE FROM site_content WHERE page = ?').run('about');

const newContent = [
  { page: 'about', section: 'hero', content_key: 'title', content_value: 'About Us' },
  { page: 'about', section: 'hero', content_key: 'subtitle', content_value: 'Bringing quality and tradition into every home.' },
  { page: 'about', section: 'hero', content_key: 'image', content_value: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477144/delight_static/dlr5ldfof9zr9jyfbs3e.jpg', content_type: 'image' },
  
  { page: 'about', section: 'who_we_are', content_key: 'title', content_value: 'Who We Are' },
  { page: 'about', section: 'who_we_are', content_key: 'text', content_value: '**Delight Consumer Products (Pvt) Ltd** is a proudly Sri Lankan manufacturing company, established in 2025 with a vision to deliver high-quality everyday essentials to modern households.\n\nOperating under the brand **“Delight,”** we specialize in producing a carefully selected range of products including incense sticks, traditional ghee oil lamps, candles, teas, and spices. Our products are inspired by Sri Lanka’s rich cultural heritage while maintaining modern standards of quality, consistency, and reliability.\n\nAs a growing company, we are focused on building a strong presence in the local market by developing trusted relationships with customers, retailers, and distributors.' },
  
  { page: 'about', section: 'what_we_do', content_key: 'title', content_value: 'What We Do' },
  { page: 'about', section: 'what_we_do', content_key: 'text', content_value: 'At Delight Consumer Products, we focus on manufacturing products that bring comfort, fragrance, flavor, and tradition into everyday life. Each product is developed with attention to quality, sourcing, and customer satisfaction.\n\nOur goal is to ensure that every household can enjoy products that are both authentic and dependable.' },
  { page: 'about', section: 'what_we_do', content_key: 'image', content_value: 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477147/delight_static/hh4rlbmhmxr7dpgbnkqz.jpg', content_type: 'image' },
  
  { page: 'about', section: 'mission', content_key: 'title', content_value: 'Our Mission' },
  { page: 'about', section: 'mission', content_key: 'text', content_value: '**To deliver quality, value, and authenticity through every product we create.**\n\nWe aim to continuously improve our manufacturing processes, expand our product range, and strengthen our distribution network across Sri Lanka. At the same time, we are working towards entering international markets and sharing the essence of Sri Lankan products with a global audience.' },
  
  { page: 'about', section: 'vision', content_key: 'title', content_value: 'Our Vision' },
  { page: 'about', section: 'vision', content_key: 'text', content_value: '**To become a trusted Sri Lankan brand recognized for quality consumer products both locally and internationally.**' },
  
  { page: 'about', section: 'commitment', content_key: 'title', content_value: 'Our Commitment' },
  { page: 'about', section: 'commitment', content_key: 'item1', content_value: 'Maintaining consistent product quality' },
  { page: 'about', section: 'commitment', content_key: 'item2', content_value: 'Building long-term customer trust' },
  { page: 'about', section: 'commitment', content_key: 'item3', content_value: 'Supporting local production and sourcing' },
  { page: 'about', section: 'commitment', content_key: 'item4', content_value: 'Continuously improving and innovating' },
  
  { page: 'about', section: 'journey', content_key: 'title', content_value: 'Our Journey' },
  { page: 'about', section: 'journey', content_key: 'text', content_value: 'As a newly established company, our journey has just begun. With dedication, passion, and a clear vision, we are steadily growing and working towards becoming a reliable name in the consumer products industry.\n\n**Delight Consumer Products — Bringing quality and tradition into every home.**' }
];

const insert = db.prepare('INSERT INTO site_content (page, section, content_key, content_value, content_type) VALUES (?, ?, ?, ?, ?)');

for (const item of newContent) {
  insert.run(item.page, item.section, item.content_key, item.content_value, item.content_type || 'text');
}

console.log('Successfully updated about page content in database.');
db.close();
