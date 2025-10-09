import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attribute } from './schemas/attribute.schema';
import { Category } from 'src/category/schemas/category.schema';
import { Item } from 'src/item/schemas/item.schema';

@Injectable()
export class AttributeService {
  constructor(
    @InjectModel(Attribute.name) private attributeModel: Model<Attribute>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Item.name) private itemModel: Model<Item>,
  ) {}

  async create(data: any): Promise<Attribute> {
    const created = new this.attributeModel(data);
    return created.save();
  }

  async findAll(): Promise<Attribute[]> {
    return this.attributeModel.find().exec();
  }

  async findOne(id: string): Promise<Attribute> {
    const attribute = await this.attributeModel.findById(id).exec();
    if (!attribute) throw new NotFoundException('Attribute not found');
    return attribute;
  }

  async update(id: string, data: any): Promise<Attribute> {
    const updated = await this.attributeModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Attribute not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.attributeModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Attribute not found');

    // Remove this attribute ID from all categories
    await this.categoryModel.updateMany(
      { attributes: id },
      { $pull: { attributes: id } },
    );

    await this.itemModel.updateMany(
      { 'attributes.attribute': id },
      { $pull: { attributes: { attribute: id } } },
    );
  }
}
