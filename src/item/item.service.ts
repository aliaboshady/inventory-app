import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Item } from './schemas/item.schema';
import { Category } from 'src/category/schemas/category.schema';
import { IPaginated } from 'src/types/shared.model';

@Injectable()
export class ItemService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<Item>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(data: any): Promise<Item> {
    const created = new this.itemModel(data);
    const saved = await created.save();

    if (saved.type) {
      await this.categoryModel.findByIdAndUpdate(saved.type, {
        $inc: { itemCount: 1 },
      });
    }

    return saved;
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemModel.findById(id).populate('type').exec();
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(id: string, data: any): Promise<Item> {
    if (data.type) {
      const category = await this.categoryModel.findById(data.type);
      if (!category) throw new NotFoundException('Category not found');
    }

    const updated = await this.itemModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('type');
    if (!updated) throw new NotFoundException('Item not found');
    return updated;
  }

  async updateAttribute(
    itemId: string,
    attributeId: string,
    newValue: string,
  ): Promise<Item> {
    const item = await this.itemModel.findById(itemId);
    if (!item) throw new NotFoundException('Item not found');

    const attr = item.attributes.find(
      (a) => a.attribute.toString() === attributeId,
    );
    if (!attr) throw new NotFoundException('Attribute not found in this item');

    attr.value = newValue;
    await item.save();

    const updatedItem = await this.itemModel
      .findById(itemId)
      .populate('type')
      .exec();
    if (!updatedItem) throw new NotFoundException('Updated item not found');

    return updatedItem;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.itemModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Item not found');

    if (deleted.type) {
      await this.categoryModel.findByIdAndUpdate(deleted.type, {
        $inc: { itemCount: -1 },
      });
    }
  }

  // 🧩 Fetch items with optional category/subCategory filters and pagination
  async findWithFilters(query: {
    category?: string;
    subCategory?: string;
    status?: string;
    page?: string;
    itemsPerPage?: string;
    attributes?: Record<string, string>; // Add attributes
  }): Promise<IPaginated> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.itemsPerPage || '10', 10);
    let filter: Record<string, any> = {};

    // ✅ subCategory has priority
    if (query.subCategory) {
      if (!Types.ObjectId.isValid(query.subCategory)) {
        return {
          data: [],
          itemsPerPage: 0,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        };
      }
      const subCat = await this.categoryModel
        .findById(query.subCategory)
        .exec();
      if (!subCat)
        return {
          data: [],
          itemsPerPage: 0,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        };
      filter.type = subCat._id;
    } else if (query.category) {
      if (!Types.ObjectId.isValid(query.category)) {
        return {
          data: [],
          itemsPerPage: 0,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        };
      }
      const mainCat = await this.categoryModel.findById(query.category).exec();
      if (!mainCat)
        return {
          data: [],
          itemsPerPage: 0,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        };

      const subCategories = await this.categoryModel
        .find({ parent: mainCat._id })
        .select('_id')
        .exec();
      if (!subCategories.length)
        return {
          data: [],
          itemsPerPage: 0,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        };

      filter.type = { $in: subCategories.map((c) => c._id) };
    }

    // ✅ Status filter
    if (query.status) {
      filter.status = query.status;
    }

    // ✅ Attribute filters
    if (query.attributes && Object.keys(query.attributes).length > 0) {
      const attrNames = Object.keys(query.attributes);

      // fetch the attribute documents from DB
      const attrDocs = await this.itemModel.db
        .collection('attributes')
        .find({ name: { $in: attrNames } })
        .toArray();

      // if any attribute doesn't exist, return empty results immediately
      if (attrDocs.length !== attrNames.length) {
        return {
          data: [],
          itemsPerPage: 0,
          totalItems: 0,
          currentPage: parseInt(query.page || '1', 10),
          totalPages: 0,
        };
      }

      const attrFilters = attrDocs.map((attrDoc) => {
        const value = query.attributes?.[attrDoc.name];
        return {
          attributes: {
            $elemMatch: { attribute: new Types.ObjectId(attrDoc._id), value },
          },
        };
      });

      if (attrFilters.length > 0) {
        filter.$and = attrFilters;
      }
    }

    // ✅ Pagination + populate
    const [items, totalItems] = await Promise.all([
      this.itemModel
        .find(filter)
        .populate('type')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.itemModel.countDocuments(filter),
    ]);

    return {
      data: items,
      itemsPerPage: items.length,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }
}
