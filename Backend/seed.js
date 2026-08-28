const mongoose = require('mongoose');
const connectDb = require('./config/db');
const Category = require('./models/Categories');
const Product = require('./models/Product');

const products = [
  ['Biscoff Stuffed Cookies', 'cookie', 'IMG_0905.JPG'],
  ['Oreo Cream Cheese Loaf', 'bread', 'IMG_0908.JPG'],
  ['Coconut Topped Loaf', 'bread', 'IMG_0934.JPG'],
  ['Classic Chocolate Chunk Cookies', 'cookie', 'IMG_0939.JPG'],
  ['Marshmallow & Chocolate Chunk Cookies', 'cookie', 'IMG_0940.JPG'],
  ['M&M Cookies', 'cookie', 'IMG_0942.JPG'],
  ['Oreo Chunk Cookies', 'cookie', 'IMG_0943.JPG'],
  ['Variety Cookie Spread', 'cookie', 'IMG_0946.JPG'],
  ['Oreo Crumb Cookies', 'cookie', 'IMG_0947.JPG'],
  ['White Chocolate Chunk Cookies', 'cookie', 'IMG_0948.JPG'],
  ['Pistachio & Chocolate Cookies', 'cookie', 'IMG_0952.JPG'],
  ['Double Chocolate Marshmallow Cookies', 'cookie', 'IMG_0953.JPG'],
  ['White Chocolate & Jam Cookies', 'cookie', 'IMG_0958.JPG']
];

const seed = async () => {
  await connectDb();
  const categories = {};
  for (const [name, description] of [
    ['bread', 'Freshly baked loaves and breads'],
    ['cookie', 'Soft, crisp and loaded cookies'],
    ['special', 'Seasonal bakery specials']
  ]) {
    categories[name] = await Category.findOneAndUpdate(
      { name },
      { name, description, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  for (const [name, category, filename] of products) {
    await Product.findOneAndUpdate(
      { name },
      {
        name,
        description: `Freshly baked ${name.toLowerCase()}.`,
        price: 12,
        image: `Images/products/${filename}`,
        category: categories[category]._id,
        stock: 100,
        isAvailable: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`Seeded ${products.length} products and ${Object.keys(categories).length} categories.`);
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
