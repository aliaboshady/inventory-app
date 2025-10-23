import mongoose, { Types } from 'mongoose';
import { CategorySchema } from '../category/schemas/category.schema';
import { ItemSchema } from '../item/schemas/item.schema';
import { AttributeSchema } from '../attribute/schemas/attribute.schema';
import { Category } from '../category/schemas/category.schema';
import { Item } from '../item/schemas/item.schema';
import { Attribute } from '../attribute/schemas/attribute.schema';

// ⚙️ Replace with your actual MongoDB URI
const MONGO_URI =
  'mongodb+srv://ali_aboshady:13579_Ali@cluster0.zbqymom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// 🧱 Setup models
const CategoryModel = mongoose.model<Category>('Category', CategorySchema);
const ItemModel = mongoose.model<Item>('Item', ItemSchema);
const AttributeModel = mongoose.model<Attribute>('Attribute', AttributeSchema);

type ItemData = {
  name: string;
  category: Types.ObjectId; // ✅ instead of "type"
  attributes: { attribute: Types.ObjectId; value?: string }[];
  status: string;
  createdAt: Date;
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ⚠️ CLEAR EXISTING DATA
    console.log('🧹 Clearing database...');
    await Promise.all([
      CategoryModel.deleteMany({}),
      ItemModel.deleteMany({}),
      AttributeModel.deleteMany({}),
    ]);
    console.log('✅ Database cleared.');

    // 🧩 Create attributes
    const attributes = await AttributeModel.insertMany([
      {
        name: 'Color',
        options: ['Red', 'Blue', 'Green', 'Black', 'Brown', 'White'],
      },
      {
        name: 'Material',
        options: ['Wood', 'Metal', 'Plastic', 'Fabric', 'Leather'],
      },
      {
        name: 'Size',
        options: ['Small', 'Medium', 'Large'],
      },
    ]);
    console.log(`🌈 Created ${attributes.length} attributes`);

    // 🪑 Create furniture-related categories
    const categories = await CategoryModel.insertMany([
      {
        name: 'Chairs',
        imageURL:
          'https://images.unsplash.com/photo-1588854337119-1cf1e8d17b10?w=400',
        attributes: [attributes[0]._id, attributes[1]._id, attributes[2]._id],
      },
      {
        name: 'Tables',
        imageURL:
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400',
        attributes: [attributes[0]._id, attributes[1]._id, attributes[2]._id],
      },
      {
        name: 'Sofas',
        imageURL:
          'https://images.unsplash.com/photo-1616627988533-0e22b9d62b26?w=400',
        attributes: [attributes[0]._id, attributes[1]._id],
      },
      {
        name: 'Cabinets',
        imageURL:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
        attributes: [attributes[0]._id, attributes[1]._id, attributes[2]._id],
      },
      {
        name: 'Beds',
        imageURL:
          'https://images.unsplash.com/photo-1600488995724-16c9dffd5a15?w=400',
        attributes: [attributes[0]._id, attributes[1]._id, attributes[2]._id],
      },
      {
        name: 'Desks',
        imageURL:
          'https://images.unsplash.com/photo-1598300053650-77269bb7c5b8?w=400',
        attributes: [attributes[0]._id, attributes[1]._id, attributes[2]._id],
      },
    ]);
    console.log(`🗂️ Created ${categories.length} categories`);

    // 📦 Create mock items
    const sampleItemNames = [
      'Office Chair',
      'Dining Chair',
      'Coffee Table',
      'Dining Table',
      'Corner Sofa',
      'Leather Sofa',
      'Wardrobe Cabinet',
      'Bed Frame',
      'Nightstand',
      'Study Desk',
      'Bookshelf',
      'TV Stand',
    ];

    const itemsData: ItemData[] = [];

    for (let i = 0; i < 50; i++) {
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      const name =
        sampleItemNames[Math.floor(Math.random() * sampleItemNames.length)];
      const colorAttr = attributes[0];
      const materialAttr = attributes[1];

      const colorValue =
        colorAttr.options[Math.floor(Math.random() * colorAttr.options.length)];
      const materialValue =
        materialAttr.options[
          Math.floor(Math.random() * materialAttr.options.length)
        ];

      itemsData.push({
        name: `${name} #${i + 1}`,
        category: randomCategory._id as Types.ObjectId, // ✅ fixed type
        attributes: [
          { attribute: colorAttr._id as Types.ObjectId, value: colorValue },
          {
            attribute: materialAttr._id as Types.ObjectId,
            value: materialValue,
          },
        ],
        status: Math.random() > 0.5 ? 'IN_WAREHOUSE' : 'OUT_OF_WAREHOUSE',
        createdAt: new Date(),
      });
    }

    const items = await ItemModel.insertMany(itemsData);
    console.log(`📦 Created ${items.length} items`);

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
