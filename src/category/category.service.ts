import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(data: any): Promise<Category> {
    const created = new this.categoryModel(data);
    return created.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel
      .find()
      .populate('parent')
      .populate('attributes')
      .exec();
  }

  async findMainCategories(): Promise<Category[]> {
    return this.categoryModel
      .find({ parent: null })
      .populate('parent')
      .populate('attributes')
      .exec();
  }

  async findSubCategories(): Promise<Category[]> {
    return this.categoryModel
      .find({ parent: { $ne: null } })
      .populate('parent')
      .populate('attributes')
      .exec();
  }

  async findSubCategoriesByParentId(parentId: string): Promise<Category[]> {
    return this.categoryModel
      .find({ parent: parentId })
      .populate('parent')
      .populate('attributes')
      .exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel
      .findById(id)
      .populate('parent')
      .populate('attributes')
      .exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, data: any): Promise<Category> {
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, data, {
        new: true,
      })
      .populate('parent')
      .populate('attributes');
    if (!updated) throw new NotFoundException('Category not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.categoryModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Category not found');

    // Remove this category as a parent from subcategories
    await this.categoryModel.updateMany(
      { parent: id },
      { $set: { parent: null } },
    );
  }
}
