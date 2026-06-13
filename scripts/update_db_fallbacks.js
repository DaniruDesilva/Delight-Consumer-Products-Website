const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'lib', 'db.ts');
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  '/hero_luxury.png': 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477024/delight_hero/tlulsqdhhetszuswfj85.jpg',
  '/hero.png': 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477025/delight_hero/wx7mq9ck0mcwo8frdznh.jpg',
  '/hero_cinematic.png': 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779476104/delight_hero/qcxhzp9mejgxgzo5du11.jpg',
  '/incense.png': 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477016/delight_products/mw9mdhwkm2xmtlwlhme9.jpg',
  '/air_freshener.png': 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477018/delight_products/nffg8m65977ikj7ov1k0.jpg', // I will manually verify this one
  '/brand_story.png': 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477029/delight_static/brand_story_fallback.jpg', // Will use contact_hero instead if needed
  '/candles_mockup.png': 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779476211/delight_products/candles_mockup_fallback.jpg',
  '/matches_mockup.png': 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779476210/delight_products/matches_mockup_fallback.jpg',
};

// Actually, I don't know the exact urls for all, so I will just query the DB for them
// and then replace them.
const Database = require('better-sqlite3');
const db = new Database(path.join(__dirname, '..', 'data', 'delight.db'));

const map = {};
const hero1 = db.prepare('SELECT image FROM hero_slides WHERE id=1').get();
if (hero1) map['/hero_luxury.png'] = hero1.image;

const hero3 = db.prepare('SELECT image FROM hero_slides WHERE id=3').get();
if (hero3) map['/hero.png'] = hero3.image;

const hero2 = db.prepare('SELECT image FROM hero_slides WHERE id=2').get();
if (hero2) map['/hero_cinematic.png'] = hero2.image;

const p1 = db.prepare('SELECT image FROM products WHERE id=5').get();
if (p1) map['/incense.png'] = p1.image;

const p2 = db.prepare('SELECT image FROM products WHERE id=7').get();
if (p2) map['/air_freshener.png'] = p2.image;

const b1 = db.prepare("SELECT content_value FROM site_content WHERE page='home' AND section='brand' AND content_key='image'").get();
if (b1) map['/brand_story.png'] = b1.content_value;

const pic1 = db.prepare("SELECT image FROM product_info_cards WHERE slug='candles'").get();
if (pic1) map['/candles_mockup.png'] = pic1.image;

const pic2 = db.prepare("SELECT image FROM product_info_cards WHERE slug='safety-wax-matches'").get();
if (pic2) map['/matches_mockup.png'] = pic2.image;

for (const [key, value] of Object.entries(map)) {
    console.log(`Replacing ${key} with ${value}`);
    // Global replace
    content = content.split(key).join(value);
}

fs.writeFileSync(file, content);
console.log('db.ts updated.');

