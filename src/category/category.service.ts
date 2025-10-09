import { Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { Item } from 'src/item/schemas/item.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Item.name) private itemModel: Model<Item>,
  ) {}

  // 🧠 Helper: return a category with both counts attached
  private async getCounts(category: Category): Promise<any> {
    const id = (category._id as Types.ObjectId).toString();

    const [subCategoryCount, itemCount] = await Promise.all([
      this.categoryModel.countDocuments({ parent: id }),
      this.itemModel.countDocuments({ type: id }),
    ]);

    return {
      ...category.toObject(),
      subCategoryCount,
      itemCount,
    };
  }

  // 🧱 Create
  async create(data: any): Promise<Category> {
    const created = new this.categoryModel({
      ...data,
      isSubCategory: !!data.parent,
    });
    return created.save();
  }

  // 📋 Find all
  async findAll(): Promise<any[]> {
    const categories = await this.categoryModel
      .find()
      .populate('parent')
      .populate('attributes')
      .exec();

    return Promise.all(categories.map((cat) => this.getCounts(cat)));
  }

  // 🏷️ Find main categories (no parent)
  async findMainCategories(): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ parent: null })
      .populate('attributes')
      .exec();

    return Promise.all(categories.map((cat) => this.getCounts(cat)));
  }

  // 🔹 Find all subcategories (those with a parent)
  async findSubCategories(): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ parent: { $ne: null } })
      .populate('parent')
      .populate('attributes')
      .exec();

    return Promise.all(categories.map((cat) => this.getCounts(cat)));
  }

  // 📂 Find subcategories for a specific parent
  async findSubCategoriesByParentId(parentId: string): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ parent: parentId })
      .populate('parent')
      .populate('attributes')
      .exec();

    return Promise.all(categories.map((cat) => this.getCounts(cat)));
  }

  // 🔍 Find one
  async findOne(id: string): Promise<any> {
    const category = await this.categoryModel
      .findById(id)
      .populate('parent')
      .populate('attributes')
      .exec();

    if (!category) throw new NotFoundException('Category not found');

    return this.getCounts(category);
  }

  // ✏️ Update
  async update(id: string, data: any): Promise<any> {
    if ('isSubCategory' in data) {
      delete data.isSubCategory;
    }

    const updated = await this.categoryModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('parent')
      .populate('attributes');

    if (!updated) throw new NotFoundException('Category not found');

    return this.getCounts(updated);
  }

  // 🗑️ Delete
  async remove(id: string): Promise<void> {
    const deleted = await this.categoryModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Category not found');

    // Detach subcategories
    await this.categoryModel.updateMany(
      { parent: id },
      { $set: { parent: null } },
    );

    // Remove type from items
    await this.itemModel.updateMany({ type: id }, { $set: { type: null } });
  }
}
