import { Types } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { Item } from 'src/item/schemas/item.schema';
import { IPaginated } from 'src/types/shared.model';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Item.name) private itemModel: Model<Item>,
  ) {}

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

  async create(data: any): Promise<Category> {
    const created = new this.categoryModel({
      ...data,
      isSubCategory: !!data.parent,
    });
    return created.save();
  }

  // 🧩 Unified find
  async findCategories(
    isSub?: boolean,
    parentId?: string,
    page = 1,
    itemsPerPage = 10,
  ): Promise<IPaginated> {
    let filter: any = {};

    if (isSub === true) filter.parent = { $ne: null };
    if (isSub === false) filter.parent = null;

    // Only use parentId if it's valid
    if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) {
        // return empty paginated response
        return {
          data: [],
          itemsPerPage: 0,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        };
      }
      filter.parent = new Types.ObjectId(parentId);
    }

    const [categories, totalItems] = await Promise.all([
      this.categoryModel
        .find(filter)
        .populate('parent')
        .populate('attributes')
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .exec(),
      this.categoryModel.countDocuments(filter),
    ]);

    if (!categories.length) {
      return {
        data: [],
        itemsPerPage: 0,
        totalItems: 0,
        currentPage: page,
        totalPages: 0,
      };
    }

    const data = await Promise.all(
      categories.map((cat) => this.getCounts(cat)),
    );

    return {
      data,
      itemsPerPage: data.length,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / itemsPerPage),
    };
  }

  async findOne(id: string): Promise<any> {
    const category = await this.categoryModel
      .findById(id)
      .populate('parent')
      .populate('attributes')
      .exec();

    if (!category) throw new NotFoundException('Category not found');
    return this.getCounts(category);
  }

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

  async remove(id: string): Promise<void> {
    const deleted = await this.categoryModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Category not found');

    await this.categoryModel.updateMany(
      { parent: id },
      { $set: { parent: null } },
    );
    await this.itemModel.updateMany({ type: id }, { $set: { type: null } });
  }
}
