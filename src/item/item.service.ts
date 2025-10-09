import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './schemas/item.schema';
import { Category } from 'src/category/schemas/category.schema';

@Injectable()
export class ItemService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<Item>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(data: any): Promise<Item> {
    const category = await this.categoryModel.findById(data.type);
    if (!category) throw new NotFoundException('Category not found');
    const created = new this.itemModel(data);
    return created.save();
  }

  async findAll(): Promise<Item[]> {
    return this.itemModel.find().populate('type').exec();
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

  async remove(id: string): Promise<void> {
    const deleted = await this.itemModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Item not found');
  }

  // 🧠 Filter items dynamically by any query parameters
  async findWithFilters(query: Record<string, string>): Promise<Item[]> {
    const filter: Record<string, any> = {};

    // If there's a "type" param, make sure it's a valid category ID
    if (query.type) {
      const category = await this.categoryModel.findById(query.type);
      if (!category) throw new NotFoundException('Category not found');
      filter.type = query.type;
    }

    // Add all other query params as direct filters (e.g. color=Red)
    for (const [key, value] of Object.entries(query)) {
      if (key !== 'type') {
        filter[key] = value;
      }
    }

    return this.itemModel.find(filter).populate('type').exec();
  }
}
